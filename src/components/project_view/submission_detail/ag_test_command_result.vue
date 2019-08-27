<template>
  <div>
    <div class="expected-and-actual-return-code"
         v-if="false">
      <div v-if="ag_test_command_result_feedback.actual_return_code !== null">
        Exit Status: {{ag_test_command_result_feedback.actual_return_code}}
      </div>
      <div v-if="ag_test_command_result_feedback.timed_out">
        The command timed out.
      </div>
      <div v-if="ag_test_command_result_feedback.expected_return_code !== null
                 && ag_test_command_result_feedback.expected_return_code !== ExpectedReturnCode.none">
        Expected exit status:
        {{ag_test_command_result_feedback.expected_return_code === ExpectedReturnCode.zero ? 0 : 'nonzero'}}
      </div>
    </div>
    <div id="exit-status-section">
      <div v-if="ag_test_command_result_feedback.return_code_correct !== null">
        <div class="feedback-label"> Exit Status: </div>

        <span v-if="ag_test_command.return_code_correct">Correct</span>
        <span v-else>Incorrect</span>

        <span v-if="ag_test_command_result_feedback.fdbk_settings.return_code_fdbk_level === ValueFeedbackLevel.expected_and_actual
                    || ag_test_command.actual_return_code !== null
                    || ag_test_command.timed_out">
          Timed out
        </span>
      </div>
    </div>

    <div id="stdout-section">
      <div v-if="ag_test_command_result_feedback.stdout_correct !== null">
        <span class="feedback-label"> Output (Stdout) Correctness: </span>
        <span v-if="ag_test_command.stdout_correct"> Correct </span>
        <span v-else> Incorrect </span>
      </div>
      <div v-if="ag_test_command_result_feedback.fdbk_settings.stdout_fdbk_level === ValueFeedbackLevel.expected_and_actual
               && !ag_test_command_result_feedback.stdout_correct">
        <span class="feedback-label"> Output (Stdout) Diff: </span>
        <template v-if="!stdout_diff_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <diff ref="stdout_diff"
                :diff_contents="stdout_diff"
                left_header="Expected Output"
                right_header="Student Output">
          </diff>
        </template>
      </div>

      <div v-if="ag_test_command_result_feedback.fdbk_settings.show_actual_stdout">
        <span class="feedback-label"> Output: </span>
        <template v-if="!stdout_content_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <span v-if="!stdout_content"> No Output </span>
          <pre v-else>{{stdout_content}}</pre>
        </template>
      </div>
    </div>

    <div id="stderr-section">
      <div v-if="ag_test_command_result_feedback.stderr_correct !== null">
        <span class="feedback-label"> Error Output (Stderr) Correctness: </span>
        <span v-if="ag_test_command.stderr_correct"> Correct </span>
        <span v-else> Incorrect </span>
      </div>
      <div v-if="ag_test_command_result_feedback.fdbk_settings.stderr_fdbk_level === ValueFeedbackLevel.expected_and_actual
               && !ag_test_command_result_feedback.stderr_correct">
        <span class="feedback-label"> Error Output (Stderr) Diff: </span>
        <template v-if="!stderr_diff_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <diff ref="stderr_diff"
                :diff_contents="stderr_diff"
                left_header="Expected Output"
                right_header="Student Output">
          </diff>
        </template>
      </div>
      <div v-if="ag_test_command_result_feedback.fdbk_settings.show_actual_stderr">
        <span class="feedback-label"> Error Output: </span>
        <template v-if="!stderr_content_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <span v-if="!stderr_content"> No Output </span>
          <pre v-else>{{stderr_content}}</pre>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCommandResultFeedback,
    FeedbackCategory,
    ResultOutput,
    Submission,
    ExpectedReturnCode, ValueFeedbackLevel
} from "ag-client-typescript";
import get_ag_test_cmd_result_stdout = ResultOutput.get_ag_test_cmd_result_stdout;
import get_ag_test_cmd_result_stderr = ResultOutput.get_ag_test_cmd_result_stderr;
import get_ag_test_cmd_result_stdout_diff = ResultOutput.get_ag_test_cmd_result_stdout_diff;
import get_ag_test_cmd_result_stderr_diff = ResultOutput.get_ag_test_cmd_result_stderr_diff;

import Diff from '@/components/diff.vue';

@Component({
  components: {
    Diff
  }
})
export default class AGTestCommandResult extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_command_result_feedback!: AGTestCommandResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  stdout_content: string | null = null;
  stderr_content: string | null = null;
  stdout_diff: string[] | null = null;
  stderr_diff: string[] | null = null;

  stdout_content_loaded = false;
  stderr_content_loaded = false;
  stdout_diff_loaded = false;
  stderr_diff_loaded = false;

  readonly ExpectedReturnCode = ExpectedReturnCode;
  readonly ValueFeedbackLevel = ValueFeedbackLevel;

  async created() {
    await this.load_stdout_content();
    await this.load_stderr_content();
    await this.load_stdout_diff();
    await this.load_stderr_diff();
  }

  async load_stdout_content() {
    this.stdout_content = await get_ag_test_cmd_result_stdout(
      this.submission.pk,
      this.ag_test_command_result_feedback.pk,
      this.fdbk_category
    );
    this.stdout_content_loaded = true;
  }

  async load_stderr_content() {
    this.stderr_content = await get_ag_test_cmd_result_stderr(
      this.submission.pk,
      this.ag_test_command_result_feedback.pk,
      this.fdbk_category
    );
    this.stderr_content_loaded = true;
  }

  async load_stdout_diff() {
    this.stdout_diff = await get_ag_test_cmd_result_stdout_diff(
      this.submission.pk,
      this.ag_test_command_result_feedback.pk,
      this.fdbk_category
    );
    console.log(this.stdout_diff);
    // not getting back an array of strings here
    this.stdout_diff_loaded = true;
  }

  async load_stderr_diff() {
    this.stderr_diff = await get_ag_test_cmd_result_stderr_diff(
      this.submission.pk,
      this.ag_test_command_result_feedback.pk,
      this.fdbk_category
    );
    console.log(this.stderr_diff);
    // not getting back an array of strings and here
    this.stderr_diff_loaded = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.feedback-label {
  font-weight: bold;
}

</style>
