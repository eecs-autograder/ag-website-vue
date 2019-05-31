<template>
  <div v-if="!loading">

    <div :class="['test-case', {'last-case': test_case.ag_test_commands.length === 0},
                 {'active-case' : is_active_case},
                 {'parent-of-active-command': command_is_active_level}]"
         @click="$emit('update_active_case', test_case)">
        <div>{{test_case.name}}</div>
        <div class="new-command-button"
             @click="$refs.new_command_modal.open()">
          <i class="fas fa-ellipsis-v command-menu"></i>
        </div>
    </div>

    <div class="commands-container">
      <div v-for="(test_command, index) of test_case.ag_test_commands"
           :class="['test-command',
                   {'last-command': index === test_case.ag_test_commands.length - 1},
                   {'active-command' : active_command !== null
                     && active_command.pk === test_command.pk}
           ]"
           @click="$emit('update_active_case', test_case);
                   $emit('update_active_command', test_command)">
        {{test_command.name}}
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
            <div class="name-container">
              <label class="text-label"> Command Name </label>
              <validated-input ref="new_command_name"
                               v-model="new_command_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
            <div class="command-container">
              <label class="text-label"> Command </label>
              <validated-input ref="new_command"
                               v-model="new_command"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
          </div>

          <APIErrors ref="api_errors"></APIErrors>

          <button class="modal-create-button"
                  :disabled="!add_command_form_is_valid || adding_command">
            Add Command
          </button>
        </validated-form>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';
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
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})

export default class AGCasePanel extends Vue implements AGTestCommandObserver {

  @Prop({default: false, type: Boolean})
  last_case!: boolean;

  @Prop({required: true, type: AGTestCase})
  test_case!: AGTestCase;

  @Prop({required: true})
  active_case!: AGTestCase | null;

  @Prop({required: true})
  active_command!: AGTestCommand | null;

  readonly is_not_empty = is_not_empty;

  add_command_form_is_valid = false;
  adding_command = false;
  loading = true;
  new_command_name = "";
  new_command = "";

  async created() {
    AGTestCommand.subscribe(this);
    this.loading = false;
  }

  beforeDestroy() {
    AGTestCommand.unsubscribe(this);
  }

  get is_active_case() {
    return this.active_case !== null
           && this.active_case.pk === this.test_case.pk;
  }

  get command_is_active_level() {
    return this.is_active_case && this.active_command !== null;
  }

  @handle_api_errors_async(handle_add_ag_command_error)
  async add_command() {
    try {
      this.adding_command = true;
      await AGTestCommand.create(
        this.test_case!.pk, { name: this.new_command_name, cmd: this.new_command }
      );
      this.new_command = "";
      this.new_command_name = "";
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
      console.log("Index: " + index);
      console.log(this.test_case.ag_test_commands.length);
      if (this.test_case.ag_test_commands.length === 0) {
        console.log("Appointing the parent");
        this.$emit('update_active_case', this.test_case);
      }
      else if (index === this.test_case.ag_test_commands.length) {
        console.log("Index - 1: " + (index - 1) + " is now active");
        this.$emit('update_active_command', this.test_case.ag_test_commands[index - 1]);
      }
      else {
        console.log("Same index active");
        this.$emit('update_active_command', this.test_case.ag_test_commands[index]);
      }
    }
  }

  update_ag_test_commands_order_changed(ag_test_case_pk: number,
                                        ag_test_command_order: number[]): void {

  }
}

function handle_add_ag_command_error(component: AGCasePanel, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';

.command-menu {
  padding-left: 10px;
}

.test-case {
  background-color: white;
  border: 1px solid darken($white-gray, 3);
  border-left: none;
  border-right: none;
  box-sizing: border-box;
  cursor: pointer;
  width: 92.5%;
  margin: 0 0% 0 7.5%;
  display: flex;
  flex-direction: row;
  padding: 10px 10px 10px 10px;
  justify-content: space-between;
}

.last-case {
  border-bottom: none;
}

.test-command {
  background-color: white;
  border: 1px solid darken($white-gray, 3);
  border-left: none;
  border-right: none;
  box-sizing: border-box;
  border-top: none;
  cursor: pointer;
  padding: 10px;
  width: 85%;
  margin-left: 15%;
}

.last-command {
  border-bottom: none;
}

.add-command {
  display: inline-block;
  padding: 4px 8px;
  font-size: 25px;
  margin-left: 2px;
  cursor: pointer;
  vertical-align: top;
}

.active-case, .active-case:hover {
  background-color: $active-color;
  border: 1px solid darken($active-color, 2);
  color: white;
}

.active-command, .active-command:hover {
  background-color: $active-color;
  border: 1px solid darken($active-color, 2);
  color: white;
}

.name-container, .command-container {
  padding: 0 0 22px 0;
}

#name-and-command {
  padding: 10px 0 10px 0;
}

.parent-of-active-command {
  background-color: $parent-of-active-color;
  border: 1px solid darken($parent-of-active-color, 2);
}

</style>
