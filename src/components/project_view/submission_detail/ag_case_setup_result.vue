<template>
  <div id="ag-case-setup-result">
      <div id="exit-status-section">
        <div class="feedback-row">
          <div class="feedback-label"> Exit status: </div>
          <div class="feedback-output-content-short">
            {{setup_exit_status}}
          </div>
        </div>
      </div>

      <div v-if="ag_test_suite_result.fdbk_settings.show_setup_stdout"
           class="feedback-row"
           id="stdout-section">
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
           class="feedback-row"
           id="stderr-section">
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  AGTestSuiteResultFeedback,
  FeedbackCategory,
  ResultOutput,
  Submission
} from "ag-client-typescript";

@Component
export default class AGCaseSetupResult extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  setup_stdout: string = "";
  setup_stderr: string = "";
  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;

  async created() {
    await this.load_setup_stdout();
    await this.load_setup_stderr();
  }

  async load_setup_stdout() {
    this.setup_stdout = await ResultOutput.get_ag_test_suite_result_setup_stdout(
      this.submission.pk,
      this.ag_test_suite_result.pk,
      this.fdbk_category
    );
    this.d_setup_stdout_loaded = true;
  }

  async load_setup_stderr() {
    this.setup_stderr = await ResultOutput.get_ag_test_suite_result_setup_stderr(
      this.submission.pk,
      this.ag_test_suite_result.pk,
      this.fdbk_category
    );
    this.d_setup_stderr_loaded = true;
  }

  get setup_exit_status() {
    if (this.ag_test_suite_result.setup_timed_out !== null
        && this.ag_test_suite_result.setup_timed_out) {
        return "Timed Out";
    }
    if (this.ag_test_suite_result.setup_return_code !== null) {
        return this.ag_test_suite_result.setup_return_code;
    }
    return "Not Available";
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';
</style>
