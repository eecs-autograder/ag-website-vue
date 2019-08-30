<template>
  <div id="ag-test-case-result-panel-multiple-commands">
    <div class="panel">
      <div :class="[`${hyphenate(ag_test_case_row_correctness_level)}-panel-header`,
                    d_is_open ? 'panel-header-open' : 'panel-header-closed']"
           @click="toggle_is_open">
        <div class="column-1">{{ag_test_case_result.ag_test_case_name}}</div>
        <div class="column-2">
          <span class="passed-status">
            <correctness-icon :correctness_level="ag_test_case_row_correctness_level">
            </correctness-icon>
          </span>
        </div>
        <div class="column-3">
          <span v-if="ag_test_case_result.total_points_possible">
            {{ag_test_case_result.total_points}}/{{ag_test_case_result.total_points_possible}}
          </span>
        </div>
      </div>

      <div :class="`${hyphenate(ag_test_case_row_correctness_level)}-panel-body`"
           id="multi-command-body"
           v-if="d_is_open">
        <div v-for="(ag_test_command_result, index) of ag_test_case_result.ag_test_command_results">
          <AGTestCommandResultPanel
            :submission="submission"
            :ag_test_command_result="ag_test_command_result"
            :fdbk_category="fdbk_category"
            :ag_test_command_row_correctness_level="command_result_correctness(
              ag_test_command_result
            )">
          </AGTestCommandResultPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    AGTestCommandResultFeedback,
    Submission
} from "ag-client-typescript";

import { hyphenate } from "@/components/project_admin/feedback_config_utils.ts";
import AGTestCommandResultPanel from '@/components/project_view/submission_detail/ag_test_command_result_panel.vue';
import CorrectnessIcon, { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";

@Component({
  components: {
    AGTestCommandResultPanel,
    CorrectnessIcon
  }
})
export default class AGTestCaseResultPanelMultipleCommands extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_case_result!: AGTestCaseResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: string;

  @Prop({required: true, type: String})
  ag_test_case_row_correctness_level!: string;

  @Prop({default: false, type: Boolean})
  panel_is_active!: boolean;

  d_is_open = false;

  readonly hyphenate = hyphenate;

  toggle_is_open() {
    this.d_is_open = !this.d_is_open;
  }

  command_result_correctness(command_result: AGTestCommandResultFeedback) {
    let return_code_correctness = this.command_result_return_code_correctness(command_result);
    let output_correctness = this.command_result_output_correctness(command_result);

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

    if (output_correctness === CorrectnessLevel.some_correct) {
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

  command_result_return_code_correctness(command_result: AGTestCommandResultFeedback) {
    if (command_result.return_code_correct === null) {
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

    if (output_not_available) {
        return CorrectnessLevel.not_available;
    }

    let output_correct = (
        (command_result.stdout_correct || command_result.stdout_correct === null)
         && (command_result.stderr_correct || command_result.stderr_correct === null)
    );
    if (output_correct) {
        return CorrectnessLevel.all_correct;
    }

    let some_output_correct = command_result.stdout_correct || command_result.stderr_correct;

    if (some_output_correct) {
        return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.none_correct;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/components/submission_detail.scss';

#multi-command-body {
  padding: 20px;
}

</style>
