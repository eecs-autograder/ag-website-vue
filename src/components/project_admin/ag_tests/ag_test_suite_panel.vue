<template>
  <div>
    <div class="panel level-0" :class="{'active': suite_is_active}">
      <button type="button"
              class="panel-toggle unstyled-button"
              :aria-expanded="is_open"
              :aria-controls="`cases-container-${label_uid}`"
              @click="update_ag_test_suite_panel_when_clicked()">
        <div class="text">
          <i class="fas caret" :class="is_open ? 'fa-caret-down' : 'fa-caret-right'"></i>
          <span>{{ag_test_suite.name}}</span>
        </div>
      </button>

      <div class="icons">
        <i class="icon handle fas fa-arrows-alt" aria-hidden="true"></i>
        <MoveButtons :index="index"
                     :count="suite_count"
                     @move_up="$emit('move_up')"
                     @move_down="$emit('move_down')" />
        <button type="button"
                class="icon add-ag-test-case-button"
                aria-label="Add Test Case"
                @click.stop="open_new_ag_test_case_modal">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>

    <div v-show="is_open" :id="`cases-container-${label_uid}`">
      <div v-if="is_open">
        <draggable ref="ag_test_case_order"
                  v-model="ag_test_suite.ag_test_cases"
                  @start="d_pre_drag_case_order = ag_test_suite.ag_test_cases.slice()"
                  @change="case_order_syncer.schedule(ag_test_suite.ag_test_cases,
                                                      d_pre_drag_case_order)"
                  @end="$event.item.style.transform = 'none'"
                  handle=".handle">
          <AGTestCasePanel
                    v-for="(test_case, case_index) of ag_test_suite.ag_test_cases"
                    :key="test_case.pk"
                    :ag_test_case="test_case"
                    :ag_test_suite="ag_test_suite"
                    :index="case_index"
                    :case_count="ag_test_suite.ag_test_cases.length"
                    :active_ag_test_command="active_ag_test_command"
                    @update_active_item="$emit('update_active_item', $event)"
                    @move_up="move_ag_test_case(case_index, -1)"
                    @move_down="move_ag_test_case(case_index, 1)">
          </AGTestCasePanel>
        </draggable>
      </div>
    </div>

    <modal v-if="d_show_new_ag_test_case_modal"
           @close="d_show_new_ag_test_case_modal = false"
           ref="new_ag_test_case_modal"
           click_outside_to_close
           aria_label="New test case"
           size="large">
      <div class="modal-header"> New Test Case </div>
      <validated-form ref="create_ag_test_case_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="create_ag_test_case"
                      @form_validity_changed="d_add_case_form_is_valid = $event">

        <div class="form-field-wrapper">
          <label class="label" :for="`new-case-name-${label_uid}`"> Test name </label>
          <validated-input ref="new_case_name"
                           v-model="d_new_case_name"
                           :validators="[is_not_empty]"
                           :input_id="`new-case-name-${label_uid}`">
          </validated-input>
        </div>

        <fieldset class="fieldset" v-for="(new_command, index) of d_new_commands">
          <legend v-if="d_new_commands.length > 1"
                  class="legend">{{format_ordinal_num(index)}}</legend>

          <div class="form-field-wrapper" v-if="d_new_commands.length > 1">
            <label class="label" :for="`command-name-${label_uid}-${index}`"> Command name </label>
            <validated-input ref="command_name"
                             v-model="new_command.name"
                             :validators="[is_not_empty]"
                             :input_id="`command-name-${label_uid}-${index}`"
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
            <label class="label" :for="`command-cmd-${label_uid}-${index}`">
              Command
              <tooltip width="medium" placement="top">
                Can be any valid bash command.
              </tooltip>
            </label>
            <validated-input ref="command"
                              v-model="new_command.cmd"
                              :validators="[is_not_empty]"
                              :input_id="`command-cmd-${label_uid}-${index}`"
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
import { APIErrorsExposed } from '@/exposed_component_types/api_errors_exposed';
import Modal from '@/components/modal.vue';
import MoveButtons from '@/components/MoveButtons.vue';
import AGTestCasePanel from '@/components/project_admin/ag_tests/ag_test_case_panel.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import {
  GlobalErrorsSubject,
  handle_api_errors_async,
} from '@/error_handling';
import { OrderSyncer } from '@/order_syncer';
import { generate_uid } from '@/utils';
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
    AGTestCasePanel,
    APIErrors,
    Draggable,
    Modal,
    MoveButtons,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGTestSuitePanel extends Vue {

  @Prop({default: null, type: AGTestSuite})
  active_ag_test_suite!: AGTestSuite | null;

  @Prop({required: true})
  active_ag_test_command!: AGTestCommand | null;

  @Prop({required: true, type: AGTestSuite})
  ag_test_suite!: AGTestSuite;

  @Prop({required: true, type: Number})
  index!: number;

  @Prop({required: true, type: Number})
  suite_count!: number;

  // Snapshot of the order before a drag starts, passed to the syncer as the rollback target.
  private d_pre_drag_case_order: AGTestCase[] = [];

  d_show_new_ag_test_case_modal = false;
  d_add_case_form_is_valid = false;
  d_cases_are_visible = false;
  d_creating_case = false;
  d_duplicate_command_name_in_case = false;
  d_new_case_name = "";
  d_new_commands: NewCommandFields[] = [new NewCommandFields({})];

  readonly is_not_empty = is_not_empty;

  private case_order_syncer = new OrderSyncer<AGTestCase>(
    (cases) => AGTestCase.update_order(this.ag_test_suite.pk, cases.map(c => c.pk)),
    (saved) => {
      this.ag_test_suite.ag_test_cases.splice(
        0, this.ag_test_suite.ag_test_cases.length, ...saved
      );
    },
    (e) => { GlobalErrorsSubject.get_instance().report_error(e); }
  );

  beforeDestroy() {
    this.case_order_syncer.flush();
  }

  get label_uid() {
    return generate_uid();
  }

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

  move_ag_test_case(index: number, delta: number) {
    const cases = this.ag_test_suite.ag_test_cases;
    const prev_order = cases.slice();
    cases.splice(index + delta, 0, cases.splice(index, 1)[0]);
    this.case_order_syncer.schedule(cases, prev_order);
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

      const api_errors = this.$refs.new_ag_test_case_api_errors as APIErrorsExposed | undefined;
      api_errors?.clear();
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

function handle_create_ag_test_case_error(component: AGTestSuitePanel, error: unknown) {
  const api_errors = component.$refs.new_ag_test_case_api_errors as APIErrorsExposed | undefined;
  api_errors?.show_errors_from_response(error);
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

.panel-toggle {
  text-align: left;
}

.handle {
  cursor: grabbing;
}

.add-ag-test-case-button {
  background: none;
  border: none;
  padding: 0 .25rem;
  cursor: pointer;
  color: inherit;

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
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
