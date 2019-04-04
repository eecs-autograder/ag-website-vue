<template>
  <div v-if="d_loading" class="loading-spinner">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else
       id="project-admin">
    <tabs ref="course_admin_tabs"
          tab_active_class="gray-white-theme-active"
          tab_inactive_class="gray-white-theme-inactive"
          v-model="current_tab_index"
          @input="on_tab_changed">
      <tab>
        <tab-header ref="project_settings_tab">
          <div class="tab-label">
            <p class="tab-header"> Project Settings </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            PROJECT SETTINGS - TODO (branch exists)
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="instructor_files_tab">
          <div class="tab-label">
            <p class="tab-header"> Instructor Files </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            INSTRUCTOR FILES - Pull Requested ATM
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="expected_student_files_tab">
          <div class="tab-label">
            <p class="tab-header"> Files Students Should Submit </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            EXPECTED STUDENT FILES - Testing ATM
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="ag_test_cases_tab">
          <div class="tab-label">
            <p class="tab-header"> Test Cases </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            AG TEST CASES - TODO (branch exists)
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="mutation_testing_tab">
          <div class="tab-label">
            <p class="tab-header"> Mutation Testing </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            MUTATION TESTING - TODO
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="edit_groups_tab">
          <div class="tab-label">
            <p class="tab-header"> Edit Groups </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            EDIT GROUPS- TODO (branch exists)
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="download_grades_tab">
          <div class="tab-label">
            <p class="tab-header"> Download Grades </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            DOWNLOAD GRADES - TODO
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="rerun_tests_tab">
          <div class="tab-label">
            <p class="tab-header"> Rerun Tests </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            RERUN TESTS - TODO
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="configure_handgrading_tab">
          <div class="tab-label">
            <p class="tab-header"> Configure Handgrading </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            CONFIGURE HANDGRADING - TODO
          </div>
        </template>
      </tab>

    </tabs>
  </div>
</template>

<script lang="ts">
  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';

  import { get_query_param } from "@/utils";
  import { Project } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      Tab,
      TabHeader,
      Tabs
    }
  })
  export default class ProjectAdmin extends Vue {
    current_tab_index = 0;
    d_loading = true;
    project: Project | null = null;

    async created() {
      this.project = await Project.get_by_pk(Number(this.$route.params.project_id));
      this.d_loading = false;
    }

    mounted() {
      this.select_tab(get_query_param(this.$route.query, "current_tab"));
    }

    on_tab_changed(index: number) {
      switch (index) {
        case 0:
          this.$router.replace({query: {current_tab: "settings"}});
          break;
        case 1:
          this.$router.replace({query: {current_tab: "instructor_files"}});
          break;
        case 2:
          this.$router.replace({query: {current_tab: "expected_student_files"}});
          break;
        case 3:
          this.$router.replace({query: {current_tab: "test_cases"}});
          break;
        case 4:
          this.$router.replace({query: {current_tab: "mutation_testing"}});
          break;
        case 5:
          this.$router.replace({query: {current_tab: "edit_groups"}});
          break;
        case 6:
          this.$router.replace({query: {current_tab: "download_grades"}});
          break;
        case 7:
          this.$router.replace({query: {current_tab: "rerun_tests"}});
          break;
        case 8:
          this.$router.replace({query: {current_tab: "configure_handgrading"}});
      }
    }

    select_tab(tab_name: string | null) {
      switch (tab_name) {
        case "settings":
          break;
        case "instructor_files":
          this.current_tab_index = 1;
          break;
        case "expected_student_files":
          this.current_tab_index = 2;
          break;
        case "test_cases":
          this.current_tab_index = 3;
          break;
        case "mutation_testing":
          this.current_tab_index = 4;
          break;
        case "edit_groups":
          this.current_tab_index = 5;
          break;
        case "download_grades":
          this.current_tab_index = 6;
          break;
        case "rerun_tests":
          this.current_tab_index = 7;
          break;
        case "configure_handgrading":
          this.current_tab_index = 8;
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
  padding-top: 10px;
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