<template>
  <div v-if="ag_test_suite_result_feedback !== null"
       id="ag-test-suite-result">

    <div id="ag-test-suite-name">
      {{ag_test_suite_result_feedback.ag_test_suite_name}}
    </div>
    <div>
      <div class="ag-test-case-results-header">
        <div> Test Case </div>
        <div> Passed </div>
        <div> Score </div>
      </div>
    </div>

    <div>
      <div v-if="ag_test_suite_result_feedback.setup_return_code !== null
                 || ag_test_suite_result_feedback.setup_timed_out">
        <AGTestCaseSetupResultPanel :submission="submission"
                                    :ag_test_suite_result_feedback="ag_test_suite_result_feedback"
                                    :fdbk_category="fdbk_category">
        </AGTestCaseSetupResultPanel>
      </div>

      <div v-for="ag_test_case_result of ag_test_suite_result_feedback.ag_test_case_results">
        <div v-if="ag_test_case_result.ag_test_command_results.length === 1">
          <AGTestCaseResultPanelSingleCommand :submission="submission"
                                              :ag_test_case_result_feedback="ag_test_case_result"
                                              :fdbk_category="fdbk_category">
          </AGTestCaseResultPanelSingleCommand>
        </div>
        <div v-else>
          <AGTestCaseResultPanelMultipleCommands :submission="submission"
                                                 :ag_test_case_result_feedback="ag_test_case_result"
                                                 :fdbk_category="fdbk_category">
          </AGTestCaseResultPanelMultipleCommands>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  AGTestSuiteResultFeedback,
  Submission
} from "ag-client-typescript";

import AGTestCaseResultPanelMultipleCommands from '@/components/project_view/submission_detail/ag_test_case_result_panel_multiple_commands.vue';
import AGTestCaseResultPanelSingleCommand from '@/components/project_view/submission_detail/ag_test_case_result_panel_single_command.vue';
import AGTestCaseSetupResultPanel from '@/components/project_view/submission_detail/ag_test_case_setup_result_panel.vue';

@Component({
  components: {
    AGTestCaseResultPanelSingleCommand,
    AGTestCaseResultPanelMultipleCommands,
    AGTestCaseSetupResultPanel
  }
})
export default class AGTestSuiteResult extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result_feedback!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: string;

  num_ag_test_cases = 0;

  created() {
    this.num_ag_test_cases = this.ag_test_suite_result_feedback!.ag_test_case_results.length;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#ag-test-suite-result {
  border: 1px solid $white-gray;
  padding: 10px;
  margin: 10px;
}

#ag-test-suite-name {
  font-size: 18px;
  padding: 0 0 10px 0;
}

.ag-test-case-results-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  padding-bottom: 10px;
}

</style>
