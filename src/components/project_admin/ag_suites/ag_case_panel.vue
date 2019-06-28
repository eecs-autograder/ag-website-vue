<template>
  <div v-if="ag_test_case !== null">
    <div :class="['ag-test-case',
                 {'closed-but-active': !is_open && command_in_case_is_active},
                 {'active-ag-test-case-multiple-commands': ag_test_case.ag_test_commands.length > 1
                                                   && command_in_case_is_active},
                 {'active-ag-test-case-one-command': ag_test_case.ag_test_commands.length === 1
                                             && command_in_case_is_active}]"
         @click="update_ag_test_case_panel_when_clicked">

      <div class="ag-test-case-name">
        <i v-if="ag_test_case.ag_test_commands.length > 1 && !is_open"
           class="fas fa-caret-right ag-test-case-symbol-right"></i>
        <i v-else-if="ag_test_case.ag_test_commands.length > 1 && is_open"
           class="fas fa-caret-down ag-test-case-symbol-down"></i>
        <span>{{ag_test_case.name}}</span>
      </div>

      <div id="ag-test-case-menu"
           @click.stop="$emit('update_active_thing', ag_test_case);
                        $refs.ag_test_case_context_menu.show_context_menu($event.pageX,
                                                                          $event.pageY)">
        <i class="fas fa-ellipsis-v"></i>
      </div>
      <context-menu ref="ag_test_case_context_menu">
        <template slot="context_menu_items">
          <context-menu-item ref="add_ag_test_command_menu_item"
                             @context_menu_item_clicked="open_new_ag_test_command_modal">
            <template slot="label">
              Add test command
            </template>
          </context-menu-item>
          <div class="context-menu-divider"> </div>
          <context-menu-item ref="edit_ag_test_case_menu_item"
                             @context_menu_item_clicked="$refs.ag_test_case_settings_modal.open()">
            <template slot="label">
              Edit test case settings
            </template>
          </context-menu-item>
          <div class="context-menu-divider"> </div>
          <context-menu-item ref="clone_ag_test_case_menu_item"
                             @context_menu_item_clicked="$refs.clone_ag_test_case_modal.open()">
            <template slot="label">
              <span id="clone-case-label"> Clone test case </span>
            </template>
          </context-menu-item>
          <div class="context-menu-divider"> </div>
          <context-menu-item ref="delete_ag_test_case_menu_item"
                             @context_menu_item_clicked="$refs.delete_ag_test_case_modal.open()">
            <template slot="label">
              <span id="delete-case-label"> Delete test case </span>
            </template>
          </context-menu-item>
        </template>
      </context-menu>

    </div>

    <div class="commands-container"
         v-if="is_open && ag_test_case.ag_test_commands.length > 1">
      <div v-for="ag_test_command of ag_test_case.ag_test_commands"
           :class="['ag-test-command',
                   {'active-ag-test-command': active_ag_test_command !== null
                                              && active_ag_test_command.pk === ag_test_command.pk}
           ]"
           @click="$emit('update_active_thing', ag_test_command)">

        <div class="ag-test-command-name">
          <span>{{ag_test_command.name}}</span>
        </div>

      </div>
    </div>

    <modal ref="new_ag_test_command_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Test Command </div>
      <hr>
      <div class="modal-body">
        <validated-form id="add-ag-test-command-form"
                        autocomplete="off"
                        spellcheck="false"
                        @submit="add_ag_test_command"
                        @form_validity_changed="add_command_form_is_valid = $event">
        <div id="ag-test-name-and-command">
            <div id="ag-test-command-name-container">
              <label class="text-label"> Command Name </label>
              <validated-input ref="new_ag_test_command_name"
                               v-model="new_command_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
            <div id="ag-test-command-container">
              <label class="text-label"> Command </label>
              <validated-input ref="new_ag_test_command"
                               v-model="new_command"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
          </div>

          <APIErrors ref="new_command_api_errors"></APIErrors>

          <button class="modal-create-button"
                  :disabled="!add_command_form_is_valid || adding_command">
            Add Test Command
          </button>
        </validated-form>
      </div>
    </modal>

    <modal ref="clone_ag_test_case_modal"
           size="large"
           include_closing_x>
      <div class="modal-header">
        Clone AG Test Case
      </div>
      <hr>
      <div class="modal-body"></div>
    </modal>

    <modal ref="delete_ag_test_case_modal"
           size="large"
           :include_closing_x="false">
      <div class="modal-header">
        Confirm Delete
      </div>
      <hr>
      <div class="modal-body">
        <p>
          Are you sure you want to delete the case:
          <span class="item-to-delete">{{ag_test_case.name}}</span>?
          This will delete all associated test cases and run results.
          THIS ACTION CANNOT BE UNDONE.
        </p>
        <div class="deletion-modal-button-footer">
          <button class="modal-delete-button"
                  @click="delete_ag_test_case()"> Delete </button>

          <button class="modal-cancel-button"
                  @click="$refs.delete_ag_test_case_modal.close()"> Cancel </button>
        </div>
      </div>
    </modal>

    <modal ref="ag_test_case_settings_modal"
           size="large"
           click_outside_to_close
           :include_closing_x="true">
      <div class="modal-header">
        Case Settings & Feedback
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

import { AGTestCase, AGTestCommand, AGTestSuite } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';
import Modal from '@/components/modal.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    AGCaseSettings,
    ContextMenu,
    ContextMenuItem,
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

  add_command_form_is_valid = false;
  adding_command = false;
  new_command_name = "";
  new_command = "";
  saving = false;
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};
  ag_test_case_settings_form_is_valid = false;

  @Watch('active_ag_test_command')
  on_active_ag_test_command_changed(new_active_ag_test_command: AGTestCommand,
                                    old_active_ag_test_command: AGTestCommand) {
    if (new_active_ag_test_command !== null
        && new_active_ag_test_command.ag_test_case === this.ag_test_case.pk) {
      this.commands_are_visible = true;
    }
  }

  get command_in_case_is_active() {
    return this.active_ag_test_command !== null
           && this.active_ag_test_command.ag_test_case === this.ag_test_case.pk;
  }

  open_new_ag_test_command_modal() {
    this.new_command = "";
    this.new_command_name = "";
    (<Modal> this.$refs.new_ag_test_command_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_ag_test_command_name).focus();
    });
  }

  commands_are_visible = false;

  get is_open() {
    return this.commands_are_visible;
  }

  update_ag_test_case_panel_when_clicked() {
    if (!this.commands_are_visible) {
      if (this.command_in_case_is_active) {
        this.commands_are_visible = true;
      }
      else {
        this.commands_are_visible = true;
        this.$emit('update_active_thing', this.ag_test_case);
      }
    }
    else {
      if (!this.command_in_case_is_active) {
        this.$emit('update_active_thing', this.ag_test_case);
      }
      else {
        this.commands_are_visible = false;
      }
    }
  }

  async delete_ag_test_case() {
    await this.ag_test_case.delete();
  }

  @handle_api_errors_async(handle_add_ag_test_command_error)
  async add_ag_test_command() {
    try {
      this.adding_command = true;
      await AGTestCommand.create(
        this.ag_test_case!.pk, { name: this.new_command_name, cmd: this.new_command }
      );
      (<Modal> this.$refs.new_ag_test_command_modal).close();
    }
    finally {
      this.adding_command = false;
    }
  }
}

function handle_add_ag_test_command_error(component: AGCasePanel, error: unknown) {
  (<APIErrors> component.$refs.new_command_api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/context_menu_styles.scss';

#delete-ag-test-case-label {
  color: $warning-red;
}

.ag-test-case {
  @extend .panel;
  padding: 0 5px 0 26px;

  .ag-test-case-symbol-right {
    @extend .caret-right;
  }

  .ag-test-case-symbol-down {
    @extend .caret-down;
  }

  #ag-test-case-menu {
    padding: 5px 9px;
    position: relative;
    visibility: hidden;
  }
}

.ag-test-case:hover {
  #ag-test-case-menu {
    visibility: visible;
  }
}

.ag-test-case-name {
  @extend .level-name;
}

.closed-but-active {
  @extend .active-level;
}

.active-ag-test-case-multiple-commands {
  #ag-test-case-menu, #ag-test-case-menu:hover {
    visibility: visible;
  }
}

.active-ag-test-case-one-command {
  @extend .active-level;
  #ag-test-case-menu, #ag-test-case-menu:hover {
    visibility: visible;
    color: white;
  }
}

.ag-test-command {
  @extend .panel;
  padding: 5px 5px 5px 70px;
}

.ag-test-test-command-name {
  @extend .level-name;
}

.active-ag-test-command, .active-single-ag-test-command {
  @extend .active-level;
}

// Modal **************************************************************

#ag-test-command-name-container, #ag-test-command-container {
  padding: 0 0 22px 0;
}

#ag-test-command-name-and-command {
  padding: 10px 0 10px 0;
}

</style>
