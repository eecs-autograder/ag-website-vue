<template>
  <div v-if="ag_test_suite_result !== null"
       id="ag-suite-result">

    <div id="ag-test-suite-name">{{ag_test_suite_result.ag_test_suite_name}}</div>
    <div class="ag-test-case-results-header">
      <div class="column-1"> Test Case </div>
      <div class="column-2"> Passed </div>
      <div class="column-3"> Score </div>
    </div>

    <submission-detail-panel
      ref="ag_case_setup_result_detail_panel"
      v-if="ag_test_suite_result.setup_return_code !== null
            || ag_test_suite_result.setup_timed_out"
      :name="ag_test_suite_result.setup_name ? ag_test_suite_result.setup_name : 'Setup'"
      :correctness_level="setup_correctness_level"
      :panel_is_active="is_first_suite && decide_whether_to_open_setup()">
      <AGCaseSetupResult :submission="submission"
                         :ag_test_suite_result="ag_test_suite_result"
                         :fdbk_category="fdbk_category">
      </AGCaseSetupResult>
    </submission-detail-panel>

    <template v-for="ag_test_case_result of ag_test_suite_result.ag_test_case_results">
      <submission-detail-panel
        ref="ag_case_result_detail_panel"
        :name="ag_test_case_result.ag_test_case_name"
        :correctness_level="case_result_correctness(ag_test_case_result)"
        :points_awarded="ag_test_case_result.total_points"
        :points_possible="ag_test_case_result.total_points_possible"
        :panel_is_active="decide_whether_to_open_case(
          case_result_correctness(ag_test_case_result), ag_test_case_result
        )">
        <AGCaseResult
          :submission="submission"
          :ag_test_case_result="ag_test_case_result"
          :fdbk_category="fdbk_category"
          :ag_test_case_row_correctness_level="case_result_correctness(ag_test_case_result)">
        </AGCaseResult>
      </submission-detail-panel>
    </template>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    AGTestSuiteResultFeedback,
    Submission
} from "ag-client-typescript";

import AGCaseResult from '@/components/project_view/submission_detail/ag_case_result.vue';
import AGCaseSetupResult from '@/components/project_view/submission_detail/ag_case_setup_result.vue';
import { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";
import SubmissionDetailPanel from "@/components/project_view/submission_detail/submission_detail_panel.vue";

@Component({
  components: {
    AGCaseResult,
    AGCaseSetupResult,
    SubmissionDetailPanel
  }
})
export default class AGSuiteResult extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: string;

  @Prop({default: false, type: Boolean})
  is_first_suite!: boolean;

  readonly CorrectnessLevel = CorrectnessLevel;

  first_incorrect_setup: null | AGTestSuiteResultFeedback = null;
  first_incorrect_case: null | AGTestCaseResultFeedback = null;

  get setup_correctness_level(): CorrectnessLevel {
    if (this.ag_test_suite_result.setup_return_code === 0) {
      return CorrectnessLevel.all_correct;
    }
    if (this.ag_test_suite_result.setup_return_code === null) {
      return CorrectnessLevel.not_available;
    }
    return CorrectnessLevel.none_correct;
  }

  case_result_correctness(case_result: AGTestCaseResultFeedback): CorrectnessLevel {
    let return_code_correctness = this.case_result_return_code_correctness(case_result);
    let output_correctness = this.case_result_output_correctness(case_result);

    if (return_code_correctness === CorrectnessLevel.not_available) {
      return output_correctness;
    }
    if (output_correctness === CorrectnessLevel.not_available) {
      return return_code_correctness;
    }

    // if (case_result.total_points === 0) {
    //   if (case_result.total_points_possible === 0) {
    //       //is this necessary???
    //     return CorrectnessLevel.all_correct;
    //   }
    //   return CorrectnessLevel.none_correct;
    // }

    if (return_code_correctness === CorrectnessLevel.all_correct &&
        output_correctness === CorrectnessLevel.all_correct) {
      return CorrectnessLevel.all_correct;
    }
    if (return_code_correctness === CorrectnessLevel.none_correct &&
        output_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.none_correct;
    }
    if (return_code_correctness === CorrectnessLevel.some_correct ||
        output_correctness === CorrectnessLevel.some_correct) {
      return CorrectnessLevel.some_correct;
    }

    if (return_code_correctness === CorrectnessLevel.all_correct &&
        output_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.some_correct;
  }

  case_result_return_code_correctness(case_result: AGTestCaseResultFeedback) {
    let not_available = case_result.ag_test_command_results.every(
      (cmd_result) => cmd_result.return_code_correct === null);

    if (not_available) {
      return CorrectnessLevel.not_available;
    }

    let all_correct = case_result.ag_test_command_results.every(
      (cmd_result) => cmd_result.return_code_correct === null || cmd_result.return_code_correct);
    if (all_correct) {
      return CorrectnessLevel.all_correct;
    }

    let none_correct = !case_result.ag_test_command_results.some(
      (cmd_result) => cmd_result.return_code_correct !== null && cmd_result.return_code_correct);
    if (none_correct) {
      return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.some_correct;
  }

  case_result_output_correctness(case_result: AGTestCaseResultFeedback) {
    let not_available = case_result.ag_test_command_results.every(
        (cmd_result) => cmd_result.stdout_correct === null &&
                        cmd_result.stderr_correct === null);
    if (not_available) {
        return CorrectnessLevel.not_available;
    }

    let all_correct = case_result.ag_test_command_results.every(
        (cmd_result) => (cmd_result.stdout_correct === null || cmd_result.stdout_correct) &&
                        (cmd_result.stderr_correct === null || cmd_result.stderr_correct));
    if (all_correct) {
        return CorrectnessLevel.all_correct;
    }

    let none_correct = !case_result.ag_test_command_results.some(
        (cmd_result) => cmd_result.stdout_correct !== null && cmd_result.stdout_correct
                        || cmd_result.stderr_correct !== null && cmd_result.stderr_correct);
    if (none_correct) {
        return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.some_correct;
  }

  decide_whether_to_open_setup(): boolean {
    if (this.first_incorrect_setup === null && this.first_incorrect_case === null
        && (this.setup_correctness_level === CorrectnessLevel.none_correct ||
            (this.ag_test_suite_result.setup_timed_out !== null
             && this.ag_test_suite_result.setup_timed_out))) {
      this.first_incorrect_setup = this.ag_test_suite_result;
      return true;
    }
    return this.first_incorrect_setup === this.ag_test_suite_result;
  }

  decide_whether_to_open_case(case_level_correctness: CorrectnessLevel,
                              ag_test_case_result: AGTestCaseResultFeedback): boolean {
    if (this.first_incorrect_setup === null && this.first_incorrect_case === null &&
        case_level_correctness === CorrectnessLevel.none_correct ||
        case_level_correctness === CorrectnessLevel.some_correct) {
      this.first_incorrect_case = ag_test_case_result;
      return true;
    }
    return this.first_incorrect_case === ag_test_case_result;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

#ag-suite-result {
  border: 2px solid #ebeef4;
  border-radius: 5px;
  padding: 20px;
  margin: 10px 0;
}

#ag-test-suite-name {
  font-size: 18px;
  font-weight: bold;
  padding: 0 0 10px 0;
}

.ag-test-case-results-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

</style>
