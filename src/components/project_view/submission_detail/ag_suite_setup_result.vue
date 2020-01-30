<template>
  <div id="ag-case-setup-result">

    <fieldset class="fieldset"
              v-if="(ag_test_suite_result.setup_timed_out !== null
                     && ag_test_suite_result.setup_timed_out)
                     || ag_test_suite_result.setup_return_code !== null">
      <legend class="legend"> Correctness </legend>
      <div id="exit-status-section">
        <div class="feedback-row">
          <div class="feedback-label"> Exit status: </div>
          <div class="feedback">
            <div class="correctness-output">
              <span v-if="ag_test_suite_result.setup_timed_out !== null
                          && this.ag_test_suite_result.setup_timed_out === true">
                <i class="far fa-clock timed-out-icon"></i>
                <span class="timed-out-msg"> (Timed out) </span>
              </span>
              <span v-else>
                {{ag_test_suite_result.setup_return_code}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="d_output_size !== null
                    && (d_output_size.setup_stdout_size !== null
                        || d_output_size.setup_stderr_size !== null)"
              class="fieldset"
              ref="actual_output">
      <legend class="legend"> Actual Output </legend>

      <div v-if="d_output_size.setup_stdout_size !== null"
           ref="setup_stdout_section"
           class="feedback-row">
        <div class="feedback-label"> Output: </div>
        <div class="feedback">
          <div v-if="d_output_size.setup_stdout_size === 0" class="short-output">No output</div>
          <div v-else-if="d_setup_stdout_content !== null" class="lengthy-output">
            <view-file :file_contents="d_setup_stdout_content"
                        view_file_max_height="50vh"
                        :progress="d_setup_stdout_load_progress"
                        ref="setup_stdout"></view-file>
          </div>
        </div>
      </div>

      <div v-if="d_output_size.setup_stderr_size !== null"
           ref="setup_stderr_section"
           class="feedback-row">
        <div class="feedback-label"> Error output: </div>
        <div class="feedback">
            <div v-if="d_output_size.setup_stderr_size === 0" class="short-output">No output</div>
            <div v-else-if="d_setup_stderr_content !== null" class="lengthy-output">
              <view-file :file_contents="d_setup_stderr_content"
                         view_file_max_height="50vh"
                         :progress="d_setup_stderr_load_progress"
                         ref="setup_stderr"></view-file>
            </div>
        </div>
      </div>
    </fieldset>
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

import ViewFile from "@/components/view_file.vue";
import { handle_global_errors_async } from '@/error_handling';

@Component({
  components: {
    ViewFile
  }
})
export default class AGSuiteSetupResult extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  d_setup_stdout_content: Promise<string> | null = null;
  d_setup_stderr_content: Promise<string> | null = null;
  d_setup_stdout_load_progress: number | null = 0;
  d_setup_stderr_load_progress: number | null = 0;
  d_output_size: ResultOutput.AGTestSuiteResultOutputSize | null = null;

  @Watch('fdbk_category')
  on_fdbk_category_change(new_value: FeedbackCategory, old_value: FeedbackCategory) {
    return this.get_output();
  }

  async created() {
    await this.get_output();
  }

  @handle_global_errors_async
  async get_output() {
    this.d_setup_stdout_content = null;
    this.d_setup_stderr_content = null;
    this.d_output_size = await ResultOutput.get_ag_test_suite_result_output_size(
      this.submission.pk,
      this.ag_test_suite_result.pk,
      this.fdbk_category
    );
    this.load_setup_stdout();
    this.load_setup_stderr();
  }

  load_setup_stdout() {
    if (this.d_output_size!.setup_stdout_size === null
        || this.d_output_size!.setup_stdout_size === 0) {
      return;
    }

    this.d_setup_stdout_content = ResultOutput.get_ag_test_suite_result_setup_stdout(
      this.submission.pk,
      this.ag_test_suite_result.pk,
      this.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_setup_stdout_load_progress = 100 * (1.0 * event.loaded / event.total);
        }
      }
    );
  }

  load_setup_stderr() {
    if (this.d_output_size!.setup_stderr_size === null
        || this.d_output_size!.setup_stderr_size === 0) {
      return;
    }

    this.d_setup_stderr_content = ResultOutput.get_ag_test_suite_result_setup_stderr(
      this.submission.pk,
      this.ag_test_suite_result.pk,
      this.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_setup_stderr_load_progress = 100 * (1.0 * event.loaded / event.total);
        }
      }
    );
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

.timed-out-icon {
  padding: 0 .125rem 0 .375rem;
}

</style>
