<template>
  <div v-if="submissions.length"
       id="submission_detail">

    <div id="submissions">
      <div v-for="submission of submissions"
           class="single-submission"
             @click="set_submission(submission)">{{format_datetime(submission.timestamp)}}
      </div>
    </div>


    <div id="view-submission">
      <div v-if="d_loading">
        <i class="fa fa-spinner fa-pulse fa-fw"></i>
      </div>
      <div v-if="submission_result !== null">
        <div id="top">

          <div id="submitted-by"> Submitted by: <span id="submitter">{{submission.submitter}}</span>
            on <span id="timestamp">{{format_datetime(submission.timestamp)}}</span>
          </div>

          <div v-if="being_processed(submission)"> This page will update automatically </div>

          <div id="grading-status-section">
            <div id="grading-status-label"> Grading status: </div>
            <div v-if="submission.status === GradingStatus.received">
              We got your submission! It should be queued soon.
            </div>
            <div v-else-if="submission.status === GradingStatus.queued">
              Your submission is at position {{submission.position_in_queue}} in the queue.
            </div>
            <div v-else-if="submission.status === GradingStatus.being_graded">
              Your submission is being graded!
            </div>
            <div v-else-if="submission.status === GradingStatus.waiting_for_deferred">
              All the public test cases are finished grading. You can submit again now!
            </div>
            <div v-else-if="submission.status === GradingStatus.finished_grading">
              Everything is finished grading!
            </div>
            <div v-else-if="submission.status === GradingStatus.removed_from_queue">
              You removed this submission from the queue. That means it won't be graded,
              and it won't count towards your daily submission limit.
            </div>
            <div v-else-if="submission.status === GradingStatus.error">
              Uh oh...Something very bad happened while we were grading your submission.
              Don't worry, it's probably our fault, not yours!
              Sometimes these things only happen once, so you might as well submit again.
              We won't count this one towards your daily limit.
              If this keeps happening, send us an email and we'll look into it!
            </div>
          </div>

          <div v-if="submission.is_bonus_submission">
            This submission used one of your bonus submissions.
          </div>
          <p v-if="is_group_member && does_not_count_for_current_user">
            Since you ran out of late days, this submission will not count towards your final grade.
          </p>
          <div v-if="!is_group_member">
            <div v-if="submission.does_not_coufor.length">
              This submission does NOT count for the following users:
              <ul>
                <li v-for="username of submission.does_not_count_for">{{username}}</li>
              </ul>
            </div>

            <div v-if="course.num_late_days !==  0">
              Late days remaining:

<!--<ul>-->
<!--  <li v-for="late_day_info of late_day_summary">-->
<!--    {{late_day_info.username}}:-->
<!--    <span v-if="!user_roles.is_admin">{{late_day_info.num_late_days}}</span>-->
<!--    <div v-if="user_roles.is_admin">-->
<!--      <input [(ngModel)]="late_day_info.num_late_days">-->
<!--      <button type="button" class="btn btn-success btn-xs"-->
<!--              [disabled]="!is_number(late_day_info.num_late_days) ||-->
<!--                    late_day_info.num_late_days < 0"-->
<!--              (click)="save_late_days(late_day_info.username, late_day_info.num_late_days)">-->
<!--        Save-->
<!--      </button>-->
<!--    </div>-->
<!--  </li>-->
<!--</ul>-->

            </div>
          </div>


          <div id="submission-score">
            Score: {{submission_result.total_points}} / {{submission_result.total_points_possible}}
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
                  id="remove-from-queue-button"
                  @click="d_show_remove_submission_from_queue_modal = true">
            Remove from queue
          </button>

          <div id="multi-file-viewer-container">
            <multi-file-viewer ref="view_submission_result_files"
                               :height_of_view_file="height_of_view_file">
            </multi-file-viewer>
          </div>

          <div v-if="user_roles.is_staff">
            <span id="adjust-feedback-label"> Adjust Feedback </span>
            <select v-model="d_feedback_category"
                    id="semester"
                    class="select"
                    @change="load_results(d_feedback_category)">
              <option :value="FeedbackCategory.staff_viewer">
                {{FeedbackCategory.staff_viewer}}
              </option>
              <option :value="FeedbackCategory.ultimate_submission">
                {{FeedbackCategory.ultimate_submission}}
              </option>

              <option v-if="user_roles.is_admin || is_group_member"
                      :value="FeedbackCategory.normal">
                {{FeedbackCategory.normal}}
              </option>
              <option v-if="user_roles.is_admin || is_group_member"
                      :value="FeedbackCategory.past_limit_submission">
                {{FeedbackCategory.past_limit_submission}}
              </option>
              <option v-if="user_roles.is_admin || is_group_member"
                      :value="FeedbackCategory.max">
                {{FeedbackCategory.max}}
              </option>
            </select>
          </div>
        </div>

        <mutation-suite-results
          v-if="submission_result.student_test_suite_results.length"
          :submission="submission"
          :mutation_test_suite_results="submission_result.student_test_suite_results"
          :fdbk_category="d_feedback_category">
        </mutation-suite-results>

        <div v-for="(ag_test_suite_result, index) of submission_result.ag_test_suite_results">
          <AGTestSuiteResult :submission="submission"
                             :ag_test_suite_result="ag_test_suite_result"
                             :fdbk_category="d_feedback_category"
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
            <li>The next time you submit, that submission will be placed at the back of the grading
              queue
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
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    Course,
    FeedbackCategory,
    get_submission_result,
    GradingStatus,
    Group,
    Submission,
    SubmissionObserver,
    SubmissionResultFeedback,
    User,
    UserRoles
} from 'ag-client-typescript';
import * as FileSaver from 'file-saver';

import Modal from '@/components/modal.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import AGTestSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";
import MutationSuiteResults from "@/components/project_view/submission_detail/mutation_suite_results.vue";
import SubmissionDetailPanel from '@/components/project_view/submission_detail/submission_detail_panel.vue';
import { deep_copy, format_datetime } from '@/utils';

interface GroupMemberLateDays {
  username: string;
  num_late_days: string;
}

@Component({
  components: {
    AGTestSuiteResult,
    Modal,
    MultiFileViewer,
    MutationSuiteResults,
    SubmissionDetailPanel
  }
})
export default class SubmissionDetail extends Vue implements SubmissionObserver {

  @Prop({required: true, type: Group})
  group!: Group;

  @Prop({required: true, type: Course})
  course!: Course;

  submission: Submission | null = null;
  submissions: Submission[] = [];
  submission_result: SubmissionResultFeedback | null = null;
  d_feedback_category: FeedbackCategory = FeedbackCategory.max;
  height_of_view_file = "500px";
  d_loading = false;
  user: User | null = null;
  user_roles: UserRoles | null =  null;
  d_show_remove_submission_from_queue_modal = false;
  late_day_summary: GroupMemberLateDays[] = [];

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly FeedbackCategory = FeedbackCategory;
  readonly GradingStatus = GradingStatus;
  readonly format_datetime = format_datetime;

  async created() {
    Submission.subscribe(this);
    this.submissions = await Submission.get_all_from_group(this.group.pk);
    this.user = await User.get_current();
    this.user_roles = await User.get_current_user_roles(this.course.pk);

    this.d_loading = false;
  }

  beforeDestroy() {
    Submission.unsubscribe(this);
  }

  update_submission_created(submission: Submission): void {
    throw new Error("Method not implemented.");
  }
  update_submission_changed(submission: Submission): void {
    throw new Error("Method not implemented.");
  }

  being_processed(submission: Submission) {
    return (submission.status !== GradingStatus.error
            && submission.status !== GradingStatus.finished_grading
            && submission.status !== GradingStatus.removed_from_queue);
  }

  async load_results(feedback_category: FeedbackCategory) {
    this.submission_result = await get_submission_result(
        this.submission!.pk, this.d_feedback_category
    );
  }

  get does_not_count_for_current_user() {
    return this.submission!.does_not_count_for.findIndex(
        username => username === this.user!.username
    ) !== -1;
  }

  get is_group_member() {
    return this.group.member_names.findIndex(
        member_name => member_name === this.user!.username
    ) !== -1;
  }

  async set_submission(submission_in: Submission) {
    this.d_loading = true;

    this.submission = deep_copy(submission_in, Submission);
    this.submission_result = await get_submission_result(
      this.submission!.pk, this.d_feedback_category
    );

    this.d_loading = false;
  }

  async is_ultimate_submission() {
    let ultimate_submission = await Submission.get_final_graded_submission_from_group(
        this.group.pk
    );
    return ultimate_submission !== null && this.submission!.pk === ultimate_submission.pk;
  }

  async open_file(filename: string) {
    let multi_file_viewer = <MultiFileViewer> this.$refs.view_submission_result_files;
    let file_content: Promise<string> = Promise.resolve(
        this.submission!.get_file_content(filename)
    );
    multi_file_viewer.add_to_viewing(filename, file_content);
  }

  async download_file(filename: string) {
    FileSaver.saveAs(new File([await this.submission!.get_file_content(filename)], filename));
  }

  async remove_submission_from_queue() {
    await this.submission!.remove_from_queue();
    this.submission!.status = GradingStatus.removed_from_queue;
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

#submission_detail {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

#top {
  padding: 6px 12px;
}

#submissions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: center;
  margin-right: 10px;
}

.single-submission {
  background-color: $white-gray;
  border: 1px solid darken($white-gray, 10);
  padding: 5px;
}

#view-submission {
  width: 50%;
}




#submitted-by {
  font-size: 20px;
  padding: 2px 0;
}

#submitter {
  color: $ocean-blue;
}

#timestamp {
  color: $green;
}

#grading-status-label {
  font-size: 18px;
  padding: 2px 0 8px 0;
}

#grading-status-section {
  padding: 0 0 2px 0;
}

#submission-score {
  font-size: 18px;
  padding: 2px 0;
}

.download-file-icon {
  padding: 0 10px;
  color: $navy-blue;
  cursor: pointer;
}

#multi-file-viewer-container {
  margin-bottom: 10px;
}

#adjust-feedback-label {
  padding: 0 5px 0 0;
}

.submitted-files {
  padding: 6px 0;
}

.submitted-file {
  padding: 4px 0;
}

.open-file {
  color: $ocean-blue;
  cursor: pointer;
}

#remove-from-queue-button {
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
