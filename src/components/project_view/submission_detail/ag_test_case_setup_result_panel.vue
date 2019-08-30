<template>
  <div id="ag-test-case-setup-result-panel">
    <div class="panel">
      <div :class="[d_is_open ? 'panel-header-open' : 'panel-header-closed',
                    `${hyphenate(ag_test_suite_setup_correctness_level)}-panel-header`]"
           @click="toggle_is_open">
        <div class="column-1">
          {{ag_test_suite_result.setup_name ? ag_test_suite_result.setup_name : 'Setup'}}
        </div>
        <div class="column-2">
          <span class="passed-status">
            <correctness-icon :correctness_level="ag_test_suite_setup_correctness_level">
            </correctness-icon>
          </span>
        </div>
        <div class="column-3"></div>
      </div>
      <div :class="`${hyphenate(ag_test_suite_setup_correctness_level)}-panel-body`"
           v-if="d_is_open">

        <div id="exit-status-section">
          <div class="feedback-label"> Exit status: </div>
          <div class="feedback-output-content-short">
            {{ag_test_suite_result.setup_return_code}}
          </div>
          <div v-if="ag_test_suite_result.setup_timed_out"
               class="feedback-row"> Setup Command Timed out </div>
        </div>

        <div v-if="ag_test_suite_result.fdbk_settings.show_setup_stdout"
             id="stdout-section"
             class="feedback-row">
          <div class="feedback-label"> Output: </div>
          <template v-if="!d_setup_stdout_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else>
            <div v-if="!setup_stdout"
                 class="feedback-output-content-short"> No Output </div>
            <pre v-else
                 class="feedback-output-content-lengthy">{{setup_stdout}}</pre>
          </template>
        </div>

        <div v-if="ag_test_suite_result.fdbk_settings.show_setup_stderr"
             id="stderr-section"
             class="feedback-row">
          <div class="feedback-label"> Error Output: </div>
          <template v-if="!d_setup_stderr_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else>
            <div v-if="!setup_stderr"
                 class="feedback-output-content-short"> No Output </div>
            <pre v-else
                 class="feedback-output-content-lengthy">{{setup_stderr}}</pre>
          </template>
        </div>

      </div>
    </div>

  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestSuiteResultFeedback,
    FeedbackCategory,
    ResultOutput,
    Submission
} from "ag-client-typescript";
import get_ag_test_suite_result_setup_stdout = ResultOutput.get_ag_test_suite_result_setup_stdout;
import get_ag_test_suite_result_setup_stderr = ResultOutput.get_ag_test_suite_result_setup_stderr;

import { hyphenate } from "@/components/project_admin/feedback_config_utils.ts";
import CorrectnessIcon, { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

@Component({
  components: {
    CorrectnessIcon
  }
})
export default class AGTestCaseSetupResultPanel extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  @Prop({required: true, type: String})
  ag_test_suite_setup_correctness_level!: string;

  @Prop({default: false, type: Boolean})
  panel_is_active!: boolean;

  setup_stdout: string = "";
  setup_stderr: string = "";
  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;
  d_is_open = false;

  readonly hyphenate = hyphenate;

  toggle_is_open() {
    this.d_is_open = !this.d_is_open;
  }

  async created() {
    this.setup_stdout = await get_ag_test_suite_result_setup_stdout(
      this.submission.pk,
      this.ag_test_suite_result.pk,
      this.fdbk_category
    );
    this.d_setup_stdout_loaded = true;

    this.setup_stderr = await get_ag_test_suite_result_setup_stderr(
      this.submission.pk,
      this.ag_test_suite_result.pk,
      this.fdbk_category
    );
    this.d_setup_stderr_loaded = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';
</style>
