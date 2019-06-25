<template>
  <div id="ag-suite-panel" v-if="test_suite !== null">
      <div :class="['test-suite',
                   {'active-suite': is_active_suite},
                   {'suite-in-active-container': case_or_command_is_active_level}]"
           @click="toggle_is_open">

        <div class="test-suite-name">
          <i v-if="is_open" class="fas fa-caret-down suite-symbol-down"></i>
          <i v-else class="fas fa-caret-right suite-symbol-right"></i>
          <span>{{test_suite.name}}</span>
        </div>

        <div id="suite-menu"
             title="Add Case"
             @click.stop="open_new_case_modal">
          <i class="fas fa-plus"></i>
        </div>
      </div>

      <div class="cases-container" v-if="is_open">
        <div v-for="(test_case, index) of test_suite.ag_test_cases"
             :key="test_case.pk">
          <AGCasePanel :test_case="test_case"
                       :test_suite="test_suite"
                       :active_case="active_case"
                       :active_command="active_command"
                       @update_active_suite="$emit('update_active_suite', $event)"
                       @update_active_case="$emit('update_active_case', $event)"
                       @update_active_command="$emit('update_active_command', $event)">
          </AGCasePanel>
        </div>
      </div>

    <modal ref="new_case_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> New Case </div>
      <hr>
      <div class="modal-body">
        <div class="name-container">
          <validated-form ref="create_case_form"
                          autocomplete="off"
                          spellcheck="false"
                          @submit.native.prevent="create_case"
                          @form_validity_changed="add_case_form_is_valid = $event">

            <div id="case-name-container">
              <label class="text-label"> Case name </label>
              <validated-input ref="new_case_name"
                               v-model="new_case_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>

            <div class="new-command-container" v-for="(new_command, index) of new_commands">

              <div class="new-command-inputs">
                <fieldset class="case-modal-fieldset">
                  <legend class="legend"> {{get_ordinal_num(index)}} </legend>

                  <div class="command-name" v-if="new_commands.length > 1">
                    <label class="text-label"> Command name </label>
                    <validated-input ref="command_name"
                                     v-model="new_command.name"
                                     :validators="[is_not_empty]"
                                     input_style="width: 100%;
                                                  min-width: 200px;
                                                  max-width: 700px;">
                      <div slot="suffix" class="remove-command-suffix">
                        <button class="remove-command-button"
                                type="button"
                                @click="remove_command(index)">
                          <i class="fas fa-times remove-command-icon"></i>
                        </button>
                      </div>
                    </validated-input>
                  </div>

                  <div class="command">
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
                           class="duplicate-command-msg">
                        Duplicate command name
                      </div>
                    </div>

                  </div>
                </fieldset>
              </div>
            </div>

            <APIErrors ref="new_case_api_errors"></APIErrors>

            <div class="modal-button-footer">
              <div id="add-command-button-container">
                <button class="add-command-button"
                        type="button"
                        :disabled="new_commands.length === 3"
                        @click="add_command">
                  <i class="fas fa-plus"></i>
                  <span> Add Another Command </span>
                </button>
              </div>

              <div class="create-case-button">
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

interface CommandInCase {
  name: string;
  cmd: string;
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
  active_suite!: AGTestSuite | null;

  @Prop({required: true})
  active_case!: AGTestCase | null;

  @Prop({required: true})
  active_command!: AGTestCommand | null;

  @Prop({required: true, type: AGTestSuite})
  test_suite!: AGTestSuite;

  @Watch('test_suite', {deep: true})
  on_test_suite_change(new_test_suite: AGTestSuite, old_test_suite: AGTestSuite) {
    this.test_suite = new_test_suite;
  }

  readonly is_not_empty = is_not_empty;

  get_ordinal_num(index: number) {
    if (index === 0) {
      return "First";
    }
    return index === 1 ? "Second" : "Third";
  }

  add_case_form_is_valid = false;
  incomplete_input_present = false;
  duplicate_command_name_in_case = false;
  creating_case = false;
  loading = true;
  is_open = false;
  new_case_name = "";
  new_commands: CommandInCase[] = [];

  add_command() {
    if (this.new_commands.length === 1) {
      this.new_commands[0].name = this.new_case_name;
    }
    this.new_commands.push({
      name: "",
      cmd: ""
    });
  }

  remove_command(index: number) {
    this.new_commands.splice(index, 1);
    if (this.new_commands.length === 1) {
      this.duplicate_command_name_in_case = false;
    }
  }

  toggle_is_open() {
    if (this.is_open && this.active_suite === this.test_suite) {
      this.close();
    }
    else {
      this.open();
    }
  }

  open() {
    this.is_open = true;
    this.$emit('update_active_suite', this.test_suite);
  }

  close() {
    this.$emit('update_active_suite', null);
    this.is_open = false;
  }

  get is_active_suite() {
    if (this.active_suite !== null && this.active_suite.pk === this.test_suite.pk) {
      if (!this.is_open) {
        this.is_open = true;
      }
      return true;
    }
    return false;
  }

  get case_or_command_is_active_level() {
    return this.is_active_suite && this.active_case !== null;
  }

  open_new_case_modal() {
    if (this.active_suite === null || this.active_suite.pk !== this.test_suite!.pk) {
      this.$emit('update_active_suite', this.test_suite);
    }
    this.duplicate_command_name_in_case = false;
    this.new_commands = [{name: "", cmd: ""}];
    this.new_case_name = "";
    (<Modal> this.$refs.new_case_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_case_name).invoke_focus();
    });
  }

  get duplicate_command_name() {
    if (this.new_commands.length > 1) {
      if (this.new_commands[0].name === this.new_commands[1].name) {
        return this.new_commands[0].name;
      }
      if (this.new_commands.length === 3) {
        if (this.new_commands[0].name === this.new_commands[2].name
            || this.new_commands[1].name === this.new_commands[2].name) {
          return this.new_commands[2].name;
        }
      }
    }
    return "";
  }

  @handle_api_errors_async(handle_create_ag_case_error)
  async create_case() {
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

      (<APIErrors> this.$refs.new_case_api_errors).clear();
      let created_case = await AGTestCase.create(this.test_suite!.pk, {name: this.new_case_name});

      for (let i = 0; i < this.new_commands.length; ++i) {
        await AGTestCommand.create(
          created_case.pk, { name: this.new_commands[i].name, cmd: this.new_commands[i].cmd }
        );
      }
      (<ValidatedForm> this.$refs.create_case_form).reset_warning_state();
      (<Modal> this.$refs.new_case_modal).close();
    }
    finally {
      this.creating_case = false;
    }
  }
}

function handle_create_ag_case_error(component: AGSuitePanel, error: unknown) {
  (<APIErrors> component.$refs.new_case_api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/forms.scss';

.test-suite {
  @extend .panel;
  padding: 0 5px 0 0;

  .suite-symbol-right {
    @extend .caret-right;
  }

  .suite-symbol-down {
    @extend .caret-down;
  }

  #suite-menu {
    padding: 5px;
    visibility: hidden;
  }
}

.test-suite:hover {
  #suite-menu {
    visibility: visible;
    color: darken($stormy-gray-dark, 10);
  }
}

.test-suite-name {
  @extend .level-name;
}

.active-suite {
  @extend .active-level;

  #suite-menu, #suite-menu:hover {
    visibility: visible;
    color: white;
  }

  .suite-symbol-right, .suite-symbol-down {
    color: white;
  }
}

.active-suite:hover {
  #suite-menu {
    color: white;
  }
}

.suite-in-active-container {
  @extend .parent-of-active-level;
  background-color: white;

  #suite-menu, .suite-symbol-right, .suite-symbol-down {
    color: darken(teal, 10);
  }

  #suite-menu {
    visibility: visible;
  }
}

.suite-in-active-container:hover {
  #suite-menu {
    color: darken(teal, 10);
  }
}

// Modal **************************************************************

#case-name-container {
  padding: 0;
}

.new-command-inputs {
  width: 100%;
  padding-top: 14px;
}

.remove-command-suffix {
  margin-left: 10px;
  display: flex;
  align-self: stretch;
}

.remove-command-button {
  @extend .light-gray-button;
}

.remove-command-icon {
  display: flex;
  align-self: center;
  padding: 1px 4px 0 4px;
}

.command-name {
  padding: 0 0 3px 0;
  width: 100%;
}

.command {
  padding: 0;
  width: 100%;
}

.add-command-button {
  @extend .white-button;
  margin-right: 20px;
}

.add-command-button span {
  padding-left: 5px;
}

.modal-button-footer {
  padding: 25px 0 5px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.duplicate-command-msg {
  box-sizing: border-box;
  color: #721c24;
  display: inline-block;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 2px 10px;
  border-radius: .25rem;
  margin-top: 11px;
}

.case-modal-fieldset {
  border-bottom: none;
  border-left: none;
  border-right: none;
  border-color: rgba(255, 255, 255, 0.3);
  border-width: 2px;
  padding: 0;
}

</style>
