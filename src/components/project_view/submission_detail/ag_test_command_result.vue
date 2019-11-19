<template>
  <div>
    <fieldset ref="correctness" v-if="show_correctness_fieldset" class="fieldset">
      <legend class="legend"> Correctness </legend>

      <div class="feedback-row"
            ref="return_code_correctness"
            v-if="ag_test_command_result.return_code_correct !== null
                  || ag_test_command_result.timed_out">
        <div class="feedback-label">Exit status:</div>
        <div class="feedback">
          <div class="correctness-output">
            <span v-if="ag_test_command_result.timed_out !== null
                        && this.ag_test_command_result.timed_out">
              <i class="far fa-clock timed-out-icon"></i>
              <span class="timed-out-msg"> (Timed out) </span>
            </span>
            <span v-else-if="ag_test_command_result.return_code_correct !== null">
              <i v-if="ag_test_command_result.return_code_correct"
                  class="fas fa-check correct-icon"></i>
              <i v-else class="fas fa-times incorrect-icon"></i>
            </span>
          </div>
        </div>
      </div>

      <div v-if="ag_test_command_result.actual_return_code !== null"
            class="feedback-row"
            ref="actual_return_code">
        <div class="feedback-label">Actual exit status:</div>
        <div class="feedback">
          <div :class="['short-output',
                        {'actual-return-code-correct': ag_test_command_result !== null
                          && ag_test_command_result.return_code_correct,
                          'actual-return-code-incorrect': ag_test_command_result !== null
                          && !ag_test_command_result.return_code_correct}]"
          >{{ag_test_command_result.actual_return_code}}</div>
        </div>
      </div>

      <div v-if="ag_test_command_result.expected_return_code !== null
                 && ag_test_command_result.expected_return_code !== ExpectedReturnCode.none"
            class="feedback-row"
            ref="expected_return_code">
        <div class="feedback-label"> Expected exit status: </div>
        <div class="feedback">
          <div class="short-output">
            {{ag_test_command_result.expected_return_code === ExpectedReturnCode.zero
              ? 0 : 'nonzero'}}
          </div>
        </div>
      </div>

      <div v-if="ag_test_command_result.stdout_correct !== null"
            ref="stdout_correctness"
            class="feedback-row">
        <div class="feedback-label"> Output: </div>
        <div class="feedback">
          <div class="correctness-output">
            <span v-if="ag_test_command_result.stdout_correct">
              <i class="fas fa-check correct-icon"></i>
            </span>
            <span v-else>
              <i class="fas fa-times incorrect-icon"></i>
            </span>
          </div>
        </div>
      </div>

      <div v-if="ag_test_command_result.stderr_correct !== null"
            ref="stderr_correctness"
            class="feedback-row">
        <div class="feedback-label"> Error output: </div>
        <div class="feedback">
          <div class="correctness-output">
            <span v-if="ag_test_command_result.stderr_correct">
              <i class="fas fa-check correct-icon"></i>
            </span>
            <span v-else>
              <i class="fas fa-times incorrect-icon"></i>
            </span>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="d_output_size !== null
                    && (d_output_size.stdout_diff_size !== null
                        || d_output_size.stderr_diff_size !== null)"
              class="fieldset"
              ref="diffs">
      <legend class="legend"> Output Diffs </legend>

      <div v-if="show_stdout_diff"
           class="feedback-row">
        <template v-if="!d_stdout_diff_loaded">
          <div class="loading-output">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </div>
        </template>
        <template v-else class="feedback-output-content-lengthy">
          <div v-if="d_stdout_diff !== null"
               class="diff-container">
            <diff ref="stdout_diff"
                  :diff_contents="d_stdout_diff"
                  diff_max_height="50vh"
                  left_header="Expected Output"
                  right_header="Student Output">
            </diff>
          </div>
        </template>
      </div>

      <div v-if="show_stderr_diff"
           class="feedback-row">
        <template v-if="!d_stderr_diff_loaded">
          <div class="loading-output">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </div>
        </template>
        <template v-else>
          <div v-if="d_stderr_diff !== null"
               class="diff-container">
            <diff ref="stderr_diff"
                  :diff_contents="d_stderr_diff"
                  diff_max_height="50vh"
                  left_header="Expected Error Output"
                  right_header="Student Error Output">
            </diff>
          </div>
        </template>
      </div>
    </fieldset>

    <fieldset v-if="d_output_size !== null &&
                    (d_output_size.stdout_size !== null || d_output_size.stderr_size !== null)"
              class="fieldset"
              ref="actual_output">
      <legend class="legend"> Actual Output </legend>

      <div v-if="d_output_size.stdout_size !== null"
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
                 class="short-output"> No output
            </div>
            <div v-else
                 class="lengthy-output">
              <view-file :file_contents="d_stdout_content"
                         view_file_max_height="50vh"
                         ref="stdout"></view-file>
            </div>
          </template>
        </div>
      </div>

      <div v-if="d_output_size.stderr_size !== null"
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
                 class="short-output"> No output
            </div>
            <div v-else
                 class="lengthy-output">
              <view-file :file_contents="d_stderr_content"
                         view_file_max_height="50vh"
                         ref="stderr"></view-file>
            </div>
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
import ViewFile from "@/components/view_file.vue";

@Component({
  components: {
    Diff,
    ViewFile
  }
})
export default class AGTestCommandResult extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_command_result!: AGTestCommandResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  d_stdout_content: Promise<string> | null = null;
  d_stderr_content: Promise<string> | null = null;
  d_stdout_diff: string[] | null = null;
  d_stderr_diff: string[] | null = null;
  d_stdout_content_loaded = false;
  d_stderr_content_loaded = false;
  d_stdout_diff_loaded = false;
  d_stderr_diff_loaded = false;
  d_output_size: ResultOutput.AGTestCommandResultOutputSize | null = null;

  @Watch('ag_test_command_result')
  async on_ag_test_command_result_change(new_value: AGTestCommandResultFeedback,
                                         old_value: AGTestCommandResultFeedback) {
    await this.get_output();
  }

  readonly ExpectedReturnCode = ExpectedReturnCode;
  readonly ValueFeedbackLevel = ValueFeedbackLevel;

  async created() {
    await this.get_output();
  }

  async get_output() {
    this.d_output_size = await ResultOutput.get_ag_test_cmd_result_output_size(
      this.submission.pk,
      this.ag_test_command_result.pk,
      this.fdbk_category
    );
    this.d_stdout_content_loaded = false;
    this.d_stderr_content_loaded = false;
    this.d_stdout_diff_loaded = false;
    this.d_stderr_content_loaded = false;
    this.load_stdout_content();
    this.load_stderr_content();
    await this.load_stdout_diff();
    await this.load_stderr_diff();
  }

  get show_correctness_fieldset() {
    return this.ag_test_command_result.return_code_correct !== null
           || (this.ag_test_command_result.timed_out !== null
               && this.ag_test_command_result.timed_out!)
           || this.ag_test_command_result.actual_return_code !== null
           || this.ag_test_command_result.stdout_correct !== null
           || this.ag_test_command_result.stderr_correct !== null;
  }

  get show_stdout_diff() {
    return this.d_output_size!.stdout_diff_size !== null;

    // this.ag_test_command_result.stdout_correct !== null
    //        && !this.ag_test_command_result.stdout_correct!
    //        && this.ag_test_command_result.fdbk_settings.stdout_fdbk_level
    //        === ValueFeedbackLevel.expected_and_actual;
  }

  get show_stderr_diff() {
    return this.d_output_size!.stderr_diff_size !== null;
    // this.ag_test_command_result.stderr_correct !== null
    //        && !this.ag_test_command_result.stderr_correct!
    //        && this.ag_test_command_result.fdbk_settings.stderr_fdbk_level
    //        === ValueFeedbackLevel.expected_and_actual;
  }

  load_stdout_content() {
    if (this.d_output_size!.stdout_size === null || this.d_output_size!.stdout_size === 0) {
      this.d_stdout_content = null;
    }
    else {
      this.d_stdout_content = ResultOutput.get_ag_test_cmd_result_stdout(
        this.submission!.pk,
        this.ag_test_command_result.pk,
        this.fdbk_category
      );
    }
    this.d_stdout_content_loaded = true;
  }

  load_stderr_content() {
    if (this.d_output_size!.stderr_size === null || this.d_output_size!.stderr_size === 0) {
      this.d_stderr_content = null;
    }
    else {
      this.d_stderr_content = ResultOutput.get_ag_test_cmd_result_stderr(
        this.submission!.pk,
        this.ag_test_command_result.pk,
        this.fdbk_category
      );
    }
    this.d_stderr_content_loaded = true;
  }

  async load_stdout_diff() {
    if (this.d_output_size!.stdout_diff_size === null
        || this.d_output_size!.stdout_diff_size === 0) {
      this.d_stdout_diff = null;
    }
    else {
      this.d_stdout_diff = await ResultOutput.get_ag_test_cmd_result_stdout_diff(
        this.submission!.pk,
        this.ag_test_command_result.pk,
        this.fdbk_category
      );
    }
    this.d_stdout_diff_loaded = true;
  }

  async load_stderr_diff() {
    if (this.d_output_size!.stderr_diff_size === null
        || this.d_output_size!.stderr_diff_size === 0) {
      this.d_stderr_diff = null;
    }
    else {
      this.d_stderr_diff = await ResultOutput.get_ag_test_cmd_result_stderr_diff(
        this.submission!.pk,
        this.ag_test_command_result.pk,
        this.fdbk_category
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

.actual-return-code-correct {
  color: $ocean-blue;
}

.actual-return-code-incorrect {
  color: lighten($warning-red, 5);
}

</style>
