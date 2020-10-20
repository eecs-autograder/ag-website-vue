// CommitChart.ts
import { Bar } from 'vue-chartjs';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { SafeMap } from '@/safe_map';

import { UltimateSubmissionEntry } from './project_stats.vue';

@Component({
    extends: Bar,
})
export default class BugsExposedHistogram extends Vue<Bar> {
    @Prop({required: true, type: ag_cli.MutationTestSuite})
    mutation_test_suite!: ag_cli.MutationTestSuite;

    @Prop({required: true, type: Array})
    ultimate_submission_entries!: UltimateSubmissionEntry[];

    mounted() {
        this.update_chart();
    }

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

        this.renderChart(
            {
                labels: Array.from(bug_counts.keys()),
                datasets: [
                    {
                        label: '# Students who exposed the bug',
                        backgroundColor: '#38C1C7',
                        data: Array.from(bug_counts.values()),
                    },
                ],
            },
            {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Bug Name'
                        },
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            // Only use integer y ticks
                            callback: value => Number(value) % 1 === 0 ? value : undefined
                        },
                        scaleLabel: {
                            display: true,
                            labelString: '# of Students who exposed the bug'
                        }
                    }]
                }
            }
        );
    }

    // Returns a map of how many times each bug was exposed.
    buggy_impl_exposed_count() {
        let counts = new SafeMap<string, number>();
        for (let bug_name of this.mutation_test_suite.buggy_impl_names) {
            counts.set(bug_name, 0);
        }

        for (let entry of this.ultimate_submission_entries) {
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
