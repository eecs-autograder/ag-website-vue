<template>
  <div v-if="d_loading" class="loading-spinner">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else
       id="project-admin">
    <tabs ref="course_admin_tabs"
          tab_active_class="gray-white-theme-active"
          tab_inactive_class="gray-white-theme-inactive"
          v-model="current_tab_index">
      <tab>
        <tab-header ref="project_settings_tab"
                    @click.native="update_tab_index(0)">
          <div class="tab-label">
            <p class="tab-header"> Project Settings </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            Project Settings - TODO (branch exists)
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="instructor_files_tab"
                    @click.native="update_tab_index(1)">
          <div class="tab-label">
            <p class="tab-header"> Instructor Files </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            Instructor Files - Pull Requested ATM
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="expected_student_files_tab"
                    @click.native="update_tab_index(2)">
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
        <tab-header ref="ag_test_cases_tab"
                    @click.native="update_tab_index(3)">
          <div class="tab-label">
            <p class="tab-header"> Test Cases </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            AG Test Cases - TODO (branch exists)
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="mutation_testing_tab"
                    @click.native="update_tab_index(4)">
          <div class="tab-label">
            <p class="tab-header"> Mutation Testing </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            Mutation Testing - TODO
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="edit_groups_tab"
                    @click.native="update_tab_index(5)">
          <div class="tab-label">
            <p class="tab-header"> Edit Groups </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            Edit Groups - TODO (branch exists)
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="download_grades_tab"
                    @click.native="update_tab_index(6)">
          <div class="tab-label">
            <p class="tab-header"> Download Grades </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            Download Grades - TODO
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="rerun_tests_tab"
                    @click.native="update_tab_index(7)">
          <div class="tab-label">
            <p class="tab-header"> Rerun Tests </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            Rerun Tests - TODO
          </div>
        </template>
      </tab>

      <tab>
        <tab-header ref="configure_handgrading_tab"
                    @click.native="update_tab_index(8)">
          <div class="tab-label">
            <p class="tab-header"> Configure Handgrading </p>
          </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            Configure Handgrading - TODO
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
      this.project = await Project.get_by_pk(Number(this.$route.params.projectId));
      this.d_loading = false;
    }

    update_tab_index(index: number) {
      this.current_tab_index = index;
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
