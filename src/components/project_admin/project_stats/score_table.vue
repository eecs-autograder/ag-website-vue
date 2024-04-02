<template>
  <table
    class="ultimate-submission-table"
    v-if="submission_results !== null
          && submission_results.length !== 0
          && first_non_null_submission_results !== undefined"
  >
    <thead>
      <tr>
        <td>Username</td>
        <td>Group</td>
        <td>Score</td>
        <template v-for="suite_result
                         of get_ag_test_suite_results(first_non_null_submission_results)">
          <td :key="`suite-${suite_result.ag_test_suite_pk}`">
            {{ suite_result.ag_test_suite_name }} ({{ suite_result.total_points_possible }})
          </td>
          <template v-for="test_result of suite_result.ag_test_case_results">
            <td :key="`test-${test_result.ag_test_case_pk}`">
              {{ test_result.ag_test_case_name }} ({{ test_result.total_points_possible }})
            </td>
          </template>
        </template>
        <template v-for="mutation_result
                         of get_mutation_test_suite_results(first_non_null_submission_results)">
          <td :key="`mutation-result-${mutation_result.pk}`">
            {{ mutation_result.mutation_test_suite_name }}
            ({{ mutation_result.total_points_possible }})
          </td>
        </template>
      </tr>
    </thead>
    <tbody>
      <tr v-for="submission_result of submission_results"
          :key="`result-${submission_result.username}`">
        <td>{{ submission_result.username }}</td>
        <td>{{ submission_result.group.member_names.join(',') }}</td>
        <template v-if="submission_result.ultimate_submission !== null">
          <td>{{ submission_result.ultimate_submission.results.total_points }}/{{
                  submission_result.ultimate_submission.results.total_points_possible}}</td>

          <template v-for="suite_result
                           of submission_result.ultimate_submission.results.ag_test_suite_results">
            <td :key="`suite-${suite_result.ag_test_suite_pk}`">
              {{ suite_result.total_points }}
            </td>
            <template v-for="test_result of suite_result.ag_test_case_results">
              <td :key="`test-${test_result.ag_test_case_pk}`">
                {{ test_result.total_points }}
              </td>
            </template>
          </template>

          <template
            v-for="suite_result
                   of submission_result.ultimate_submission.results.mutation_test_suite_results"
          >
            <td :key="`mutation-suite-${suite_result.mutation_test_suite_pk}`">
              {{ suite_result.total_points }}
            </td>
          </template>
        </template>
      </tr>
    </tbody>
  </table>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';
import { assert_not_null } from '@/utils';

@Component({})
export default class ScoreTable extends Vue {
  @Prop({type: Array, required: true})
  submission_results: ag_cli.FullUltimateSubmissionResult[] | null = null;

  get first_non_null_submission_results() {
    assert_not_null(this.submission_results);
    let first_non_null = this.submission_results.find(res => res.ultimate_submission !== null);
    return first_non_null;
  }

  get_ag_test_suite_results(submission_result: ag_cli.FullUltimateSubmissionResult) {
    if (submission_result.ultimate_submission === null) {
      return [];
    }
    return submission_result.ultimate_submission.results.ag_test_suite_results;
  }

  get_mutation_test_suite_results(submission_result: ag_cli.FullUltimateSubmissionResult) {
    if (submission_result.ultimate_submission === null) {
      return [];
    }
    return submission_result.ultimate_submission.results.mutation_test_suite_results;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

table {
  border-collapse: collapse;
}

td, th {
  border: 1px solid $pebble-medium;
  padding: .25rem;
}

tr:nth-child(even) {
  background-color: $pebble-medium;
}
</style>
