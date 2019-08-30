<template>
  <div v-if="ag_test_suite_result !== null"
       id="ag-test-suite-result">

    <div id="ag-test-suite-name">{{ag_test_suite_result.ag_test_suite_name}}</div>
    <div>
      <div class="ag-test-case-results-header">
        <div class="column-1">
          <div id="ag-object"> Test Case </div>
        </div>
        <div class="column-2">
          <div id="passed-status"> Passed </div>
        </div>
        <div class="column-3">
          <div id="score"> Score </div>
        </div>
      </div>
    </div>

    <div>
      <div v-if="ag_test_suite_result.setup_return_code !== null
                 || ag_test_suite_result.setup_timed_out">
        <AGTestCaseSetupResultPanel
          :submission="submission"
          :ag_test_suite_result="ag_test_suite_result"
          :fdbk_category="fdbk_category"
          :ag_test_suite_setup_correctness_level="setup_correctness_level">
        </AGTestCaseSetupResultPanel>
      </div>

      <div v-for="ag_test_case_result of ag_test_suite_result.ag_test_case_results">
        <div v-if="ag_test_case_result.ag_test_command_results.length === 1">
          <AGTestCaseResultPanelSingleCommand
            :submission="submission"
            :ag_test_case_result="ag_test_case_result"
            :fdbk_category="fdbk_category"
            :ag_test_case_row_correctness_level="case_result_correctness(ag_test_case_result)">
          </AGTestCaseResultPanelSingleCommand>
        </div>
        <div v-else>
          <AGTestCaseResultPanelMultipleCommands
            :submission="submission"
            :ag_test_case_result="ag_test_case_result"
            :fdbk_category="fdbk_category"
            :ag_test_case_row_correctness_level="case_result_correctness(ag_test_case_result)">
          </AGTestCaseResultPanelMultipleCommands>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    AGTestSuiteResultFeedback,
    Submission
} from "ag-client-typescript";

import AGTestCaseResultPanelMultipleCommands from '@/components/project_view/submission_detail/ag_test_case_result_panel_multiple_commands.vue';
import AGTestCaseResultPanelSingleCommand from '@/components/project_view/submission_detail/ag_test_case_result_panel_single_command.vue';
import AGTestCaseSetupResultPanel from '@/components/project_view/submission_detail/ag_test_case_setup_result_panel.vue';
import { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";

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
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: string;

  @Prop({default: false, type: Boolean})
  is_first_suite!: boolean;

  num_ag_test_cases = 0;
  first_incorrect_setup: null | AGTestSuiteResultFeedback = null;
  first_incorrect_case: null | AGTestCaseResultFeedback = null;

  readonly CorrectnessLevel = CorrectnessLevel;

  created() {
    this.num_ag_test_cases = this.ag_test_suite_result!.ag_test_case_results.length;
  }

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
    if (return_code_correctness === CorrectnessLevel.none_correct &&
        output_correctness === CorrectnessLevel.all_correct) {
      return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.not_available;
  }

  case_result_return_code_correctness(case_result: AGTestCaseResultFeedback) {
    let not_available = case_result.ag_test_command_results.every(
      (cmd_result) => cmd_result.return_code_correct === null);

    if (not_available) {
      return CorrectnessLevel.not_available;
    }

    let all_correct = case_result.ag_test_command_results.every(
      (cmd_result) => cmd_result.return_code_correct ||
                      cmd_result.return_code_correct === null);
    if (all_correct) {
      return CorrectnessLevel.all_correct;
    }

    let none_correct = !case_result.ag_test_command_results.some(
      (cmd_result) => cmd_result.return_code_correct);
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
        (cmd_result) => (cmd_result.stdout_correct ||
                         cmd_result.stdout_correct === null) &&
                        (cmd_result.stderr_correct || cmd_result.stderr_correct === null));
    if (all_correct) {
        return CorrectnessLevel.all_correct;
    }

    let none_correct = !case_result.ag_test_command_results.some(
        (cmd_result) => cmd_result.stdout_correct || cmd_result.stderr_correct);
    if (none_correct) {
        return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.some_correct;
  }


  decide_whether_to_open_setup(setup_level_correctness: CorrectnessLevel): boolean {
    if (this.first_incorrect_setup === null && this.first_incorrect_case === null &&
      (setup_level_correctness === CorrectnessLevel.none_correct ||
       this.ag_test_suite_result.setup_timed_out)) {
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
@import '@/styles/colors.scss';
@import '@/styles/components/submission_detail.scss';

#ag-test-suite-result {
  border: 2px solid $white-gray;
  border-radius: 5px;
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
  justify-content: flex-start;
}

</style>
