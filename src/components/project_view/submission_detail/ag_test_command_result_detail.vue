<template>
  <div>
    <description-renderer
      v-if="d_globals.user_roles.is_staff
            && d_staff_description !== null && d_staff_description !== ''"
      :text="d_staff_description"
      ref="staff_description"
    ></description-renderer>

    <description-renderer
      v-if="ag_test_command_result.student_description !== null
            && ag_test_command_result.student_description !== ''"
      :text="ag_test_command_result.student_description"
      ref="student_description"
    ></description-renderer>

    <description-renderer
      v-if="ag_test_command_result.student_on_fail_description !== null
            && ag_test_command_result.student_on_fail_description !== ''"
      :text="ag_test_command_result.student_on_fail_description"
      ref="student_on_fail_description"
    ></description-renderer>

    <div
      ref="warnings"
      v-if="custom_scoring_error_msg"
      class="fieldset"
    >
      <div class="legend"> Warnings </div>
      <info-blurb>
        Something unexpected happened while grading this test.
        <br>
        It might be a minor configuration issue, or the instructor script might have done something unexpected.
        Please notify your instructor so that they can diagnose and resolve this.
      </info-blurb>
      <div class="warning">
        {{custom_scoring_error_msg}}
      </div>
    </div>

    <div ref="correctness" v-if="show_correctness_fieldset" class="fieldset">
      <div class="legend"> Correctness </div>

      <div
        class="feedback-section"
        ref="return_code_correctness"
        v-if="ag_test_command_result.return_code_correct !== null
              || ag_test_command_result.timed_out"
      >
        <div class="feedback-row">
          <div class="feedback-label">Exit status:</div>
          <div class="feedback">
            <div class="short-output">
              <span
                v-if="ag_test_command_result.timed_out !== null
                      && this.ag_test_command_result.timed_out"
              >
                <i class="far fa-clock timed-out-icon"></i>
                <span class="timed-out-msg"> (Timed out) </span>
              </span>
              <span
                v-else-if="ag_test_command_result.return_code_correct !== null"
              >
                <i v-if="ag_test_command_result.return_code_correct"
                    class="fas fa-check correct-icon"></i>
                <i v-else class="fas fa-times incorrect-icon"></i>
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="ag_test_command_result.return_code_points_possible > 0"
          class="feedback-row"
        >
          <div class="feedback-label hanging-indent"> Points: </div>
          <div class="feedback">
            <div class="short-output">
              {{ag_test_command_result.return_code_points}}/{{ag_test_command_result.return_code_points_possible}}
            </div>
          </div>
        </div>

        <div
          v-if="ag_test_command_result.return_code_correct === false
                && ag_test_command_result.expected_return_code !== null"
          class="feedback-row"
        >
          <div class="feedback-label hanging-indent"> Info: </div>
          <div class="feedback">
            <div v-if="!ag_test_command_result.timed_out" class="short-output">
              Expected {{ag_test_command_result.expected_return_code}} status,
              but was {{ag_test_command_result.actual_return_code}}
            </div>

            <div v-else class="short-output">
                Expected {{ag_test_command_result.expected_return_code}} status,
                but command timed out
            </div>
          </div>
        </div>
      </div>

      <div
        class="feedback-section"
        ref="stdout_correctness"
        v-if="ag_test_command_result.stdout_correct !== null"
      >
        <div
          class="feedback-row"
        >
          <div class="feedback-label"> Output: </div>
          <div class="feedback">
            <div class="short-output">
              <span v-if="ag_test_command_result.stdout_correct">
                <i class="fas fa-check correct-icon"></i>
              </span>
              <span v-else>
                <i class="fas fa-times incorrect-icon"></i>
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="ag_test_command_result.stdout_points_possible > 0"
          class="feedback-row"
        >
          <div class="feedback-label hanging-indent"> Points: </div>
          <div class="feedback">
            <div class="short-output">
              {{ag_test_command_result.stdout_points}}/{{ag_test_command_result.stdout_points_possible}}
            </div>
          </div>
        </div>
      </div>


      <div
        class="feedback-section"
        ref="stderr_correctness"
        v-if="ag_test_command_result.stderr_correct !== null"
      >
        <div
          class="feedback-row"
        >
          <div class="feedback-label"> Error output: </div>
          <div class="feedback">
            <div class="short-output">
              <span v-if="ag_test_command_result.stderr_correct">
                <i class="fas fa-check correct-icon"></i>
              </span>
              <span v-else>
                <i class="fas fa-times incorrect-icon"></i>
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="ag_test_command_result.stderr_points_possible > 0"
          class="feedback-row"
        >
          <div class="feedback-label hanging-indent"> Points: </div>
          <div class="feedback">
            <div class="short-output">
              {{ag_test_command_result.stderr_points}}/{{ag_test_command_result.stderr_points_possible}}
            </div>
          </div>
        </div>
      </div>

      <div
        class="feedback-section"
        v-if="ag_test_command_result.custom_scoring_used"
        ref="custom_scoring_correctness"
      >
        <div
          class="feedback-row"
        >
          <div class="feedback-label"> {{ custom_scoring_label }}: </div>
          <div class="feedback">
            <div class="short-output">
              <span v-if="only_custom_scoring_points_available">
                {{ag_test_command_result.custom_scoring_points}}/{{ag_test_command_result.custom_scoring_points_possible}}
              </span>
              <span v-else>
                {{
                  ag_test_command_result.custom_scoring_points < 0
                    ? ag_test_command_result.custom_scoring_points
                    : `+${ag_test_command_result.custom_scoring_points}`
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="d_output_size !== null
                    && (d_output_size.stdout_diff_size !== null
                        || d_output_size.stderr_diff_size !== null)"
              class="fieldset"
              ref="diffs">
      <div class="legend"> Output Diffs </div>

      <div class="feedback-section">
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
      </div>

      <div class="feedback-section">
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
      </div>
    </div>

    <div v-if="ag_test_command_result.actual_return_code !== null
                    || (d_output_size !== null
                        && (d_output_size.stdout_size !== null
                        || d_output_size.stderr_size !== null))"
              class="fieldset"
              ref="actual_output">
      <div class="legend"> Actual Output </div>

      <div
        class="feedback-section"
        v-if="d_output_size && d_output_size.stdout_size !== null"
        ref="actual_stdout_section"
      >
        <div class="feedback-row">
          <div class="feedback-label"> Output: </div>
          <div class="feedback">
            <div v-if="d_output_size && d_output_size.stdout_size === 0" class="short-output">No output</div>
            <div v-else-if="d_stdout_content !== null" class="lengthy-output">
              <view-file :file_contents="d_stdout_content"
                          view_file_max_height="50vh"
                          :progress="d_stdout_load_progress"
                          ref="stdout"></view-file>
            </div>
          </div>
        </div>
      </div>

      <div
        class="feedback-section"
        v-if="d_output_size && d_output_size.stderr_size !== null"
        ref="actual_stderr_section"
      >
        <div class="feedback-row">
          <div class="feedback-label"> Error output: </div>
          <div class="feedback">
            <div v-if="d_output_size && d_output_size.stderr_size === 0" class="short-output">No output</div>
            <div v-else-if="d_stderr_content !== null" class="lengthy-output">
              <view-file :file_contents="d_stderr_content"
                          view_file_max_height="50vh"
                          :progress="d_stderr_load_progress"
                          ref="stderr"></view-file>
            </div>
          </div>
        </div>
      </div>

      <div
        class="feedback-section"
        v-if="ag_test_command_result.actual_return_code !== null"
        ref="actual_return_code_section"
      >
        <div class="feedback-row">
          <div class="feedback-label"> Exit status: </div>
          <div class="feedback">
            <div
              :class="[
                'short-output',
                {'actual-return-code-incorrect': ag_test_command_result.return_code_correct === false},
                {'actual-return-code-correct': ag_test_command_result.return_code_correct === true}
              ]"
            >
              {{ag_test_command_result.actual_return_code}}
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">

import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCommand,
  AGTestCommandResultFeedback,
  CustomScoringError,
  ExpectedReturnCode,
  FeedbackCategory,
  ResultOutput,
  Submission,
  ValueFeedbackLevel
} from "ag-client-typescript";

import { GlobalData } from '@/app.vue';
import Diff from '@/components/diff.vue';
import DescriptionRenderer from "@/components/project_view/submission_detail/description_renderer.vue"
import InfoBlurb from '@/components/InfoBlurb.vue';
import ViewFile from "@/components/view_file/view_file.vue";
import { handle_global_errors_async } from '@/error_handling';
import { Created } from '@/lifecycle';


@Component({
  components: {
    DescriptionRenderer,
    Diff,
    InfoBlurb,
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
  readonly CustomScoringError = CustomScoringError;

  async created() {
    if (this.d_globals.user_roles.is_staff) {
      let ag_test_command = await AGTestCommand.get_by_pk(
        this.ag_test_command_result.ag_test_command_pk);
      this.d_staff_description = ag_test_command.staff_description;
    }
    return this.get_output();
  }

  get only_custom_scoring_points_available() {
    if (!this.ag_test_command_result.custom_scoring_used) {
      return false;
    }

    return (this.ag_test_command_result.return_code_points_possible === 0
      && this.ag_test_command_result.stdout_points_possible === 0
      && this.ag_test_command_result.stderr_points_possible === 0
    )
  }

  get custom_scoring_label() {
    if (this.ag_test_command_result.custom_scoring_label !== null) {
      return this.ag_test_command_result.custom_scoring_label;
    }
    else if (this.only_custom_scoring_points_available) {
      return 'Points';
    }
    else {
      return 'Instructor score adjustment'
    }
  }

  get custom_scoring_error_msg() {
    switch (this.ag_test_command_result.custom_scoring_error) {
      case CustomScoringError.none:
        return null;
      case CustomScoringError.exceeded_max_points:
        return ('The custom score that was parsed from the output exceeded the max custom scoring'
                + ' points possible. The max custom scoring points possible were awarded instead of'
                + ' the parsed value');
      case CustomScoringError.failed_to_find_pattern:
        return 'Failed to find a custom score matching the configured pattern in output';
      case CustomScoringError.non_integer:
        return 'The parsed custom score value was a non-integer. Only integer values are supported';
      default: {
        const _exhaustiveCheck: never = this.ag_test_command_result.custom_scoring_error;
        return _exhaustiveCheck;
      }
    }
  }

  get show_correctness_fieldset() {
    return this.ag_test_command_result.return_code_correct !== null
           || (this.ag_test_command_result.timed_out !== null
               && this.ag_test_command_result.timed_out!)
           || this.ag_test_command_result.actual_return_code !== null
           || this.ag_test_command_result.stdout_correct !== null
           || this.ag_test_command_result.stderr_correct !== null
           || this.ag_test_command_result.custom_scoring_used;
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

.warning {
  word-wrap: break-word;
  padding: .625rem .875rem;
  margin-bottom: -1px;    /* Prevent double borders */
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

</style>
