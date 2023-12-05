<template>
  <div id="submission-detail">
    <div id="submitted-by"> Submitted by:
      <span id="submitter">{{submission.submitter}}</span>
      on <span id="submission-timestamp">{{format_datetime(submission.timestamp)}}</span>
    </div>

    <div v-if="show_score" id="submission-score">
      Score:
      <b>{{submission_result.total_points}}/{{submission_result.total_points_possible}}</b>
    </div>
    <div v-if="submission.status === GradingStatus.waiting_for_deferred"
         id="deferred-tests-message" class="info-spacing grading-status">
      Core tests finished. You can submit again now!
    </div>
    <div v-else-if="submission.status === GradingStatus.finished_grading"
         id="deferred-tests-message" class="info-spacing grading-status">
      All tests finished.
    </div>

    <div v-if="show_auto_update_msg" id="auto-update-message" class="info-spacing">
      This page will update automatically.
    </div>

    <div v-if="submission.status !== GradingStatus.waiting_for_deferred
                && submission.status !== GradingStatus.finished_grading"
          id="grading-status-section"
          class="grading-status info-spacing">
      <div v-if="submission.status === GradingStatus.received">
        We got your submission! It should be queued soon.
      </div>
      <div v-else-if="submission.status === GradingStatus.queued">
        <i class="queued-symbol">Q</i>
        Your submission is at position {{submission.position_in_queue}} in the queue.
      </div>
      <div v-else-if="submission.status === GradingStatus.being_graded">
        <i class="fas fa-list being-graded-symbol"></i>
        Your submission is being graded!
      </div>
      <div v-else-if="submission.status === GradingStatus.removed_from_queue">
        <i class="fas fa-eject removed-symbol"></i>
        You removed this submission from the queue. That means it won't be graded,
        and it won't count towards your daily submission limit.
      </div>
      <div v-else-if="submission.status === GradingStatus.rejected">
        <i class="fas fa-ban rejected-symbol"></i>
        Your submission has been rejected because it did not pass certain
        required checks (see first test suite results). It won't be graded,
        and it won't count towards your daily submission limit.
      </div>
      <div v-else-if="submission.status === GradingStatus.error">
        <i class="fas fa-skull error-symbol"></i>
        An unexpected error occurred while grading your submission.
        This submission will not count towards your daily limit.
        Please wait a few minutes and try your submission again.
        If the problem persists, please contact <b>{{SYSADMIN_CONTACT}}</b> and include
        the information <b>"Submission ID: {{submission.pk}}"</b> in your email.
      </div>
    </div>

    <div class="info-spacing">
      <button v-if="is_group_member
                    && (submission_with_results.status === GradingStatus.received
                        || submission_with_results.status === GradingStatus.queued)"
              id="remove-submission-from-queue-button"
              class="red-button"
              @click="d_show_remove_submission_from_queue_modal = true">
        Remove from Queue
      </button>
    </div>

    <div v-if="submission.is_bonus_submission"
          id="is-bonus-submission-message"
          class="info-spacing">
      <i class="fas fa-star bonus-icon"></i>
      This submission used one of your bonus submissions.
    </div>

    <div v-if="does_not_count_for_current_user"
         id="does-not-count-for-user-message"
         class="info-spacing">
      <i class="fas fa-exclamation-circle submission-does-not-count-icon"></i>
      Since you ran out of late day tokens, this submission will
      <b>NOT</b> count towards your final grade.
    </div>
    <div v-else-if="submission_with_results.does_not_count_for.length"
         class="info-spacing">
      <div id="does-not-count-for-label">
        This submission does <span class="does-not-count">NOT</span> count
        for the following users:
      </div>
      <div id="does-not-count-for-list">
        <div v-for="(username, index) of submission.does_not_count_for"
             class="does-not-count-for-list-item">
          <span class="list-icon">
            <i class="fas fa-exclamation-circle submission-does-not-count-icon"></i>
          </span>
          <span class="username">{{username}}</span>
        </div>
      </div>
    </div>

    <div class="submitted-files">
      <div v-for="filename of submission.submitted_filenames"
            class="submitted-file">
        <a class="open-file-link"
            :class="{'current-file': current_filename === filename}"
            @click="view_file(filename)">{{filename}}</a>
        <i class="cursor-pointer fa fa-file-download download-file-icon"
            @click="download_file(filename)">
        </i>
      </div>
    </div>

    <progress-overlay v-if="d_downloading_file" :progress="d_download_progress"></progress-overlay>

    <div id="view-file-region" v-if="current_filename !== null">
      <code-theme-toggle class="code-theme-toggle-container"></code-theme-toggle>
      <view-file id="view-file-container"
                  :filename="current_filename"
                  :file_contents="current_file_contents"
                  :progress="load_contents_progress"
                  view_file_max_height="50vh"
                  :is_code_file="true"></view-file>
    </div>

    <div class="discarded-files" v-if="submission.discarded_files.length !== 0">
      <i class="fas fa-exclamation-triangle"></i>
      The following unexpected files were <b>discarded</b>:
      <div v-for="filename of submission.discarded_files" class="discarded-file">
        <i class="far fa-trash-alt"></i>
        {{filename}}
      </div>
    </div>

    <div v-if="d_globals.user_roles.is_staff
                && submission_with_results.status !== GradingStatus.removed_from_queue"
          id="adjust-feedback-section" class="info-spacing">
      <span id="adjust-feedback-label"> Adjust Feedback </span>
      <select id="adjust-feedback-select"
              class="select"
              :disabled="d_loading_results"
              :value="feedback_category"
              @change="load_adjusted_fdbk($event.target.value)">
        <option v-if="d_globals.user_roles.is_admin || is_group_member"
                ref="normal_feedback_option"
                :value="FeedbackCategory.normal">
          Normal
        </option>
        <option v-if="d_globals.user_roles.is_admin || is_group_member"
                ref="past_limit_feedback_option"
                :value="FeedbackCategory.past_limit_submission">
          Past Limit
        </option>
        <option ref="ultimate_submission_feedback_option"
                :value="FeedbackCategory.ultimate_submission">
          Final Graded
        </option>
        <option ref="staff_viewer_feedback_option"
                :value="FeedbackCategory.staff_viewer">
          Student Lookup
        </option>
        <option v-if="d_globals.user_roles.is_admin || is_group_member"
                ref="max_feedback_option"
                :value="FeedbackCategory.max">
          Max
        </option>
      </select>
    </div>

    <!-- show old hints here -->

    <mutation-suite-results
      ref="mutation_suite_results"
      v-if="submission_result.mutation_test_suite_results.length"
      :submission="submission"
      :mutation_test_suite_results="submission_result.mutation_test_suite_results"
      :fdbk_category="feedback_category">
    </mutation-suite-results>

    <AGTestSuiteResultDetail
      v-for="(ag_test_suite_result, index) of submission_result.ag_test_suite_results"
      :key="ag_test_suite_result.pk"
      :submission="submission"
      :ag_test_suite_result="ag_test_suite_result"
      :fdbk_category="feedback_category"
      :is_first_suite="index === 0"
    ></AGTestSuiteResultDetail>

    <modal v-if="d_show_remove_submission_from_queue_modal"
           @close="d_show_remove_submission_from_queue_modal = false"
           ref="remove_submission_from_queue_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header">Confirm: Remove Submission from Queue</div>
      <div class="modal-body">
        <div>Are you sure you want to remove this submission from the grading queue?
          <ul>
            <li>This action cannot be undone</li>
            <li>Once removed, the submission will NOT be graded</li>
            <li>The next time you submit, that submission will be placed at the
                back of the grading queue
            </li>
          </ul>
        </div>
      </div>

      <APIErrors ref="api_errors"></APIErrors>

      <div class="modal-button-footer">
        <button id="confirm-remove-submission-from-queue-button"
                class="red-button"
                :disabled="d_removing_from_queue"
                @click="remove_submission_from_queue">
          Remove from Queue
        </button>
        <button id="cancel-remove-submission-from-queue-button"
                class="white-button"
                @click="d_show_remove_submission_from_queue_modal = false">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">

import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    Course,
    FeedbackCategory,
    GradingStatus,
    Group,
    Submission,
    SubmissionResultFeedback,
    SubmissionResults,
    SubmissionWithResults,
} from 'ag-client-typescript';
import * as FileSaver from 'file-saver';

import { GlobalData } from '@/app.vue';
import APIErrors from "@/components/api_errors.vue";
import Modal from '@/components/modal.vue';
import ProgressOverlay from '@/components/progress_overlay.vue';
import AGTestSuiteResultDetail from '@/components/project_view/submission_detail/ag_test_suite_result_detail.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import MutationSuiteResults from '@/components/project_view/submission_detail/mutation_suite_results.vue';
import ResultPanel from '@/components/project_view/submission_detail/result_panel.vue';
import CodeThemeToggle from '@/components/view_file/code_theme_toggle.vue';
import ViewFile from '@/components/view_file/view_file.vue';
import { SYSADMIN_CONTACT } from '@/constants';
import { handle_api_errors_async, handle_global_errors_async } from '@/error_handling';
import { OpenFilesMixin } from '@/open_files_mixin';
import { format_datetime, toggle } from '@/utils';

@Component({
  components: {
    APIErrors,
    AGTestSuiteResultDetail,
    CodeThemeToggle,
    Modal,
    MutationSuiteResults,
    ProgressOverlay,
    ResultPanel,
    ViewFile,
  }
})
export default class SubmissionDetail extends OpenFilesMixin {

  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Object})
  submission_with_results!: SubmissionWithResults;

  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Group})
  group!: Group;

  @Prop({required: true, type: Boolean})
  is_ultimate_submission!: boolean;

  @Watch('submission_with_results')
  on_selected_submission_change(new_value: SubmissionWithResults,
                                old_value: SubmissionWithResults) {
    this.d_submission_fdbk_override = null;
    this.d_fdbk_category_override = null;
    this.close_all_files();
  }

  d_submission_fdbk_override: null | SubmissionResultFeedback = null;
  d_fdbk_category_override: FeedbackCategory | null = null;
  d_show_remove_submission_from_queue_modal = false;
  d_loading_results = false;
  d_removing_from_queue = false;
  d_downloading_file = false;
  d_download_progress: number | null = null;

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly FeedbackCategory = FeedbackCategory;
  readonly GradingStatus = GradingStatus;
  readonly format_datetime = format_datetime;

  readonly SYSADMIN_CONTACT = SYSADMIN_CONTACT;

  get submission() {
    return new Submission(this.submission_with_results);
  }

  get submission_result() {
    return this.d_submission_fdbk_override === null
        ? this.submission_with_results.results : this.d_submission_fdbk_override;
  }

  private get show_score() {
    return (this.submission.status === GradingStatus.waiting_for_deferred
            || this.submission.status === GradingStatus.finished_grading)
           && this.submission_result !== null
           && Number(this.submission_result.total_points_possible) !== 0;
  }

  get feedback_category(): FeedbackCategory {
    if (this.d_fdbk_category_override !== null) {
      return this.d_fdbk_category_override;
    }

    if (this.d_globals.user_roles!.is_staff) {
      if (this.is_group_member
          || (this.is_ultimate_submission && this.d_globals.user_roles!.is_admin)) {
        return FeedbackCategory.max;
      }
      return FeedbackCategory.staff_viewer;
    }
    if (this.is_ultimate_submission) {
      return FeedbackCategory.ultimate_submission;
    }
    if (this.submission.is_past_daily_limit) {
      return FeedbackCategory.past_limit_submission;
    }
    return FeedbackCategory.normal;
  }

  private get show_auto_update_msg() {
    return (this.submission.status === GradingStatus.received
            || this.submission.status === GradingStatus.queued
            || this.submission.status === GradingStatus.being_graded)
            || (this.d_globals.user_roles.is_staff
                && this.submission.status === GradingStatus.waiting_for_deferred);
  }

  @handle_global_errors_async
  private load_adjusted_fdbk(fdbk_category: FeedbackCategory) {
    return toggle(this, 'd_loading_results', async () => {
      this.d_submission_fdbk_override = await SubmissionResults.get_submission_result(
        this.submission.pk, fdbk_category
      );
      this.d_fdbk_category_override = fdbk_category;
    });
  }

  private get does_not_count_for_current_user() {
    return this.submission.does_not_count_for.findIndex(
        username => username === this.d_globals.current_user!.username
    ) !== -1;
  }

  private get is_group_member() {
    return this.group.member_names.findIndex(
        member_name => member_name === this.d_globals.current_user!.username
    ) !== -1;
  }

  private view_file(filename: string) {
    this.open_file(
      filename,
      (progress_callback) => this.submission.get_file_content(filename, progress_callback)
    );
  }

  @handle_global_errors_async
  private download_file(filename: string) {
    this.d_download_progress = null;
    return toggle(this, 'd_downloading_file', async () => {
      let content = this.submission.get_file_content(filename, (event) => {
        if (event.lengthComputable) {
          this.d_download_progress = 100 * (1.0 * event.loaded / event.total);
        }
      });
      FileSaver.saveAs(new File([await content], filename));
    });
  }

  @handle_api_errors_async(handle_remove_submission_from_queue_error)
  private remove_submission_from_queue() {
    return toggle(this, 'd_removing_from_queue', async () => {
      await this.submission.remove_from_queue();
      this.d_show_remove_submission_from_queue_modal = false;
    });
  }
}

export function handle_remove_submission_from_queue_error(component: SubmissionDetail,
                                                          error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
}

#submission-detail {
  margin: .875rem;
}

#submitted-by {
  font-size: 1.125rem;
  margin-bottom: .375rem;
}

#submitter {
  color: $ocean-blue;
}

#submission-timestamp {
  color: $green;
}

#submission-score {
  font-size: 1.25rem;
  margin: .625rem 0;
}

.grading-status {
  color: darken($stormy-gray-dark, 15);

  .queued-symbol {
    font-weight: bold;
    color: darken($sky-blue, 10%);
  }

  .being-graded-symbol {
    color: $ocean-blue;
  }

  .finished-grading-symbol {
    color: green;
  }

  .removed-symbol {
    color: $orange;
  }

  .error-symbol, .rejected-symbol {
    color: crimson;
  }
}

.bonus-icon {
  color: darken($light-blue, 10);
  padding-right: .375rem;
}

.submission-does-not-count-icon {
  color: $coral-pink;
  padding-right: .375rem;
}

.does-not-count-for-list-item {
  margin: .25rem 0;
  padding-left: 1rem;
}

.submitted-files {
  margin: 1rem 0 .375rem;

  .submitted-file {
    margin: .25rem 0;
    color: $ocean-blue;
  }

  .open-file-link {
    cursor: pointer;
  }

  .current-file {
    color: black;
    cursor: default;
  }

  .download-file-icon {
    padding-left: .625rem;
    cursor: pointer;
  }
}

#view-file-region {
  position: relative;

  .code-theme-toggle-container {
    position: absolute;
    top: 0;
    right: 1px;
    margin-top: -1.875rem;
  }

  #view-file-container {
    margin-bottom: .625rem;
    border: 1px solid $pebble-medium;
  }
}

.discarded-files {
  margin: .625rem 0;
  font-size: 1rem;

  .discarded-file {
    margin: .25rem 0;
    padding-left: 1rem;
  }

  .fa-exclamation-triangle {
    color: darken($light-yellow, 25%);
  }

  .fa-trash-alt {
    color: $cherry;
  }
}

#adjust-feedback-label {
  padding-right: .125rem;
}

#adjust-feedback-select:disabled:hover {
  cursor: wait;
}

.info-spacing {
  margin: .625rem 0;
}

</style>
