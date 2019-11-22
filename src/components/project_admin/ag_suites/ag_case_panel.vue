<template>
  <div>
    <div class="ag-test-case panel level-1"
          :class="{'active': command_in_case_is_active && (!is_open || !has_multiple_commands)}"
          @click="update_ag_test_case_panel_when_clicked">
      <div class="text">
        <i v-if="ag_test_case.ag_test_commands.length > 1"
          class="fas caret" :class="is_open ? 'fa-caret-down' : 'fa-caret-right'"></i>
        <span>{{ag_test_case.name}}</span>
      </div>

      <div class="icons">
        <i class="icon handle fas fa-arrows-alt"></i>
        <div class="dropdown" @click.stop="$emit('update_active_item', ag_test_case)">
          <i class="menu-icon icon fas fa-ellipsis-h"></i>
          <div class="menu">
            <div ref="add_ag_test_command_menu_item"
                @click="open_new_ag_test_command_modal"
                class="menu-item">
              <i class="fas fa-plus"></i>
              <span class="menu-item-text">Add command</span>
            </div>
            <div class="menu-divider"> </div>
            <div ref="edit_ag_test_case_menu_item"
                @click="d_show_ag_test_case_settings_modal = true"
                class="menu-item">
              <i class="fas fa-pencil-alt"></i>
              <span class="menu-item-text">Edit test case settings</span>
            </div>
            <div class="menu-divider"> </div>
            <div ref="clone_ag_test_case_menu_item"
                @click="open_clone_ag_test_case_modal"
                class="menu-item">
              <i class="far fa-copy"></i>
              <span class="menu-item-text"> Clone test case </span>
            </div>
            <div class="menu-divider"> </div>
            <div ref="delete_ag_test_case_menu_item"
                @click="d_show_delete_ag_test_case_modal = true"
                class="menu-item">
              <i class="fas fa-trash-alt"></i>
              <span class="delete-ag-test-case-label menu-item-text"> Delete test case </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="commands-container" v-if="is_open && has_multiple_commands">
      <draggable ref="ag_test_command_order"
                 v-model="ag_test_case.ag_test_commands"
                 @change="set_ag_test_command_order"
                 @end="$event.item.style.transform = 'none'"
                 handle=".handle">
        <div class="ag-test-command panel level-2"
             v-for="ag_test_command of ag_test_case.ag_test_commands"
             :key="ag_test_command.pk"
             :class="{'active': active_ag_test_command !== null
                                 && active_ag_test_command.pk === ag_test_command.pk}"
             @click="$emit('update_active_item', ag_test_command)">
          <div class="text">
            <span>{{ag_test_command.name}}</span>
          </div>
          <div class="icons">
            <i class="icon handle fas fa-arrows-alt"></i>
          </div>
        </div>
      </draggable>
    </div>

    <modal v-if="d_show_new_ag_test_command_modal"
           @close="d_show_new_ag_test_command_modal = false"
           ref="new_ag_test_command_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Test Command </div>
      <hr>
      <div class="modal-body">
        <validated-form id="add-ag-test-command-form"
                        autocomplete="off"
                        spellcheck="false"
                        @submit="add_ag_test_command"
                        @form_validity_changed="d_add_command_form_is_valid = $event">
          <div id="ag-test-name-and-command">
            <div id="ag-test-command-name-container">
              <label class="text-label"> Command name </label>
              <validated-input ref="new_ag_test_command_name"
                               v-model="d_new_command_name"
                               :show_warnings_on_blur="true"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
            <div id="ag-test-command-container">
              <label class="text-label">Command</label>
              <validated-input ref="new_ag_test_command"
                               v-model="d_new_command"
                               :show_warnings_on_blur="true"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
          </div>

          <APIErrors ref="new_command_api_errors"></APIErrors>

          <button class="modal-create-button"
                  :disabled="!d_add_command_form_is_valid || d_adding_command">
            Add Command
          </button>
        </validated-form>
      </div>
    </modal>

    <modal v-if="d_show_clone_ag_test_case_modal"
           @close="d_show_clone_ag_test_case_modal = false"
           ref="clone_ag_test_case_modal"
           size="large"
           click_outside_to_close
           include_closing_x>
      <div class="modal-header">Clone AG Test Case</div>
      <hr>
      <div class="modal-body">
        <validated-form id="clone-ag-test-case-form"
                        autocomplete="off"
                        spellcheck="false"
                        @submit="clone_ag_test_case"
                        @form_validity_changed="d_clone_case_form_is_valid = $event">
          <label class="text-label">Case Name</label>
          <validated-input ref="ag_test_case_clone_name"
                           v-model="d_cloned_case_name"
                           :show_warnings_on_blur="true"
                           :validators="[is_not_empty]">
          </validated-input>
          <APIErrors ref="clone_case_api_errors"></APIErrors>
          <div class="modal-button-container">
            <button id="modal-clone-ag-test-case-button"
                    type="submit"
                    :disabled="d_cloning || !d_clone_case_form_is_valid">
              Clone Case
            </button>
          </div>
        </validated-form>
      </div>
    </modal>

    <modal v-if="d_show_delete_ag_test_case_modal"
           @close="d_show_delete_ag_test_case_modal = false"
           ref="delete_ag_test_case_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header">
        Delete "{{ag_test_case.name}}"
      </div>
      <hr>
      <div class="modal-body">
        <p>
          Are you sure you want to delete the test case:
          <span class="item-to-delete">{{ag_test_case.name}}</span>? <br>
          This will delete all associated run results. <br>
          THIS ACTION CANNOT BE UNDONE.
        </p>
        <div class="deletion-modal-button-footer">
          <button class="modal-delete-button"
                  :disabled="d_deleting"
                  @click="delete_ag_test_case()"> Delete </button>

          <button class="modal-cancel-button"
                  @click="d_show_delete_ag_test_case_modal = false"> Cancel </button>
        </div>
      </div>
    </modal>

    <modal v-if="d_show_ag_test_case_settings_modal"
           @close="d_show_ag_test_case_settings_modal = false"
           ref="ag_test_case_settings_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header">
        Test Case Settings
      </div>
      <hr>
      <div class="modal-body">
        <AGCaseSettings :ag_test_case="ag_test_case"></AGCaseSettings>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

import { AGTestCase, AGTestCommand, AGTestSuite } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';
import Modal from '@/components/modal.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { handle_api_errors_async, toggle } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    AGCaseSettings,
    ContextMenu,
    ContextMenuItem,
    Draggable,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGCasePanel extends Vue {

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  @Prop({required: true, type: AGTestSuite})
  ag_test_suite!: AGTestSuite;

  @Prop({required: false, type: AGTestCommand})
  active_ag_test_command!: AGTestCommand | null;

  readonly is_not_empty = is_not_empty;

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
    this.d_cloned_case_name = "";
    this.d_show_clone_ag_test_case_modal = true;
    Vue.nextTick(() => {
        (<ValidatedInput> this.$refs.ag_test_case_clone_name).focus();
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

  set_ag_test_command_order() {
    return AGTestCommand.update_order(
      this.ag_test_case.pk, this.ag_test_case.ag_test_commands.map(cmd => cmd.pk));
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

function handle_add_ag_test_command_error(component: AGCasePanel, error: unknown) {
  (<APIErrors> component.$refs.new_command_api_errors).show_errors_from_response(error);
}

function handle_clone_ag_test_case_error(component: AGCasePanel, error: unknown) {
    (<APIErrors> component.$refs.clone_case_api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/list_panels.scss';
@import '@/styles/static_dropdown.scss';

@import './ag_tests.scss';

* {
  box-sizing: border-box;
}

.delete-ag-test-case-label {
  color: $warning-red;
}

@include list-panels($indentation: $panel-indentation);

.dropdown {
  color: black;  // For when the case panel is active
  @include static-dropdown($open-on-hover: true, $orient-right: true);

  .menu-item {
    padding: 6px 6px;
  }
}

.menu-item-text {
  margin-left: 10px;
}

// Modal **************************************************************

#ag-test-command-name-container, #ag-test-command-container {
  padding: 0 0 22px 0;
}

#ag-test-command-name-and-command {
  padding: 10px 0 10px 0;
}

#modal-clone-ag-test-case-button {
  @extend .green-button;
  margin-top: 10px;
}

.modal-button-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
</style>
