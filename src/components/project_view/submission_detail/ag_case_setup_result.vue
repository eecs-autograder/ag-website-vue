<template>
  <div id="ag-case-setup-result">
      <div id="exit-status-section">
        <div class="feedback-row">
          <div class="feedback-label"> Exit status: </div>
          <div class="feedback-output-content-short">
            <span v-if="setup_exit_status === ReturnCodeCorrectness.timed_out">
              <span>{{setup_exit_status}}</span>
              <i class="fas fa-clock timed-out-icon"></i>
            </span>
            <span v-else-if="setup_exit_status === ReturnCodeCorrectness.not_available">
              <i class="fas fa-ban not-available-icon"></i>
            </span>
            <span v-else>
              {{setup_exit_status}}
            </span>
          </div>
        </div>
      </div>

      <div v-if="d_ag_test_suite_result.fdbk_settings.show_setup_stdout"
           class="feedback-row"
           id="stdout-section">
        <div class="feedback-label"> Output: </div>
        <template v-if="!d_setup_stdout_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_setup_stdout"
               class="feedback-output-content-short"> No Output </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_setup_stdout}}</pre>
        </template>
      </div>

      <div v-if="d_ag_test_suite_result.fdbk_settings.show_setup_stderr"
           class="feedback-row"
           id="stderr-section">
        <div class="feedback-label"> Error Output: </div>
        <template v-if="!d_setup_stderr_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_setup_stderr"
               class="feedback-output-content-short"> No Output </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_setup_stderr}}</pre>
        </template>
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    AGTestSuiteResultFeedback,
    FeedbackCategory,
    ResultOutput,
    Submission
} from "ag-client-typescript";

import { ReturnCodeCorrectness } from '@/components/project_view/submission_detail/return_code_correctness';

@Component
export default class AGCaseSetupResult extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  d_setup_stdout: string | null = null;
  d_setup_stderr: string | null = null;
  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;
  d_ag_test_suite_result_output_size: ResultOutput.AGTestSuiteResultOutputSize | null = null;
  d_ag_test_suite_result: AGTestSuiteResultFeedback | null = null;
  d_submission: Submission | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;

  readonly ReturnCodeCorrectness = ReturnCodeCorrectness;

  @Watch('submission')
  async on_submission_change(new_value: Submission, old_value: Submission) {
    this.d_submission = new_value;
    await this.get_results();
  }

  @Watch('ag_test_suite_result')
  async on_ag_test_suite_result_change(new_value: object, old_value: object) {
    this.d_ag_test_suite_result = JSON.parse(JSON.stringify(new_value));
    await this.get_results();
  }

  @Watch('fdbk_category')
  async on_fdbk_category_change(new_value: FeedbackCategory, old_value: FeedbackCategory) {
    this.d_fdbk_category = new_value;
    await this.get_results();
  }

  async created() {
    this.d_submission = this.submission;
    this.d_ag_test_suite_result = this.ag_test_suite_result;
    this.d_fdbk_category = this.fdbk_category;
    await this.get_results();
  }

  async get_results() {
    this.d_ag_test_suite_result_output_size
        = await ResultOutput.get_ag_test_suite_result_output_size(
      this.d_submission!.pk,
      this.d_ag_test_suite_result!.pk,
      this.d_fdbk_category
    );
    await this.load_setup_stdout();
    await this.load_setup_stderr();
  }

  async load_setup_stdout() {
    this.d_setup_stdout_loaded = false;
    if (this.d_ag_test_suite_result_output_size!.setup_stdout_size === null) {
      this.d_setup_stdout = null;
    }
    else {
      this.d_setup_stdout = await ResultOutput.get_ag_test_suite_result_setup_stdout(
        this.d_submission!.pk,
        this.d_ag_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_setup_stdout_loaded = true;
  }

  async load_setup_stderr() {
    this.d_setup_stderr_loaded = false;
    if (this.d_ag_test_suite_result_output_size!.setup_stderr_size === null) {
        this.d_setup_stderr = null;
    }
    else {
      this.d_setup_stderr = await ResultOutput.get_ag_test_suite_result_setup_stderr(
        this.d_submission!.pk,
        this.d_ag_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_setup_stderr_loaded = true;
  }

  get setup_exit_status() {
    if (this.d_ag_test_suite_result!.setup_timed_out !== null
        && this.d_ag_test_suite_result!.setup_timed_out === true) {
        return ReturnCodeCorrectness.timed_out;
    }
    if (this.d_ag_test_suite_result!.setup_return_code !== null) {
        return this.d_ag_test_suite_result!.setup_return_code;
    }
    return ReturnCodeCorrectness.not_available;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

.not-available-icon {
  color: darken($pebble-dark, 5);
  padding: 0 2px 0 0;
}

.timed-out-icon {
  color: $navy-blue;
  padding: 0 2px 0 5px;
}

</style>
