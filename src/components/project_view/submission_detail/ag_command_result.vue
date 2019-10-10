<template>
  <div id="ag-command-result">
    <fieldset v-if="show_correctness_fieldset" class="fieldset">
      <legend class="legend"> Correctness </legend>

      <div id="exit-status-section">
        <div class="feedback-row"
             id="return-code-correctness-section"
             v-if="return_code_correctness !== ReturnCodeCorrectness.not_available">
          <div class="feedback-label"> Exit status:
          </div>
          <div class="feedback">
            <div class="correctness-output">
              <span v-if="return_code_correctness === ReturnCodeCorrectness.timed_out">
                <i class="far fa-clock timed-out-icon"></i>
                <span class="timed-out-msg"> (Timed Out) </span>
              </span>
              <span v-else-if="return_code_correctness === ReturnCodeCorrectness.correct">
                <i class="fas fa-check correct-icon"></i>
              </span>
              <span v-else-if="return_code_correctness === ReturnCodeCorrectness.incorrect">
                <i class="fas fa-times incorrect-icon"></i>
              </span>
            </div>
          </div>
        </div>

        <div v-if="show_actual_and_expected_return_code"
             id="actual-and-expected-return-code-section">
          <div v-if="d_ag_test_command_result.actual_return_code !== null"
               class="feedback-row"
               id="actual-return-code">
            <div class="feedback-label"> Actual exit status: </div>
            <div class="feedback">
              <div class="short-output">{{d_ag_test_command_result.actual_return_code}}</div>
            </div>
          </div>

          <div v-if="d_ag_test_command_result.expected_return_code !== null
                     && d_ag_test_command_result.expected_return_code
                     !== ExpectedReturnCode.none"
               class="feedback-row"
               id="expected-return-code">
            <div class="feedback-label"> Expected exit status: </div>
            <div class="feedback">
              <div class="short-output">{{d_ag_test_command_result.expected_return_code
                === ExpectedReturnCode.zero ? 0 : 'nonzero'}}</div>
            </div>
          </div>
        </div>

        <div v-if="d_ag_test_command_result.stdout_correct !== null"
             id="stdout-correctness-section"
             class="feedback-row">
          <div class="feedback-label"> Output: </div>
          <div class="feedback">
            <div class="correctness-output">
              <span v-if="d_ag_test_command_result.stdout_correct">
                <i class="fas fa-check correct-icon"></i>
              </span>
              <span v-else>
                <i class="fas fa-times incorrect-icon"></i>
              </span>
            </div>
          </div>
        </div>

        <div v-if="d_ag_test_command_result.stderr_correct !== null"
             id="stderr-correctness-section"
             class="feedback-row">
          <div class="feedback-label"> Error output: </div>
          <div class="feedback">
            <div class="correctness-output">
              <span v-if="d_ag_test_command_result.stderr_correct">
                <i class="fas fa-check correct-icon"></i>
              </span>
              <span v-else>
                <i class="fas fa-times incorrect-icon"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="show_stdout_diff || show_stderr_diff"
              class="fieldset">
      <legend class="legend"> Output Diffs </legend>

      <div v-if="show_stdout_diff"
           id="stdout-diff-section"
           class="feedback-row">
        <template v-if="!d_stdout_diff_loaded">
          <div class="loading-output">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </div>
        </template>
        <template v-else class="feedback-output-content-lengthy">
          <div class="diff-container" v-if="d_stdout_diff !== null">
            <diff ref="stdout_diff"
                  :diff_contents="d_stdout_diff"
                  diff_height="50vh"
                  left_header="Expected Output"
                  right_header="Student Output">
            </diff>
          </div>
        </template>
      </div>

      <div v-if="show_stderr_diff"
           id="stderr-diff-section"
           class="feedback-row">
        <template v-if="!d_stderr_diff_loaded">
          <div class="loading-output">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </div>
        </template>
        <template v-else>
          <div class="diff-container" v-if="d_stderr_diff !== null">
            <diff ref="stderr_diff"
                  :diff_contents="d_stderr_diff"
                  diff_height="50vh"
                  left_header="Expected Error Output"
                  right_header="Student Error Output">
            </diff>
          </div>
        </template>
      </div>
    </fieldset>

    <fieldset v-if="d_ag_test_command_result.fdbk_settings.show_actual_stdout
                    || d_ag_test_command_result.fdbk_settings.show_actual_stderr"
              class="fieldset">
      <legend class="legend"> Actual Output </legend>
      <div v-if="d_ag_test_command_result.fdbk_settings.show_actual_stdout"
           id="actual-stdout-section"
           class="feedback-row">
        <div class="feedback-label"> Output: </div>
        <div class="feedback">
          <template v-if="!d_stdout_content_loaded">
            <div class="loading-output">
              <i class="fa fa-spinner fa-pulse fa-fw"></i>
            </div>
          </template>
          <template v-else>
            <div v-if="!d_stdout_content"
                 class="short-output"> No Output
            </div>
            <pre v-else class="lengthy-output">{{d_stdout_content}}</pre>
          </template>
        </div>
      </div>

      <div v-if="d_ag_test_command_result.fdbk_settings.show_actual_stderr"
           id="actual-stderr-section"
           class="feedback-row">
        <div class="feedback-label"> Error output: </div>
        <div class="feedback">
          <template v-if="!d_stderr_content_loaded">
            <div class="loading-output">
              <i class="fa fa-spinner fa-pulse fa-fw"></i>
            </div>
          </template>
          <template v-else>
            <div v-if="!d_stderr_content"
                 class="short-output"> No Output
            </div>
            <pre v-else class="lengthy-output">{{d_stderr_content}}</pre>
          </template>
        </div>
      </div>
    </fieldset>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    AGTestCommandResultFeedback,
    ExpectedReturnCode,
    FeedbackCategory,
    ResultOutput,
    Submission,
    ValueFeedbackLevel
} from "ag-client-typescript";

import Diff from '@/components/diff.vue';
import { ReturnCodeCorrectness } from '@/components/project_view/submission_detail/return_code_correctness';

@Component({
  components: {
    Diff
  }
})
export default class AGCommandResult extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_command_result!: AGTestCommandResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  d_stdout_content: string | null = null;
  d_stderr_content: string | null = null;
  d_stdout_diff: string[] | null = null;
  d_stderr_diff: string[] | null = null;
  d_stdout_content_loaded = false;
  d_stderr_content_loaded = false;
  d_stdout_diff_loaded = false;
  d_stderr_diff_loaded = false;
  d_ag_test_command_result_output_size: ResultOutput.AGTestCommandResultOutputSize | null = null;
  d_submission: Submission | null = null;
  d_ag_test_command_result: AGTestCommandResultFeedback | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;

  readonly ReturnCodeCorrectness = ReturnCodeCorrectness;

  @Watch('submission')
  on_submission_change(new_value: Submission, old_value: Submission) {
    this.d_submission = new_value;
  }

  @Watch('fdbk_category')
  on_fdbk_category_change(new_value: FeedbackCategory, old_value: FeedbackCategory) {
    this.d_fdbk_category = new_value;
  }

  @Watch('ag_test_command_result')
  async on_ag_test_command_result_change(new_value: object, old_value: object) {
    this.d_ag_test_command_result = JSON.parse(JSON.stringify(new_value));
    await this.get_results();
  }

  readonly ExpectedReturnCode = ExpectedReturnCode;
  readonly ValueFeedbackLevel = ValueFeedbackLevel;

  async created() {
    this.d_submission = this.submission;
    this.d_ag_test_command_result = this.ag_test_command_result;
    this.d_fdbk_category = this.fdbk_category;
    await this.get_results();
  }

  async get_results() {
    this.d_ag_test_command_result_output_size
        = await ResultOutput.get_ag_test_cmd_result_output_size(
      this.d_submission!.pk,
      this.d_ag_test_command_result!.pk,
      this.d_fdbk_category
    );
    this.d_stdout_content_loaded = false;
    this.d_stderr_content_loaded = false;
    this.d_stdout_diff_loaded = false;
    this.d_stderr_content_loaded = false;
    await this.load_stdout_content();
    await this.load_stderr_content();
    await this.load_stdout_diff();
    await this.load_stderr_diff();
  }

  get show_correctness_fieldset() {
    return this.d_ag_test_command_result!.return_code_correct !== null
           || (this.d_ag_test_command_result!.timed_out !== null
               && this.d_ag_test_command_result!.timed_out!)
           || this.show_actual_and_expected_return_code
           || this.d_ag_test_command_result!.stdout_correct !== null
           || this.d_ag_test_command_result!.stderr_correct !== null;
  }

  get show_actual_and_expected_return_code() {
    return this.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level
           === ValueFeedbackLevel.expected_and_actual
           && (this.d_ag_test_command_result!.actual_return_code !== null
               || this.d_ag_test_command_result!.expected_return_code !== null);
  }

  get show_stdout_diff() {
    return this.d_ag_test_command_result!.stdout_correct !== null
           && !this.d_ag_test_command_result!.stdout_correct!
           && this.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level
           === ValueFeedbackLevel.expected_and_actual;
  }

  get show_stderr_diff() {
    return this.d_ag_test_command_result!.stderr_correct !== null
           && !this.d_ag_test_command_result!.stderr_correct!
           && this.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level
           === ValueFeedbackLevel.expected_and_actual;
  }

  get return_code_correctness() {
    if (this.d_ag_test_command_result!.timed_out !== null
        && this.d_ag_test_command_result!.timed_out!) {
      return ReturnCodeCorrectness.timed_out;
    }
    if (this.d_ag_test_command_result!.return_code_correct !== null) {
      return this.d_ag_test_command_result!.return_code_correct!
          ? ReturnCodeCorrectness.correct : ReturnCodeCorrectness.incorrect;
    }
    return ReturnCodeCorrectness.not_available;
  }

  async load_stdout_content() {
    if (this.d_ag_test_command_result_output_size!.stdout_size === null) {
      this.d_stdout_content = null;
    }
    else {
      this.d_stdout_content = await ResultOutput.get_ag_test_cmd_result_stdout(
        this.d_submission!.pk,
        this.ag_test_command_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_stdout_content_loaded = true;
  }

  async load_stderr_content() {
    if (this.d_ag_test_command_result_output_size!.stderr_size === null) {
      this.d_stderr_content = null;
    }
    else {
      this.d_stderr_content = await ResultOutput.get_ag_test_cmd_result_stderr(
        this.d_submission!.pk,
        this.d_ag_test_command_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_stderr_content_loaded = true;
  }

  async load_stdout_diff() {
    if (this.d_ag_test_command_result_output_size!.stdout_diff_size === null) {
      this.d_stdout_diff = null;
    }
    else {
      this.d_stdout_diff = await ResultOutput.get_ag_test_cmd_result_stdout_diff(
        this.d_submission!.pk,
        this.d_ag_test_command_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_stdout_diff_loaded = true;
  }

  async load_stderr_diff() {
    if (this.d_ag_test_command_result_output_size!.stderr_diff_size === null) {
      this.d_stderr_diff = null;
    }
    else {
      this.d_stderr_diff = await ResultOutput.get_ag_test_cmd_result_stderr_diff(
        this.d_submission!.pk,
        this.d_ag_test_command_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_stderr_diff_loaded = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

.not-available-icon, .correct-icon, .incorrect-icon, .timed-out-icon {
  padding: 0 5px 0 0;
}

.timed-out-msg {
  //color: $coral-pink;
}

</style>
