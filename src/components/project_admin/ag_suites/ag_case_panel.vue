<template>
  <div v-if="!loading">

    <div :class="['test-case',
                 {'active-case' : is_active_case},
                 {'active-single-command': test_case.ag_test_commands.length === 1
                                           && active_command !== null
                                           && test_case.ag_test_commands[0].pk
                                              === active_command.pk},
                 {'parent-of-active-command': command_is_active_level
                                              && test_case.ag_test_commands.length > 1}]"
                 @click="update_case_and_command">

      <div class="test-case-name">
        <i v-if="test_case.ag_test_commands.length === 1" class="far fa-star case-symbol"></i>
        <i v-else class="fas fa-briefcase case-symbol"></i>
        <span>{{test_case.name}}</span>
      </div>

      <div v-if="is_active_case"
           class="case-menu"
           @click.stop="$refs.case_context_menu.show_context_menu($event.pageX, $event.pageY)">
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
              Delete case
            </template>
          </context-menu-item>
        </template>
      </context-menu>

    </div>

    <div class="commands-container" v-if="is_active_case && test_case.ag_test_commands.length > 1">
      <div v-for="test_command of test_case.ag_test_commands"
           :class="['test-command',
                   {'active-command' : active_command !== null
                                       && active_command.pk === test_command.pk}
           ]"
           @click="$emit('update_active_command', test_command)">

        <div class="test-command-name">
            <i class="fas fa-star command-symbol"></i>
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
          This will delete all associated test
          cases and run results. THIS ACTION CANNOT BE UNDONE.
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

        <validated-form id="case-settings-form"
                        autocomplete="off"
                        spellcheck="false"
                        @submit.native.prevent="save_ag_test_case_settings"
                        @form_validity_changed="case_settings_form_is_valid = $event">

          <div id="case-name-container">
            <label class="text-label"> Case name </label>
            <validated-input ref="case_name"
                             v-model="d_test_case.name"
                             :validators="[is_not_empty]">
            </validated-input>
          </div>

          <div class="bottom-of-form">
            <APIErrors ref="api_errors"></APIErrors>

            <button type="submit"
                    class="save-button"
                    :disabled="!case_settings_form_is_valid || saving"> Save Updates
            </button>

            <div v-if="!saving" class="last-saved-timestamp">
              <span> Last Saved: </span>
              {{(new Date(d_test_case.last_modified)).toLocaleString(
              'en-US', last_modified_format
              )}}
            </div>

            <div v-else class="last-saved-spinner">
              <i class="fa fa-spinner fa-pulse"></i>
            </div>
          </div>

          <hr class="case-settings-divider">

          <div class="case-feedback-title"> Case Feedback </div>

        </validated-form>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';
import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

import Dropdown from '@/components/dropdown.vue';
import Modal from '@/components/modal.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import { AGTestCase, AGTestCommand, AGTestCommandObserver } from 'ag-client-typescript';

import { deep_copy, handle_api_errors_async } from '@/utils';
import {
  is_not_empty,
} from '@/validators';

@Component({
  components: {
    APIErrors,
    ContextMenu,
    ContextMenuItem,
    Dropdown,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})

export default class AGCasePanel extends Vue implements AGTestCommandObserver {
  @Prop({required: true, type: AGTestCase})
  test_case!: AGTestCase;

  @Prop({required: true})
  active_case!: AGTestCase | null;

  @Prop({required: true})
  active_command!: AGTestCommand | null;

  readonly is_not_empty = is_not_empty;

  add_command_form_is_valid = false;
  d_test_case: AGTestCase | null = null;
  adding_command = false;
  loading = true;
  new_command_name = "";
  new_command = "";
  saving = false;
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};

  case_settings_form_is_valid = false;


  async created() {
    AGTestCommand.subscribe(this);
    this.d_test_case = deep_copy(this.test_case, AGTestCase);
    this.loading = false;
  }

  beforeDestroy() {
    AGTestCommand.unsubscribe(this);
  }

  update_case_and_command() {
    if (this.test_case.ag_test_commands.length === 1) {
      this.$emit('update_active_case', this.test_case);
      this.$emit('update_active_command', this.test_case.ag_test_commands[0]);
    }
    else {
      this.$emit('update_active_case', this.test_case);
    }
  }

  get is_active_case() {
    return this.active_case !== null
           && this.active_case.pk === this.test_case.pk;
  }

  get command_is_active_level() {
    return this.is_active_case && this.active_command !== null;
  }

  open_new_command_modal() {
    this.new_command = "";
    this.new_command_name = "";
    (<Modal> this.$refs.new_command_modal).open();
  }

  async delete_ag_case() {
    await this.test_case!.delete();
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

  update_ag_test_command_changed(ag_test_command: AGTestCommand): void {
    if (ag_test_command.ag_test_case === this.test_case.pk) {
      let index = this.test_case.ag_test_commands.findIndex(
        (test_command: AGTestCommand) => test_command.pk === ag_test_command.pk
      );
      Vue.set(this.test_case.ag_test_commands, index, deep_copy(ag_test_command, AGTestCommand));
    }
  }

  update_ag_test_command_created(ag_test_command: AGTestCommand): void {
    if (ag_test_command.ag_test_case === this.test_case.pk) {
      this.test_case.ag_test_commands.push(ag_test_command);
    }
  }

  update_ag_test_command_deleted(ag_test_command: AGTestCommand): void {
    if (ag_test_command.ag_test_case === this.test_case.pk) {
      let index = this.test_case.ag_test_commands.findIndex(
        (test_command: AGTestCommand) => test_command.pk === ag_test_command.pk
      );
      this.test_case.ag_test_commands.splice(index, 1);
      if (index === this.test_case.ag_test_commands.length) {
        this.$emit('update_active_command', this.test_case.ag_test_commands[index - 1]);
      }
      else {
        this.$emit('update_active_command', this.test_case.ag_test_commands[index]);
      }
    }
  }

  update_ag_test_commands_order_changed(ag_test_case_pk: number,
                                        ag_test_command_order: number[]): void {

  }

  @handle_api_errors_async(handle_save_ag_suite_settings_error)
  async save_ag_test_case_settings() {
    try {
      this.saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_test_case!.save();
    }
    finally {
      this.saving = false;
    }
  }

}

function handle_save_ag_suite_settings_error(component: AGCasePanel, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
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

.test-case {
  @extend .panel;
  padding: 0 5px 0 42px;

  .case-symbol {
    font-size: 15px;
    padding: 0 8px 0 0;
    color: $stormy-gray-dark;
  }
}

.test-case-name {
  padding: 5px;
}

.case-menu {
  padding: 5px 9px;
  position: relative;
}

.case-menu:hover {
  color: darken($stormy-gray-dark, 10);
}

.test-command {
  @extend .panel;
  padding: 0 5px 0 67px;

  .command-symbol {
    padding-right: 10px;
    font-size: 15px;
    color: darken($stormy-gray-light, 5);
  }
}

.test-command-name {
  padding: 5px;
}

#name-container, #command-container {
  padding: 0 0 22px 0;
}

#name-and-command {
  padding: 10px 0 10px 0;
}

.active-case {
  @extend .active-level;

  .case-symbol {
    color: white;
  }
}

.active-command, .active-single-command {
  @extend .active-level;

  .command-symbol {
    color: white;
  }
}

.parent-of-active-command {
  @extend .parent-of-active-level;
  //background-color: lighten($white-gray, 3);
  background-color: white;

  .case-symbol {
    color: darken(teal, 10);
  }

  .case-menu {
    color: darken(teal, 10);
  }
}

#case-name-container {
  padding: 10px 13px 22px 13px;
}

.case-feedback-title {
  padding: 10px 13px 10px 13px;
}

.case-settings-divider {
  margin: 2px 13px 13px 13px;
}
</style>
