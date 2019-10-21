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

    <fieldset v-if="ag_test_suite_result.fdbk_settings.show_setup_stdout
                    || ag_test_suite_result.fdbk_settings.show_setup_stderr"
              class="fieldset">
      <legend class="legend"> Actual Output </legend>
      <div v-if="ag_test_suite_result.fdbk_settings.show_setup_stdout"
           id="setup-stdout-section"
           class="feedback-row">
        <div class="feedback-label"> Output: </div>
        <div class="feedback">
          <template v-if="!d_setup_stdout_loaded">
            <div class="loading-output">
              <i class="fa fa-spinner fa-pulse fa-fw"></i>
            </div>
          </template>
          <template v-else>
            <div v-if="!d_setup_stdout"
                 class="short-output"> No output </div>
            <pre v-else
                 class="lengthy-output">{{d_setup_stdout}}</pre>
          </template>
        </div>
      </div>

      <div v-if="ag_test_suite_result.fdbk_settings.show_setup_stderr"
           id="setup-stderr-section"
           class="feedback-row">
        <div class="feedback-label"> Error output: </div>
        <div class="feedback">
          <template v-if="!d_setup_stderr_loaded">
            <div class="loading-output">
              <i class="fa fa-spinner fa-pulse fa-fw"></i>
            </div>
          </template>
          <template v-else>
            <div v-if="!d_setup_stderr"
                 class="short-output"> No output </div>
            <pre v-else
                 class="lengthy-output">{{d_setup_stderr}}</pre>
          </template>
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

@Component
export default class AGSuiteSetupResult extends Vue {
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
  d_output_size: ResultOutput.AGTestSuiteResultOutputSize | null = null;

  @Watch('ag_test_suite_result')
  async on_ag_test_suite_result_change(new_value: AGTestSuiteResultFeedback,
                                       old_value: AGTestSuiteResultFeedback) {
    await this.get_output();
  }

  async created() {
    await this.get_output();
  }

  async get_output() {
    this.d_output_size
        = await ResultOutput.get_ag_test_suite_result_output_size(
      this.submission!.pk,
      this.ag_test_suite_result!.pk,
      this.fdbk_category
    );
    this.d_setup_stdout_loaded = false;
    this.d_setup_stderr_loaded = false;
    await this.load_setup_stdout();
    await this.load_setup_stderr();
  }

  async load_setup_stdout() {
    if (this.d_output_size!.setup_stdout_size === null) {
      this.d_setup_stdout = null;
    }
    else {
      this.d_setup_stdout = await ResultOutput.get_ag_test_suite_result_setup_stdout(
        this.submission!.pk,
        this.ag_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_setup_stdout_loaded = true;
  }

  async load_setup_stderr() {
    if (this.d_output_size!.setup_stderr_size === null) {
        this.d_setup_stderr = null;
    }
    else {
      this.d_setup_stderr = await ResultOutput.get_ag_test_suite_result_setup_stderr(
        this.submission!.pk,
        this.ag_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_setup_stderr_loaded = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

.timed-out-icon {
  padding: 0 2px 0 5px;
}

</style>
