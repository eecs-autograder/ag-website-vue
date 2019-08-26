<template>
  <div v-if="d_loading">
    <div v-for="mutation_test_suite_result of mutation_test_suite_results">
      <mutation-test-suite-result-panel></mutation-test-suite-result-panel>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    MutationTestSuiteResultFeedback,
    Submission
} from 'ag-client-typescript';

import MutationTestSuiteResultPanel from '@/components/project_view/submission_detail/mutation_test_suite_result_panel.vue';

@Component({
  components: {
    MutationTestSuiteResultPanel
  }
})
export default class MutationTestSuiteResults extends Vue {
  @Prop({required: true, type: Array})
  mutation_test_suite_results!: MutationTestSuiteResultFeedback[];

  @Prop({required: true, type: Submission})
  submission!: Submission;

  d_loading = false;

  created() {
    this.d_loading = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

@media only screen and (min-width: 481px) {

}

</style>
