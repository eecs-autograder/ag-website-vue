<template>
  <div v-if="!d_loading"
       id="ag-suite-result"
       class="suite-result">

    <div id="ag-test-suite-name">{{d_ag_test_suite_result.ag_test_suite_name}}</div>
    <div class="ag-test-case-results-header">
      <div class="column-1"> Test Case </div>
      <div class="column-2"> Passed </div>
      <div class="column-3"> Score </div>
    </div>

    <submission-detail-panel
      ref="ag_case_setup_result_detail_panel"
      v-if="d_ag_test_suite_result.setup_return_code !== null
            || d_ag_test_suite_result.setup_timed_out"
      :name="d_ag_test_suite_result.setup_name ? d_ag_test_suite_result.setup_name : 'Setup'"
      :correctness_level="setup_correctness_level"
      :open_initially="setup_panel_is_active">
      <AGSuiteSetupResult :submission="submission"
                         :ag_test_suite_result="d_ag_test_suite_result"
                         :fdbk_category="fdbk_category">
      </AGSuiteSetupResult>
    </submission-detail-panel>

    <template v-for="ag_test_case_result of d_ag_test_suite_result.ag_test_case_results">
      <submission-detail-panel
        ref="ag_case_result_detail_panel"
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
      </submission-detail-panel>
    </template>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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
    SubmissionDetailPanel: ResultPanel
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

  d_first_incorrect_setup: null | AGTestSuiteResultFeedback = null;
  d_first_incorrect_case: null | AGTestCaseResultFeedback = null;

  d_loading = true;

  d_ag_test_suite_result: AGTestSuiteResultFeedback | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;

  @Watch('ag_test_suite_result')
  on_ag_test_suite_result_change(new_value: object, old_value: object) {
    this.d_ag_test_suite_result = JSON.parse(JSON.stringify(new_value));
    this.determine_active_panels();
  }

  created() {
    this.d_ag_test_suite_result = this.ag_test_suite_result;
    this.d_fdbk_category = this.fdbk_category;
    this.determine_active_panels();
    this.d_loading = false;
  }

  determine_active_panels() {
    this.d_first_incorrect_setup = null;
    this.d_first_incorrect_case = null;
    this.decide_whether_to_open_setup();
    this.ag_test_suite_result.ag_test_case_results.forEach(
      (ag_case) => {
        this.decide_whether_to_open_case(
          this.case_result_correctness(ag_case), ag_case
        );
      }
    );
  }

  get setup_correctness_level(): CorrectnessLevel {
      if (!this.d_ag_test_suite_result!.fdbk_settings.show_setup_return_code) {
          return CorrectnessLevel.info_only;
      }
      return setup_return_code_correctness(this.d_ag_test_suite_result!.setup_return_code,
                                           this.d_ag_test_suite_result!.setup_timed_out);
  }

  decide_whether_to_open_setup() {
    if (this.setup_correctness_level === CorrectnessLevel.none_correct ||
        (this.d_ag_test_suite_result!.setup_timed_out !== null
         && this.d_ag_test_suite_result!.setup_timed_out!)) {
        this.d_first_incorrect_setup = this.d_ag_test_suite_result;
    }
  }

  get setup_panel_is_active(): boolean {
    return this.is_first_suite && this.d_first_incorrect_setup !== null;
  }

  case_result_correctness(case_result: AGTestCaseResultFeedback): CorrectnessLevel {
    let return_code_correctness = this.case_result_return_code_correctness(case_result);
    let output_correctness = this.case_result_output_correctness(case_result);

    if (return_code_correctness === CorrectnessLevel.info_only
        && output_correctness === CorrectnessLevel.not_available) {
      return CorrectnessLevel.info_only;
    }

    if (output_correctness === CorrectnessLevel.info_only
        && return_code_correctness === CorrectnessLevel.not_available) {
      return CorrectnessLevel.info_only;
    }

    if (return_code_correctness === CorrectnessLevel.not_available
        || return_code_correctness === CorrectnessLevel.info_only) {
      return output_correctness;
    }

    if (output_correctness === CorrectnessLevel.not_available
        || output_correctness === CorrectnessLevel.info_only) {
      return return_code_correctness;
    }

    if (case_result.total_points === 0 && case_result.total_points_possible !== 0) {
      return CorrectnessLevel.none_correct;
    }

    if (return_code_correctness === CorrectnessLevel.all_correct
        && output_correctness === CorrectnessLevel.all_correct) {
      return CorrectnessLevel.all_correct;
    }
    if (return_code_correctness === CorrectnessLevel.none_correct
        && output_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.none_correct;
    }
    if (return_code_correctness === CorrectnessLevel.some_correct
        || output_correctness === CorrectnessLevel.some_correct) {
      return CorrectnessLevel.some_correct;
    }

    if (return_code_correctness === CorrectnessLevel.all_correct
        && output_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.some_correct;
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

  decide_whether_to_open_case(case_level_correctness: CorrectnessLevel,
                              ag_test_case_result: AGTestCaseResultFeedback) {
    if (this.d_first_incorrect_setup === null
        && this.d_first_incorrect_case === null
        && (case_level_correctness === CorrectnessLevel.none_correct
            || case_level_correctness === CorrectnessLevel.some_correct)) {
      this.d_first_incorrect_case = ag_test_case_result;
    }
  }

  get_case_is_active(ag_test_case: AGTestCaseResultFeedback): boolean {
    return this.d_first_incorrect_case !== null
           && this.d_first_incorrect_case.pk === ag_test_case.pk;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

#ag-test-suite-name {
  font-size: 22px;
  font-weight: bold;
  padding: 0 0 10px 0;
}

.ag-test-case-results-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

</style>
