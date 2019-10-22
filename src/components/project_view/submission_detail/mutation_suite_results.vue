<template>
  <div id="mutation-test-suite-results"
       class="suite-result">
    <div id="mutation-test-suites-title">Mutation Testing Suites</div>
    <div id="mutation-test-suites-header">
      <div class="column-1"> Suite Name </div>
      <div class="column-2"> Student Tests </div>
      <div class="column-3"> Score </div>
    </div>

    <div v-for="mutation_test_suite_result of mutation_test_suite_results"
         :key="mutation_test_suite_result.pk">

      <submission-detail-panel
        ref="mutation_test_suite_detail_panel"
        :name="mutation_test_suite_result.student_test_suite_name"
        :correctness_level="mutation_suite_correctness(mutation_test_suite_result)"
        :points_awarded="parseFloat(mutation_test_suite_result.total_points)"
        :points_possible="parseFloat(mutation_test_suite_result.total_points_possible)">
        <mutation-suite-result :submission="submission"
                               :mutation_test_suite_result="mutation_test_suite_result"
                               :fdbk_category="fdbk_category">
        </mutation-suite-result>
      </submission-detail-panel>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { MutationTestSuiteResultFeedback, Submission } from 'ag-client-typescript';

import { CorrectnessLevel, setup_return_code_correctness } from "@/components/project_view/submission_detail/correctness";
import MutationSuiteResult from '@/components/project_view/submission_detail/mutation_suite_result.vue';
import ResultPanel from "@/components/project_view/submission_detail/result_panel.vue";

@Component({
  components: {
    MutationSuiteResult,
    SubmissionDetailPanel: ResultPanel
  }
})
export default class MutationSuiteResults extends Vue {

  @Prop({required: true, type: Array})
  mutation_test_suite_results!: MutationTestSuiteResultFeedback[];

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: String})
  fdbk_category!: string;

  setup_return_code_correctness(suite_result: MutationTestSuiteResultFeedback) {
    return setup_return_code_correctness(suite_result.setup_return_code,
                                         suite_result.setup_timed_out);
  }

  student_tests_correctness(suite_result: MutationTestSuiteResultFeedback) {
    if (suite_result.invalid_tests === null) {
      return suite_result.discarded_tests.length === 0
            ? CorrectnessLevel.not_available : CorrectnessLevel.some_correct;
    }

    if (suite_result.invalid_tests.length === 0 && suite_result.discarded_tests.length === 0) {
      return CorrectnessLevel.all_correct;
    }

    if (suite_result.invalid_tests.length === suite_result.student_tests.length) {
      return CorrectnessLevel.none_correct;
    }

    return CorrectnessLevel.some_correct;
  }

  bugs_exposed_correctness(suite_result: MutationTestSuiteResultFeedback) {
    if (suite_result.num_bugs_exposed === null) {
      return CorrectnessLevel.not_available;
    }

    if (suite_result.num_bugs_exposed === 0) {
      return CorrectnessLevel.none_correct;
    }

    let total_points = typeof(suite_result.total_points) === 'string'
        ? parseFloat(suite_result.total_points) : suite_result.total_points;
    let total_points_possible = typeof(suite_result.total_points_possible) === 'string'
        ? parseFloat(suite_result.total_points_possible) : suite_result.total_points_possible;

    if (total_points_possible === 0 && suite_result.num_bugs_exposed > 0) {
      return CorrectnessLevel.info_only;
    }

    if (total_points === total_points_possible) {
      return CorrectnessLevel.all_correct;
    }
    return CorrectnessLevel.some_correct;
  }

  mutation_suite_correctness(suite_result: MutationTestSuiteResultFeedback) {
    let return_code_correctness = this.setup_return_code_correctness(suite_result);
    let points_correctness = this.bugs_exposed_correctness(suite_result);
    let student_tests_correctness = this.student_tests_correctness(suite_result);

    // received no points
    if (points_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.none_correct;
    }

    let correctnesses = [return_code_correctness, points_correctness, student_tests_correctness];
    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.not_available);

    if (correctnesses.length === 0) {  // All 3 were not_available
      return CorrectnessLevel.info_only;
    }

    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.info_only);
    if (correctnesses.length === 0) {  // All remaining were info_only
      return CorrectnessLevel.info_only;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.all_correct)) {
      return CorrectnessLevel.all_correct;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.none_correct)) {
      return CorrectnessLevel.none_correct;
    }

    // We have a mix of all, some, and none correct
    return CorrectnessLevel.some_correct;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

#mutation-test-suites-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
}

#mutation-test-suites-title {
  font-size: 19px;
  font-weight: bold;
  padding: 0 0 10px 0;
}

</style>
