<template>
  <div id="submission-detail">
    <div v-if="d_loading"
         id="submission-detail-loading-spinner">
      <i class="fa fa-spinner fa-pulse fa-fw"></i>
    </div>
    <div v-else
         id="view-submission">
      <div id="submission-detail-overview">

        <div id="submitted-by"> Submitted by:
          <span id="submitter">{{d_submission.submitter}}</span>
          on <span id="submission-timestamp">{{format_datetime(d_submission.timestamp)}}</span>
        </div>

        <div v-if="being_processed"
             id="being-processed-message">
          This page will update automatically.
        </div>

        <div id="grading-status-section">
          <div id="grading-status-label">
            Grading status:
            <span>
              <i v-if="d_submission.status === GradingStatus.queued"
                 class="queued-symbol">Q</i>
              <i v-else-if="d_submission.status === GradingStatus.being_graded"
                 class="fas fa-list being-graded-symbol"></i>
              <i v-else-if="d_submission.status === GradingStatus.waiting_for_deferred
                            || d_submission.status === GradingStatus.finished_grading"
                 class="far fa-check-circle finished-grading-symbol"></i>
              <i v-else-if="d_submission.status === GradingStatus.removed_from_queue"
                 class="fas fa-eject removed-symbol"></i>
              <i v-else-if="d_submission.status === GradingStatus.error"
                 class="fas fa-skull error-symbol"></i>
            </span>
          </div>

          <div id="grading-status">
            <div v-if="d_submission.status === GradingStatus.received">
              We got your submission! It should be queued soon.
            </div>
            <div v-else-if="d_submission.status === GradingStatus.queued">
              Your submission is at position {{d_submission.position_in_queue}} in the queue.
            </div>
            <div v-else-if="d_submission.status === GradingStatus.being_graded">
              Your submission is being graded!
            </div>
            <div v-else-if="d_submission.status === GradingStatus.waiting_for_deferred">
              All the public test cases are finished grading. You can submit again now!
            </div>
            <div v-else-if="d_submission.status === GradingStatus.finished_grading">
              Everything is finished grading!
            </div>
            <div v-else-if="d_submission.status === GradingStatus.removed_from_queue">
              You removed this submission from the queue. That means it won't be graded,
              and it won't count towards your daily submission limit.
            </div>
            <div v-else-if="d_submission.status === GradingStatus.error">
              Uh oh...Something very bad happened while we were grading your submission.
              Don't worry, it's probably our fault, not yours!
              Sometimes these things only happen once, so you might as well submit again.
              We won't count this one towards your daily limit.
              If this keeps happening, send us an email and we'll look into it!
            </div>
          </div>
        </div>

        <div v-if="d_submission.is_bonus_submission"
             id="is-bonus-submission-message">
          This submission used one of your bonus submissions.
        </div>
        <p v-if="is_group_member && does_not_count_for_current_user"
           id="does-not-count-for-user-message">
          Since you ran out of late days, this submission will not count towards your final grade.
        </p>
        <div v-if="!is_group_member">
          <div v-if="d_submission.does_not_count_for.length">
            This submission does NOT count for the following users:
            <ul>
              <li v-for="username of d_submission.does_not_count_for">{{username}}</li>
            </ul>
          </div>
        </div>

        <div v-if="(d_submission.status === GradingStatus.waiting_for_deferred
                   || d_submission.status === GradingStatus.finished_grading) &&
                   d_submission_result !== null
                   && d_submission_result.total_points_possible !== 0"
             id="submission-score"> Score:
          {{d_submission_result.total_points}}/{{d_submission_result.total_points_possible}}
        </div>


        <div class="submitted-files">
          <div v-for="submitted_filename of d_submission.submitted_filenames"
               class="submitted-file">
            <a class="open-file" @click="open_file(submitted_filename)">{{submitted_filename}}</a>
            <i class="cursor-pointer fa fa-download download-file-icon"
               @click="download_file(submitted_filename)">
            </i>
          </div>
        </div>

        <button v-if="is_group_member && (d_submission.status === GradingStatus.received
                      || d_submission.status === GradingStatus.queued)"
                id="remove-submission-from-queue-button"
                @click="d_show_remove_submission_from_queue_modal = true">
          Remove from queue
        </button>

        <div id="multi-file-viewer-container">
          <multi-file-viewer ref="view_submission_result_files"
                             :height_of_view_file="d_height_of_view_file">
          </multi-file-viewer>
        </div>

        <div v-if="d_user_roles.is_staff
                   && d_submission.status !== GradingStatus.removed_from_queue"
             id="adjust-feedback-section">
          <span id="adjust-feedback-label"> Adjust Feedback </span>
          <select v-model="d_fdbk_category"
                  id="adjust-feedback-select"
                  class="select"
                  @change="load_results()">
            <option v-if="d_user_roles.is_admin || is_group_member"
                    ref="normal_feedback_option"
                    :value="FeedbackCategory.normal">
              Normal
            </option>
            <option v-if="d_user_roles.is_admin || is_group_member"
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
            <option v-if="d_user_roles.is_admin || is_group_member"
                    ref="max_feedback_option"
                    :value="FeedbackCategory.max">
              Max
            </option>
          </select>
        </div>
      </div>

      <div v-if="d_submission_result !== null">
        <mutation-suite-results
          ref="mutation_suite_results"
          v-if="d_submission_result.student_test_suite_results.length"
          :submission="d_submission"
          :mutation_test_suite_results="d_submission_result.student_test_suite_results"
          :fdbk_category="d_fdbk_category">
        </mutation-suite-results>

        <div v-for="(ag_test_suite_result, index) of d_submission_result.ag_test_suite_results"
             ref="ag_test_suite_results">
          <AGTestSuiteResult :submission="d_submission"
                             :ag_test_suite_result="ag_test_suite_result"
                             :fdbk_category="d_fdbk_category"
                             :is_first_suite="index === 0">
          </AGTestSuiteResult>
        </div>
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

      <div class="modal-button-container">
        <button id="cancel-remove-submission-from-queue-button"
                class="modal-cancel-button white-button"
                @click="d_show_remove_submission_from_queue_modal = false">
          Cancel
        </button>
        <button id="confirm-remove-submission-from-queue-button"
                class="red-button"
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
    SubmissionWithResults,
    User,
    UserRoles
} from 'ag-client-typescript';
import * as FileSaver from 'file-saver';

import { GlobalData } from '@/app.vue';
import Modal from '@/components/modal.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import AGTestSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";
import MutationSuiteResults from "@/components/project_view/submission_detail/mutation_suite_results.vue";
import SubmissionDetailPanel from '@/components/project_view/submission_detail/submission_detail_panel.vue';
import { format_datetime } from '@/utils';

@Component({
  components: {
    AGTestSuiteResult,
    Modal,
    MultiFileViewer,
    MutationSuiteResults,
    SubmissionDetailPanel
  }
})
export default class SubmissionDetail extends Vue {

  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Object})
  selected_submission_with_results!: SubmissionWithResults;

  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Group})
  group!: Group;

  @Prop({required: true, type: Boolean})
  is_ultimate_submission!: boolean;

  @Watch('selected_submission_with_results')
  on_selected_submission_change(new_value: SubmissionWithResults,
                                old_value: SubmissionWithResults) {
    this.d_loading = true;
    this.d_submission = new Submission(new_value);
    this.d_fdbk_category = this.determine_feedback_type();
    this.d_submission_result = new_value.results;
    this.d_loading = false;
  }

  d_fdbk_category: FeedbackCategory | null = null;
  d_submission: null | Submission = null;
  d_submission_result: null | SubmissionResultFeedback = null;
  d_loading = true;
  d_height_of_view_file = "500px";
  d_show_remove_submission_from_queue_modal = false;
  d_user_roles: UserRoles | null =  null;
  d_user: User | null = null;

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly FeedbackCategory = FeedbackCategory;
  readonly GradingStatus = GradingStatus;
  readonly format_datetime = format_datetime;

  created() {
    this.d_submission = new Submission(this.selected_submission_with_results);
    this.d_user = this.d_globals.current_user;
    this.d_user_roles = this.d_globals.user_roles;
    this.d_fdbk_category = this.determine_feedback_type();
    this.d_submission_result = this.selected_submission_with_results.results;
    this.d_loading = false;
  }

  determine_feedback_type(): FeedbackCategory {
    if (this.d_user_roles!.is_staff) {
      if (this.is_group_member || (this.is_ultimate_submission && this.d_user_roles!.is_admin)) {
        return FeedbackCategory.max;
      }
      return FeedbackCategory.staff_viewer;
    }
    if (this.is_ultimate_submission) {
      return FeedbackCategory.ultimate_submission;
    }
    if (this.d_submission!.is_past_daily_limit) {
      return FeedbackCategory.past_limit_submission;
    }
    return FeedbackCategory.normal;
  }

  get being_processed() {
    return (this.d_submission!.status !== GradingStatus.error
            && this.d_submission!.status !== GradingStatus.finished_grading
            && this.d_submission!.status !== GradingStatus.removed_from_queue);
  }

  async load_results() {
    this.d_submission_result = await get_submission_result(
      this.d_submission!.pk, this.d_fdbk_category!
    );
  }

  get does_not_count_for_current_user() {
    return this.d_submission!.does_not_count_for.findIndex(
        username => username === this.d_user!.username
    ) !== -1;
  }

  get is_group_member() {
    return this.group.member_names.findIndex(
        member_name => member_name === this.d_user!.username
    ) !== -1;
  }

  async open_file(filename: string) {
    let multi_file_viewer = <MultiFileViewer> this.$refs.view_submission_result_files;
    let file_content: Promise<string> = Promise.resolve(
      this.d_submission!.get_file_content(filename)
    );
    multi_file_viewer.add_to_viewing(filename, file_content);
  }

  async download_file(filename: string) {
    FileSaver.saveAs(new File([await this.d_submission!.get_file_content(filename)], filename));
  }

  async remove_submission_from_queue() {
    await this.d_submission!.remove_from_queue();
    this.d_submission!.status = GradingStatus.removed_from_queue;
    this.d_show_remove_submission_from_queue_modal = false;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

* {
  box-sizing: border-box;
}

#submission-detail {
  padding: 9px 30px 30px 30px;
}

#submission-detail-loading-spinner {
  color: $ocean-blue;
  font-size: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
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

#being-processed-message {
  padding: 5px 0 10px 0;
}

#grading-status-section {
  padding: 5px 0 5px 0;
}

#grading-status-label {
  font-size: 18px;
  padding: 0 0 5px 0;
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

</style>
