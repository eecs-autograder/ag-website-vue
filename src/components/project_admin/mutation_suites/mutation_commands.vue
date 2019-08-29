<template>
  <div id="mutation-commands-component">
    <div id="use-setup-command-container"
         class="checkbox-input-container">
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
      <mutation-command ref="setup_command"
                        id="setup-command"
                        v-model="d_mutation_test_suite.setup_command"
                        include_command_name_input
                        @form_validity_changed="d_setup_command_is_valid = $event"
                        @input="$emit('input', d_mutation_test_suite)">
        <template v-slot:command-label>
          1. Setup
        </template>
      </mutation-command>
    </div>

    <div class="mutation-command-container">
      <mutation-command
          ref="get_student_test_names_command"
          id="get-student-test-names-command"
          v-model="d_mutation_test_suite.get_student_test_names_command"
          @input="$emit('input', d_mutation_test_suite)"
          @form_validity_changed="d_get_student_test_names_command_is_valid = $event">
        <template v-slot:command-label>
          2. Discover student test names
          <i class="fas fa-question-circle input-tooltip">
            <tooltip width="large" placement="right">
              This command should print a whitespace-separated list of student
              test names to standard out. <br>
              This is often as simple as "ls test*.cpp"
            </tooltip>
          </i>
        </template>
      </mutation-command>
    </div>

    <div class="mutation-command-container">
      <mutation-command ref="student_test_validity_check_command"
                        id="student-test-validity-check-command"
                        v-model="d_mutation_test_suite.student_test_validity_check_command"
                        @input="$emit('input', d_mutation_test_suite)"
                        @form_validity_changed="d_student_test_validity_check_is_valid = $event">
        <template v-slot:command-label>
          3. Check for false positives
          <i class="fas fa-question-circle input-tooltip">
            <tooltip width="large" placement="right">
              This command will be run once for every discovered student test,
              with the name of that test substituted for ${student_test_name}. <br>
              If the command exits nonzero, that student test will be flagged as
              a false positive.
            </tooltip>
          </i>
          </template>
      </mutation-command>
    </div>

    <div class="mutation-command-container">
      <mutation-command ref="grade_buggy_impl_command"
                        id="grade-buggy-impl-command"
                        v-model="d_mutation_test_suite.grade_buggy_impl_command"
                        @input="$emit('input', d_mutation_test_suite)"
                        @form_validity_changed="d_grade_buggy_impl_command_is_valid = $event">
        <template v-slot:command-label>
          4. Run student tests with buggy implementations
          <i class="fas fa-question-circle input-tooltip">
            <tooltip width="large" placement="right">
              This command is run once for every buggy impl, student test pair,
              with the test name substituted for ${student_test_name} and the
              bug name substituted for ${buggy_impl_name}.<br>
              Student tests with false positives are excluded. <br>
              If the command exits nonzero, the buggy impl is marked as exposed,
              and the process skips ahead to the next bug.
            </tooltip>
          </i>
        </template>
      </mutation-command>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { MutationTestSuite } from "ag-client-typescript";

import MutationCommand from "@/components/project_admin/mutation_suites/mutation_command.vue";
import Tooltip from "@/components/tooltip.vue";
import {
  deep_copy,
  format_datetime
} from "@/utils";
import { is_not_empty } from '@/validators';

@Component({
  components: {
    MutationCommand,
    Tooltip
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
@import '@/styles/forms.scss';

#mutation-commands-component {
  padding: 6px 12px 14px 2px;
}

.mutation-command-container {
  margin-bottom: 30px;
  min-width: 600px;
  width: 50%;
  max-width: 100%;
}

#use-setup-command-container {
  padding: 5px 5px 14px 0;
  position: relative;
}
</style>
