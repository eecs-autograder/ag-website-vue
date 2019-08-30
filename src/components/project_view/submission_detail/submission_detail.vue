<template>
  <div v-if="!d_loading"
       id="submission_detail">
    <div v-if="submission_result !== null"
         id="view-submission">
      <mutation-test-suite-results
        :submission="submission"
        :mutation_test_suite_results="submission_result.student_test_suite_results"
        :fdbk_category="feedback_category">
      </mutation-test-suite-results>
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
    FeedbackCategory,
    get_submission_result,
    Group,
    Submission,
    SubmissionResultFeedback
} from 'ag-client-typescript';

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
    console.log(all_submissions.length);
    if (all_submissions.length !== 0) {
        this.submission = all_submissions[0];
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

#submission_detail {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

#view-submission {
  width: 50%;

}

@media only screen and (min-width: 481px) {

}

</style>
