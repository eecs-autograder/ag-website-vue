import { Scatter } from 'vue-chartjs';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import { FullUltimateSubmissionResult } from 'ag-client-typescript';
// @ts-ignore
import zoom from 'chartjs-plugin-zoom';

import { SafeMap } from '@/safe_map';

import { FirstSubmissionData } from './project_stats.vue';

@Component({
    extends: Scatter,
})
export default class FirstSubmissionTimeVsFinalScore extends Mixins(Scatter) {
    @Prop({required: true})
    ultimate_submission_entries!: FullUltimateSubmissionResult[];

    @Prop({required: true})
    first_submissions_by_group!: SafeMap<number, FirstSubmissionData>;

    mounted() {
        this.addPlugin(zoom);
        this.update_chart();
    }

    @Watch('ultimate_submission_entries')
    on_ultimate_submission_entries_change() {
        this.update_chart();
    }

    update_chart() {
        // Overwriting base render method with actual data.
        this.renderChart(
            {
                // labels: labels,
                datasets: [
                    {
                        label: 'Final Score vs. First Submission Time',
                        backgroundColor: '#f87979',
                        data: this.compute_data_points(),
                    }
                ],
            },
            {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'hour',
                            unitStepSize: 1,
                            displayFormats: {
                                hour: 'MMM D, h:mm a',
                            },
                            tooltipFormat: 'MMM D, YYYY, h:mm a',
                        },
                        distribution: 'linear',
                        bounds: 'data',
                        ticks: {
                            source: 'auto',
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Time of First Submission'
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
                            labelString: '% Score'
                        }
                    }]
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            enabled: true,
                            mode: 'x',
                        }
                    },
                }
            }
        );
    }

    compute_data_points() {
        if (this.ultimate_submission_entries.length === 0) {
            return [];
        }

        let result = [];
        for (let entry of this.ultimate_submission_entries) {
            if (!this.first_submissions_by_group.has(entry.group.pk)) {
                continue;
            }

            if (entry.ultimate_submission === null) {
                continue;
            }

            if (Number(entry.ultimate_submission.results.total_points_possible) === 0) {
                continue;
            }
            let percent = Math.floor(
                Number(entry.ultimate_submission.results.total_points)
                / Number(entry.ultimate_submission.results.total_points_possible)
                * 100
            );
            result.push({
                x: this.first_submissions_by_group.get(entry.group.pk).first_submission.timestamp,
                y: percent,
            });
        }
        return result;
    }
}
