<template>
  <div id="mutation-commands-component">
    <div id="use-setup-command-container">
      <input id="use-setup-command"
             type="checkbox"
             class="checkbox"
             @change="$emit('input', d_mutation_test_suite)"
             v-model="d_mutation_test_suite.use_setup_command"/>
      <label class="checkbox-label"
             id="use-setup-command-label"
             for="use-setup-command">
        Use Setup Command
      </label>
    </div>

    <div class="mutation-command-container"
         v-if="d_mutation_test_suite.use_setup_command">
      <div class="command-name"> 1. Setup Command </div>
      <div class="command">
        <mutation-command ref="setup_command"
                          id="setup-command"
                          v-model="d_mutation_test_suite.setup_command"
                          include_command_name
                          @form_validity_changed="d_setup_command_is_valid = $event"
                          @input="$emit('input', d_mutation_test_suite)">
        </mutation-command>
      </div>
    </div>

    <div class="mutation-command-container">
      <div class="command-name"> 2. Command to get student test names </div>
      <div class="command">
        <mutation-command
          ref="get_student_test_names_command"
          v-model="d_mutation_test_suite.get_student_test_names_command"
          @input="$emit('input', d_mutation_test_suite)"
          @form_validity_changed="d_get_student_test_names_command_is_valid = $event">
        </mutation-command>
      </div>
    </div>

    <div class="mutation-command-container">
      <div class="command-name"> 3. Command to check validity of student tests </div>
      <div class="command">
        <mutation-command ref="student_test_validity_check_command"
                          v-model="d_mutation_test_suite.student_test_validity_check_command"
                          @input="$emit('input', d_mutation_test_suite)"
                          @form_validity_changed="d_student_test_validity_check_is_valid = $event">
        </mutation-command>
      </div>
    </div>

    <div class="mutation-command-container">
      <div class="command-name"> 4. Command to run student tests with buggy implementations </div>
      <div class="command">
        <mutation-command ref="grade_buggy_impl_command"
                          v-model="d_mutation_test_suite.grade_buggy_impl_command"
                          @input="$emit('input', d_mutation_test_suite)"
                          @form_validity_changed="d_grade_buggy_impl_command_is_valid = $event">
        </mutation-command>
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
  value!: MutationTestSuite;

  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  d_mutation_test_suite: MutationTestSuite | null = null;

  @Watch('value')
  on_value_changed(new_val: MutationTestSuite, old_val: MutationTestSuite) {
    this.d_mutation_test_suite = deep_copy(new_val, MutationTestSuite);
  }

  created() {
    this.d_mutation_test_suite = deep_copy(this.value, MutationTestSuite);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

.mutation-command-container {
  padding: 10px 12px 2px 12px;
}

.command-name {
  display: inline-block;
  font-weight: bold;
  font-size: 20px;
  padding: 5px 0 0 0;
}

.command {
  padding: 2px 12px 10px 0;
}

#use-setup-command-container {
  padding: 10px 5px 0 12px;
  position: relative;
}

</style>
