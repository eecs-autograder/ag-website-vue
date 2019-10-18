<template>
  <div id="submission-detail">
    <div id="view-submission">
      <div id="submission-detail-overview">

        <div id="submitted-by"> Submitted by:
          <span id="submitter">{{submission.submitter}}</span>
          on <span id="submission-timestamp">{{format_datetime(submission.timestamp)}}</span>
        </div>

        <div v-if="show_score"
             id="submission-score"> Score:
          <b>{{submission_result.total_points}}/{{submission_result.total_points_possible}}</b>
        </div>
        <div v-if="d_globals.user_roles.is_staff
                   && (submission.status === GradingStatus.waiting_for_deferred
                   || submission.status === GradingStatus.waiting_for_deferred)"
             id="staff-score-message">
          <div v-if="submission.status === GradingStatus.waiting_for_deferred">
            Deferred tests pending
          </div>
          <div v-else-if="submission.status === GradingStatus.finished_grading">
            Deferred tests finished
          </div>
        </div>

        <div v-if="show_auto_update_msg"
             id="auto-update-message">
          This page will update automatically.
        </div>

        <div v-if="submission.status !== GradingStatus.waiting_for_deferred
                   && submission.status !== GradingStatus.finished_grading"
             id="grading-status-section">
          <div id="grading-status-label">
            Grading status:
            <span>
              <i v-if="submission.status === GradingStatus.queued"
                 class="queued-symbol">Q</i>
              <i v-else-if="submission.status === GradingStatus.being_graded"
                 class="fas fa-list being-graded-symbol"></i>
              <i v-else-if="submission.status === GradingStatus.removed_from_queue"
                 class="fas fa-eject removed-symbol"></i>
              <i v-else-if="submission.status === GradingStatus.error"
                 class="fas fa-skull error-symbol"></i>
            </span>
          </div>

          <div id="grading-status">
            <div v-if="submission.status === GradingStatus.received">
              We got your submission! It should be queued soon.
            </div>
            <div v-else-if="submission.status === GradingStatus.queued">
              Your submission is at position {{submission.position_in_queue}} in the queue.
            </div>
            <div v-else-if="submission.status === GradingStatus.being_graded">
              Your submission is being graded!
            </div>
            <div v-else-if="submission.status === GradingStatus.removed_from_queue">
              You removed this submission from the queue. That means it won't be graded,
              and it won't count towards your daily submission limit.
            </div>
            <div v-else-if="submission.status === GradingStatus.error"
                 id="grading-status-error-message">
              An unexpected error occurred while grading your submission.
              This submission will not count towards your daily limit.
              Please wait a few minutes and try your submission again.
              If the problem persists, please contact <b>help@autograder.io</b> and include
              the information <b>"Submission ID: {{submission.pk}}"</b> in your email.
            </div>
          </div>
        </div>

        <div v-if="submission.is_bonus_submission"
             id="is-bonus-submission-message"
             class="additional-submission-info">
          <i class="fas fa-star bonus-icon"></i>
          This submission used one of your bonus submissions.
        </div>
        <div v-if="is_group_member && does_not_count_for_current_user"
             id="does-not-count-for-user-message"
             class="additional-submission-info">
          <i class="fas fa-exclamation-circle submission-does-not-count-icon"></i>
          Since you ran out of late days, this submission will
          <span class="does-not-count">NOT</span> count towards your final grade.
        </div>

        <div v-if="!is_group_member && submission.does_not_count_for.length"
             class="additional-submission-info">
          <div id="does-not-count-for-label">
            This submission does <span class="does-not-count">NOT</span> count
            for the following users:
          </div>
          <div id="list-of-group-members-submission-does-not-count-for">
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
          <div v-for="submitted_filename of submission.submitted_filenames"
               class="submitted-file">
            <a class="open-file" @click="open_file(submitted_filename)">{{submitted_filename}}</a>
            <i class="cursor-pointer fa fa-download download-file-icon"
               @click="download_file(submitted_filename)">
            </i>
          </div>
        </div>

        <button v-if="is_group_member && (submission.status === GradingStatus.received
                      || submission.status === GradingStatus.queued)"
                id="remove-submission-from-queue-button"
                @click="d_show_remove_submission_from_queue_modal = true">
          Remove from queue
        </button>

        <div id="multi-file-viewer-container">
          <multi-file-viewer ref="view_submission_result_files"
                             height_of_view_file="50vh">
          </multi-file-viewer>
        </div>

        <div v-if="d_globals.user_roles.is_staff
                   && submission.status !== GradingStatus.removed_from_queue"
             id="adjust-feedback-section">
          <span id="adjust-feedback-label"> Adjust Feedback </span>
          <select id="adjust-feedback-select"
                  class="select"
                  v-model="d_fdbk_category"
                  :disabled="d_loading_results"
                  @change="load_results()">
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
      </div>

      <mutation-suite-results
        ref="mutation_suite_results"
        v-if="submission_result.student_test_suite_results.length"
        :submission="submission"
        :mutation_test_suite_results="submission_result.student_test_suite_results"
        :fdbk_category="d_fdbk_category">
      </mutation-suite-results>

      <div v-for="(ag_test_suite_result, index) of submission_result.ag_test_suite_results"
           ref="ag_test_suite_results">
        <AGTestSuiteResult :submission="submission"
                           :key="ag_test_suite_result.pk"
                           :ag_test_suite_result="ag_test_suite_result"
                           :fdbk_category="d_fdbk_category"
                           :is_first_suite="index === 0">
        </AGTestSuiteResult>
      </div>

    </div>

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
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import AGTestSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import MutationSuiteResults from "@/components/project_view/submission_detail/mutation_suite_results.vue";
import ResultPanel from '@/components/project_view/submission_detail/result_panel.vue';
import { format_datetime, handle_api_errors_async } from '@/utils';

@Component({
  components: {
    APIErrors,
    AGTestSuiteResult,
    Modal,
    MultiFileViewer,
    MutationSuiteResults,
    SubmissionDetailPanel: ResultPanel
  }
})
export default class SubmissionDetail extends Vue {

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
    this.d_fdbk_category = this.determine_feedback_type();
  }

  d_submission_fdbk_override: null | SubmissionResultFeedback = null;
  d_show_remove_submission_from_queue_modal = false;
  d_loading_results = false;
  d_removing_from_queue = false;
  d_fdbk_category: FeedbackCategory | null = null;

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly FeedbackCategory = FeedbackCategory;
  readonly GradingStatus = GradingStatus;
  readonly format_datetime = format_datetime;

  created() {
    this.d_submission_fdbk_override = this.submission_with_results.results;
    this.d_fdbk_category = this.determine_feedback_type();
  }

  get submission() {
    return new Submission(this.submission_with_results);
  }

  get submission_result() {
    return this.d_submission_fdbk_override === null
        ? this.submission_with_results.results : this.d_submission_fdbk_override;
  }

  get show_score() {
    return (this.submission.status === GradingStatus.waiting_for_deferred
           || this.submission.status === GradingStatus.finished_grading)
           && this.submission_result !== null
           && this.submission_result.total_points_possible !== 0;
  }

  determine_feedback_type(): FeedbackCategory {
    if (this.d_globals.user_roles!.is_staff) {
      if (this.is_group_member || (this.is_ultimate_submission
          && this.d_globals.user_roles!.is_admin)) {
          return FeedbackCategory.max;
      }
      return FeedbackCategory.staff_viewer;
    }
    if (this.is_ultimate_submission) {
      return FeedbackCategory.ultimate_submission;
    }
    if (this.submission!.is_past_daily_limit) {
      return FeedbackCategory.past_limit_submission;
    }
    return FeedbackCategory.normal;
  }

  get show_auto_update_msg() {
    return (this.submission!.status === GradingStatus.received
            || this.submission!.status === GradingStatus.queued
            || this.submission!.status === GradingStatus.being_graded)
            || (this.d_globals.user_roles.is_staff
                && this.submission.status === GradingStatus.waiting_for_deferred);
  }

  async load_results() {
    this.d_loading_results = true;
    this.d_submission_fdbk_override = await get_submission_result(
      this.submission!.pk, this.d_fdbk_category!
    );
    this.d_loading_results = false;
  }

  get does_not_count_for_current_user() {
    return this.submission!.does_not_count_for.findIndex(
        username => username === this.d_globals.current_user!.username
    ) !== -1;
  }

  get is_group_member() {
    return this.group.member_names.findIndex(
        member_name => member_name === this.d_globals.current_user!.username
    ) !== -1;
  }

  async open_file(filename: string) {
    let multi_file_viewer = <MultiFileViewer> this.$refs.view_submission_result_files;
    multi_file_viewer.add_to_viewing(filename, this.submission!.get_file_content(filename));
  }

  async download_file(filename: string) {
    FileSaver.saveAs(new File([await this.submission!.get_file_content(filename)], filename));
  }

  @handle_api_errors_async(handle_remove_submission_from_queue_error)
  async remove_submission_from_queue() {
    try {
      this.d_removing_from_queue = true;
      await this.submission!.remove_from_queue();
      this.d_show_remove_submission_from_queue_modal = false;
    }
    finally {
      this.d_removing_from_queue = false;
    }
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
  padding: 9px 30px 30px 30px;
}

#submission-detail-overview {
  padding: 6px 0 0 1px;
}

#submitted-by {
  font-size: 22px;
  padding: 0 0 5px 0;
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

#grading-status {
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
  font-size: 20px;
  padding: 5px 0 5px 0;
}

.submitted-files {
  padding: 5px 0;
}

.submitted-file {
  padding: 4px 0;
}

.open-file {
  color: $ocean-blue;
  cursor: pointer;
}

.download-file-icon {
  padding: 0 10px;
  color: $navy-blue;
  cursor: pointer;
}

#multi-file-viewer-container {
  margin-bottom: 2px;
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

#staff-score-message {
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

#list-of-group-members-submission-does-not-count-for {
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
  color: $coral-pink;
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
