<template>
  <div v-if="d_loading" class="loading-spinner">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="project-admin">
    <div class="navbar default-navbar">
      <div class="nav-link"
            :class="{'active': d_current_tab === 'settings'}"
            @click="set_current_tab('settings')">
        Settings
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'instructor_files'}"
            @click="set_current_tab('instructor_files')">
        Instructor Files
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'expected_student_files'}"
            @click="set_current_tab('expected_student_files')">
        Student Files
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'test_cases'}"
            @click="set_current_tab('test_cases')">
        Test Cases
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'mutation_testing'}"
            @click="set_current_tab('mutation_testing')">
        Mutation Testing
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'edit_groups'}"
            @click="set_current_tab('edit_groups')">
        Groups & Extensions
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'download_grades'}"
            @click="set_current_tab('download_grades')">
        Grades & Files
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'rerun_tests'}"
            @click="set_current_tab('rerun_tests')">
        Rerun
      </div>
      <div class="nav-link"
            :class="{'active': d_current_tab === 'handgrading'}"
            @click="set_current_tab('handgrading')">
        Handgrading
      </div>
    </div>

    <div>
      <project-settings v-show="d_current_tab === 'settings'"
                        v-if="d_loaded_tabs.has('settings')"
                        :project="project"> </project-settings>
      <instructor-files v-show="d_current_tab === 'instructor_files'"
                        v-if="d_loaded_tabs.has('instructor_files')"
                        :project="project"></instructor-files>
      <expected-student-files v-show="d_current_tab === 'expected_student_files'"
                              v-if="d_loaded_tabs.has('expected_student_files')"
                              :project="project"></expected-student-files>
      <ag-suites v-show="d_current_tab === 'test_cases'"
                 v-if="d_loaded_tabs.has('test_cases')"
                 :project="project"></ag-suites>
      <mutation-suites v-show="d_current_tab === 'mutation_testing'"
                       v-if="d_loaded_tabs.has('mutation_testing')"
                       :project="project"></mutation-suites>
      <edit-groups v-show="d_current_tab === 'edit_groups'"
                   v-if="d_loaded_tabs.has('edit_groups')"
                   :project="project"></edit-groups>
      <download-grades v-show="d_current_tab === 'download_grades'"
                       v-if="d_loaded_tabs.has('download_grades')"
                       :project="project">
      </download-grades>
      <div v-show="d_current_tab === 'rerun_tests'">RERUN TESTS - TODO</div>
      <handgrading-settings v-show="d_current_tab === 'handgrading'"
                            v-if="d_loaded_tabs.has('handgrading')"
                            :project="project"></handgrading-settings>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';

import {
  ExpectedStudentFile,
  ExpectedStudentFileObserver,
  InstructorFile,
  InstructorFileObserver,
  Project,
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import { ArraySet } from '@/array_set';
import AGSuites from '@/components/project_admin/ag_suites/ag_suites.vue';
import DownloadGrades from "@/components/project_admin/download_grades.vue";
import EditGroups from '@/components/project_admin/edit_groups/edit_groups.vue';
import ExpectedStudentFiles from '@/components/project_admin/expected_student_files/expected_student_files.vue';
import HandgradingSettings from '@/components/project_admin/handgrading_settings/handgrading_settings.vue';
import InstructorFiles from '@/components/project_admin/instructor_files/instructor_files.vue';
import MutationSuites from '@/components/project_admin/mutation_suites/mutation_suites.vue';
import ProjectSettings from '@/components/project_admin/project_settings.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import { Created, Destroyed, Mounted } from '@/lifecycle';
import { array_remove_unique, get_query_param } from "@/utils";

@Component({
  components: {
    'ag-suites': AGSuites,
    DownloadGrades,
    EditGroups,
    ExpectedStudentFiles,
    HandgradingSettings,
    InstructorFiles,
    MutationSuites,
    ProjectSettings,
    Tab,
    TabHeader,
    Tabs
  }
})
export default class ProjectAdmin extends Vue implements InstructorFileObserver,
                                                         ExpectedStudentFileObserver,
                                                         Created,
                                                         Mounted,
                                                         Destroyed {
  @Inject({from: 'globals'})
  globals!: GlobalData;

  d_loading = true;
  project: Project | null = null;
  d_current_tab: string = 'settings';

  // The identifiers for tabs that have been clicked on and therefore
  // have had there content loaded.
  d_loaded_tabs: Set<string> = new Set();

  async created() {
    this.project = await Project.get_by_pk(Number(this.$route.params.project_id));

    await this.globals.set_current_project(this.project);
    InstructorFile.subscribe(this);
    ExpectedStudentFile.subscribe(this);
    this.d_loading = false;
  }

  mounted() {
    this.initialize_current_tab();
  }

  destroyed() {
    InstructorFile.unsubscribe(this);
    ExpectedStudentFile.unsubscribe(this);
  }

  private initialize_current_tab() {
    let requested_tab = get_query_param(this.$route.query, "current_tab");
    if (requested_tab !== null) {
      this.set_current_tab(requested_tab);
    }
    else {
      this.mark_tab_as_loaded('settings');
    }
  }

  private set_current_tab(tab_id: string) {
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

  update_instructor_file_created(instructor_file: InstructorFile) {
    if (this.project !==  null) {
      this.project.instructor_files!.push(instructor_file);
      this.project.instructor_files!.sort(
        (first: InstructorFile, second: InstructorFile) => first.name.localeCompare(second.name)
      );
    }
  }

  update_instructor_file_deleted(instructor_file: InstructorFile) {
    if (this.project !==  null) {
      array_remove_unique(
        this.project.instructor_files!, instructor_file.pk, (file, pk) => file.pk === pk);
    }
  }

  update_instructor_file_renamed(instructor_file: InstructorFile) {
    if (this.project !== null) {
      let index = this.project.instructor_files!.findIndex(
        (file) => file.pk === instructor_file.pk
      );
      Vue.set(this.project.instructor_files!, index, instructor_file);

      this.project.instructor_files!.sort(
        (first: InstructorFile, second: InstructorFile) => first.name.localeCompare(second.name)
      );
    }
  }

  update_expected_student_file_created(expected_student_file: ExpectedStudentFile): void {
    if (this.project !== null) {
      this.project.expected_student_files.push(expected_student_file);
      this.project.expected_student_files.sort(
        (first: ExpectedStudentFile, second: ExpectedStudentFile) => {
          return first.pattern.localeCompare(second.pattern);
        }
      );
    }
  }

  update_expected_student_file_changed(expected_student_file: ExpectedStudentFile): void {
    if (this.project !== null) {
      let index = this.project.expected_student_files.findIndex(
        (file) => file.pk === expected_student_file.pk);
      Vue.set(this.project.expected_student_files, index, expected_student_file);

      this.project.expected_student_files.sort(
        (first: ExpectedStudentFile, second: ExpectedStudentFile) => {
          return first.pattern.localeCompare(second.pattern);
        }
      );
    }
  }

  update_expected_student_file_deleted(expected_student_file: ExpectedStudentFile): void {
    if (this.project !== null) {
      array_remove_unique(
        this.project.expected_student_files, expected_student_file.pk,
        (file, pk) => file.pk === pk
      );
    }
  }

  update_instructor_file_content_changed(
    instructor_file: InstructorFile, new_content: string): void {}
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/navbar.scss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#project-admin {
  height: 100%;
  width: 100%;
}

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

</style>
