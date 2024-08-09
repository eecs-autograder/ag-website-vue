<template>
  <div>
    <description-renderer
      v-if="d_globals.user_roles.is_staff
            && d_staff_description !== null && d_staff_description !== ''"
      :text="d_staff_description"
    ></description-renderer>

    <description-renderer
      v-if="ag_test_command_result.student_description !== null"
      :text="ag_test_command_result.student_description"
    ></description-renderer>

    <description-renderer
      v-if="ag_test_command_result.student_on_fail_description !== null"
      :text="ag_test_command_result.student_on_fail_description"
    ></description-renderer>

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
                          // return_code_correct can be null so we need to check for false
                          // to avoid showing the red warning color when it's null
                          && ag_test_command_result.return_code_correct === false}]"
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

      <div v-if="d_output_size.stdout_diff_size !== null" class="feedback-row">
        <div v-if="d_stdout_diff !== null" class="diff-container">
          <diff ref="stdout_diff"
                :diff_contents="d_stdout_diff"
                diff_max_height="50vh"
                :progress="d_stdout_diff_load_progress"
                left_header="Expected Output"
                right_header="Student Output">
          </diff>
        </div>
      </div>

      <div v-if="d_output_size.stderr_diff_size !== null" class="feedback-row">
        <div v-if="d_stderr_diff !== null" class="diff-container">
          <diff ref="stderr_diff"
                :diff_contents="d_stderr_diff"
                diff_max_height="50vh"
                :progress="d_stderr_diff_load_progress"
                left_header="Expected Error Output"
                right_header="Student Error Output">
          </diff>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="d_output_size !== null
                    && (d_output_size.stdout_size !== null || d_output_size.stderr_size !== null)"
              class="fieldset"
              ref="actual_output">
      <legend class="legend"> Actual Output </legend>

      <div v-if="d_output_size.stdout_size !== null"
           ref="actual_stdout_section"
           class="feedback-row">
        <div class="feedback-label"> Output: </div>
        <div class="feedback">
          <div v-if="d_output_size.stdout_size === 0" class="short-output">No output</div>
          <div v-else-if="d_stdout_content !== null" class="lengthy-output">
            <view-file :file_contents="d_stdout_content"
                        view_file_max_height="50vh"
                        :progress="d_stdout_load_progress"
                        ref="stdout"></view-file>
          </div>
        </div>
      </div>

      <div v-if="d_output_size.stderr_size !== null"
           ref="actual_stderr_section"
           class="feedback-row">
        <div class="feedback-label"> Error output: </div>
        <div class="feedback">
          <div v-if="d_output_size.stderr_size === 0" class="short-output">No output</div>
          <div v-else-if="d_stderr_content !== null" class="lengthy-output">
            <view-file :file_contents="d_stderr_content"
                        view_file_max_height="50vh"
                        :progress="d_stderr_load_progress"
                        ref="stderr"></view-file>
          </div>
        </div>
      </div>
    </fieldset>

  </div>
</template>

<script lang="ts">

import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCommand,
  AGTestCommandResultFeedback,
  ExpectedReturnCode,
  FeedbackCategory,
  ResultOutput,
  Submission,
  ValueFeedbackLevel
} from "ag-client-typescript";

import { GlobalData } from '@/app.vue';
import Diff from '@/components/diff.vue';
import DescriptionRenderer from "@/components/project_view/submission_detail/description_renderer.vue"
import ViewFile from "@/components/view_file/view_file.vue";
import { handle_global_errors_async } from '@/error_handling';
import { Created } from '@/lifecycle';


@Component({
  components: {
    DescriptionRenderer,
    Diff,
    ViewFile
  }
})
export default class AGTestCommandResultDetail extends Vue implements Created{
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_command_result!: AGTestCommandResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  d_staff_description: string | null = null;

  d_output_size: ResultOutput.AGTestCommandResultOutputSize | null = null;

  d_stdout_content: Promise<string> | null = null;
  d_stderr_content: Promise<string> | null = null;
  d_stdout_load_progress: number | null = null;
  d_stderr_load_progress: number | null = null;

  d_stdout_diff: Promise<string[]> | null = null;
  d_stderr_diff: Promise<string[]> | null = null;
  d_stdout_diff_load_progress: number | null = null;
  d_stderr_diff_load_progress: number | null = null;

  @Watch('fdbk_category')
  on_fdbk_category_change(new_value: FeedbackCategory, old_value: FeedbackCategory) {
    return this.get_output();
  }

  readonly ExpectedReturnCode = ExpectedReturnCode;
  readonly ValueFeedbackLevel = ValueFeedbackLevel;

  async created() {
    if (this.d_globals.user_roles.is_staff) {
      let ag_test_command = await AGTestCommand.get_by_pk(this.ag_test_command_result.ag_test_command_pk);
      this.d_staff_description = ag_test_command.staff_description;
    }
    return this.get_output();
  }

  get show_correctness_fieldset() {
    return this.ag_test_command_result.return_code_correct !== null
           || (this.ag_test_command_result.timed_out !== null
               && this.ag_test_command_result.timed_out!)
           || this.ag_test_command_result.actual_return_code !== null
           || this.ag_test_command_result.stdout_correct !== null
           || this.ag_test_command_result.stderr_correct !== null;
  }

  @handle_global_errors_async
  async get_output() {
    this.d_stdout_content = null;
    this.d_stderr_content = null;
    this.d_stdout_diff = null;
    this.d_stderr_diff = null;

    this.d_output_size = await ResultOutput.get_ag_test_cmd_result_output_size(
      this.submission.pk,
      this.ag_test_command_result.pk,
      this.fdbk_category
    );
    this.load_stdout_diff();
    this.load_stderr_diff();
    this.load_stdout_content();
    this.load_stderr_content();
  }

  load_stdout_content() {
    if (this.d_output_size!.stdout_size === null || this.d_output_size!.stdout_size === 0) {
      return;
    }

    this.d_stdout_load_progress = null;
    this.d_stdout_content = ResultOutput.get_ag_test_cmd_result_stdout(
      this.submission.pk,
      this.ag_test_command_result.pk,
      this.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_stdout_load_progress = 100 * (1.0 * event.loaded / event.total);
        }
      }
    );
  }

  load_stderr_content() {
    if (this.d_output_size!.stderr_size === null || this.d_output_size!.stderr_size === 0) {
      return;
    }

    this.d_stderr_load_progress = null;
    this.d_stderr_content = ResultOutput.get_ag_test_cmd_result_stderr(
      this.submission.pk,
      this.ag_test_command_result.pk,
      this.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_stderr_load_progress = 100 * (1.0 * event.loaded / event.total);
        }
      }
    );
  }

  load_stdout_diff() {
    if (this.d_output_size!.stdout_diff_size === null
        || this.d_output_size!.stdout_diff_size === 0) {
      return;
    }

    this.d_stdout_diff_load_progress = null;
    this.d_stdout_diff = ResultOutput.get_ag_test_cmd_result_stdout_diff(
      this.submission.pk,
      this.ag_test_command_result.pk,
      this.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_stdout_diff_load_progress = 100 * (1.0 * event.loaded / event.total);
        }
      }
    );
  }

  load_stderr_diff() {
    if (this.d_output_size!.stderr_diff_size === null
        || this.d_output_size!.stderr_diff_size === 0) {
      return;
    }

    this.d_stderr_diff_load_progress = null;
    this.d_stderr_diff = ResultOutput.get_ag_test_cmd_result_stderr_diff(
      this.submission.pk,
      this.ag_test_command_result.pk,
      this.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_stderr_diff_load_progress = 100 * (1.0 * event.loaded / event.total);
        }
      }
    );
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

.diff-container {
    background-color: white;
    border: 2px solid $pebble-medium;
    border-radius: 3px;
    margin-bottom: 5px;
}

</style>
