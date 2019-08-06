<template>
  <div id="mutation-commands-component">

    <div class="checkbox-input-container"
         id="use-setup-command-container">
      <input id="use-setup-command"
             type="checkbox"
             class="checkbox"
             v-model="d_mutation_test_suite.use_setup_command"/>
      <label class="checkbox-label"
             id="use-setup-command-label"
             for="use-setup-command">
        Use Setup Command
      </label>
    </div>

    <div id="setup-command-container">
      <fieldset class="fieldset">
        <legend :class="['legend',
                        {'setup-command-not-in-use': !d_mutation_test_suite.use_setup_command}]">
          1. Setup Command
        </legend>

        <div v-if="d_mutation_test_suite.use_setup_command">
          <mutation-command ref="setup_command"
                            id="setup-command"
                            v-model="d_mutation_test_suite.setup_command"
                            include_command_name
                            @form_validity_changed="d_setup_command_is_valid = $event">
          </mutation-command>
        </div>

      </fieldset>
    </div>

    <div class="mutation-command-container">
      <fieldset class="fieldset">
        <legend class="legend"> 2. Get student test names </legend>
        <mutation-command
          ref="get_student_test_names_command"
          v-model="d_mutation_test_suite.get_student_test_names_command"
          @form_validity_changed="d_get_student_test_names_command_is_valid = $event">
        </mutation-command>
      </fieldset>
    </div>

    <div class="mutation-command-container">
      <fieldset class="fieldset">
        <legend class="legend"> 3. Validity check student tests </legend>
        <mutation-command ref="student_test_validity_check_command"
                          v-model="d_mutation_test_suite.student_test_validity_check_command"
                          @form_validity_changed="d_student_test_validity_check_is_valid = $event">
        </mutation-command>
      </fieldset>
    </div>

    <div class="mutation-command-container">
      <fieldset class="fieldset">
        <legend class="legend"> 4. Run student tests with buggy implementations </legend>
        <mutation-command ref="grade_buggy_impl_command"
                          v-model="d_mutation_test_suite.grade_buggy_impl_command"
                          @form_validity_changed="d_grade_buggy_impl_command_is_valid = $event">
        </mutation-command>
      </fieldset>
    </div>

    <div class="save-button-container">
      <APIErrors ref="api_errors"></APIErrors>
      <div>
        <button class="green-button save-button"
                id="save-commands"
                :disabled="!command_settings_forms_are_valid || d_saving"
                @click="save_command_settings">
          Save
        </button>

        <div v-show="!d_saving" class="last-saved-timestamp">
          <span> Last Saved: </span>
          {{format_datetime(d_mutation_test_suite.last_modified)}}
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { MutationTestSuite } from "ag-client-typescript";

import APIErrors from '@/components/api_errors.vue';
import MutationCommand from "@/components/project_admin/mutation_suites/mutation_command.vue";
import {
    deep_copy,
    format_datetime,
    handle_api_errors_async
} from "@/utils";
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    MutationCommand
  }
})
export default class MutationCommands extends Vue {
  @Prop({required: true, type: MutationTestSuite})
  mutation_test_suite!: MutationTestSuite;

  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  d_setup_command_is_valid = true;
  d_get_student_test_names_command_is_valid = true;
  d_student_test_validity_check_is_valid = true;
  d_grade_buggy_impl_command_is_valid = true;
  d_mutation_test_suite: MutationTestSuite | null = null;
  d_saving = false;

  @Watch('mutation_test_suite')
  on_mutation_test_suite_change(new_val: MutationTestSuite, old_val: MutationTestSuite) {
    this.d_mutation_test_suite = deep_copy(new_val, MutationTestSuite);
  }

  created() {
    this.d_mutation_test_suite = deep_copy(this.mutation_test_suite, MutationTestSuite);
  }

  get command_settings_forms_are_valid() {
    if (!this.d_mutation_test_suite!.use_setup_command) {
        return this.d_get_student_test_names_command_is_valid
               && this.d_student_test_validity_check_is_valid
               && this.d_grade_buggy_impl_command_is_valid;
    }
    return this.d_setup_command_is_valid
           && this.d_get_student_test_names_command_is_valid
           && this.d_student_test_validity_check_is_valid
           && this.d_grade_buggy_impl_command_is_valid;
  }
  @handle_api_errors_async(handle_save_mutation_commands_error)
  async save_command_settings() {
    try {
      this.d_saving = true;
      await this.d_mutation_test_suite!.save();
    }
    finally {
      this.d_saving = false;
    }
  }
}
function handle_save_mutation_commands_error(component: MutationCommands, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

.mutation-command-container {
  margin: 0 0 15px 0;
}

#use-setup-command-container {
  padding-left: 12px;
  margin-bottom: 10px;
}

#setup-command-container {
  margin-top: 10px;
  margin-bottom: 8px;
}

.setup-command-not-in-use {
  color: $stormy-gray-dark;
}

.save-button-container {
  margin-left: 15px;
}

.save-button {
  @extend .green-button;
  display: block;
  margin: 0 10px 10px 0;
}

.last-saved-timestamp {
  font-size: 14px;
  color: lighten(black, 30);
}
</style>
