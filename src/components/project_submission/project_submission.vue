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
            <group-registration :project="project"
                                :course="course">
            </group-registration>
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

import { Course, Project } from 'ag-client-typescript';

import GroupRegistration from '@/components/project_submission/group_registration/group_registration.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import { get_query_param } from '@/utils';

@Component({
  components: {
    GroupRegistration,
    Tab,
    TabHeader,
    Tabs
  }
})
export default class ProjectSubmission extends Vue {
  current_tab_index = 0;
  d_loading = true;
  project: Project | null = null;
  course: Course | null = null;

  async created() {
    this.project = await Project.get_by_pk(Number(this.$route.params.project_id));
    this.course = await Course.get_by_pk(this.project.course);
    this.d_loading = false;
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

@media only screen and (min-width: 481px) {
  .tab-body {
    border-top: 2px solid $pebble-medium;
  }
}

</style>
