<template>
  <div id="ag-test-case-result-panel-single-command">
    <div class="panel">
      <div :class="[d_is_open ? 'panel-header-open' : 'panel-header-closed',
                   `${hyphenate(ag_test_case_row_correctness_level)}-panel-header`]"
           @click="toggle_d_is_open">
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
           v-if="d_is_open">
        <AGTestCommandResult
          :submission="submission"
          :ag_test_command_result="ag_test_case_result.ag_test_command_results[0]"
          :fdbk_category="fdbk_category">
        </AGTestCommandResult>
      </div>
    </div>
    <div></div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    FeedbackCategory,
    Submission
} from "ag-client-typescript";

import { hyphenate } from "@/components/project_admin/feedback_config_utils.ts";
import AGTestCommandResult from '@/components/project_view/submission_detail/ag_test_command_result.vue';
import CorrectnessIcon, { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

@Component({
  components: {
    AGTestCommandResult,
    CorrectnessIcon
  }
})
export default class AGTestCaseResultPanelSingleCommand extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_case_result!: AGTestCaseResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  @Prop({required: true, type: String})
  ag_test_case_row_correctness_level!: string;

  @Prop({default: false, type: Boolean})
  panel_is_active!: boolean;

  d_is_open = false;

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly hyphenate = hyphenate;

  toggle_d_is_open() {
    if (this.ag_test_case_row_correctness_level !== CorrectnessLevel.not_available) {
      this.d_is_open = !this.d_is_open;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';
</style>
