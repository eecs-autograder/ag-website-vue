<template>
  <div id="ag-command-result">
    <div v-if="ag_test_command_result.return_code_correct !== null"
         id="exit-status-section">
      <div class="feedback-row">
        <div class="feedback-label"> Exit Status: </div>
        <div class="feedback-output-content-short"
             id="return-code-correctness">
          {{return_code_correctness}}

          <span v-if="d_ag_test_command_result.fdbk_settings.return_code_fdbk_level
                      === ValueFeedbackLevel.expected_and_actual ||
                      d_ag_test_command_result.actual_return_code !== null ||
                      d_ag_test_command_result.timed_out">
            <i class="fas fa-question-circle"></i>
            <tooltip ref="expected_and_actual_return_code"
                     width="medium"
                     placement="top">
              <div class="expected-and-actual-return-code">
                <div v-if="d_ag_test_command_result.actual_return_code !== null">
                  Exit Status: {{d_ag_test_command_result.actual_return_code}}
                </div>
                <div v-if="d_ag_test_command_result.timed_out">
                  The command timed out.
                </div>
                <div v-if="d_ag_test_command_result.expected_return_code !== null
                   && d_ag_test_command_result.expected_return_code !== ExpectedReturnCode.none">
                  Expected exit status:
                  {{d_ag_test_command_result.expected_return_code
                    === ExpectedReturnCode.zero ? 0 : 'nonzero'}}
                </div>
              </div>
            </tooltip>
          </span>

        </div>
      </div>
    </div>

    <div id="stdout-section">
      <div v-if="d_ag_test_command_result.stdout_correct !== null">
        <div class="feedback-row"
             id="stdout-correctness-section">
          <div class="feedback-label"> Output (Stdout) Correctness: </div>
          <div class="feedback-output-content-short">
            {{d_ag_test_command_result.stdout_correct ? 'Correct' : 'Incorrect'}}
          </div>
        </div>

        <div v-if="d_ag_test_command_result.fdbk_settings.stdout_fdbk_level
                   === ValueFeedbackLevel.expected_and_actual
                   && !d_ag_test_command_result.stdout_correct"
             class="feedback-row"
             id="stdout-diff-section">
          <div class="feedback-label"> Output (Stdout) Diff: </div>
          <template v-if="!d_stdout_diff_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else class="feedback-output-content-lengthy">
            <diff ref="stdout_diff"
                  :diff_contents="d_stdout_diff"
                  left_header="Expected Output"
                  right_header="Student Output">
            </diff>
          </template>
        </div>
      </div>

      <div v-if="d_ag_test_command_result.fdbk_settings.show_actual_stdout"
           class="feedback-row"
           id="stdout-actual-section">
        <div class="feedback-label"> Output: </div>
        <template v-if="!d_stdout_content_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_stdout_content"
               class="feedback-output-content-short"> No Output </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_stdout_content}}</pre>
        </template>
      </div>
    </div>

    <div id="stderr-section">
      <div v-if="d_ag_test_command_result.stderr_correct !== null">
        <div class="feedback-row"
             id="stderr-correctness-section">
          <div class="feedback-label"> Error Output (Stderr) Correctness: </div>
          <div class="feedback-output-content-short">
            {{d_ag_test_command_result.stderr_correct ? 'Correct' : 'Incorrect'}}
          </div>
        </div>

        <div v-if="d_ag_test_command_result.fdbk_settings.stderr_fdbk_level
                   === ValueFeedbackLevel.expected_and_actual
                   && !d_ag_test_command_result.stderr_correct"
             class="feedback-row"
             id="stderr-diff-section">
          <div class="feedback-label"> Error Output (Stderr) Diff: </div>
          <template v-if="!d_stderr_diff_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else
                    class="feedback-output-content-lengthy">
            <diff ref="stderr_diff"
                  :diff_contents="d_stderr_diff"
                  left_header="Expected Output"
                  right_header="Student Output">
            </diff>
          </template>
        </div>
      </div>

      <div v-if="d_ag_test_command_result.fdbk_settings.show_actual_stderr"
           class="feedback-row"
           id="stderr-actual-section">
        <div class="feedback-label"> Error Output: </div>
        <template v-if="!d_stderr_content_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_stderr_content"
               class="feedback-output-content-short"> No Output </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_stderr_content}}</pre>
        </template>
      </div>
    </div>

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
import Tooltip from '@/components/tooltip.vue';

@Component({
  components: {
    Diff,
    Tooltip
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

  d_submission: Submission | null = null;
  d_ag_test_command_result: AGTestCommandResultFeedback | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;

  d_stdout_content_loaded = false;
  d_stderr_content_loaded = false;
  d_stdout_diff_loaded = false;
  d_stderr_diff_loaded = false;

  @Watch('submission')
  async on_submission_change(new_value: Submission, old_value: Submission) {
    this.d_submission = new_value;
    await this.get_results();
  }

  @Watch('ag_test_command_result')
  async on_ag_test_command_result_change(new_value: object, old_value: object) {
    this.d_ag_test_command_result = JSON.parse(JSON.stringify(new_value));
    await this.get_results();
  }

  @Watch('fdbk_category')
  async on_fdbk_category_change(new_value: FeedbackCategory, old_value: FeedbackCategory) {
    this.d_fdbk_category = new_value;
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
    await this.load_stdout_content();
    await this.load_stderr_content();
    await this.load_stdout_diff();
    await this.load_stderr_diff();
  }

  get return_code_correctness() {
    if (this.d_ag_test_command_result!.timed_out !== null
        && this.d_ag_test_command_result!.timed_out!) {
        return "Timed Out";
    }
    if (this.d_ag_test_command_result!.return_code_correct !== null) {
      return this.d_ag_test_command_result!.return_code_correct! ? "Correct" : "Incorrect";
    }
    return "Not Available";
  }

  async load_stdout_content() {
    this.d_stdout_content_loaded = false;
    this.d_stdout_content = await ResultOutput.get_ag_test_cmd_result_stdout(
      this.d_submission!.pk,
      this.ag_test_command_result.pk,
      this.d_fdbk_category
    );
    this.d_stdout_content_loaded = true;
  }

  async load_stderr_content() {
    this.d_stderr_content_loaded = false;
    this.d_stderr_content = await ResultOutput.get_ag_test_cmd_result_stderr(
      this.d_submission!.pk,
      this.d_ag_test_command_result!.pk,
      this.d_fdbk_category
    );
    this.d_stderr_content_loaded = true;
  }

  async load_stdout_diff() {
    this.d_stdout_diff_loaded = false;
    this.d_stdout_diff = await ResultOutput.get_ag_test_cmd_result_stdout_diff(
      this.d_submission!.pk,
      this.d_ag_test_command_result!.pk,
      this.d_fdbk_category
    );
    this.d_stdout_diff_loaded = true;
  }

  async load_stderr_diff() {
    this.d_stderr_diff_loaded = false;
    this.d_stderr_diff = await ResultOutput.get_ag_test_cmd_result_stderr_diff(
      this.d_submission!.pk,
      this.d_ag_test_command_result!.pk,
      this.d_fdbk_category
    );
    this.d_stderr_diff_loaded = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';
</style>
