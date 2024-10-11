<template>
  <div v-if="d_loading" class="loading-centered">
    <div class="loading-large">
      <i class="fa fa-spinner fa-pulse"></i>
    </div>
  </div>
  <div v-else id="project-admin">
    <h1>HI!</h1>
    <div class="navbar default-navbar">
      <div class="nav-link"
            data-testid="settings-tab"
            :class="{'active': d_current_tab === 'settings'}"
            @click="set_current_tab('settings')">
        Settings
      </div>
      <div class="nav-link"
            data-testid="instructor-files-tab"
            :class="{'active': d_current_tab === 'instructor_files'}"
            @click="set_current_tab('instructor_files')">
        Instructor Files
      </div>
      <div class="nav-link"
            data-testid="student-files-tab"
            :class="{'active': d_current_tab === 'expected_student_files'}"
            @click="set_current_tab('expected_student_files')">
        Student Files
      </div>
      <div class="nav-link"
            data-testid="test-cases-tab"
            :class="{'active': d_current_tab === 'test_cases'}"
            @click="set_current_tab('test_cases')">
        Test Cases
      </div>
      <div class="nav-link"
            data-testid="mutation-testing-tab"
            :class="{'active': d_current_tab === 'mutation_testing'}"
            @click="set_current_tab('mutation_testing')">
        Mutation Testing
      </div>
      <div class="nav-link"
            data-testid="edit-groups-tab"
            :class="{'active': d_current_tab === 'edit_groups'}"
            @click="set_current_tab('edit_groups')">
        Groups & Extensions
      </div>
      <div class="nav-link"
            data-testid="download-grades-tab"
            :class="{'active': d_current_tab === 'download_grades'}"
            @click="set_current_tab('download_grades')">
        Grades & Files
      </div>
      <div class="nav-link"
            data-testid="rerun-tests-tab"
            :class="{'active': d_current_tab === 'rerun_tests'}"
            @click="set_current_tab('rerun_tests')">
        Rerun
      </div>
      <div class="nav-link"
            data-testid="handgrading-tab"
            :class="{'active': d_current_tab === 'handgrading'}"
            @click="set_current_tab('handgrading')">
        Handgrading
      </div>
      <div class="nav-link"
            data-testid="stats-tab"
            :class="{'active': d_current_tab === 'stats'}"
            @click="set_current_tab('stats')">
        Stats (Beta)
      </div>
    </div>

    <div class="body">
      <project-settings v-show="d_current_tab === 'settings'"
                        v-if="d_loaded_tabs.has('settings')"
                        :project="d_project"> </project-settings>
      <instructor-files v-show="d_current_tab === 'instructor_files'"
                        v-if="d_loaded_tabs.has('instructor_files')"
                        :project="d_project"></instructor-files>
      <expected-student-files v-show="d_current_tab === 'expected_student_files'"
                              v-if="d_loaded_tabs.has('expected_student_files')"
                              :project="d_project"></expected-student-files>
      <ag-test-suites v-show="d_current_tab === 'test_cases'"
                      v-if="d_loaded_tabs.has('test_cases')"
                      :project="d_project"></ag-test-suites>
      <mutation-suites v-show="d_current_tab === 'mutation_testing'"
                       v-if="d_loaded_tabs.has('mutation_testing')"
                       :project="d_project"></mutation-suites>
      <edit-groups v-show="d_current_tab === 'edit_groups'"
                   v-if="d_loaded_tabs.has('edit_groups')"
                   :course="d_globals.current_course"
                   :project="d_project"></edit-groups>
      <download-grades v-show="d_current_tab === 'download_grades'"
                       v-if="d_loaded_tabs.has('download_grades')"
                       :project="d_project">
      </download-grades>
      <rerun-submissions v-show="d_current_tab === 'rerun_tests'"
                         v-if="d_loaded_tabs.has('rerun_tests')"
                         :project="d_project"></rerun-submissions>
      <handgrading-settings v-show="d_current_tab === 'handgrading'"
                            v-if="d_loaded_tabs.has('handgrading')"
                            :project="d_project"></handgrading-settings>
      <project-stats
        v-show="d_current_tab === 'stats'"
        v-if="d_loaded_tabs.has('stats')"
        :course="d_globals.current_course"
        :project="d_project"
      />
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
  ProjectObserver,
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import { ArraySet } from '@/array_set';
import AGTestSuites from '@/components/project_admin/ag_tests/ag_test_suites.vue';
import DownloadGrades from "@/components/project_admin/download_grades.vue";
import EditGroups from '@/components/project_admin/edit_groups/edit_groups.vue';
import ExpectedStudentFiles from '@/components/project_admin/expected_student_files/expected_student_files.vue';
import HandgradingSettings from '@/components/project_admin/handgrading_settings/handgrading_settings.vue';
import InstructorFiles from '@/components/project_admin/instructor_files/instructor_files.vue';
import MutationSuites from '@/components/project_admin/mutation_suites/mutation_suites.vue';
import ProjectSettings from '@/components/project_admin/project_settings.vue';
import ProjectStats from '@/components/project_admin/project_stats/project_stats.vue';
import RerunSubmissions from '@/components/project_admin/rerun_submissions/rerun_submissions.vue';
import { CurrentTabMixin } from '@/current_tab_mixin';
import { handle_global_errors_async } from '@/error_handling';
import { BeforeDestroy, Created, Destroyed, Mounted } from '@/lifecycle';
import { assert_not_null, deep_copy, get_query_param, safe_assign } from "@/utils";

@Component({
  components: {
    'ag-test-suites': AGTestSuites,
    DownloadGrades,
    EditGroups,
    ExpectedStudentFiles,
    HandgradingSettings,
    InstructorFiles,
    MutationSuites,
    ProjectSettings,
    ProjectStats,
    RerunSubmissions,
  }
})
export default class ProjectAdmin extends CurrentTabMixin implements ProjectObserver,
                                                          InstructorFileObserver,
                                                          ExpectedStudentFileObserver,
                                                          Created,
                                                          Mounted,
                                                          BeforeDestroy {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  d_loading = true;
  d_project: Project | null = null;

  @handle_global_errors_async
  async created() {
    this.d_project = await Project.get_by_pk(Number(this.$route.params.project_id));

    await this.d_globals.set_current_project(this.d_project);
    Project.subscribe(this);
    InstructorFile.subscribe(this);
    ExpectedStudentFile.subscribe(this);
    this.d_loading = false;
  }

  mounted() {
    return this.initialize_current_tab('settings');
  }

  beforeDestroy() {
    Project.unsubscribe(this);
    InstructorFile.unsubscribe(this);
    ExpectedStudentFile.unsubscribe(this);
  }

  update_project_created(project: Project): void {
  }

  update_project_changed(project: Project): void {
    if (project.pk === this.d_project!.pk) {
      this.d_project = deep_copy(project, Project);
    }
  }

  update_instructor_file_created(instructor_file: InstructorFile) {
    if (this.d_project === null || instructor_file.project !== this.d_project.pk) {
      return;
    }
    assert_not_null(this.d_project.instructor_files);
    this.d_project.instructor_files.push(instructor_file);
    this.d_project.instructor_files.sort(
      (first: InstructorFile, second: InstructorFile) => first.name.localeCompare(second.name)
    );
  }

  update_instructor_file_deleted(instructor_file: InstructorFile) {
    if (this.d_project === null || instructor_file.project !== this.d_project.pk) {
      return;
    }
    assert_not_null(this.d_project.instructor_files);
    this.d_project.instructor_files.splice(
      this.d_project.instructor_files.findIndex(file => file.pk === instructor_file.pk),
      1
    );
  }

  update_instructor_file_renamed(instructor_file: InstructorFile) {
    if (this.d_project === null || instructor_file.project !== this.d_project.pk) {
      return;
    }

    assert_not_null(this.d_project.instructor_files);
    let index = this.d_project.instructor_files.findIndex(
      (file) => file.pk === instructor_file.pk
    );
    Vue.set(this.d_project.instructor_files, index, instructor_file);

    this.d_project.instructor_files.sort(
      (first: InstructorFile, second: InstructorFile) => first.name.localeCompare(second.name)
    );
  }

  update_expected_student_file_created(expected_student_file: ExpectedStudentFile): void {
    if (this.d_project === null || expected_student_file.project !== this.d_project.pk) {
      return;
    }

    this.d_project.expected_student_files.push(expected_student_file);
    this.d_project.expected_student_files.sort(
      (first: ExpectedStudentFile, second: ExpectedStudentFile) => {
        return first.pattern.localeCompare(second.pattern);
      }
    );
  }

  update_expected_student_file_changed(expected_student_file: ExpectedStudentFile): void {
    if (this.d_project === null || expected_student_file.project !== this.d_project.pk) {
      return;
    }

    let index = this.d_project.expected_student_files.findIndex(
      (file) => file.pk === expected_student_file.pk);
    Vue.set(this.d_project.expected_student_files, index, expected_student_file);

    this.d_project.expected_student_files.sort(
      (first: ExpectedStudentFile, second: ExpectedStudentFile) => {
        return first.pattern.localeCompare(second.pattern);
      }
    );
  }

  update_expected_student_file_deleted(expected_student_file: ExpectedStudentFile): void {
    if (this.d_project === null || expected_student_file.project !== this.d_project.pk) {
      return;
    }

    this.d_project.expected_student_files.splice(
      this.d_project.expected_student_files.findIndex(item => item.pk === expected_student_file.pk),
      1
    );
  }

  update_instructor_file_content_changed(
    instructor_file: InstructorFile, new_content: Blob): void {}
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/global.scss';
@import '@/styles/loading.scss';
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

@include navbar(
  $background-color: $navbar-background-color,
  $hover-color: $navbar-hover-color,
  $active-color: $navbar-active-color,
  $border-color: $navbar-hover-color
);

.body {
  height: 100%;
}

</style>
