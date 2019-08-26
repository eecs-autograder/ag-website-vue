<template>
  <div v-if="!d_loading">
    <div v-if="submission_result !== null">

      <h2> Submission: </h2>
      <div> pk: {{submission.pk}} </div>
      <div> Group: {{submission.group}} </div>
      <div> Timestamp: {{submission.timestamp}} </div>
      <div> Submitter: {{submission.submitter}} </div>
      <div> Submitted Filenames: {{submission.submitted_filenames}} </div>
      <div> Status: {{submission.status}} </div>
      <div> Count towards daily limit: {{submission.count_towards_daily_limit}} </div>
      <div> Is past daily limit: {{submission.is_past_daily_limit}} </div>
      <div> Is bonus submission: {{submission.is_bonus_submission}} </div>
      <div> Count towards total limit: {{submission.count_towards_total_limit}} </div>
      <div> Does not count for: {{submission.does_not_count_for}} </div>
      <div> Position in queue: {{submission.position_in_queue}} </div>
      <div> Last modified: {{submission.last_modified}} </div>

      <h2> Submission Result </h2>
      <div> pk: {{submission_result.pk}}</div>
      <div> Total Points: {{submission_result.total_points}}</div>
      <div> Total Points Possible: {{submission_result.total_points_possible}}</div>
      <div> AG Test Suite Results: {{submission_result.ag_test_suite_results}}</div>
      <div> Student Test Suite Results: {{submission_result.student_test_suite_results}}</div>

      <h2> Mutation Suites </h2>
      <mutation-test-suite-results :submission="submission"
                                   :mutation_test_suite_results="submission_result.student_test_suite_results"
                                   :fdbk_category="feedback_category">
      </mutation-test-suite-results>

      <h2> AG Suites </h2>
      <div v-for="(ag_test_suite_result, index) of submission_result.ag_test_suite_results">
        <AGTestSuiteResult :submission="submission"
                           :ag_test_suite_result="ag_test_suite_result"
                           :fdbk_category="feedback_category">
        </AGTestSuiteResult>
      </div>
    </div>

  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    Group,
    FeedbackCategory,
    Submission,
    SubmissionResultFeedback,
    get_submission_result
} from 'ag-client-typescript';
import {

} from 'ag-client-typescript/dist/src/submission_result';

import AGTestSuiteResult from '@/components/project_view/submission_detail/ag_test_suite_result.vue';
import MutationTestSuiteResults from "@/components/project_view/submission_detail/mutation_test_suite_results.vue";

@Component({
  components: {
    AGTestSuiteResult,
    MutationTestSuiteResults
  }
})
export default class SubmissionDetail extends Vue {

  @Prop({required: true, type: Group})
  group!: Group;

  submission: Submission | null = null;
  submission_result: SubmissionResultFeedback | null = null;
  feedback_category: FeedbackCategory = FeedbackCategory.max;
  d_loading = false;

  async created() {
    let all_submissions = await Submission.get_all_from_group(this.group.pk);
    if (all_submissions.length !== 0) {
        this.submission = all_submissions[all_submissions.length - 1];
    }
    if (this.submission !== null) {
      this.submission_result = await get_submission_result(
          this.submission!.pk, this.feedback_category
      );
      console.log(this.submission_result);
      console.log(this.submission_result.student_test_suite_results);
    }
    this.d_loading = false;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

@media only screen and (min-width: 481px) {

}

</style>
