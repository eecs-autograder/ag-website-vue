<template>
  <div>

    <div class="checkbox-input-container">
      <input id="use-setup-command"
             type="checkbox"
             class="checkbox"
             v-model="d_mutation_test_suite.use_setup_command"/>
      <label class="checkbox-label"
             for="use-setup-command">
        Use Setup Command
      </label>
    </div>

    <div v-if="d_mutation_test_suite.use_setup_command">
      <mutation-command :ag_command="d_mutation_test_suite.setup_command">
      </mutation-command>
    </div>

    <mutation-command :ag_command="d_mutation_test_suite.get_student_test_names_command">
    </mutation-command>

    <mutation-command :ag_command="d_mutation_test_suite.student_test_validity_check_command">
    </mutation-command>

    <mutation-command :ag_command="d_mutation_test_suite.grade_buggy_impl_command">
    </mutation-command>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { MutationTestSuite } from "ag-client-typescript";

import MutationCommand from "@/components/project_admin/mutation_suite_editing/mutation_command.vue";
import { deep_copy } from "@/utils";

@Component({
    components: {
       MutationCommand
    }
})
export default class MutationCommands extends Vue {
  @Prop({required: true, type: MutationTestSuite})
  mutation_test_suite!: MutationTestSuite;

  d_mutation_test_suite: MutationTestSuite | null = null;

  created() {
      this.d_mutation_test_suite = deep_copy(this.mutation_test_suite, MutationTestSuite);
  }



}
</script>

<style scoped lang="scss">
</style>
