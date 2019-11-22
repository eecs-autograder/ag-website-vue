<template>
  <div v-if="d_loading" class="loading-spinner">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>

  <div v-else id="project-view">
    <div class="navbar default-navbar">
      <div class="nav-link"
           ref="submit_tab"
           :class="{'active': d_current_tab === 'submit'}"
           @click="set_current_tab('submit')"
           v-if="can_submit">
        Submit
      </div>
      <div class="nav-link"
           ref="my_submissions_tab"
           :class="{
             'active': d_current_tab === 'my_submissions',
             'disabled': group === null
           }"
           @click="set_current_tab('my_submissions')"
           v-if="can_submit">
        My Submissions
      </div>
      <div class="nav-link"
           ref="student_lookup_tab"
           :class="{'active': d_current_tab === 'student_lookup'}"
           @click="set_current_tab('student_lookup')"
           v-if="d_globals.user_roles.is_staff">
        Student Lookup
      </div>
      <div class="nav-link"
           ref="handgrading_tab"
           :class="{'active': d_current_tab === 'handgrading'}"
           @click.self="set_current_tab('handgrading')"
           v-if="handgrading_rubric !== null">
        Handgrading
        <template v-if="d_globals.user_roles.is_admin">
          <router-link :to="`/web/project_admin/${project.pk}?current_tab=configure_handgrading`">
            <i id="edit-handgrading-link" class="fas fa-cog cog"></i>
          </router-link>
        </template>
      </div>
      <div class="nav-link"
           ref="handgrading_result_tab"
           :class="{'active': d_current_tab === 'handgrading_result'}"
           @click.self="set_current_tab('handgrading_result')"
           v-if="handgrading_result !== null">
        Handgrading Score
      </div>
    </div>

    <div>
      <div v-if="can_submit && d_loaded_tabs.has('submit')"
           v-show="d_current_tab === 'submit'">
        <group-registration v-if="group === null"
                            ref="group_registration"
                            :project="project"
                            :course="course">
        </group-registration>
        <submit v-else
                @submitted="on_submit"
                :course="course" :project="project" :group="group"></submit>
      </div>

      <submission-list v-if="can_submit && d_loaded_tabs.has('my_submissions')"
                       v-show="d_current_tab === 'my_submissions'"
                       :course="course" :project="project" :group="group"></submission-list>

      <student-lookup v-show="d_current_tab === 'student_lookup'"
                      v-if="d_loaded_tabs.has('student_lookup')"
                      :course="course"
                      :project="project"></student-lookup>

      <handgrading-container v-show="d_current_tab === 'handgrading'"
                             v-if="handgrading_rubric !== null && d_loaded_tabs.has('handgrading')"
                             :course="course"
                             :project="project"
                             :handgrading_rubric="handgrading_rubric"></handgrading-container>

      <handgrading v-show="d_current_tab === 'handgrading_result'"
                   v-if="handgrading_result !== null && d_loaded_tabs.has('handgrading_result')"
                   :handgrading_result="handgrading_result"
                   :readonly_handgrading_results="true"></handgrading>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';

import {
  Course,
  Group,
  GroupObserver,
  HandgradingResult,
  HandgradingRubric,
  HttpError,
  Project
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import Handgrading from '@/components/handgrading/handgrading.vue';
import HandgradingContainer from '@/components/handgrading/handgrading_container.vue';
import GroupRegistration from '@/components/project_view/group_registration/group_registration.vue';
import StudentLookup from '@/components/project_view/student_lookup.vue';
import Submit from '@/components/project_view/submit.vue';
import SubmissionList from '@/components/submission_list/submission_list.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import { assert_not_null, format_datetime, get_query_param } from '@/utils';

@Component({
  components: {
    GroupRegistration,
    Handgrading,
    HandgradingContainer,
    StudentLookup,
    SubmissionList,
    Submit,
    Tab,
    TabHeader,
    Tabs
  }
})
export default class ProjectView extends Vue implements GroupObserver {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  d_current_tab: string = 'submit';
  d_loading = true;

  d_load_my_submissions = false;

  project: Project | null = null;
  course: Course | null = null;
  group: Group | null = null;
  handgrading_rubric: HandgradingRubric | null = null;
  handgrading_result: HandgradingResult | null = null;

  // The identifiers for tabs that have been clicked on and therefore
  // have had there content loaded.
  d_loaded_tabs: Set<string> = new Set();

  readonly format_datetime = format_datetime;

  async mounted() {
    Group.subscribe(this);
    this.project = await Project.get_by_pk(Number(this.$route.params.project_id));
    this.course = await Course.get_by_pk(this.project.course);

    let groups_is_member_of = await this.d_globals.current_user.groups_is_member_of();
    let result = groups_is_member_of.find(group => group.project === this.project!.pk);
    if (result !== undefined) {
      this.group = result;
    }

    await this.d_globals.set_current_project(this.project, this.course);
    await Promise.all([this.load_handgrading(), this.load_handgrading_result()]);
    this.initialize_current_tab();

    this.d_loading = false;
  }

  beforeDestroy() {
    Group.unsubscribe(this);
  }

  private initialize_current_tab() {
    let requested_tab = get_query_param(this.$route.query, "current_tab");
    if (requested_tab !== null) {
      this.set_current_tab(requested_tab);
    }
    else {
      if (this.d_globals.user_roles.is_handgrader) {
        this.d_current_tab = 'handgrading';
      }
      this.mark_tab_as_loaded(this.d_current_tab);
    }
  }

  private set_current_tab(tab_id: string) {
    if (tab_id === 'my_submissions' && this.group === null
        || tab_id === 'handgrading' && this.handgrading_rubric === null
        || tab_id === 'handgrading_result' && this.handgrading_result === null) {
      return;
    }

    this.d_current_tab = tab_id;
    this.$router.replace({query: {...this.$route.query, current_tab: tab_id}});
    this.mark_tab_as_loaded(tab_id);
  }

  private mark_tab_as_loaded(tab_id: string) {
    if (!this.d_loaded_tabs.has(tab_id)) {
      let new_loaded_tabs = new Set(this.d_loaded_tabs);
      new_loaded_tabs.add(tab_id);
      this.d_loaded_tabs = new_loaded_tabs;
    }
  }

  private async load_handgrading() {
    assert_not_null(this.project);
    if (!this.project!.has_handgrading_rubric) {
      return;
    }

    if (this.d_globals.user_roles.is_staff || this.d_globals.user_roles.is_handgrader) {
      this.handgrading_rubric = await HandgradingRubric.get_from_project(this.project!.pk);
    }
  }

  private async load_handgrading_result() {
    if (this.group === null) {
      return;
    }

    try {
      this.handgrading_result = await HandgradingResult.get_by_group_pk(this.group.pk);
    }
    catch (e) {
      if (!(e instanceof HttpError) || (e.status !== 403 && e.status !== 404)) {
        // istanbul ignore next
        throw e;
      }
    }
  }

  // Whether to show the "submit" and "my submissions" tabs
  get can_submit() {
    return !this.d_globals.user_roles.is_handgrader
           || this.d_globals.user_roles.is_student
           || this.d_globals.user_roles.is_staff;
  }

  on_submit() {
    this.set_current_tab('my_submissions');
    return this.group!.refresh();
  }

  update_group_changed(group: Group): void {}

  update_group_created(group: Group): void {
    let has_current_user = group.member_names.find(
      member => member === this.d_globals.current_user.username) !== undefined;
    if (this.project !== null && group.project === this.project.pk && has_current_user) {
      this.group = group;
    }
  }

  update_group_merged(new_group: Group, group1_pk: number, group2_pk: number): void {}
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/navbar.scss';

.loading-spinner {
  color: $ocean-blue;
  font-size: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

@include navbar(
  $background-color: $pebble-light,
  $hover-color: lighten($pebble-dark, 5%),
  $active-color: $pebble-dark,
  $border-color: lighten($pebble-dark, 5%)
);

#edit-handgrading-link {
  margin-left: 6px;
  color: $ocean-blue;
  font-size: 1.1em;
}

#edit-handgrading-link:hover {
  color: lighten($ocean-blue, 5%);
}

</style>
