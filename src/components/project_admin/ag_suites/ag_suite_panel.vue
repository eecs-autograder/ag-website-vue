<template>
  <div>
    <div class="panel" :class="{'active': suite_is_active}"
         @click="update_ag_test_suite_panel_when_clicked()">
      <div class="text">
        <i class="fas caret" :class="is_open ? 'fa-caret-down' : 'fa-caret-right'"></i>
        <span>{{ag_test_suite.name}}</span>
      </div>

      <div class="icons">
        <i class="icon handle fas fa-arrows-alt"></i>
        <i class="icon fas fa-plus"
           @click.stop="open_new_ag_test_case_modal"
           title="Add Test Case"></i>
      </div>
    </div>

    <div v-if="is_open">
      <draggable ref="ag_test_case_order"
                 v-model="ag_test_suite.ag_test_cases"
                 @change="set_ag_test_case_order"
                 @end="$event.item.style.transform = 'none'"
                 handle=".handle">
        <AGCasePanel v-for="test_case of ag_test_suite.ag_test_cases"
                   :key="test_case.pk"
                   :ag_test_case="test_case"
                   :ag_test_suite="ag_test_suite"
                   :active_ag_test_command="active_ag_test_command"
                   @update_active_item="$emit('update_active_item', $event)">
        </AGCasePanel>
      </draggable>
    </div>

    <modal v-if="d_show_new_ag_test_case_modal"
           @close="d_show_new_ag_test_case_modal = false"
           ref="new_ag_test_case_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> New Test Case </div>
      <validated-form ref="create_ag_test_case_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="create_ag_test_case"
                      @form_validity_changed="d_add_case_form_is_valid = $event">

        <div class="form-field-wrapper">
          <label class="label"> Test name </label>
          <validated-input ref="new_case_name"
                           v-model="d_new_case_name"
                           :validators="[is_not_empty]"
                           :show_warnings_on_blur="true">
          </validated-input>
        </div>

        <fieldset class="fieldset" v-for="(new_command, index) of d_new_commands">
          <legend v-if="d_new_commands.length > 1"
                  class="legend">{{format_ordinal_num(index)}}</legend>

          <div class="form-field-wrapper" v-if="d_new_commands.length > 1">
            <label class="label"> Command name </label>
            <validated-input ref="command_name"
                             v-model="new_command.name"
                             :validators="[is_not_empty]"
                             :show_warnings_on_blur="true"
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

          <div class="form-field-wrapper">
            <label class="label">
              Command
              <i class="fas fa-question-circle input-tooltip">
                <tooltip width="large" placement="right">
                  Can be any valid bash command. <br>
                  Note that if it includes sequencing or piping,
                  you will have to increase the process limit.
                </tooltip>
              </i>
            </label>
            <validated-input ref="command"
                              v-model="new_command.cmd"
                              :validators="[is_not_empty]"
                              :show_warnings_on_blur="true"
                              input_style="width: 100%;
                                           min-width: 200px;
                                           max-width: 700px;">
            </validated-input>

            <div>
              <div v-if="d_duplicate_command_name_in_case
                          && new_command.name === duplicate_command_name"
                    class="duplicate-ag-test-command-msg">
                Duplicate command name
              </div>
            </div>

          </div>
        </fieldset>

        <APIErrors ref="new_ag_test_case_api_errors"></APIErrors>

        <div class="modal-button-footer">
          <button class="modal-create-button"
                  type="submit"
                  :disabled="!d_add_case_form_is_valid || d_creating_case">
            Create Case
          </button>

          <button class="add-ag-test-command-button"
                  type="button"
                  :disabled="d_new_commands.length === 3"
                  @click="add_command">
            <i class="fas fa-plus"></i>
            <span> Add Another Command </span>
          </button>
        </div>
      </validated-form>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

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
    Draggable,
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

  d_show_new_ag_test_case_modal = false;
  d_add_case_form_is_valid = false;
  d_cases_are_visible = false;
  d_creating_case = false;
  d_duplicate_command_name_in_case = false;
  d_new_case_name = "";
  d_new_commands: NewCommandFields[] = [new NewCommandFields({})];

  readonly is_not_empty = is_not_empty;

  @Watch('active_ag_test_command')
  on_active_ag_test_command_changed(new_active_ag_test_command: AGTestCommand,
                                    old_active_ag_test_command: AGTestCommand) {
    if (this.command_in_suite_is_active) {
      this.d_cases_are_visible = true;
    }
  }

  get command_in_suite_is_active() {
    return this.active_ag_test_command !== null && this.ag_test_suite.ag_test_cases.findIndex(
      (test_case: AGTestCase) => test_case.pk === this.active_ag_test_command!.ag_test_case
    ) !== -1;
  }

  get is_open() {
    return this.d_cases_are_visible;
  }

  format_ordinal_num(index: number) {
    if (index === 0) {
      return "First";
    }
    return index === 1 ? "Second" : "Third";
  }

  update_ag_test_suite_panel_when_clicked() {
    if (!this.d_cases_are_visible) {
      this.d_cases_are_visible = true;
      this.$emit('update_active_item', this.ag_test_suite);
    }
    else {
      if (this.suite_is_active) {
        this.d_cases_are_visible = false;
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
    if (this.d_new_commands.length === 1) {
      this.d_new_commands[0].name = this.d_new_case_name;
    }
    this.d_new_commands.push(new NewCommandFields({}));
  }

  remove_command(index: number) {
    this.d_new_commands.splice(index, 1);
    if (this.d_new_commands.length === 1) {
      this.d_duplicate_command_name_in_case = false;
    }
  }

  get suite_is_active() {
    return this.active_ag_test_suite !== null
           && this.active_ag_test_suite.pk === this.ag_test_suite.pk;
  }

  open_new_ag_test_case_modal() {
    this.$emit('update_active_item', this.ag_test_suite);
    this.d_duplicate_command_name_in_case = false;
    this.d_new_case_name = "";
    this.d_show_new_ag_test_case_modal = true;
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_case_name).focus();
    });
  }

  get duplicate_command_name(): string {
    let names = new Set();
    for (let new_command of this.d_new_commands) {
      if (names.has(new_command.name)) {
        return new_command.name;
      }
      names.add(new_command.name);
    }

    return "";
  }

  set_ag_test_case_order() {
    return AGTestCase.update_order(
      this.ag_test_suite.pk, this.ag_test_suite.ag_test_cases.map(test_case => test_case.pk));
  }

  @handle_api_errors_async(handle_create_ag_test_case_error)
  async create_ag_test_case() {
    try {
      this.d_creating_case = true;
      this.d_duplicate_command_name_in_case = false;

      if (this.d_new_commands.length === 1) {
        this.d_new_commands[0].name = this.d_new_case_name;
      }
      else {
        if (this.duplicate_command_name !== "") {
          this.d_duplicate_command_name_in_case = true;
          return;
        }
      }

      (<APIErrors> this.$refs.new_ag_test_case_api_errors).clear();
      let created_case = await AGTestCase.create(
        this.ag_test_suite!.pk, {name: this.d_new_case_name}
      );

      for (let i = 0; i < this.d_new_commands.length; ++i) {
        await AGTestCommand.create(
          created_case.pk, {name: this.d_new_commands[i].name, cmd: this.d_new_commands[i].cmd}
        );
      }
      (<ValidatedForm> this.$refs.create_ag_test_case_form).reset_warning_state();
      this.d_show_new_ag_test_case_modal = false;
    }
    finally {
      this.d_creating_case = false;
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
@import '@/styles/forms.scss';
@import '@/styles/list_panels.scss';
@import '@/styles/modal.scss';

@import './ag_tests.scss';

@include list-panels($indentation: $panel-indentation);

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.remove-ag-test-command-suffix {
  margin-left: .375rem;
}

.remove-ag-test-command-button {
  @extend .flat-white-button;
  padding: .375rem .5rem;
}

.remove-ag-test-command-icon {
  padding: 0 .25rem;
}

.add-ag-test-command-button {
  @extend .white-button;
  margin-left: auto;
}

.add-ag-test-command-button .fa-plus {
  padding-right: .25rem;
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

</style>
