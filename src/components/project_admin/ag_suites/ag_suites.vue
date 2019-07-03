<template>
  <div id="ag-test-suites-component" v-if="!loading">

    <div id="ag-test-suite-nav-bar">

      <div id="nav-bar-header">
        <div id="ag-test-suites-title"> Suites </div>
        <button type="button"
                id="add-ag-test-suite-button"
                @click="open_new_ag_test_suite_modal()">
          <i class="fas fa-plus plus"></i> Add Test Suite
        </button>
      </div>

      <div id="nav-bar-body" @wheel.stop>
        <div id="all-ag-test-suites">
          <div v-for="ag_test_suite of ag_test_suites"
               class="ag-test-suite-container"
               :key="ag_test_suite.pk">
            <AGSuitePanel :ag_test_suite="ag_test_suite"
                          :active_ag_test_suite="active_ag_test_suite"
                          :active_ag_test_command="active_ag_test_command"
                          @update_active_item="update_active_item($event)">
            </AGSuitePanel>
          </div>
        </div>
      </div>
    </div>

    <div id="viewing-window">
      <div v-if="active_ag_test_suite !== null"
           class="settings-wrapper">
        <AGSuiteSettings :ag_test_suite="active_ag_test_suite"
                         :project="project">
        </AGSuiteSettings>
      </div>

      <div v-else-if="active_level_is_command"
           class="settings-wrapper">
        <AGCommandSettings :ag_test_command="active_ag_test_command"
                           :ag_test_case="parent_ag_test_case"
                           :project="project">
        </AGCommandSettings>
      </div>
    </div>

    <div id="button-footer">
      <span v-if="active_level_is_command">
        <button type="button"
                @click="go_to_prev_ag_test_case"
                id="prev-ag-test-case-button"
                :disabled="!prev_ag_test_case_is_available">
          <i class="fas fa-angle-double-left" id="prev"> </i> Previous Case
        </button>

        <button type="button"
                @click="go_to_next_ag_test_case"
                id="next-ag-test-case-button"
                :disabled="!next_ag_test_case_is_available">
          Next Case <i class="fas fa-angle-double-right" id="next"></i>
        </button>
      </span>
    </div>

    <modal ref="new_ag_test_suite_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Suite </div>
      <hr>
      <div class="modal-body">
        <validated-form id="add-ag-test-suite-form"
                        autocomplete="off"
                        spellcheck="false"
                        @submit="add_ag_test_suite"
                        @form_validity_changed="add_ag_test_suite_form_is_valid = $event">
          <div class="ag-test-suite-name-container">
            <label class="text-label"> Suite Name </label>
            <validated-input ref="new_ag_test_suite_name"
                             v-model="new_ag_test_suite_name"
                             :validators="[is_not_empty]">
            </validated-input>
          </div>

          <APIErrors ref="api_errors"></APIErrors>

          <button class="modal-create-button"
                  :disabled="!add_ag_test_suite_form_is_valid || adding_suite"> Add Suite
          </button>
        </validated-form>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCaseObserver,
  AGTestCommand,
  AGTestCommandObserver,
  AGTestSuite,
  AGTestSuiteObserver,
  Project
} from 'ag-client-typescript';
import { ID } from 'ag-client-typescript/dist/src/base';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import AGCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import AGSuitePanel from '@/components/project_admin/ag_suites/ag_suite_panel.vue';
import AGSuiteSettings from '@/components/project_admin/ag_suites/ag_suite_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    AGCaseSettings,
    AGCommandSettings,
    AGSuitePanel,
    AGSuiteSettings,
    APIErrors,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGSuites extends Vue implements AGTestSuiteObserver,
                                                     AGTestCaseObserver,
                                                     AGTestCommandObserver {
  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;

  add_ag_test_suite_form_is_valid = false;
  new_ag_test_suite_name = "";
  adding_suite = false;

  active_ag_test_suite: AGTestSuite | null = null;
  active_ag_test_command: AGTestCommand | null = null;
  loading = true;
  ag_test_suites: AGTestSuite[] = [];

  get parent_ag_test_case() {
    if (this.active_ag_test_command !== null) {
      return this.find_parent_suite_and_case(this.active_ag_test_command)[1];
    }
    return null;
  }

  get parent_ag_test_suite() {
    if (this.active_ag_test_command !== null) {
      return this.find_parent_suite_and_case(this.active_ag_test_command)[0];
    }
    return null;
  }

  async created() {
    AGTestSuite.subscribe(this);
    AGTestCase.subscribe(this);
    AGTestCommand.subscribe(this);
    this.ag_test_suites = await AGTestSuite.get_all_from_project(this.project.pk);
    this.loading = false;
  }

  beforeDestroy() {
    AGTestSuite.unsubscribe(this);
    AGTestCase.unsubscribe(this);
    AGTestCommand.unsubscribe(this);
  }

  update_active_item(item: AGTestSuite | AGTestCase | AGTestCommand | null) {
    if (item instanceof AGTestSuite) {
      this.active_ag_test_suite = item;
      this.active_ag_test_command = null;
    }
    else if (item instanceof AGTestCase) {
      this.active_ag_test_suite = null;
      this.active_ag_test_command = item.ag_test_commands[0];
    }
    else if (item instanceof AGTestCommand) {
      this.active_ag_test_suite = null;
      this.active_ag_test_command = item;
    }
    else {
      this.active_ag_test_suite = null;
      this.active_ag_test_command = null;
    }
  }

  open_new_ag_test_suite_modal() {
    (<Modal> this.$refs.new_ag_test_suite_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_ag_test_suite_name).focus();
    });
  }

  get prev_ag_test_case_is_available() {
    if (this.active_ag_test_command !== null) {
      let prev_suite: AGTestSuite;
      let prev_case: AGTestCase;

      let [parent_ag_test_suite, parent_ag_test_case] = this.find_parent_suite_and_case(
        this.active_ag_test_command!
      );
      let suite_index = this.ag_test_suites.findIndex(
        (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite.pk
      );
      let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
        (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case.pk
      );
      let command_index = parent_ag_test_case.ag_test_commands.findIndex(
        (ag_command: AGTestCommand) => ag_command.pk === this.active_ag_test_command!.pk
      );

      // if there is a command at the same index in the previous case
      if (case_index !== 0) {
        prev_case = parent_ag_test_suite.ag_test_cases[case_index - 1];
        return prev_case.ag_test_commands.length > command_index;
      }
      // you can go to the previous suite
      else if (suite_index !== 0) {
        prev_suite = this.ag_test_suites[suite_index - 1];
        let num_cases = prev_suite.ag_test_cases.length;
        if (num_cases > 0) {
          prev_case = prev_suite.ag_test_cases[num_cases - 1];
          return prev_case.ag_test_commands.length > command_index;
        }
      }
    }
    return false;
  }

  get next_ag_test_case_is_available() {
    if (this.active_ag_test_command !== null) {
      let next_suite: AGTestSuite;
      let next_case: AGTestCase;
      let [parent_ag_test_suite, parent_ag_test_case] = this.find_parent_suite_and_case(
        this.active_ag_test_command!
      );
      let suite_index = this.ag_test_suites.findIndex(
        (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite.pk
      );
      let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
        (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case.pk
      );
      let command_index = parent_ag_test_case.ag_test_commands.findIndex(
        (ag_command: AGTestCommand) => ag_command.pk === this.active_ag_test_command!.pk
      );

      let num_cases = parent_ag_test_suite.ag_test_cases.length;
      // if there is a command at the same index in the next case
      if (num_cases - 1 > case_index) {
        next_case = parent_ag_test_suite.ag_test_cases[case_index + 1];
        return next_case.ag_test_commands.length > command_index;
      }
      // if you can go to the next suite
      else if (suite_index < this.ag_test_suites.length - 1) {
        next_suite = this.ag_test_suites[suite_index + 1];
        if (next_suite.ag_test_cases.length > 0) {
          next_case = next_suite.ag_test_cases[0];
          return next_case.ag_test_commands.length > command_index;
        }
      }
    }
    return false;
  }

  go_to_next_ag_test_case() {
    let [parent_ag_test_suite, parent_ag_test_case] = this.find_parent_suite_and_case(
      this.active_ag_test_command!
    );

    let suite_index = this.ag_test_suites.findIndex(
      (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite.pk
    );
    let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
      (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case.pk
    );
    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === this.active_ag_test_command!.pk
    );

    if (parent_ag_test_suite.ag_test_cases.length - 1 > case_index) {
      parent_ag_test_case = parent_ag_test_suite!.ag_test_cases[case_index + 1];
    }
    else {
      parent_ag_test_suite = this.ag_test_suites[suite_index + 1];
      parent_ag_test_case = parent_ag_test_suite!.ag_test_cases[0];
    }
    this.update_active_item(parent_ag_test_case!.ag_test_commands[command_index]);
  }

  go_to_prev_ag_test_case() {
    let [parent_ag_test_suite, parent_ag_test_case] = this.find_parent_suite_and_case(
      this.active_ag_test_command!
    );

    let suite_index = this.ag_test_suites.findIndex(
      (ag_suite: AGTestSuite) => ag_suite.pk === parent_ag_test_suite.pk
    );
    let case_index = parent_ag_test_suite.ag_test_cases.findIndex(
      (ag_case: AGTestCase) => ag_case.pk === parent_ag_test_case.pk
    );
    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === this.active_ag_test_command!.pk
    );

    if (case_index !== 0) {
      parent_ag_test_case = parent_ag_test_suite.ag_test_cases[case_index - 1];
    }
    else {
      parent_ag_test_suite =  this.ag_test_suites[suite_index - 1];
      let num_cases = parent_ag_test_suite.ag_test_cases.length;
      parent_ag_test_case = parent_ag_test_suite.ag_test_cases[num_cases - 1];
    }
    this.update_active_item(parent_ag_test_case!.ag_test_commands[command_index]);
  }

  get active_level_is_suite() {
    return this.active_ag_test_suite !== null;
  }

  get active_level_is_command() {
    return this.active_ag_test_command !== null;
  }

  @handle_api_errors_async(handle_add_ag_test_suite_error)
  async add_ag_test_suite() {
    try {
      this.adding_suite = true;
      let new_suite = await AGTestSuite.create(
        this.project.pk, {name: this.new_ag_test_suite_name}
      );
      (<Modal> this.$refs.new_ag_test_suite_modal).close();
      this.new_ag_test_suite_name = "";
    }
    finally {
      this.adding_suite = false;
    }
  }

  // SuiteObserver -------------------------------------------------------------------------------
  update_ag_test_suite_changed(ag_test_suite: AGTestSuite): void {
    let index = this.ag_test_suites.findIndex(
      (suite: AGTestSuite) => suite.pk === ag_test_suite.pk);
    Vue.set(this.ag_test_suites, index, deep_copy(ag_test_suite, AGTestSuite));
  }

  update_ag_test_suite_created(ag_test_suite: AGTestSuite): void {
    this.ag_test_suites.push(ag_test_suite);
    this.update_active_item(ag_test_suite);
  }

  update_ag_test_suite_deleted(ag_test_suite: AGTestSuite): void {
    let index = this.ag_test_suites.findIndex(
      (suite: AGTestSuite) => ag_test_suite.pk === suite.pk);
    let suite_was_active: boolean = (this.active_ag_test_suite !== null
                                     && ag_test_suite.pk === this.active_ag_test_suite.pk);
    this.ag_test_suites.splice(index, 1);
    if (suite_was_active) {
      if (this.ag_test_suites.length === 0) {
        this.update_active_item(null);
      }
      else if (index === this.ag_test_suites.length) {
        this.update_active_item(this.ag_test_suites[index - 1]);
      }
      else {
        this.update_active_item(this.ag_test_suites[index]);
      }
    }
  }

  update_ag_test_suites_order_changed(project_pk: number, ag_test_suite_order: ID[]): void {}

  // CaseObserver --------------------------------------------------------------------------------
  update_ag_test_case_changed(ag_test_case: AGTestCase): void {
    let parent_suite = this.ag_test_suites[this.ag_test_suites.findIndex(
      (ag_suite: AGTestSuite) => ag_suite.pk === ag_test_case.ag_test_suite
    )];
    let case_index = parent_suite!.ag_test_cases.findIndex(
      (test_case: AGTestCase) => test_case.pk === ag_test_case.pk
    );
    Vue.set(
      parent_suite.ag_test_cases,
      case_index,
      deep_copy(ag_test_case, AGTestCase)
    );
  }

  update_ag_test_case_created(ag_test_case: AGTestCase): void {
    let parent_suite = this.ag_test_suites[this.ag_test_suites.findIndex(
      (ag_suite: AGTestSuite) => ag_suite.pk === ag_test_case.ag_test_suite
    )];
    parent_suite.ag_test_cases.push(ag_test_case);
  }

  update_ag_test_case_deleted(ag_test_case: AGTestCase): void {
    let parent_suite = this.ag_test_suites[this.ag_test_suites.findIndex(
      (ag_suite: AGTestSuite) => ag_suite.pk === ag_test_case.ag_test_suite
    )];
    let case_index = parent_suite!.ag_test_cases.findIndex(
      (test_case: AGTestCase) => test_case.pk === ag_test_case.pk
    );
    let case_was_active: boolean = (this.active_ag_test_command !== null
                                    && this.active_ag_test_command.ag_test_case
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
  update_ag_test_command_changed(ag_test_command: AGTestCommand): void {
    let [parent_ag_test_suite, parent_ag_test_case] = this.find_parent_suite_and_case(
      ag_test_command
    );

    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === ag_test_command.pk);

    Vue.set(
      parent_ag_test_case.ag_test_commands,
      command_index,
      deep_copy(ag_test_command, AGTestCommand)
    );
  }

  update_ag_test_command_created(ag_test_command: AGTestCommand): void {
    let [parent_ag_test_suite, parent_ag_test_case] = this.find_parent_suite_and_case(
      ag_test_command
    );
    parent_ag_test_case!.ag_test_commands.push(ag_test_command);
    this.update_active_item(ag_test_command);
  }

  update_ag_test_command_deleted(ag_test_command: AGTestCommand): void {
    let [parent_ag_test_suite, parent_ag_test_case] = this.find_parent_suite_and_case(
      ag_test_command
    );

    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: AGTestCommand) => ag_command.pk === ag_test_command.pk);

    let command_was_active = this.active_ag_test_command !== null
                             && ag_test_command.pk === this.active_ag_test_command!.pk;
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

  find_parent_suite_and_case(ag_test_command: AGTestCommand): [AGTestSuite, AGTestCase] {
    let parent_ag_test_suite!: AGTestSuite;
    let parent_ag_test_case!: AGTestCase;

    for (let suite_index = 0; suite_index < this.ag_test_suites.length; ++suite_index) {
      let case_index = this.ag_test_suites[suite_index].ag_test_cases.findIndex(
        (ag_case: AGTestCase) => ag_case.pk === ag_test_command.ag_test_case);
      if (case_index !== -1) {
        parent_ag_test_suite = this.ag_test_suites[suite_index];
        parent_ag_test_case = parent_ag_test_suite.ag_test_cases[case_index];
      }
    }
    return [parent_ag_test_suite, parent_ag_test_case];
  }

  update_ag_test_commands_order_changed(ag_test_case_pk: number,
                                        ag_test_command_order: number[]) { }
}

function handle_add_ag_test_suite_error(component: AGSuites, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/forms.scss';

#ag-test-suites-component {
  width: 100%;
  box-sizing: border-box;
  display: flex;
}

.settings-wrapper {
  height: 100%;
}

#ag-test-suite-nav-bar {
  box-sizing: border-box;
  flex-direction: column;
  align-items: stretch;
  min-width: 400px;
}

#nav-bar-header {
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-left: none;
  border-bottom: none;
  margin-top: 10px;
  box-sizing: border-box;
}

#nav-bar-body {
  box-sizing: border-box;
  flex: 2;
  overflow-y: scroll;
  padding-bottom: 10px;
  height: 700px;
}

#ag-test-suites-title {
  font-size: 1.125rem;
  display: inline-block;
}

#add-ag-test-suite-button {
  @extend .white-button;
  box-shadow: none;
}

.plus {
  padding-right: 5px;
}

#viewing-window {
  box-sizing: border-box;
  flex: 1;
  padding-top: 20px;
}

#button-footer {
  background-color: $white-gray;
  border-top: 1px solid hsl(210, 20%, 94%);
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  left: 0;
  right: 0;
  min-height: 55px;
  padding: 10px;
  position: fixed;
}

#next-ag-test-case-button, #prev-ag-test-case-button {
  @extend .white-button;
  margin-left: 15px;
  font-size: 14px;
}

#next {
  padding-left: 5px;
}

#prev {
  padding-right: 5px;
}

// Modal **************************************************************
.ag-test-suite-name-container {
  padding: 0 0 22px 0;
}

</style>
