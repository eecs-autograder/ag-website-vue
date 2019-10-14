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
        :correctness_level="get_mutation_test_validity_correctness_level(
          mutation_test_suite_result
        )"
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

import { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";
import MutationSuiteResult
    from '@/components/project_view/submission_detail/mutation_suite_result.vue';
import SubmissionDetailPanel
    from "@/components/project_view/submission_detail/submission_detail_panel.vue";

import { MutationTestSuiteResultFeedback, Submission } from 'ag-client-typescript';
import { Component, Prop, Vue } from 'vue-property-decorator';

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

  suite_return_code_correctness(suite_result: MutationTestSuiteResultFeedback) {
    if (suite_result.has_setup_command) {
      if (suite_result.setup_return_code === 0) {
        return CorrectnessLevel.all_correct;
      }
      return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.not_available;
  }

  suite_student_test_correctness(suite_result: MutationTestSuiteResultFeedback) {
    if (suite_result.invalid_tests !== null) {
      // no test submitted is invalid
      if (suite_result.invalid_tests.length === 0) {
        return CorrectnessLevel.all_correct;
      }
      // invalid cannot be zero at this point - all tests submitted are invalid
      if (suite_result.invalid_tests.length === suite_result.student_tests.length) {
        return CorrectnessLevel.none_correct;
      }
      // more than zero invalid but less than total tests
      return CorrectnessLevel.some_correct;
    }
    return CorrectnessLevel.not_available;
  }

  suite_bugs_exposed_correctness(suite_result: MutationTestSuiteResultFeedback) {
    let student_tests_correctness = this.suite_student_test_correctness(suite_result);
    let total_points = typeof(suite_result.total_points) === 'string'
        ? parseFloat(suite_result.total_points) : suite_result.total_points;
    let total_points_possible = typeof(suite_result.total_points_possible) === 'string'
        ? parseFloat(suite_result.total_points_possible) : suite_result.total_points_possible;

    if (suite_result.num_bugs_exposed !== null) {
      if (total_points === 0 && total_points_possible !== 0) {
          console.log(suite_result.student_test_suite_name + " Received 0 points when points possible > 0");
        return CorrectnessLevel.none_correct;
      }
      else if (suite_result.total_points === suite_result.total_points_possible) {
        if (student_tests_correctness !== CorrectnessLevel.all_correct) {
            return CorrectnessLevel.some_correct;
        }
        return CorrectnessLevel.all_correct;
      }
      console.log(suite_result.student_test_suite_name + " received some points but not all");
      return CorrectnessLevel.some_correct;
    }
    if (student_tests_correctness === CorrectnessLevel.all_correct ||
        student_tests_correctness === CorrectnessLevel.not_available) {
      return CorrectnessLevel.not_available;
    }
    return student_tests_correctness;
  }

  get_mutation_test_validity_correctness_level(suite_result: MutationTestSuiteResultFeedback) {
    let return_code_correctness = this.suite_return_code_correctness(suite_result);
    let bugs_exposed_correctness = this.suite_bugs_exposed_correctness(suite_result);

    let total_points = typeof(suite_result.total_points) === 'string'
        ? parseFloat(suite_result.total_points) : suite_result.total_points;
    let total_points_possible = typeof(suite_result.total_points_possible) === 'string'
        ? parseFloat(suite_result.total_points_possible) : suite_result.total_points_possible;

    console.log(suite_result.student_test_suite_name);
    console.log("Return code correctness: " + return_code_correctness);
    console.log("Bugs exposed correctness: " + bugs_exposed_correctness);
    console.log("******");

    if (total_points === 0 && total_points_possible !== 0) {
      return CorrectnessLevel.none_correct;
    }

    if ((return_code_correctness === CorrectnessLevel.not_available)) {
      if (bugs_exposed_correctness === CorrectnessLevel.not_available) {
        return CorrectnessLevel.info_only;
      }
      return bugs_exposed_correctness;
    }

    if (return_code_correctness === CorrectnessLevel.all_correct) {
      if (bugs_exposed_correctness === CorrectnessLevel.all_correct) {
          return CorrectnessLevel.all_correct;
      }
      else if (bugs_exposed_correctness === CorrectnessLevel.not_available) {
        return CorrectnessLevel.info_only;
      }
      else {
        return CorrectnessLevel.some_correct;
      }
    }

    if (return_code_correctness === CorrectnessLevel.none_correct) {
      if (bugs_exposed_correctness === CorrectnessLevel.all_correct
          || bugs_exposed_correctness === CorrectnessLevel.some_correct) {
        return CorrectnessLevel.some_correct;
      }
      return CorrectnessLevel.none_correct;
    }

    return CorrectnessLevel.info_only;
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
