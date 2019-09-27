<template>
  <div id="ag-command-result">
    <fieldset class="fieldset" v-if="ag_test_command_result.return_code_correct !== null">
      <legend class="legend"> Correctness </legend>
      <div id="exit-status-section">

          <div class="feedback-row">
            <div class="feedback-label" id="return-code-correctness-section"> Exit Status: </div>
            <div class="feedback">
              <div class="correctness-output">
                <span v-if="return_code_correctness === ReturnCodeCorrectness.timed_out">
                  <span> Timed Out </span>
                  <i class="fas fa-clock timed-out-icon"></i>
                </span>
                <span v-else-if="return_code_correctness === ReturnCodeCorrectness.not_available">
                  <i class="fas fa-ban not-available-icon"></i>
                </span>
                <span v-else-if="return_code_correctness === ReturnCodeCorrectness.correct">
                  <i class="fas fa-check-circle correct-icon"></i>
                </span>
                <span v-else-if="return_code_correctness === ReturnCodeCorrectness.incorrect">
                  <i class="fas fa-times-circle incorrect-icon"></i>
                </span>
              </div>

              <span v-if="show_exit_status_tooltip">
                <i class="fas fa-question-circle">
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
                                 && d_ag_test_command_result.expected_return_code
                                 !== ExpectedReturnCode.none">
                        Expected exit status:
                        {{d_ag_test_command_result.expected_return_code
                          === ExpectedReturnCode.zero ? 0 : 'nonzero'}}
                      </div>
                    </div>
                  </tooltip>
                </i>
              </span>
            </div>

          </div>

          <div v-if="d_ag_test_command_result.stdout_correct !== null"
               id="stdout-correctness-section"
               class="feedback-row">
            <div class="feedback-label"> Stdout: </div>
            <div class="feedback">
              <div class="correctness-output">
                <span v-if="d_ag_test_command_result.stdout_correct">
                  <i class="fas fa-check-circle correct-icon"></i>
                </span>
                <span v-else>
                  <i class="fas fa-times-circle incorrect-icon"></i>
                </span>
              </div>
            </div>

          </div>

          <div v-if="d_ag_test_command_result.stderr_correct !== null"
               id="stderr-correctness-section"
               class="feedback-row">
            <div class="feedback-label"> Stderr: </div>
            <div class="feedback">
              <div class="correctness-output">
                <span v-if="d_ag_test_command_result.stderr_correct">
                  <i class="fas fa-check-circle correct-icon"></i>
                </span>
                <span v-else>
                  <i class="fas fa-times-circle incorrect-icon"></i>
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
          <div class="diff-container">
            <diff ref="stdout_diff"
                  :diff_contents="d_stdout_diff"
                  left_header="Expected Stdout"
                  right_header="Student Stdout">
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
          <div class="diff-container">
            <diff ref="stderr_diff"
                  :diff_contents="d_stderr_diff"
                  left_header="Expected Stderr"
                  right_header="Student Stderr">
            </diff>
          </div>
        </template>
      </div>
    </fieldset>


    <fieldset v-if="d_ag_test_command_result.fdbk_settings.show_actual_stdout
                    || d_ag_test_command_result.fdbk_settings.show_actual_stderr"
              class="fieldset">
      <legend class="legend"> Output </legend>

      <div v-if="d_ag_test_command_result.fdbk_settings.show_actual_stdout"
           id="show-actual-stdout-section"
           class="feedback-row">

        <div class="feedback-label"> Stdout: </div>

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
           id="show-actual-stderr-section"
           class="feedback-row">

        <div class="feedback-label"> Stderr: </div>

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
  d_stdout_content_loaded = false;
  d_stderr_content_loaded = false;
  d_stdout_diff_loaded = false;
  d_stderr_diff_loaded = false;
  d_ag_test_command_result_output_size: ResultOutput.AGTestCommandResultOutputSize | null = null;
  d_submission: Submission | null = null;
  d_ag_test_command_result: AGTestCommandResultFeedback | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;

  // wide_diff = [
  //     "  ./euchre.exe pack.in noshuffle 1 Alice Simple Bob Simple Cathy Simple Drew Simple\n",
  //     "- Hand 0\n",
  //     "- Jack of Diamonds turned up\n",
  //     "- Jack of Diamonds turned up\n",
  //     "- Jack of Diamonds turned up\n",
  //     "- Jack of Diamonds turned up\n",
  //     "- Jack of Diamonds turned up\n",
  //     "- Jack of Diamonds turned up\n",
  //     "- Jack of Diamonds turned up\n",
  //     "- Jack of Diamonds turned up\n",
  //     "+ Hand 0\n",
  // ];

  readonly ReturnCodeCorrectness = ReturnCodeCorrectness;

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
    this.d_ag_test_command_result_output_size
        = await ResultOutput.get_ag_test_cmd_result_output_size(
      this.d_submission!.pk,
      this.d_ag_test_command_result!.pk,
      this.d_fdbk_category
    );
    await this.load_stdout_content();
    await this.load_stderr_content();
    await this.load_stdout_diff();
    await this.load_stderr_diff();
  }

  get show_stdout_diff() {
      console.log(this.d_ag_test_command_result!.stdout_correct !== null);
      console.log(this.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level);
      console.log(!this.d_ag_test_command_result!.stdout_correct);
      console.log(this.d_stdout_diff);
      console.log("******************");

      return this.d_ag_test_command_result!.stdout_correct !== null
             && this.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level
             === ValueFeedbackLevel.expected_and_actual
             && !this.d_ag_test_command_result!.stdout_correct;
  }

  get show_stderr_diff() {
      return this.d_ag_test_command_result!.stderr_correct !== null
             && this.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level
             === ValueFeedbackLevel.expected_and_actual
             && !this.d_ag_test_command_result!.stderr_correct;
  }

  get show_exit_status_tooltip() {
      return this.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level
             === ValueFeedbackLevel.expected_and_actual
             || this.d_ag_test_command_result!.actual_return_code !== null
             || this.d_ag_test_command_result!.timed_out;
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
    this.d_stdout_content_loaded = false;
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
    this.d_stderr_content_loaded = false;
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
    this.d_stdout_diff_loaded = false;
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
    this.d_stderr_diff_loaded = false;
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

.not-available-icon {
  padding: 0 5px 0 0;
}

.correct-icon {
  padding: 0 5px 0 0;
}

.incorrect-icon {
  padding: 0 5px 0 0;
}

.timed-out-icon {
  padding: 0 5px 0 0;
}

</style>
