<template>
  <div v-if="d_loading" class="loading-centered">
    <div class="loading-large">
      <i class="fa fa-spinner fa-pulse"></i>
    </div>
  </div>
  <div v-else id="ag-test-suites-component">
    <div class="sidebar-container">
      <div class="sidebar-menu">
        <div class="sidebar-header" :class="{'sidebar-header-closed': d_collapsed}">
          <span class="sidebar-collapse-button" @click="d_collapsed = !d_collapsed">
            <i class="fas fa-bars"></i>
          </span>
          <template v-if="!d_collapsed">
            <span class="sidebar-header-text"> Suites </span>
            <button type="button"
                    id="add-ag-test-suite-button"
                    class="sidebar-new-button"
                    @click="open_new_ag_test_suite_modal()">
              <i class="fas fa-plus sidebar-plus"></i> Add Suite
            </button>
          </template>
        </div>

        <div class="sidebar-content" v-if="!d_collapsed">
          <draggable ref="ag_test_suite_order"
                      v-model="d_ag_test_suites"
                      @start="record_current_ag_test_suite_order"
                      @change="set_ag_test_suite_order"
                      @end="$event.item.style.transform = 'none'"
                      handle=".handle">
            <AGTestSuitePanel
              v-for="ag_test_suite of d_ag_test_suites"
              :key="ag_test_suite.pk"
              :ag_test_suite="ag_test_suite"
              :active_ag_test_suite="d_active_ag_test_suite"
              :active_ag_test_command="d_active_ag_test_command"
              @update_active_item="update_active_item($event)">
            </AGTestSuitePanel>
          </draggable>
        </div>
      </div>

      <div id="viewing-window" class="body" :class="{'body-closed': d_collapsed}">
        <template v-if="d_active_ag_test_suite !== null">
          <AGTestSuiteSettings
            :ag_test_suite="d_active_ag_test_suite"
            :project="project"
            :is_first_suite="d_active_ag_test_suite.pk === d_ag_test_suites[0].pk"
          />
        </template>
        <template v-else-if="active_level_is_command">
          <AGTestCommandSettings :ag_test_command="d_active_ag_test_command"
                                  :ag_test_case="parent_ag_test_case"
                                  :project="project">
          </AGTestCommandSettings>
        </template>
      </div>
    </div>

    <div id="fixed-button-footer">
      <span v-if="active_level_is_command">
        <button type="button"
                @click="go_to_prev_ag_test_case"
                id="prev-ag-test-case-button"
                :disabled="!prev_ag_test_case_is_available">
          <i class="fas fa-angle-double-left" id="prev"> </i> Prev Test
        </button>

        <button type="button"
                @click="go_to_next_ag_test_case"
                id="next-ag-test-case-button"
                :disabled="!next_ag_test_case_is_available">
          Next Test <i class="fas fa-angle-double-right" id="next"></i>
        </button>
      </span>
    </div>

    <modal v-if="d_show_new_ag_test_suite_modal"
            @close="d_show_new_ag_test_suite_modal = false"
            ref="new_ag_test_suite_modal"
            click_outside_to_close
            size="medium">
      <div class="modal-header"> New Suite </div>
      <validated-form id="add-ag-test-suite-form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="add_ag_test_suite"
                      @form_validity_changed="d_add_ag_test_suite_form_is_valid = $event">
        <div class="ag-test-suite-name-container">
          <label class="label"> Suite name </label>
          <validated-input ref="new_ag_test_suite_name"
                            v-model="d_new_ag_test_suite_name"
                            :validators="[is_not_empty]">
          </validated-input>
        </div>

        <APIErrors ref="api_errors"></APIErrors>

        <div class="modal-button-footer">
          <button class="modal-create-button"
                  :disabled="!d_add_ag_test_suite_form_is_valid || d_adding_suite"> Add Suite
          </button>
        </div>
      </validated-form>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

import {
  AGTestCase,
  AGTestCaseObserver,
  AGTestCommand,
  AGTestCommandObserver,
  AGTestSuite,
  AGTestSuiteObserver,
  ExpectedStudentFile,
  ExpectedStudentFileObserver,
  InstructorFile,
  InstructorFileObserver,
  Project
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import AGTestCaseSettings from '@/components/project_admin/ag_tests/ag_test_case_settings.vue';
import AGTestCommandSettings from '@/components/project_admin/ag_tests/ag_test_command_settings.vue';
import AGTestSuitePanel from '@/components/project_admin/ag_tests/ag_test_suite_panel.vue';
import AGTestSuiteSettings from '@/components/project_admin/ag_tests/ag_test_suite_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async, handle_global_errors_async } from '@/error_handling';
import { deep_copy } from '@/utils';
import { is_not_empty } from '@/validators';

import {
  find_parent_suite,
  find_parent_suite_and_test_case,
  update_changed_ag_test_case,
} from '../suite_observer_utils';

@Component({
  components: {
    AGTestCaseSettings,
    AGTestCommandSettings,
    AGTestSuitePanel,
    AGTestSuiteSettings,
    APIErrors,
    Draggable,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGTestSuites extends Vue implements AGTestSuiteObserver,
                                                         AGTestCaseObserver,
                                                         AGTestCommandObserver,
                                                         InstructorFileObserver,
                                                         ExpectedStudentFileObserver {
  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;

  d_add_ag_test_suite_form_is_valid = false;
  d_new_ag_test_suite_name = "";
  d_adding_suite = false;
  d_show_new_ag_test_suite_modal = false;

  d_active_ag_test_suite: AGTestSuite | null = null;
  d_active_ag_test_command: AGTestCommand | null = null;

  d_loading = true;
  d_ag_test_suites: AGTestSuite[] = [];
  // For rolling back re-ordering if an error occurs.
  private d_current_ag_test_suite_order: AGTestSuite[] = [];

  d_collapsed = false;

  @handle_global_errors_async
  async created() {
    AGTestSuite.subscribe(this);
    AGTestCase.subscribe(this);
    AGTestCommand.subscribe(this);
    InstructorFile.subscribe(this);
    ExpectedStudentFile.subscribe(this);
    this.d_ag_test_suites = await AGTestSuite.get_all_from_project(this.project.pk);
    this.d_loading = false;
  }

  beforeDestroy() {
    AGTestSuite.unsubscribe(this);
    AGTestCase.unsubscribe(this);
    AGTestCommand.unsubscribe(this);
    InstructorFile.unsubscribe(this);
    ExpectedStudentFile.unsubscribe(this);
  }

  get parent_ag_test_case(): AGTestCase | null {
    let [parent_suite, parent_test_case] = this.parent_suite_and_test;
    return parent_test_case;
  }

  get parent_ag_test_suite(): AGTestSuite | null {
    let [parent_suite, parent_test_case] = this.parent_suite_and_test;
    return parent_suite;
  }

  private get parent_suite_and_test() {
    if (this.d_active_ag_test_command !== null) {
      let parent_tuple = find_parent_suite_and_test_case(
        this.d_active_ag_test_command, this.d_ag_test_suites);
      return parent_tuple === null ? [null, null] : parent_tuple;
    }
    return [null, null];
  }

  update_active_item(item: AGTestSuite | AGTestCase | AGTestCommand | null) {
    if (item instanceof AGTestSuite) {
      this.d_active_ag_test_suite = item;
      this.d_active_ag_test_command = null;
    }
    else if (item instanceof AGTestCase) {
      if (item.ag_test_commands.length > 0) {
        this.d_active_ag_test_suite = null;
        this.d_active_ag_test_command = item.ag_test_commands[0];
      }
    }
    else if (item instanceof AGTestCommand) {
      this.d_active_ag_test_suite = null;
      this.d_active_ag_test_command = item;
    }
    else {
      this.d_active_ag_test_suite = null;
      this.d_active_ag_test_command = null;
    }
  }

  open_new_ag_test_suite_modal() {
    this.d_show_new_ag_test_suite_modal = true;
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_ag_test_suite_name).focus();
    });
  }

  record_current_ag_test_suite_order() {
    this.d_current_ag_test_suite_order = this.d_ag_test_suites.slice();
  }

  @handle_global_errors_async
  async set_ag_test_suite_order() {
    try {
      await AGTestSuite.update_order(
        this.project.pk, this.d_ag_test_suites.map(suite => suite.pk)
      );
    }
    catch (e) {
      this.d_ag_test_suites = this.d_current_ag_test_suite_order;
      this.d_current_ag_test_suite_order = [];
      throw e;
    }
  }

  get prev_ag_test_case_is_available() {
    if (this.d_active_ag_test_command !== null) {
      let [parent_ag_test_suite, parent_ag_test_case] = this.parent_suite_and_test;
      if (parent_ag_test_suite === null || parent_ag_test_case === null) {
        // istanbul ignore next
        return;
      }

      let suite_index = this.d_ag_test_suites.findIndex(
        (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite!.pk
      );
      let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
        (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case!.pk
      );
      let command_index = parent_ag_test_case.ag_test_commands.findIndex(
        (ag_command: AGTestCommand) => ag_command.pk === this.d_active_ag_test_command!.pk
      );

      // if there is a command at the same index in the previous case
      if (case_index !== 0) {
        let prev_case = parent_ag_test_suite.ag_test_cases[case_index - 1];
        return prev_case.ag_test_commands.length > command_index;
      }
      // you can go to the previous suite
      else if (suite_index !== 0) {
        let prev_suite = this.d_ag_test_suites[suite_index - 1];
        let num_cases = prev_suite.ag_test_cases.length;
        if (num_cases > 0) {
          let prev_case = prev_suite.ag_test_cases[num_cases - 1];
          return prev_case.ag_test_commands.length > command_index;
        }
      }
    }
    return false;
  }

  get next_ag_test_case_is_available() {
    if (this.d_active_ag_test_command !== null) {
      let [parent_ag_test_suite, parent_ag_test_case] = this.parent_suite_and_test;
      if (parent_ag_test_suite === null || parent_ag_test_case === null) {
        // istanbul ignore next
        return;
      }

      let suite_index = this.d_ag_test_suites.findIndex(
        (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite!.pk
      );
      let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
        (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case!.pk
      );
      let command_index = parent_ag_test_case.ag_test_commands.findIndex(
        (ag_command: AGTestCommand) => ag_command.pk === this.d_active_ag_test_command!.pk
      );

      let num_cases = parent_ag_test_suite.ag_test_cases.length;
      // if there is a command at the same index in the next case
      if (num_cases - 1 > case_index) {
        let next_case = parent_ag_test_suite.ag_test_cases[case_index + 1];
        return next_case.ag_test_commands.length > command_index;
      }
      // if you can go to the next suite
      else if (suite_index < this.d_ag_test_suites.length - 1) {
        let next_suite = this.d_ag_test_suites[suite_index + 1];
        if (next_suite.ag_test_cases.length > 0) {
          let next_case = next_suite.ag_test_cases[0];
          return next_case.ag_test_commands.length > command_index;
        }
      }
    }
    return false;
  }

  go_to_next_ag_test_case() {
    let [parent_ag_test_suite, parent_ag_test_case] = find_parent_suite_and_test_case(
      this.d_active_ag_test_command!, this.d_ag_test_suites
    )!;

    let suite_index = this.d_ag_test_suites.findIndex(
      (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite.pk
    );
    let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
      (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case.pk
    );
    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === this.d_active_ag_test_command!.pk
    );

    if (parent_ag_test_suite.ag_test_cases.length - 1 > case_index) {
      parent_ag_test_case = parent_ag_test_suite!.ag_test_cases[case_index + 1];
    }
    else {
      parent_ag_test_suite = this.d_ag_test_suites[suite_index + 1];
      parent_ag_test_case = parent_ag_test_suite!.ag_test_cases[0];
    }
    this.update_active_item(parent_ag_test_case!.ag_test_commands[command_index]);
  }

  go_to_prev_ag_test_case() {
    let [parent_ag_test_suite, parent_ag_test_case] = find_parent_suite_and_test_case(
      this.d_active_ag_test_command!, this.d_ag_test_suites
    )!;

    let suite_index = this.d_ag_test_suites.findIndex(
      (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite.pk
    );
    let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
      (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case.pk
    );
    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === this.d_active_ag_test_command!.pk
    );

    if (case_index !== 0) {
      parent_ag_test_case = parent_ag_test_suite.ag_test_cases[case_index - 1];
    }
    else {
      parent_ag_test_suite =  this.d_ag_test_suites[suite_index - 1];
      let num_cases = parent_ag_test_suite.ag_test_cases.length;
      parent_ag_test_case = parent_ag_test_suite.ag_test_cases[num_cases - 1];
    }
    this.update_active_item(parent_ag_test_case!.ag_test_commands[command_index]);
  }

  get active_level_is_suite() {
    return this.d_active_ag_test_suite !== null;
  }

  get active_level_is_command() {
    return this.d_active_ag_test_command !== null;
  }

  @handle_api_errors_async(handle_add_ag_test_suite_error)
  async add_ag_test_suite() {
    try {
      this.d_adding_suite = true;
      let new_suite = await AGTestSuite.create(
        this.project.pk, {name: this.d_new_ag_test_suite_name}
      );
      this.d_show_new_ag_test_suite_modal = false;
      this.d_new_ag_test_suite_name = "";
    }
    finally {
      this.d_adding_suite = false;
    }
  }

  // InstructorFileObserver and ExpectedStudentFileObserver ---------------------------------------

  update_instructor_file_created(instructor_file: InstructorFile): void {}
  update_instructor_file_renamed(instructor_file: InstructorFile, old_name: string): void { }
  update_instructor_file_content_changed(
    instructor_file: InstructorFile, new_content: Blob): void {}
  update_instructor_file_deleted(instructor_file: InstructorFile): void {
    for (let suite of this.d_ag_test_suites) {
      suite.instructor_files_needed.splice(
        suite.instructor_files_needed.findIndex(file => file.pk === instructor_file.pk),
        1
      );
    }
  }
  update_expected_student_file_created(expected_student_file: ExpectedStudentFile): void {}
  update_expected_student_file_changed(expected_student_file: ExpectedStudentFile): void {}
  update_expected_student_file_deleted(expected_student_file: ExpectedStudentFile): void {
    for (let suite of this.d_ag_test_suites) {
      suite.student_files_needed.splice(
        suite.student_files_needed.findIndex(file => file.pk === expected_student_file.pk),
        1
      );
    }
  }

  // SuiteObserver -------------------------------------------------------------------------------

  update_ag_test_suite_created(ag_test_suite: AGTestSuite): void {
    if (ag_test_suite.project === this.project.pk) {
      this.d_ag_test_suites.push(ag_test_suite);
      this.update_active_item(ag_test_suite);
    }
  }

  update_ag_test_suite_changed(ag_test_suite: AGTestSuite): void {
    if (ag_test_suite.project === this.project.pk) {
      let index = this.d_ag_test_suites.findIndex(
        (suite: AGTestSuite) => suite.pk === ag_test_suite.pk);
      Vue.set(this.d_ag_test_suites, index, deep_copy(ag_test_suite, AGTestSuite));
    }
  }

  update_ag_test_suite_deleted(ag_test_suite: AGTestSuite): void {
    if (ag_test_suite.project !== this.project.pk) {
      return;
    }

    let index = this.d_ag_test_suites.findIndex(
      (suite: AGTestSuite) => ag_test_suite.pk === suite.pk);
    this.d_ag_test_suites.splice(index, 1);

    let suite_was_active = (this.d_active_ag_test_suite !== null
                            && ag_test_suite.pk === this.d_active_ag_test_suite.pk);
    if (suite_was_active) {
      if (this.d_ag_test_suites.length === 0) {
        this.update_active_item(null);
      }
      else if (index === this.d_ag_test_suites.length) {
        this.update_active_item(this.d_ag_test_suites[index - 1]);
      }
      else {
        this.update_active_item(this.d_ag_test_suites[index]);
      }
    }
  }

  update_ag_test_suites_order_changed(project_pk: number, ag_test_suite_order: number[]): void {}

  // CaseObserver --------------------------------------------------------------------------------

  update_ag_test_case_created(ag_test_case: AGTestCase): void {
    let parent_suite = find_parent_suite(ag_test_case, this.d_ag_test_suites);
    if (parent_suite !== null) {
      parent_suite.ag_test_cases.push(ag_test_case);
      // Cloning a test triggers an _ag_test_case_created notification.
      this.update_active_item(ag_test_case);
    }
  }

  update_ag_test_case_changed(ag_test_case: AGTestCase): void {
    update_changed_ag_test_case(deep_copy(ag_test_case, AGTestCase), this.d_ag_test_suites);
  }

  update_ag_test_case_deleted(ag_test_case: AGTestCase): void {
    let parent_suite_index = this.d_ag_test_suites.findIndex(
      (ag_suite) => ag_suite.pk === ag_test_case.ag_test_suite
    );
    if (parent_suite_index === -1) {
      // Test case could belong to another project
      return;
    }

    let parent_suite = this.d_ag_test_suites[parent_suite_index];
    let case_index = parent_suite!.ag_test_cases.findIndex(
      (test_case: AGTestCase) => test_case.pk === ag_test_case.pk
    );
    let case_was_active: boolean = (this.d_active_ag_test_command !== null
                                    && this.d_active_ag_test_command.ag_test_case
                                    === ag_test_case.pk);
    this.update_active_item(null);
    parent_suite!.ag_test_cases.splice(case_index, 1);
    if (case_was_active) {
      if (parent_suite.ag_test_cases.length === 0) {
        this.update_active_item(parent_suite!);
      }
      else if (case_index === parent_suite!.ag_test_cases.length) {
        this.update_active_item(parent_suite!.ag_test_cases[case_index - 1]);
      }
      else {
        this.update_active_item(parent_suite!.ag_test_cases[case_index]);
      }
    }
  }

  update_ag_test_cases_order_changed(ag_test_suite_pk: number, ag_test_case_order: number[]) { }

  // CommandObserver------------------------------------------------------------------------------
  update_ag_test_command_created(ag_test_command: AGTestCommand): void {
    let parents = find_parent_suite_and_test_case(ag_test_command, this.d_ag_test_suites);
    if (parents === null) {
        // Command could belong to another project
        return;
    }

    let [parent_ag_test_suite, parent_ag_test_case] = parents;
    parent_ag_test_case.ag_test_commands.push(ag_test_command);

    this.update_active_item(ag_test_command);
  }

  update_ag_test_command_changed(ag_test_command: AGTestCommand): void {
    let parents = find_parent_suite_and_test_case(ag_test_command, this.d_ag_test_suites);
    if (parents === null) {
        // Command could belong to another project
        return;
    }

    let [parent_ag_test_suite, parent_ag_test_case] = parents;
    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === ag_test_command.pk);

    Vue.set(
      parent_ag_test_case.ag_test_commands,
      command_index,
      deep_copy(ag_test_command, AGTestCommand),
    );
  }


  update_ag_test_command_deleted(ag_test_command: AGTestCommand): void {
    let parents = find_parent_suite_and_test_case(ag_test_command, this.d_ag_test_suites);
    if (parents === null) {
      return;
    }
    let [parent_ag_test_suite, parent_ag_test_case] = parents;

    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === ag_test_command.pk);

    let command_was_active = this.d_active_ag_test_command !== null
                             && ag_test_command.pk === this.d_active_ag_test_command!.pk;
    parent_ag_test_case!.ag_test_commands.splice(command_index, 1);
    if (command_was_active) {
      if (command_index === parent_ag_test_case!.ag_test_commands.length) {
        this.update_active_item(parent_ag_test_case!.ag_test_commands[command_index - 1]);
      }
      else {
        this.update_active_item(parent_ag_test_case!.ag_test_commands[command_index]);
      }
    }
  }


  update_ag_test_commands_order_changed(ag_test_case_pk: number,
                                        ag_test_command_order: number[]) { }
}

function handle_add_ag_test_suite_error(component: AGTestSuites, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/collapsible_sidebar.scss';
@import '@/styles/fixed_footer.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';

@import './ag_tests.scss';

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

$border-color: $gray-blue-1;

@include collapsible-sidebar(
  $sidebar-width: 300px,
  $sidebar-header-height: 2.625rem,
  $background-color: white,
  $border-color: $border-color,
  $page-footer-height: $footer-height,
  $stretch: true,
);

.sidebar-container {
  .sidebar-content {
    padding-top: .125rem;
  }
}

.body {
  padding: .625rem .875rem;
  overflow-x: hidden;
}

#fixed-button-footer {
  @include fixed-footer($footer-height);
}

#next-ag-test-case-button, #prev-ag-test-case-button {
  @extend .white-button;
  margin-left: .875rem;
  font-size: .875rem;
}

#next {
  padding-left: .25rem;
}

#prev {
  padding-right: .25rem;
}

</style>
