<template>
  <div id="mutation-test-suite-results">
    <div id="mutation-test-suites-title">Mutation Testing Suites</div>
    <div id="mutation-test-suites-header">
      <div class="column-1"> Suite Name </div>
      <div class="column-2"> Student Tests </div>
      <div class="column-3"> Score </div>
    </div>

    <template v-for="(mutation_test_suite_result, index) of mutation_test_suite_results">
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
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    MutationTestSuiteResultFeedback,
    Submission
} from 'ag-client-typescript';

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

  get_mutation_test_validity_correctness_level(suite_result: MutationTestSuiteResultFeedback) {
    if (suite_result.invalid_tests === null) {
      return CorrectnessLevel.not_available;
    }
    if (suite_result.has_setup_command && suite_result.setup_return_code !== 0) {
      return CorrectnessLevel.none_correct;
    }

    if (suite_result.total_points === suite_result.total_points_possible) {
      if (suite_result.invalid_tests.length === 0) {
        return CorrectnessLevel.all_correct;
      }
      return CorrectnessLevel.some_correct;
    }

    if (suite_result.invalid_tests.length === suite_result.student_tests.length) {
      return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.some_correct;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';

#mutation-test-suite-results {
  border: 2px solid #ebeef4;
  border-radius: 5px;
  padding: 20px;
  margin: 10px 0;
}

#mutation-test-suites-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
}

#mutation-test-suites-title {
  font-size: 18px;
  font-weight: bold;
  padding: 0 0 10px 0;
}

</style>
