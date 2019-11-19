<template>
  <div id="submission-detail">
    <div id="submitted-by"> Submitted by:
      <span id="submitter">{{submission.submitter}}</span>
      on <span id="submission-timestamp">{{format_datetime(submission.timestamp)}}</span>
    </div>

    <div v-if="show_score"
          id="submission-score"> Score:
      <b>{{submission_result.total_points}}/{{submission_result.total_points_possible}}</b>
    </div>
    <div v-else-if="submission.status === GradingStatus.waiting_for_deferred"
          id="deferred-tests-message" class="grading-status">
      Score hidden. Core tests finished. You can submit again now!
    </div>
    <div v-else-if="submission.status === GradingStatus.finished_grading"
          id="deferred-tests-message" class="grading-status">
      Score hidden. All tests finished.
    </div>

    <div v-if="show_auto_update_msg"
          id="auto-update-message">
      This page will update automatically.
    </div>

    <div v-if="submission.status !== GradingStatus.waiting_for_deferred
                && submission.status !== GradingStatus.finished_grading"
          id="grading-status-section"
          class="grading-status">
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
      <div v-else-if="submission.status === GradingStatus.error">
        <i class="fas fa-skull error-symbol"></i>
        An unexpected error occurred while grading your submission.
        This submission will not count towards your daily limit.
        Please wait a few minutes and try your submission again.
        If the problem persists, please contact <b>help@autograder.io</b> and include
        the information <b>"Submission ID: {{submission.pk}}"</b> in your email.
      </div>
    </div>

    <div v-if="submission.is_bonus_submission"
          id="is-bonus-submission-message"
          class="additional-submission-info">
      <i class="fas fa-star bonus-icon"></i>
      This submission used one of your bonus submissions.
    </div>

    <div v-if="does_not_count_for_current_user"
         id="does-not-count-for-user-message"
         class="additional-submission-info">
      <i class="fas fa-exclamation-circle submission-does-not-count-icon"></i>
      Since you ran out of late days, this submission will
      <span class="does-not-count">NOT</span> count towards your final grade.
    </div>
    <div v-else-if="submission_with_results.does_not_count_for.length"
         class="additional-submission-info">
      <div id="does-not-count-for-label">
        This submission does <span class="does-not-count">NOT</span> count
        for the following users:
      </div>
      <div id="does-not-count-for-list">
        <div v-for="(username, index) of submission.does_not_count_for"
              :class="['single-user-submission-does-not-count-for',
                      {'last-username-in-list':
                        index === submission.does_not_count_for.length - 1}]">
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

    <button v-if="is_group_member
                  && (submission_with_results.status === GradingStatus.received
                      || submission_with_results.status === GradingStatus.queued)"
            id="remove-submission-from-queue-button"
            @click="d_show_remove_submission_from_queue_modal = true">
      Remove from queue
    </button>

    <div id="view-file-container" v-if="current_filename !== null">
      <view-file :filename="current_filename"
                  :file_contents="current_file_contents"
                  :progress="load_contents_progress"
                  view_file_max_height="50vh"></view-file>
    </div>

    <div v-if="d_globals.user_roles.is_staff
                && submission_with_results.status !== GradingStatus.removed_from_queue"
          id="adjust-feedback-section">
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

    <mutation-suite-results
      ref="mutation_suite_results"
      v-if="submission_result.student_test_suite_results.length"
      :submission="submission"
      :mutation_test_suite_results="submission_result.student_test_suite_results"
      :fdbk_category="feedback_category">
    </mutation-suite-results>

    <AGSuiteResult
      v-for="(ag_test_suite_result, index) of submission_result.ag_test_suite_results"
      :key="ag_test_suite_result.pk"
      :submission="submission"
      :ag_test_suite_result="ag_test_suite_result"
      :fdbk_category="feedback_category"
      :is_first_suite="index === 0"
    ></AGSuiteResult>

    <modal v-if="d_show_remove_submission_from_queue_modal"
           @close="d_show_remove_submission_from_queue_modal = false"
           ref="remove_submission_from_queue_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header">Confirm: Remove Submission from Queue</div>
      <div class="modal-divider"></div>
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

      <div class="modal-button-container">
        <button id="cancel-remove-submission-from-queue-button"
                class="modal-cancel-button white-button"
                @click="d_show_remove_submission_from_queue_modal = false">
          Cancel
        </button>
        <button id="confirm-remove-submission-from-queue-button"
                class="red-button"
                :disabled="d_removing_from_queue"
                @click="remove_submission_from_queue">
          Remove
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
    get_submission_result,
    GradingStatus,
    Group,
    Submission,
    SubmissionResultFeedback,
    SubmissionWithResults
} from 'ag-client-typescript';
import * as FileSaver from 'file-saver';

import { GlobalData } from '@/app.vue';
import APIErrors from "@/components/api_errors.vue";
import Modal from '@/components/modal.vue';
import ProgressOverlay from '@/components/progress_overlay.vue';
import AGSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import MutationSuiteResults from '@/components/project_view/submission_detail/mutation_suite_results.vue';
import ResultPanel from '@/components/project_view/submission_detail/result_panel.vue';
import ViewFile from '@/components/view_file.vue';
import { OpenFilesMixin } from '@/open_files_mixin';
import { format_datetime, handle_api_errors_async, toggle } from '@/utils';

@Component({
  components: {
    APIErrors,
    AGSuiteResult,
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
           && this.submission_result.total_points_possible !== 0;
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

  private load_adjusted_fdbk(fdbk_category: FeedbackCategory) {
    return toggle(this, 'd_loading_results', async () => {
      this.d_submission_fdbk_override = await get_submission_result(
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

  private download_file(filename: string) {
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
@import '@/styles/components/submission_detail.scss';

* {
  box-sizing: border-box;
}

#submission-detail {
  padding: 0 15px 30px 15px;
}

#submission-detail-overview {
  padding: 0 0 0 1px;
}

#submitted-by {
  font-size: 19px;
  padding: 10px 0 5px 0;
}

#submitter {
  color: $ocean-blue;
}

#submission-timestamp {
  color: $green;
}

#auto-update-message {
  padding: 5px 0;
}

#grading-status-section {
  padding: 5px 0 5px 0;
}

#grading-status-label {
  font-size: 18px;
  padding: 0 0 5px 0;
}

#grading-status-label span {
  padding-left: 3px;
}

.grading-status {
  color: darken($stormy-gray-dark, 15);
}

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

.error-symbol {
  color: crimson;
}

#submission-score {
  font-size: 19px;
  padding: 5px 0 5px 0;
}

.submitted-files {
  padding: 5px 0;
}

.submitted-file {
  padding: 4px 0;
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
  padding: 0 10px;
  cursor: pointer;
}

#view-file-container {
  margin-bottom: 2px;
  border: 1px solid $pebble-medium;
}

#adjust-feedback-section {
  padding: 5px 0 5px 0;
}

#adjust-feedback-label {
  padding: 0 2px 0 0;
}

#adjust-feedback-select:disabled:hover {
  cursor: wait;
}

#remove-submission-from-queue-button {
  @extend .red-button;
  margin: 5px 0 10px 0;
}

.modal-cancel-button {
  margin-right: 10px;
}

.modal-header {
  font-size: 20px;
  padding: 10px 0 5px 0;
}

.modal-divider {
  background-color: darken($white-gray, 3);
  height: 2px;
  margin: 9px 0;
}

.modal-message {
  line-height: 22px;
  padding: 5px 0;
}

.modal-button-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 10px 0 0 0;
}

.bonus-icon {
  color: darken($light-blue, 10);
  padding-right: 5px;
  width: 23px;
}

.submission-does-not-count-icon {
  color: $coral-pink;
  padding-right: 5px;
  width: 23px;
}

.additional-submission-info {
  padding: 5px 0;
}

#deferred-tests-message {
  padding: 5px 0;
}

.list-icon {
  padding-right: 5px;
}

.single-user-submission-does-not-count-for {
  padding: 0 0 8px 20px;
  display: flex;
  flex-direction: row;
}

#does-not-count-for-label {
  padding: 0 0 5px 0;
}

#does-not-count-for-list {
  padding: 4px 0 0 0;
  display: inline-block;
  vertical-align: top;
}

#list-submission-does-not-count-for {
  margin: 0;

  li {
    padding: 5px 0;
  }
}

.does-not-count {
  font-weight: bold;
}

.last-username-in-list {
  padding-bottom: 0;
}

.modal-body {
  li {
    padding-bottom: 5px;
  }
}

</style>
