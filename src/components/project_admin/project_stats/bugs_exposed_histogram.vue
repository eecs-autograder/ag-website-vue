<template>
  <!-- See https://www.chartjs.org/docs/latest/configuration/responsive.html#important-note -->
  <div style="position: relative; height: 70vh">
    <canvas ref="submissions_over_time_canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';
import { BarController, BarElement, CategoryScale, Chart, Legend, Tooltip } from 'chart.js';

import { SafeMap } from '@/safe_map';
import { assert_not_null } from '@/utils';

Chart.register(BarElement, BarController, CategoryScale);
Chart.register(Legend, Tooltip);

@Component
export default class BugsExposedHistogram extends Vue {
  @Prop({required: true, type: ag_cli.MutationTestSuite})
  mutation_test_suite!: ag_cli.MutationTestSuite;

  @Prop({required: true, type: Array})
  ultimate_submission_entries!: ag_cli.FullUltimateSubmissionResult[];

  mounted() {
    this.update_chart();
  }

  d_chart: Chart | null = null;

  @Watch('mutation_test_suite')
  on_mutation_test_suite_change() {
    this.update_chart();
  }

  @Watch('ultimate_submission_entries')
  on_ultimate_submission_entries_change() {
    this.update_chart();
  }

  update_chart() {
    let bug_counts = this.buggy_impl_exposed_count();

    if (this.d_chart !== null) {
      this.d_chart.destroy();
    }

    let context = (<HTMLCanvasElement> this.$refs.submissions_over_time_canvas).getContext('2d');
    assert_not_null(context);
    this.d_chart = new Chart(
      context,
      {
        type: 'bar',
        data: {
          labels: Array.from(bug_counts.keys()),
          datasets: [
            {
              label: '# Students who exposed the bug',
              backgroundColor: '#38C1C7',
              data: Array.from(bug_counts.values()),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Bug Name'
              },
            },
            y: {
              ticks: {
                // Only use integer y ticks
                callback: value => Number(value) % 1 === 0 ? value : undefined
              },
              title: {
                display: true,
                text: '# of Students who exposed the bug'
              }
            }
          }
        }
      }
    );
  }

  // Returns a map of (bug name) -> (how many times that bug was exposed).
  buggy_impl_exposed_count() {
    let counts = new SafeMap<string, number>();
    for (let bug_name of this.mutation_test_suite.buggy_impl_names) {
      counts.set(bug_name, 0);
    }

    for (let entry of this.ultimate_submission_entries) {
      if (entry.ultimate_submission === null) {
        continue;
      }
      let mutation_test_suite_results
        = entry.ultimate_submission.results.mutation_test_suite_results;
      for (let suite_result of mutation_test_suite_results) {
        if (suite_result.mutation_test_suite_pk !== this.mutation_test_suite.pk) {
          continue;
        }

        for (let bug_name of suite_result.bugs_exposed ?? []) {
          counts.set(bug_name, counts.get(bug_name, 0) + 1);
        }
      }
    }
    return counts;
  }
}
</script>
