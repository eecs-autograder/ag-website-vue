<template>
  <div v-if="test_case !== null">

    <div :class="['test-case',
                 {'active-case' : is_active_case},
                 {'active-single-command': test_case.ag_test_commands.length === 1
                                           && active_command !== null
                                           && test_case.ag_test_commands[0].pk
                                              === active_command.pk},
                 {'parent-of-active-command': command_is_active_level
                                              && test_case.ag_test_commands.length > 1}]"
                 @click="$emit('update_active_case', test_case)">

      <div class="test-case-name">
        <i v-if="test_case.ag_test_commands.length > 1 && !is_active_case"
           class="fas fa-caret-right case-symbol-right"></i>
        <i v-else-if="test_case.ag_test_commands.length > 1 && is_active_case"
           class="fas fa-caret-down case-symbol-down"></i>
        <span :class="{'pad-left': test_case.ag_test_commands.length === 1}">
          {{test_case.name}}
        </span>
      </div>

      <div id="case-menu"
           @click.stop="$refs.case_context_menu.show_context_menu($event.pageX, $event.pageY);
                        $emit('update_active_case', test_case)">
        <i class="fas fa-ellipsis-v"></i>
      </div>
      <context-menu ref="case_context_menu">
        <template slot="context_menu_items">
          <context-menu-item ref="add_command_menu_item"
                             @context_menu_item_clicked="open_new_command_modal">
            <template slot="label">
              Add Command
            </template>
          </context-menu-item>
          <div class="context-menu-divider"> </div>
          <context-menu-item ref="edit_case_menu_item"
                             @context_menu_item_clicked="$refs.case_settings_modal.open()">
            <template slot="label">
              Edit case settings
            </template>
          </context-menu-item>
          <div class="context-menu-divider"> </div>
          <context-menu-item ref="delete_case_menu_item"
                             @context_menu_item_clicked="$refs.delete_case_modal.open()">
            <template slot="label">
              <span id="delete-case-label"> Delete case </span>
            </template>
          </context-menu-item>
        </template>
      </context-menu>

    </div>

    <div class="commands-container" v-if="is_active_case && test_case.ag_test_commands.length > 1">
      <div v-for="test_command of test_case.ag_test_commands"
           :class="['test-command',
                   {'active-command': active_command !== null
                                      && active_command.pk === test_command.pk}
           ]"
           @click="$emit('update_active_command', test_command)">

        <div class="test-command-name">
          <span>{{test_command.name}}</span>
        </div>

      </div>
    </div>

    <modal ref="new_command_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Command </div>
      <hr>
      <div class="modal-body">
        <validated-form id="add-command-form"
                        autocomplete="off"
                        spellcheck="false"
                        @submit.native.prevent="add_command"
                        @form_validity_changed="add_command_form_is_valid = $event">
        <div id="name-and-command">
            <div id="name-container">
              <label class="text-label"> Command Name </label>
              <validated-input ref="new_command_name"
                               v-model="new_command_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
            <div id="command-container">
              <label class="text-label"> Command </label>
              <validated-input ref="new_command"
                               v-model="new_command"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
          </div>

          <APIErrors ref="new_command_api_errors"></APIErrors>

          <button class="modal-create-button"
                  :disabled="!add_command_form_is_valid || adding_command">
            Add Command
          </button>
        </validated-form>
      </div>
    </modal>

    <modal ref="delete_case_modal"
           size="large"
           :include_closing_x="false">
      <div class="modal-header">
        Confirm Delete
      </div>
      <hr>
      <div class="modal-body">
        <p>
          Are you sure you want to delete the case:
          <span class="case-to-delete">{{test_case.name}}</span>?
          This will delete all associated test cases and run results.
          THIS ACTION CANNOT BE UNDONE.
        </p>
        <div id="modal-button-container">
          <button class="modal-delete-button"
                  @click="delete_ag_case()"> Delete </button>

          <button class="modal-cancel-button"
                  @click="$refs.delete_case_modal.close()"> Cancel </button>
        </div>
      </div>
    </modal>

    <modal ref="case_settings_modal"
           size="large"
           click_outside_to_close
           :include_closing_x="true">
      <div class="modal-header">
        Case Settings & Feedback
      </div>
      <hr>
      <div class="modal-body">
        <AGCaseSettings :test_case="test_case"></AGCaseSettings>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { AGTestCase, AGTestCommand } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';
import Modal from '@/components/modal.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
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
  test_case!: AGTestCase;

  @Prop({required: true})
  active_case!: AGTestCase | null;

  @Prop({required: true})
  active_command!: AGTestCommand | null;

  readonly is_not_empty = is_not_empty;

  add_command_form_is_valid = false;
  adding_command = false;
  new_command_name = "";
  new_command = "";
  saving = false;
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};
  case_settings_form_is_valid = false;

  get is_active_case() {
    return this.active_case !== null && this.active_case.pk === this.test_case!.pk;
  }

  get command_is_active_level() {
    return this.is_active_case && this.active_command !== null;
  }

  open_new_command_modal() {
    this.new_command = "";
    this.new_command_name = "";
    (<Modal> this.$refs.new_command_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_command_name).invoke_focus();
    });
  }

  async delete_ag_case() {
    await this.test_case!.delete();
    // don't close modal here
  }

  @handle_api_errors_async(handle_add_ag_command_error)
  async add_command() {
    try {
      this.adding_command = true;
      await AGTestCommand.create(
        this.test_case!.pk, { name: this.new_command_name, cmd: this.new_command }
      );
      (<Modal> this.$refs.new_command_modal).close();
    }
    finally {
      this.adding_command = false;
    }
  }
}

function handle_add_ag_command_error(component: AGCasePanel, error: unknown) {
  (<APIErrors> component.$refs.new_command_api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/context_menu_styles.scss';

#delete-case-label {
  color: $warning-red;
}

.test-case {
  @extend .panel;
  padding: 0 5px 0 25px;

  .case-symbol-right {
    font-size: 18px;
    padding: 0 10px 0 3px;
    color: $stormy-gray-dark;
  }

  .case-symbol-down {
    font-size: 18px;
    padding: 0 8px 0 0;
    color: $stormy-gray-dark;
  }

  #case-menu {
    padding: 5px 9px;
    position: relative;
    visibility: hidden;
  }
}

.test-case:hover {
  #case-menu {
    visibility: visible;
    color: darken($stormy-gray-dark, 10);
  }
}

.test-case-name {
  padding: 5px;
}

.active-case {
  @extend .active-level;

  #case-menu, #case-menu:hover {
    visibility: visible;
    color: white;
  }

  .case-symbol-right, .case-symbol-down {
    color: white;
  }
}

.active-case:hover {
  #case-menu {
    color: white;
  }
}

.test-command {
  @extend .panel;
  padding: 0 5px 0 50px;
}

.test-command-name {
  padding: 5px 5px 5px 15px;
}

.active-command, .active-single-command {
  @extend .active-level;
}

.parent-of-active-command {
  @extend .parent-of-active-level;
  background-color: white;

  #case-menu, .case-symbol-right, .case-symbol-down {
    color: darken(teal, 10);
  }

  #case-menu {
    visibility: visible;
  }
}

.parent-of-active-command:hover {
  #case-menu {
    color: darken(teal, 10);
  }
}

// Modal **************************************************************
#case-name-container {
  padding: 10px 13px 22px 13px;
}

.case-feedback-title {
  padding: 10px 13px 10px 13px;
}

.case-settings-divider {
  margin: 2px 13px 13px 13px;
}

#name-container, #command-container {
  padding: 0 0 22px 0;
}

#name-and-command {
  padding: 10px 0 10px 0;
}

</style>
