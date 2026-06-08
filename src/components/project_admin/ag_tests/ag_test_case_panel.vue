<template>
  <div>
    <div class="ag-test-case panel level-1"
          :class="{'active': command_in_case_is_active && (!is_open || !has_multiple_commands)}">
      <button type="button"
              class="panel-toggle"
              :aria-controls="has_multiple_commands ? `commands-container-${label_uid}` : ''"
              :aria-expanded="is_open"
              @click="update_ag_test_case_panel_when_clicked">
        <div class="text">
          <i v-if="ag_test_case.ag_test_commands.length > 1"
            class="fas caret" :class="is_open ? 'fa-caret-down' : 'fa-caret-right'"></i>
          <span>{{ag_test_case.name}}</span>
        </div>
      </button>

      <div class="icons">
        <i class="icon handle fas fa-arrows-alt" aria-hidden="true"></i>
        <MoveButtons :index="index"
                     :count="case_count"
                     @move_up="$emit('move_up')"
                     @move_down="$emit('move_down')" />
        <div class="dropdown">
          <button type="button"
                  class="menu-icon-button icon"
                  aria-label="Test case options"
                  @click.stop="$emit('update_active_item', ag_test_case)">
            <i class="fas fa-ellipsis-h"></i>
          </button>
          <div class="menu">
            <button ref="add_ag_test_command_menu_item"
                    type="button"
                    @click="open_new_ag_test_command_modal"
                    class="menu-item">
              <i class="fas fa-plus"></i>
              <span class="menu-item-text">Add command</span>
            </button>
            <template>
              <div class="menu-divider"> </div>
              <button ref="edit_ag_test_case_menu_item"
                      type="button"
                      @click="d_show_ag_test_case_settings_modal = true"
                      class="menu-item">
                <i class="fas fa-pencil-alt"></i>
                <span class="menu-item-text">Advanced test settings</span>
              </button>
            </template>
            <div class="menu-divider"> </div>
            <button ref="clone_ag_test_case_menu_item"
                    type="button"
                    @click="open_clone_ag_test_case_modal"
                    class="menu-item">
              <i class="far fa-copy"></i>
              <span class="menu-item-text"> Clone test case </span>
            </button>
            <div class="menu-divider"> </div>
            <button ref="delete_ag_test_case_menu_item"
                    type="button"
                    @click="d_show_delete_ag_test_case_modal = true"
                    class="menu-item">
              <i class="fas fa-trash-alt"></i>
              <span class="delete-ag-test-case-label menu-item-text"> Delete test case </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      :id="`commands-container-${label_uid}`"
      class="commands-container"
      v-show="is_open && has_multiple_commands"
    >
      <div v-if="is_open && has_multiple_commands">
        <draggable ref="ag_test_command_order"
                  v-model="ag_test_case.ag_test_commands"
                  @start="d_pre_drag_command_order = ag_test_case.ag_test_commands.slice()"
                  @change="command_order_syncer.schedule(ag_test_case.ag_test_commands,
                                                          d_pre_drag_command_order)"
                  @end="$event.item.style.transform = 'none'"
                  handle=".handle">
          <AGTestCommandPanel
                    v-for="(ag_test_command, cmd_index) of ag_test_case.ag_test_commands"
                    :key="ag_test_command.pk"
                    :ag_test_command="ag_test_command"
                    :active_ag_test_command="active_ag_test_command"
                    :index="cmd_index"
                    :command_count="ag_test_case.ag_test_commands.length"
                    @update_active_item="$emit('update_active_item', $event)"
                    @move_up="move_command(cmd_index, -1)"
                    @move_down="move_command(cmd_index, 1)">
          </AGTestCommandPanel>
        </draggable>
      </div>
    </div>

    <modal v-if="d_show_new_ag_test_command_modal"
           @close="d_show_new_ag_test_command_modal = false"
           ref="new_ag_test_command_modal"
           click_outside_to_close
           aria_label="Add command"
           size="medium">
      <div class="modal-header"> Add Command </div>
      <validated-form ref="add_ag_test_command_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="add_ag_test_command"
                      @form_validity_changed="d_add_command_form_is_valid = $event">
        <div class="form-field-wrapper">
          <label class="label" :for="`new-command-name-${label_uid}`"> Command name </label>
          <validated-input ref="new_ag_test_command_name"
                           v-model="d_new_command_name"
                           :validators="[is_not_empty]"
                           :input_id="`new-command-name-${label_uid}`">
          </validated-input>
        </div>
        <div class="form-field-wrapper">
          <label class="label" :for="`new-command-${label_uid}`">Command</label>
          <validated-input ref="new_ag_test_command"
                           v-model="d_new_command"
                           :validators="[is_not_empty]"
                           :input_id="`new-command-${label_uid}`">
          </validated-input>
        </div>

        <APIErrors ref="new_command_api_errors"></APIErrors>

        <div class="modal-button-footer">
          <button class="modal-create-button"
                  type="submit"
                  :disabled="!d_add_command_form_is_valid || d_adding_command">
            Add Command
          </button>
        </div>
      </validated-form>
    </modal>

    <modal v-if="d_show_clone_ag_test_case_modal"
           @close="d_show_clone_ag_test_case_modal = false"
           ref="clone_ag_test_case_modal"
           size="large"
           click_outside_to_close
           :aria_label="`Clone ${ag_test_case.name}`"
           include_closing_x>
      <div class="modal-header">Clone "{{ag_test_case.name}}"</div>
      <validated-form ref="clone_ag_test_case_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="clone_ag_test_case"
                      @form_validity_changed="d_clone_case_form_is_valid = $event">
        <div class="form-field-wrapper">
          <label class="label" :for="`clone-case-name-${label_uid}`">Case Name</label>
          <validated-input ref="ag_test_case_clone_name"
                           v-model="d_cloned_case_name"
                           :validators="[is_not_empty]"
                           :input_id="`clone-case-name-${label_uid}`">
          </validated-input>
        </div>
        <APIErrors ref="clone_case_api_errors"></APIErrors>
        <div class="modal-button-footer">
          <button class="save-button"
                  ref="modal_clone_ag_test_case_button"
                  type="submit"
                  :disabled="d_cloning || !d_clone_case_form_is_valid">
            Clone Test Case
          </button>
        </div>
      </validated-form>
    </modal>

    <modal v-if="d_show_delete_ag_test_case_modal"
           @close="d_show_delete_ag_test_case_modal = false"
           ref="delete_ag_test_case_modal"
           size="large"
           aria_label="Delete test case"
           click_outside_to_close>
      <div class="modal-header">
        Delete "{{ag_test_case.name}}"
      </div>

      Are you sure you want to delete the test case:
      <span class="item-to-delete">{{ag_test_case.name}}</span>? <br><br>
      This will delete all associated run results. <br>
      <b>THIS ACTION CANNOT BE UNDONE.</b>

      <APIErrors ref="delete_errors"></APIErrors>
      <div class="modal-button-footer">
        <button class="modal-delete-button"
                :disabled="d_deleting"
                @click="delete_ag_test_case()"> Delete </button>

        <button class="modal-cancel-button"
                @click="d_show_delete_ag_test_case_modal = false"> Cancel </button>
      </div>
    </modal>

    <modal v-if="d_show_ag_test_case_settings_modal"
           @close="d_show_ag_test_case_settings_modal = false"
           ref="ag_test_case_settings_modal"
           size="large"
           aria_label="Advanced test case settings"
           click_outside_to_close>
      <div class="modal-header">
        Advanced Test Case Settings
      </div>
      <AGTestCaseSettings :ag_test_case="ag_test_case"></AGTestCaseSettings>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

import { AGTestCase, AGTestCommand, AGTestSuite } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import { APIErrorsExposed } from '@/exposed_component_types/api_errors_exposed';
import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';
import Modal from '@/components/modal.vue';
import MoveButtons from '@/components/MoveButtons.vue';
import AGTestCaseSettings from '@/components/project_admin/ag_tests/ag_test_case_settings.vue';
import AGTestCommandPanel from '@/components/project_admin/ag_tests/ag_test_command_panel.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import {
  GlobalErrorsSubject,
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func
} from '@/error_handling';
import { OrderSyncer } from '@/order_syncer';
import { generate_uid, toggle } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    AGTestCaseSettings,
    AGTestCommandPanel,
    ContextMenu,
    ContextMenuItem,
    Draggable,
    Modal,
    MoveButtons,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGTestCasePanel extends Vue {

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  @Prop({required: true, type: AGTestSuite})
  ag_test_suite!: AGTestSuite;

  @Prop({required: false, type: AGTestCommand})
  active_ag_test_command!: AGTestCommand | null;

  @Prop({required: true, type: Number})
  index!: number;

  @Prop({required: true, type: Number})
  case_count!: number;

  // Snapshot of the order before a drag starts, passed to the syncer as the rollback target.
  private d_pre_drag_command_order: AGTestCommand[] = [];

  readonly is_not_empty = is_not_empty;

  private command_order_syncer = new OrderSyncer<AGTestCommand>(
    (cmds) => AGTestCommand.update_order(this.ag_test_case.pk, cmds.map(cmd => cmd.pk)),
    (saved) => {
      this.ag_test_case.ag_test_commands.splice(
        0, this.ag_test_case.ag_test_commands.length, ...saved
      );
    },
    (e) => { GlobalErrorsSubject.get_instance().report_error(e); }
  );

  beforeDestroy() {
    this.command_order_syncer.flush();
  }

  get label_uid() {
    return generate_uid();
  }

  d_add_command_form_is_valid = false;
  d_clone_case_form_is_valid = true;
  d_adding_command = false;
  d_cloning = false;
  d_deleting = false;
  d_show_ag_test_case_settings_modal = false;
  d_show_new_ag_test_command_modal = false;
  d_show_clone_ag_test_case_modal = false;
  d_show_delete_ag_test_case_modal = false;
  d_new_command_name = "";
  d_new_command = "";
  d_cloned_case_name: string = "";

  get commands_are_visible() {
    return this.d_commands_are_visible;
  }
  private d_commands_are_visible = false;

  @Watch('active_ag_test_command')
  on_active_ag_test_command_changed(new_active_ag_test_command: AGTestCommand,
                                    old_active_ag_test_command: AGTestCommand) {
    if (this.active_ag_test_command !== null
        && new_active_ag_test_command.ag_test_case === this.ag_test_case.pk) {
      this.d_commands_are_visible = true;
    }
  }

  created() {
    if (this.command_in_case_is_active) {
      this.d_commands_are_visible = true;
    }
  }

  get has_multiple_commands() {
    return this.ag_test_case.ag_test_commands.length > 1;
  }

  get command_in_case_is_active() {
    return this.active_ag_test_command !== null
           && this.active_ag_test_command.ag_test_case === this.ag_test_case.pk;
  }

  open_new_ag_test_command_modal() {
    this.d_new_command = "";
    this.d_new_command_name = "";
    this.d_show_new_ag_test_command_modal = true;
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_ag_test_command_name).focus();
    });
  }

  open_clone_ag_test_case_modal() {
    this.d_cloned_case_name = this.ag_test_case.name;
    this.d_show_clone_ag_test_case_modal = true;
    Vue.nextTick(() => {
        (<ValidatedInput> this.$refs.ag_test_case_clone_name).focus({select: true});
    });
  }

  get is_open() {
    return this.d_commands_are_visible;
  }

  update_ag_test_case_panel_when_clicked() {
    if (!this.d_commands_are_visible) {
      if (this.command_in_case_is_active) {
        this.d_commands_are_visible = true;
      }
      else {
        this.d_commands_are_visible = true;
        this.$emit('update_active_item', this.ag_test_case);
      }
    }
    else {
      if (!this.command_in_case_is_active) {
        this.$emit('update_active_item', this.ag_test_case);
      }
      else {
        this.d_commands_are_visible = false;
      }
    }
  }

  @handle_api_errors_async(make_error_handler_func('delete_errors'))
  delete_ag_test_case() {
    return toggle(this, 'd_deleting', async () => {
      await this.ag_test_case.delete();
      this.d_show_delete_ag_test_case_modal = false;
    });
  }

  @handle_api_errors_async(handle_clone_ag_test_case_error)
  async clone_ag_test_case() {
    try {
      this.d_cloning = true;
      await this.ag_test_case.copy(this.d_cloned_case_name);
      this.d_show_clone_ag_test_case_modal = false;
    }
    finally {
      this.d_cloning = false;
    }
  }

  move_command(index: number, delta: number) {
    const cmds = this.ag_test_case.ag_test_commands;
    const prev_order = cmds.slice();
    cmds.splice(index + delta, 0, cmds.splice(index, 1)[0]);
    this.command_order_syncer.schedule(cmds, prev_order);
  }

  @handle_api_errors_async(handle_add_ag_test_command_error)
  async add_ag_test_command() {
    try {
      this.d_adding_command = true;
      await AGTestCommand.create(
        this.ag_test_case!.pk, {name: this.d_new_command_name, cmd: this.d_new_command}
      );
      this.d_show_new_ag_test_command_modal = false;
    }
    finally {
      this.d_adding_command = false;
    }
  }
}

function handle_add_ag_test_command_error(component: AGTestCasePanel, error: unknown) {
  const api_errors = component.$refs.new_command_api_errors as APIErrorsExposed | undefined;
  api_errors?.show_errors_from_response(error);
}

function handle_clone_ag_test_case_error(component: AGTestCasePanel, error: unknown) {
  const api_errors = component.$refs.clone_case_api_errors as APIErrorsExposed | undefined;
  api_errors?.show_errors_from_response(error);
}


</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/list_panels.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';
@import '@/styles/static_dropdown.scss';

@import './ag_tests.scss';

* {
  box-sizing: border-box;
}

.delete-ag-test-case-label {
  color: $warning-red;
}

@include list-panels($indentation: $panel-indentation);

.panel-toggle {
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
}

.handle {
  cursor: grabbing;
}


.dropdown {
  color: black;  // For when the case panel is active
  @include static-dropdown($open-on-hover: true, $orient-right: true);

  .menu-icon-button {
    background: none;
    border: none;
    padding: 0 .25rem;
    cursor: pointer;
    color: inherit;
  }

  .menu-item {
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    padding: .375rem;
    cursor: pointer;
    color: inherit;
  }
}

.menu-item-text {
  margin-left: .625rem;
}

</style>
