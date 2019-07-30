<template>
  <div v-if="mutation_test_suite !== null"
       id="mutation-test-suite-panel"
       @click="$emit('update_active_suite', mutation_test_suite)">
    <span>{{mutation_test_suite.name}}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { MutationTestSuite } from "ag-client-typescript";

@Component
export default class MutationSuitePanel extends Vue {
  @Prop({required: true, type: MutationTestSuite})
  mutation_test_suite!: MutationTestSuite;

  @Prop({default: null, type: MutationTestSuite})
  active_mutation_test_suite!: MutationTestSuite | null;

  d_loading = false;

  @Watch('active_ag_test_command')
  on_active_ag_test_command_changed(new_active_mutation_test_command: MutationTestSuite,
                                    old_active_mutation_test_command: MutationTestSuite) {
    console.log("Active ag_test_command changed");
  }

  get suite_is_active() {
      return this.active_mutation_test_suite !== null
             && this.active_mutation_test_suite.pk === this.mutation_test_suite.pk;
  }
}
</script>

<style scoped lang="scss">

#mutation-test-suite-panel {
  cursor: pointer;
  font-size: 14px;
  padding: 8px;
  width: 100%;
}

</style>
