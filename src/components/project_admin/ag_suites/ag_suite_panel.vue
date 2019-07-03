<template>
  <div id="ag-test-suite-panel" v-if="ag_test_suite !== null">
      <div :class="['ag-test-suite', {'active-ag-test-suite': suite_is_active}]"
           @click="update_ag_test_suite_panel_when_clicked()">
        <div class="ag-test-suite-name">
          <i v-if="is_open" class="fas fa-caret-down ag-test-suite-symbol-down"></i>
          <i v-else class="fas fa-caret-right ag-test-suite-symbol-right"></i>
          <span>{{ag_test_suite.name}}</span>
        </div>

        <div id="ag-test-suite-menu"
             title="Add Test Case"
             @click.stop="open_new_ag_test_case_modal">
          <i class="fas fa-plus"></i>
        </div>
      </div>

      <div class="ag-test-cases-container" v-if="is_open">
        <div v-for="test_case of ag_test_suite.ag_test_cases"
             :key="test_case.pk">
          <AGCasePanel :ag_test_case="test_case"
                       :ag_test_suite="ag_test_suite"
                       :active_ag_test_command="active_ag_test_command"
                       @update_active_item="$emit('update_active_item', $event)">
          </AGCasePanel>
        </div>
      </div>

    <modal ref="new_ag_test_case_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> New Test Case </div>
      <hr>
      <div class="modal-body">
        <div class="name-container">
          <validated-form ref="create_ag_test_case_form"
                          autocomplete="off"
                          spellcheck="false"
                          @submit="create_ag_test_case"
                          @form_validity_changed="add_case_form_is_valid = $event">

            <div id="case-name-container">
              <label class="text-label"> Case name </label>
              <validated-input ref="new_case_name"
                               v-model="new_case_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>

            <div class="new-ag-test-command-container"
                 v-for="(new_command, index) of new_commands">

              <div class="new-ag-test-command-inputs">
                <fieldset class="ag-test-case-modal-fieldset">
                  <legend class="legend">{{format_ordinal_num(index)}}</legend>

                  <div class="ag-test-command-name" v-if="new_commands.length > 1">
                    <label class="text-label"> Command name </label>
                    <validated-input ref="command_name"
                                     v-model="new_command.name"
                                     :validators="[is_not_empty]"
                                     input_style="width: 100%;
                                                  min-width: 200px;
                                                  max-width: 700px;">
                      <div slot="suffix" class="remove-ag-test-command-suffix">
                        <button class="remove-ag-test-command-button"
                                type="button"
                                @click="remove_command(index)">
                          <i class="fas fa-times remove-ag-test-command-icon"></i>
                        </button>
                      </div>
                    </validated-input>
                  </div>

                  <div class="ag-test-command">
                    <label class="text-label"> Command </label>
                    <validated-input ref="command"
                                     v-model="new_command.cmd"
                                     :validators="[is_not_empty]"
                                     input_style="width: 100%;
                                                  min-width: 200px;
                                                  max-width: 700px;">
                    </validated-input>

                    <div>
                      <div v-if="duplicate_command_name_in_case
                                 && new_command.name === duplicate_command_name"
                           class="duplicate-ag-test-command-msg">
                        Duplicate command name
                      </div>
                    </div>

                  </div>
                </fieldset>
              </div>
            </div>

            <APIErrors ref="new_ag_test_case_api_errors"></APIErrors>

            <div class="modal-button-footer">
              <div id="add-ag-test-command-button-container">
                <button class="add-ag-test-command-button"
                        type="button"
                        :disabled="new_commands.length === 3"
                        @click="add_command">
                  <i class="fas fa-plus"></i>
                  <span> Add Another Command </span>
                </button>
              </div>

              <div class="create-ag-test-case-button">
                <button class="modal-create-button"
                        type="submit"
                        :disabled="!add_case_form_is_valid || creating_case">
                  Create Case
                </button>
              </div>
            </div>

          </validated-form>
        </div>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCommand,
  AGTestSuite
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import AGCasePanel from '@/components/project_admin/ag_suites/ag_case_panel.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

export class NewCommandFields {
  name: string;
  cmd: string;

  constructor({name = "", cmd = ""}: {name?: string, cmd?: string}) {
    this.name = name;
    this.cmd = cmd;
  }
}

@Component({
  components: {
    AGCasePanel,
    APIErrors,
    Modal,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGSuitePanel extends Vue {

  @Prop({default: null, type: AGTestSuite})
  active_ag_test_suite!: AGTestSuite | null;

  @Prop({required: true})
  active_ag_test_command!: AGTestCommand | null;

  @Prop({required: true, type: AGTestSuite})
  ag_test_suite!: AGTestSuite;

  add_case_form_is_valid = false;
  cases_are_visible = false;
  creating_case = false;
  duplicate_command_name_in_case = false;
  loading = true;
  new_case_name = "";
  new_commands: NewCommandFields[] = [];

  readonly is_not_empty = is_not_empty;

  @Watch('active_ag_test_command')
  on_active_ag_test_command_changed(new_active_ag_test_command: AGTestCommand,
                                    old_active_ag_test_command: AGTestCommand) {
    if (this.command_in_suite_is_active) {
      this.cases_are_visible = true;
    }
  }

  get command_in_suite_is_active() {
    return this.active_ag_test_command !== null && this.ag_test_suite.ag_test_cases.findIndex(
      (test_case: AGTestCase) => test_case.pk === this.active_ag_test_command!.ag_test_case
    ) !== -1;
  }

  get is_open() {
    return this.cases_are_visible;
  }

  format_ordinal_num(index: number) {
    if (index === 0) {
      return "First";
    }
    return index === 1 ? "Second" : "Third";
  }

  update_ag_test_suite_panel_when_clicked() {
    if (!this.cases_are_visible) {
      this.cases_are_visible = true;
      this.$emit('update_active_item', this.ag_test_suite);
    }
    else {
      if (this.suite_is_active) {
        this.cases_are_visible = false;
      }
      else if (this.command_in_suite_is_active) {
        this.$emit('update_active_item', this.ag_test_suite);
      }
      else {
        this.$emit('update_active_item', this.ag_test_suite);
      }
    }
  }

  add_command() {
    if (this.new_commands.length === 1) {
      this.new_commands[0].name = this.new_case_name;
    }
    this.new_commands.push(new NewCommandFields({}));
  }

  remove_command(index: number) {
    this.new_commands.splice(index, 1);
    if (this.new_commands.length === 1) {
      this.duplicate_command_name_in_case = false;
    }
  }

  get suite_is_active() {
    return this.active_ag_test_suite !== null
           && this.active_ag_test_suite.pk === this.ag_test_suite.pk;
  }

  open_new_ag_test_case_modal() {
    this.$emit('update_active_item', this.ag_test_suite);
    this.duplicate_command_name_in_case = false;
    this.add_command();
    this.new_case_name = "";
    (<Modal> this.$refs.new_ag_test_case_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_case_name).focus();
    });
  }

  get duplicate_command_name(): string {
    let names = new Set();
    for (let new_command of this.new_commands) {
      if (names.has(new_command.name)) {
        return new_command.name;
      }
      names.add(new_command.name);
    }

    return "";
  }

  @handle_api_errors_async(handle_create_ag_test_case_error)
  async create_ag_test_case() {
    try {
      this.creating_case = true;
      this.duplicate_command_name_in_case = false;

      if (this.new_commands.length === 1) {
        this.new_commands[0].name = this.new_case_name;
      }
      else {
        if (this.duplicate_command_name !== "") {
          this.duplicate_command_name_in_case = true;
          return;
        }
      }

      (<APIErrors> this.$refs.new_ag_test_case_api_errors).clear();
      let created_case = await AGTestCase.create(
        this.ag_test_suite!.pk, {name: this.new_case_name}
      );

      for (let i = 0; i < this.new_commands.length; ++i) {
        await AGTestCommand.create(
          created_case.pk, {name: this.new_commands[i].name, cmd: this.new_commands[i].cmd}
        );
      }
      (<ValidatedForm> this.$refs.create_ag_test_case_form).reset_warning_state();
      (<Modal> this.$refs.new_ag_test_case_modal).close();
    }
    finally {
      this.creating_case = false;
    }
  }
}

function handle_create_ag_test_case_error(component: AGSuitePanel, error: unknown) {
  (<APIErrors> component.$refs.new_ag_test_case_api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/forms.scss';

.ag-test-suite {
  @extend .panel;
  padding: 0 5px 0 0;

  .ag-test-suite-symbol-right {
    @extend .caret-right;
  }

  .ag-test-suite-symbol-down {
    @extend .caret-down;
  }

  #ag-test-suite-menu {
    padding: 5px;
    visibility: hidden;
  }
}

.ag-test-suite:hover {
  #ag-test-suite-menu {
    visibility: visible;
    color: darken($stormy-gray-dark, 10);
  }
}

.ag-test-suite-name {
  @extend .level-name;
}

.active-ag-test-suite {
  @extend .active-level;

  #ag-test-suite-menu, #ag-test-suite-menu:hover {
    visibility: visible;
    color: white;
  }

  .ag-test-suite-symbol-right, .ag-test-suite-symbol-down {
    color: white;
  }
}

.active-ag-test-suite:hover {
  #ag-test-suite-menu {
    color: white;
  }
}

.ag-test-suite-in-active-container {
  @extend .parent-of-active-level;
  background-color: white;

  #ag-test-suite-menu, .ag-test-suite-symbol-right, .ag-test-suite-symbol-down {
    color: darken(teal, 10);
  }

  #ag-test-suite-menu {
    visibility: visible;
  }
}

.ag-test-suite-in-active-container:hover {
  #suite-menu {
    color: darken(teal, 10);
  }
}

// Modal **************************************************************

#ag-test-case-name-container {
  padding: 0;
}

.new-ag-test-command-inputs {
  width: 100%;
  padding-top: 14px;
}

.remove-ag-test-command-suffix {
  margin-left: 10px;
  display: flex;
  align-self: stretch;
}

.remove-ag-test-command-button {
  @extend .light-gray-button;
}

.remove-ag-test-command-icon {
  display: flex;
  align-self: center;
  padding: 1px 4px 0 4px;
}

.ag-test-command-name {
  padding: 0 0 3px 0;
  width: 100%;
}

.ag-test-command {
  padding: 0;
  width: 100%;
}

.add-ag-test-command-button {
  @extend .white-button;
  margin-right: 20px;
}

.add-ag-test-command-button span {
  padding-left: 5px;
}

.modal-button-footer {
  padding: 25px 0 5px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.duplicate-ag-test-command-msg {
  box-sizing: border-box;
  color: #721c24;
  display: inline-block;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 2px 10px;
  border-radius: .25rem;
  margin-top: 11px;
}

.ag-test-case-modal-fieldset {
  border-bottom: none;
  border-left: none;
  border-right: none;
  border-color: rgba(255, 255, 255, 0.3);
  border-width: 2px;
  padding: 0;
}

</style>
