<template>
  <div class="suite-result">

    <div id="ag-test-suite-name">{{ag_test_suite_result.ag_test_suite_name}}</div>
    <div class="ag-test-case-results-header">
      <div class="column-1"> Test Case </div>
      <div class="column-2"> Passed </div>
      <div class="column-3"> Score </div>
    </div>

    <result-panel
      v-if="ag_test_suite_result.setup_return_code !== null
            || ag_test_suite_result.setup_timed_out"
      ref="ag_case_setup_result_detail_panel"
      :name="ag_test_suite_result.setup_name ? ag_test_suite_result.setup_name : 'Setup'"
      :correctness_level="setup_correctness_level"
      :open_initially="setup_panel_is_active">
      <AGSuiteSetupResult :submission="submission"
                         :ag_test_suite_result="ag_test_suite_result"
                         :fdbk_category="fdbk_category">
      </AGSuiteSetupResult>
    </result-panel>

    <template v-for="ag_test_case_result of ag_test_suite_result.ag_test_case_results">
      <result-panel
        ref="ag_case_result_detail_panel"
        :key="ag_test_case_result.pk"
        :name="ag_test_case_result.ag_test_case_name"
        :correctness_level="case_result_correctness(ag_test_case_result)"
        :points_awarded="ag_test_case_result.total_points"
        :points_possible="ag_test_case_result.total_points_possible"
        :open_initially="get_case_is_active(ag_test_case_result)"
        :is_multi_command_case="ag_test_case_result.ag_test_command_results.length > 1">
        <AGCaseResult
          :submission="submission"
          :ag_test_case_result="ag_test_case_result"
          :fdbk_category="fdbk_category"
          :ag_test_case_row_correctness_level="case_result_correctness(ag_test_case_result)">
        </AGCaseResult>
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

import AGCaseResult from '@/components/project_view/submission_detail/ag_case_result.vue';
import AGSuiteSetupResult from '@/components/project_view/submission_detail/ag_suite_setup_result.vue';
import { CorrectnessLevel, setup_return_code_correctness } from "@/components/project_view/submission_detail/correctness";
import ResultPanel from "@/components/project_view/submission_detail/result_panel.vue";


@Component({
  components: {
    AGCaseResult,
    AGSuiteSetupResult,
    ResultPanel
  }
})
export default class AGSuiteResult extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  @Prop({default: false, type: Boolean})
  is_first_suite!: boolean;

  readonly CorrectnessLevel = CorrectnessLevel;

  get setup_is_incorrect(): boolean {
    return this.setup_correctness_level === CorrectnessLevel.none_correct
           || (this.ag_test_suite_result!.setup_timed_out !== null
               && this.ag_test_suite_result!.setup_timed_out!);
  }

  get first_incorrect_case(): AGTestCaseResultFeedback | null {
    if (this.setup_is_incorrect) {
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

  get setup_correctness_level(): CorrectnessLevel {
    if (!this.ag_test_suite_result!.fdbk_settings.show_setup_return_code) {
      return CorrectnessLevel.info_only;
    }
    return setup_return_code_correctness(this.ag_test_suite_result!.setup_return_code,
                                         this.ag_test_suite_result!.setup_timed_out);
  }

  get setup_panel_is_active(): boolean {
    return this.is_first_suite && this.setup_is_incorrect;
  }

  get_case_is_active(ag_test_case: AGTestCaseResultFeedback): boolean {
    return this.first_incorrect_case !== null
           && this.first_incorrect_case.pk === ag_test_case.pk;
  }

  case_result_correctness(case_result: AGTestCaseResultFeedback): CorrectnessLevel {
    let return_code_correctness = this.case_result_return_code_correctness(case_result);
    let output_correctness = this.case_result_output_correctness(case_result);

    if (case_result.total_points === 0 && case_result.total_points_possible !== 0) {
      return CorrectnessLevel.none_correct;
    }

    let correctnesses = [return_code_correctness, output_correctness];

    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.not_available);
    if (correctnesses.length === 0) {
      return CorrectnessLevel.not_available;
    }

    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.info_only);
    if (correctnesses.length === 0) {
      return CorrectnessLevel.info_only;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.all_correct)) {
      return CorrectnessLevel.all_correct;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.none_correct)) {
      return CorrectnessLevel.none_correct;
    }

    return CorrectnessLevel.some_correct;
  }

  case_result_return_code_correctness(case_result: AGTestCaseResultFeedback) {
    let not_available = case_result.ag_test_command_results.every(
      (cmd_result) => cmd_result.return_code_correct === null);

    let some_show_return_code_only = case_result.ag_test_command_results.some(
      (cmd_result) => cmd_result.fdbk_settings.show_actual_return_code);

    if (not_available) {
      if (some_show_return_code_only) {
          return CorrectnessLevel.info_only;
      }
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
        (cmd_result) => cmd_result.stdout_correct === null
                        && cmd_result.stderr_correct === null
    );

    let some_show_info_only = case_result.ag_test_command_results.some(
        (cmd_result) => (cmd_result.stdout_points_possible === 0
                        && cmd_result.stderr_points_possible === 0)
                        && (cmd_result.fdbk_settings.show_actual_stdout
                        || cmd_result.fdbk_settings.show_actual_stderr)
    );

    if (not_available) {
      if (some_show_info_only) {
          return CorrectnessLevel.info_only;
      }
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
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

#ag-test-suite-name {
  font-size: 19px;
  font-weight: bold;
  padding: 0 0 10px 0;
}

.ag-test-case-results-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

</style>
