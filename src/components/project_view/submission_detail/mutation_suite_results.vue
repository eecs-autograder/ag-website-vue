import {CorrectnessLevel} from "@/components/project_view/submission_detail/correctness_icon";
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

import { setup_return_code_correctness } from "@/components/project_view/submission_detail/correctness";
import { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";
import MutationSuiteResult from '@/components/project_view/submission_detail/mutation_suite_result.vue';
import SubmissionDetailPanel from "@/components/project_view/submission_detail/submission_detail_panel.vue";

@Component({
  components: {
    MutationSuiteResult,
    SubmissionDetailPanel
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
    if (suite_result.invalid_tests !== null) {
      if (suite_result.invalid_tests.length === 0) {
        return CorrectnessLevel.all_correct;
      }
      if (suite_result.invalid_tests.length === suite_result.student_tests.length) {
        return CorrectnessLevel.none_correct;
      }
      return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.not_available;
  }

  points_for_bugs_exposed_correctness(suite_result: MutationTestSuiteResultFeedback) {
    let total_points = typeof(suite_result.total_points) === 'string'
        ? parseFloat(suite_result.total_points) : suite_result.total_points;
    let total_points_possible = typeof(suite_result.total_points_possible) === 'string'
        ? parseFloat(suite_result.total_points_possible) : suite_result.total_points_possible;

    if (suite_result.num_bugs_exposed !== null) {
      if (total_points === 0 && total_points_possible !== 0) {
        return CorrectnessLevel.none_correct;
      }
      else if (suite_result.total_points === suite_result.total_points_possible) {
          return CorrectnessLevel.all_correct;
      }
      return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.not_available;
  }

  mutation_suite_correctness(suite_result: MutationTestSuiteResultFeedback) {
    let return_code_correctness = this.setup_return_code_correctness(suite_result);
    let points_correctness = this.points_for_bugs_exposed_correctness(suite_result);
    let student_tests_correctness = this.student_tests_correctness(suite_result);

    // received no points
    if (points_correctness === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.none_correct;
    }

    // received all points
    if (points_correctness === CorrectnessLevel.all_correct) {
      // invalid_tests are present or hidden
      if (student_tests_correctness !== CorrectnessLevel.all_correct) {
        points_correctness = CorrectnessLevel.some_correct;
      }
    }
    // points hidden
    else if (points_correctness === CorrectnessLevel.not_available) {
      // invalid_tests hidden or no invalid_tests
      if (student_tests_correctness === CorrectnessLevel.all_correct
          || student_tests_correctness === CorrectnessLevel.not_available) {
        points_correctness = CorrectnessLevel.info_only;
      }
      // invalid_tests present
      else {
        points_correctness = student_tests_correctness;
      }
    }

    if ((return_code_correctness === CorrectnessLevel.not_available)) {
      return points_correctness;
    }
    else if (return_code_correctness === CorrectnessLevel.all_correct) {
      // invalid_tests present or some points awarded
      if (points_correctness === CorrectnessLevel.none_correct
          || points_correctness === CorrectnessLevel.some_correct) {
        return CorrectnessLevel.some_correct;
      }
      // no invalid tests or invalid_tests hidden or points hidden
      else {
        return points_correctness;
      }
    }
    // all tests valid or some tests valid or some points awarded
    if (points_correctness === CorrectnessLevel.all_correct
        || points_correctness === CorrectnessLevel.some_correct) {
      return CorrectnessLevel.some_correct;
    }
    // all tests invalid or invalid_tests hidden or points hidden
    return CorrectnessLevel.none_correct;
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
  font-size: 22px;
  font-weight: bold;
  padding: 0 0 10px 0;
}

</style>
