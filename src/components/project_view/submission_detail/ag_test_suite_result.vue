<template>
  <div>
    AG Test Suite Result
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    FeedbackCategory,
    Submission
} from "ag-client-typescript";

import AGTestCaseResultPanelSingleCommand from '@/components/project_view/submission_detail/ag_test_case_result_panel_single_command.vue';
import { AGTestSuiteResultFeedback } from 'ag-client-typescript/dist/src/submission_result';

@Component({
  components: {
    AGTestCaseResultPanelSingleCommand
  }
})
export default class AGTestSuiteResult extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result: AGTestSuiteResultFeedback | null = null;

  @Prop({required: true, type: String})
  fdbk_category!: string;

  num_ag_test_cases = 0;

  created() {
    this.num_ag_test_cases = this.ag_test_suite_result!.ag_test_case_results.length;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

</style>
