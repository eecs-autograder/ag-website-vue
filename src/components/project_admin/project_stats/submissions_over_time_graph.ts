import { Line } from 'vue-chartjs';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import { Submission } from 'ag-client-typescript';
import 'chartjs-adapter-luxon';
// @ts-ignore
import zoom from 'chartjs-plugin-zoom';
import { DateTime, Duration } from 'luxon';

@Component({
    extends: Line,
})
export default class SubmissionsOverTimeGraph extends Mixins(Line) {
    @Prop({required: true})
    submissions!: Submission[];

    mounted() {
        this.addPlugin(zoom);
        this.update_chart();
    }

    @Watch('submissions')
    on_submissions_change() {
        this.update_chart();
    }

    update_chart() {
        // Overwriting base render method with actual data.
        this.renderChart(
            {
                // labels: labels,
                datasets: [
                    {
                        label: 'Submissions Per Hour',
                        backgroundColor: '#f87979',
                        // @ts-ignore  // chart.js's annotations here don't allow luxon DateTime
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
                                hour: 'MMM d, h:mm a ZZZZ',
                            },
                            tooltipFormat: 'MMM d, YYYY, h:mm a ZZZZ',
                        },
                        distribution: 'linear',
                        bounds: 'data',
                        ticks: {
                            source: 'auto',
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
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
                            labelString: '# of Submissions'
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
        if (this.submissions.length === 0) {
            return [];
        }

        let timestamps = this.submissions.map(
            submission => DateTime.fromISO(submission.timestamp)
        ).sort((first, second) => first.toMillis() - second.toMillis());

        let start = timestamps[0];
        let end = timestamps[timestamps.length - 1];

        let num_hours = Math.ceil(end.diff(start).as('hours'));
        let buckets = Array(num_hours).fill(0);

        for (let timestamp of timestamps) {
            let offset = timestamp.diff(start);
            buckets[Math.floor(offset.as('hours'))] += 1;
        }

        let result = [];
        for (let i = 0; i < num_hours; ++i) {
            result.push({
                x: start.plus(
                    Duration.fromObject({hours: i})
                ).set({second: 0, millisecond: 0}),
                y: buckets[i],
            });
        }
        return result;
    }
}
