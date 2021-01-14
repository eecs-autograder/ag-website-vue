<template>
  <div class="suite-result">

    <div id="ag-test-suite-name">{{ag_test_suite_result.ag_test_suite_name}}</div>
    <div class="ag-test-case-results-header">
      <div class="column-1"> Test Case </div>
      <div class="column-2"> Passed </div>
      <div class="column-3"> Score </div>
    </div>

    <result-panel
      v-if="ag_test_suite_result.setup_name !== null"
      ref="setup_result_panel"
      :name="ag_test_suite_result.setup_name !== '' ? ag_test_suite_result.setup_name : 'Setup'"
      :correctness_level="setup_correctness_level"
      :open_initially="is_first_suite && setup_correctness_level === CorrectnessLevel.none_correct">
      <AGTestSuiteSetupResultDetail
        :submission="submission"
        :ag_test_suite_result="ag_test_suite_result"
        :fdbk_category="fdbk_category"/>
    </result-panel>

    <template v-for="ag_test_case_result of ag_test_suite_result.ag_test_case_results">
      <result-panel
        ref="test_result_panel"
        :key="ag_test_case_result.pk"
        :name="ag_test_case_result.ag_test_case_name"
        :correctness_level="case_result_correctness(ag_test_case_result)"
        :points_awarded="ag_test_case_result.total_points"
        :points_possible="ag_test_case_result.total_points_possible"
        :open_initially="first_incorrect_case !== null
                         && first_incorrect_case.pk === ag_test_case_result.pk"
        :is_multi_command_case="ag_test_case_result.ag_test_command_results.length > 1">
        <AGTestCaseResultDetail
          :submission="submission"
          :ag_test_case_result="ag_test_case_result"
          :fdbk_category="fdbk_category"
          :ag_test_case_row_correctness_level="case_result_correctness(ag_test_case_result)">
        </AGTestCaseResultDetail>
      </result-panel>
    </template>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    AGTestSuiteResultFeedback,
    FeedbackCategory,
    Submission
} from "ag-client-typescript";

import AGTestCaseResultDetail from '@/components/project_view/submission_detail/ag_test_case_result_detail.vue';
import AGTestSuiteSetupResultDetail from '@/components/project_view/submission_detail/ag_test_suite_setup_result_detail.vue';
import {
  ag_test_case_result_correctness,
  ag_test_case_result_output_correctness,
  ag_test_case_result_return_code_correctness,
  CorrectnessLevel,
  setup_return_code_correctness
} from "@/components/project_view/submission_detail/correctness";
import ResultPanel from "@/components/project_view/submission_detail/result_panel.vue";


@Component({
  components: {
    AGTestCaseResultDetail,
    AGTestSuiteSetupResultDetail,
    ResultPanel
  }
})
export default class AGTestSuiteResultDetail extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  @Prop({default: false, type: Boolean})
  is_first_suite!: boolean;

  readonly CorrectnessLevel = CorrectnessLevel;

  private get setup_correctness_level(): CorrectnessLevel {
    if (this.ag_test_suite_result.setup_name === null) {
      return CorrectnessLevel.not_available;
    }
    if (this.ag_test_suite_result.setup_return_code === null
        && this.ag_test_suite_result.setup_timed_out === null) {
      return CorrectnessLevel.info_only;
    }
    return setup_return_code_correctness(this.ag_test_suite_result.setup_return_code,
                                         this.ag_test_suite_result.setup_timed_out);
  }

  private get first_incorrect_case(): AGTestCaseResultFeedback | null {
    if (!this.is_first_suite || this.setup_correctness_level === CorrectnessLevel.none_correct) {
      return null;
    }

    for (let ag_case of this.ag_test_suite_result.ag_test_case_results) {
      let case_correctness = this.case_result_correctness(ag_case);
      if (case_correctness === CorrectnessLevel.some_correct
          || case_correctness === CorrectnessLevel.none_correct) {
        return ag_case;
      }
    }
    return null;
  }

  case_result_correctness(case_result: AGTestCaseResultFeedback) {
    return ag_test_case_result_correctness(case_result);
  }

  case_result_return_code_correctness(case_result: AGTestCaseResultFeedback) {
    return ag_test_case_result_return_code_correctness(case_result);
  }

  case_result_output_correctness(case_result: AGTestCaseResultFeedback) {
    return ag_test_case_result_output_correctness(case_result);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

#ag-test-suite-name {
  font-size: 1.25rem;
  font-weight: bold;
  padding: 0 0 10px 0;
}

.ag-test-case-results-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

</style>
