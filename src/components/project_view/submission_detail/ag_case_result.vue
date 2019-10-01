<template>
  <div v-if="ag_test_case_result.ag_test_command_results.length"
       class="ag-case-result">
    <template v-if="ag_test_case_result.ag_test_command_results.length > 1">
      <div id="multi-command-body">
        <div v-for="ag_test_command_result of ag_test_case_result.ag_test_command_results">
          <submission-detail-panel
            ref="ag_test_command_panel"
            :name="`ag_test_command_result ${ag_test_command_result.pk}`"
            :correctness_level="command_result_correctness(ag_test_command_result)"
            :is_command="true">
            <AGCommandResult :submission="submission"
                             :ag_test_command_result="ag_test_command_result"
                             :fdbk_category="fdbk_category">
            </AGCommandResult>
          </submission-detail-panel>
        </div>
      </div>
    </template>
    <template v-else>
      <AGCommandResult ref="ag_command_result"
                       :submission="submission"
                       :ag_test_command_result="ag_test_case_result.ag_test_command_results[0]"
                       :fdbk_category="fdbk_category">
      </AGCommandResult>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    AGTestCommandResultFeedback,
    FeedbackCategory,
    Submission
} from "ag-client-typescript";

import AGCommandResult from '@/components/project_view/submission_detail/ag_command_result.vue';
import CorrectnessIcon, { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';
import SubmissionDetailPanel from "@/components/project_view/submission_detail/submission_detail_panel.vue";

@Component({
  components: {
    AGCommandResult,
    SubmissionDetailPanel,
    CorrectnessIcon
  }
})
export default class AGCaseResult extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_case_result!: AGTestCaseResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  readonly CorrectnessLevel = CorrectnessLevel;

  command_result_correctness(command_result: AGTestCommandResultFeedback) {
    let return_code_correctness = this.command_result_return_code_correctness(command_result);
    let output_correctness = this.command_result_output_correctness(command_result);

    // if (command_result.pk === 2934) {
    //     console.log("Return code correctness: " + return_code_correctness);
    //     console.log("Output correctness: " + output_correctness);
    // }

    if (return_code_correctness === CorrectnessLevel.output_only
        && output_correctness === CorrectnessLevel.not_available) {
      return CorrectnessLevel.output_only;
    }

    if (output_correctness === CorrectnessLevel.output_only
        && return_code_correctness === CorrectnessLevel.not_available) {
      return CorrectnessLevel.output_only;
    }

    if (return_code_correctness === CorrectnessLevel.not_available
        || return_code_correctness === CorrectnessLevel.output_only) {
      return output_correctness;
    }

    if (output_correctness === CorrectnessLevel.not_available
        || output_correctness === CorrectnessLevel.output_only) {
      return return_code_correctness;
    }

    if (return_code_correctness === CorrectnessLevel.all_correct
        && output_correctness === CorrectnessLevel.all_correct) {
      return CorrectnessLevel.all_correct;
    }

    if (return_code_correctness === CorrectnessLevel.none_correct
        && output_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.none_correct;
    }

    if (output_correctness === CorrectnessLevel.some_correct) {
      return CorrectnessLevel.some_correct;
    }

    if (return_code_correctness === CorrectnessLevel.all_correct
        && output_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.some_correct;
  }

  command_result_return_code_correctness(command_result: AGTestCommandResultFeedback) {
    if (command_result.return_code_correct === null) {
      if (command_result.fdbk_settings.show_actual_return_code) {
        return CorrectnessLevel.output_only;
      }
      return CorrectnessLevel.not_available;
    }
    else if (command_result.return_code_correct) {
      return CorrectnessLevel.all_correct;
    }
    return CorrectnessLevel.none_correct;
  }

  command_result_output_correctness(command_result: AGTestCommandResultFeedback) {
    let output_not_available = command_result.stdout_correct === null &&
                               command_result.stderr_correct === null;

    let show_output_only = (
        (command_result.stdout_points_possible === 0
        && command_result.stderr_points_possible === 0)
        && (command_result.fdbk_settings.show_actual_stdout
            || command_result.fdbk_settings.show_actual_stderr)
    );

    if (output_not_available) {
      if (show_output_only) {
        return CorrectnessLevel.output_only;
      }
      return CorrectnessLevel.not_available;
    }

    let output_correct = (
      (command_result.stdout_correct === null || command_result.stdout_correct)
      && (command_result.stderr_correct === null || command_result.stderr_correct)
    );

    if (output_correct) {
      return CorrectnessLevel.all_correct;
    }

    let some_output_correct = (
        (command_result.stdout_correct !== null && command_result.stdout_correct)
        || (command_result.stderr_correct !== null && command_result.stderr_correct)
    );

    if (some_output_correct) {
      return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.none_correct;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';
</style>
