<template>
  <div class="pass-fail-counts">
    <table class="pass-fail-table">
      <thead>
        <tr>
          <th>Test Case</th>
          <th># Students Pass</th>
          <th># Students Fail</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="suite of d_ag_test_suites">
          <tr :key="`suite-${suite.pk}`" class="suite-row">
            <td class="suite-name">{{suite.name}}</td>
            <td></td><td></td>
          </tr>

          <tr v-for="test_case of suite.ag_test_cases" :key="`test-${test_case.pk}`">
            <td class="test-name">{{test_case.name}}</td>
            <td class="num-pass">{{d_pass_counts.get(test_case.pk, null)}}</td>
            <td class="num-fail">{{d_fail_counts.get(test_case.pk, null)}}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import {
  ag_test_case_result_correctness,
  CorrectnessLevel
} from '@/components/project_view/submission_detail/correctness';
import { handle_global_errors_async } from '@/error_handling';
import { SafeMap } from '@/safe_map';

@Component({})
export default class PassFailCounts extends Vue {
  @Prop({required: true, type: ag_cli.Project})
  project!: ag_cli.Project;

  @Prop({required: true})
  submission_results!: ag_cli.SubmissionResultFeedback[];

  d_ag_test_suites: ag_cli.AGTestSuite[] = [];
  d_mutation_suites: ag_cli.MutationTestSuite[] = [];

  d_loading = true;

  // <test case pk>: <num pass>
  d_pass_counts = new SafeMap<number, number>();
  // <test case pk>: <num fail>
  d_fail_counts = new SafeMap<number, number>();

  @handle_global_errors_async
  async created() {
    [this.d_ag_test_suites, this.d_mutation_suites] = await Promise.all([
      ag_cli.AGTestSuite.get_all_from_project(this.project.pk),
      ag_cli.MutationTestSuite.get_all_from_project(this.project.pk)
    ]);

    for (let result of this.submission_results) {
      for (let suite_result of result.ag_test_suite_results) {
        for (let test_case_result of suite_result.ag_test_case_results) {
          let correctness = ag_test_case_result_correctness(test_case_result);
          if (correctness === CorrectnessLevel.info_only) {
            continue;
          }

          let counts = correctness === CorrectnessLevel.all_correct
            ? this.d_pass_counts : this.d_fail_counts;
          counts.set(
            test_case_result.ag_test_case_pk,
            counts.get(test_case_result.ag_test_case_pk, 0) + 1
          );
        }
      }
    }
    this.d_loading = false;
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

.suite-name {
  font-weight: bold;
}

.test-name {
  padding-left: 1.25rem;
}

.num-pass, .num-fail {
  text-align: right;
  padding-right: .5rem;
}
</style>