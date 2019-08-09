<template>
  <div v-if="d_loading" class="loading-spinner">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>

  <div v-else
       id="project-submission">
    <tabs ref="course_admin_tabs"
          tab_active_class="gray-white-theme-active"
          tab_inactive_class="gray-white-theme-inactive"
          v-model="current_tab_index"
          @input="on_tab_changed">
      <tab>
        <tab-header ref="project_settings_tab">
          <div class="tab-label">
            <p class="tab-header"> Submit </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            <div v-if="group === null">
              <group-registration ref="group_registration"
                                  :project="project"
                                  :course="course">
              </group-registration>
            </div>

            <div v-if="group !== null">
              <div v-if="group.extended_due_date !== null">
                <h4 id="extension">
                  Extension: {{format_datetime(group.extended_due_date)}}
                </h4>
              </div>

              <div id="group-members-container">
                <div id="group-members-title"> Group members: </div>
                <div v-for="(member, index) of group.member_names">
                  <div :class="['group-member',
                               {'odd-row': index % 2 !== 0}]">
                    {{member}}
                  </div>
                </div>
              </div>

            </div>

            <!--TODO Submit component-->

          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="instructor_files_tab">
          <div class="tab-label">
            <p class="tab-header"> My Submissions </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            <!--TODO Submissions-->
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="expected_student_files_tab">
          <div class="tab-label">
            <p class="tab-header"> Student Lookup </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            <!--TODO Student Lookup-->
          </div>
        </template>
      </tab>
    </tabs>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Course, Group, GroupObserver, Project, User } from 'ag-client-typescript';

import GroupRegistration from '@/components/project_submission/group_registration/group_registration.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import { format_datetime, get_query_param } from '@/utils';

@Component({
  components: {
    GroupRegistration,
    Tab,
    TabHeader,
    Tabs
  }
})
export default class ProjectView extends Vue implements GroupObserver {
  current_tab_index = 0;
  d_loading = true;
  user: User | null = null;
  project: Project | null = null;
  course: Course | null = null;
  group: Group | null = null;
  readonly format_datetime = format_datetime;

  async created() {
    Group.subscribe(this);
    this.project = await Project.get_by_pk(Number(this.$route.params.project_id));
    this.course = await Course.get_by_pk(this.project.course);
    this.user = await User.get_current();
    let groups_is_member_of = await this.user.groups_is_member_of();
    if (groups_is_member_of.length > 0) {
      let result = groups_is_member_of.find(group => group.project === this.project!.pk);
      if (result !== undefined) {
        this.group = result;
      }
    }
    this.d_loading = false;
  }

  beforeDestroy() {
    Group.unsubscribe(this);
  }

  mounted() {
    this.select_tab(get_query_param(this.$route.query, "current_tab"));
  }

  on_tab_changed(index: number) {
    switch (index) {
      case 0:
        this.$router.replace({query: {current_tab: "submit"}});
        break;
      case 1:
        this.$router.replace({query: {current_tab: "my_submissions"}});
        break;
      case 2:
        this.$router.replace({query: {current_tab: "student_lookup"}});
    }
  }
  select_tab(tab_name: string | null) {
    switch (tab_name) {
      case "submit":
        break;
      case "my_submissions":
        this.current_tab_index = 1;
        break;
      case "student_lookup":
        this.current_tab_index = 2;
        break;
      default:
        this.current_tab_index = 0;
    }
  }

  update_group_changed(group: Group): void {}

  update_group_created(group: Group): void {
    this.group = group;
  }

  update_group_merged(new_group: Group, group1_pk: number, group2_pk: number): void {}
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.loading-spinner {
  color: $ocean-blue;
  font-size: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.tab-header {
  margin: 0;
  font-size: 14px;
  overflow: hidden;
}

.tab-body {
  text-align: left;
  position: relative;
  padding: 10px;
}

.tab-label {
  outline: none;
  cursor: pointer;
}

#group-members-container {
  min-width: 25%;
  border-collapse: collapse;
  border: 2px solid lighten(black, 15);
  border-radius: 5px;
  display: inline-block;
}

#group-members-title {
  padding: 14px 15px 14px 15px;
  background-color: lighten(black, 15);
  color: white;
}

.group-member {
  font-size: 16px;
  padding: 12px 15px 12px 15px;
  border-radius: 0 0 2px 2px;
}

#group-members-container .odd-row {
  background-color: $white-gray;
}

@media only screen and (min-width: 481px) {
  .tab-body {
    border-top: 2px solid $pebble-medium;
  }
}

</style>
