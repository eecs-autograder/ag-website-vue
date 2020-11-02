// CommitChart.ts
import { Line } from 'vue-chartjs';
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import { Submission } from 'ag-client-typescript';
// @ts-ignore
import moment from "moment";

@Component({
    extends: Line,
})
export default class SubmissionsOverTimeGraph extends Mixins(Line) {
    @Prop({required: true})
    submissions!: Submission[];

    mounted() {
        this.update_chart();
    }

    @Watch('submission_results')
    on_submission_results_change() {
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
                            displayFormats: {
                                // Don't display seconds or milliseconds.
                                millisecond: 'h:mm a',
                                second: 'h:mm a',
                            },
                            tooltipFormat: 'MMM D, YYYY, h:mm a'
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
                }
            }
        );
    }

    compute_data_points() {
        if (this.submissions.length === 0) {
            return [];
        }

        let timestamps = this.submissions.map(submission => moment(submission.timestamp));
        timestamps.sort((first, second) => first.diff(second));

        let start = timestamps[0];
        let end = timestamps[timestamps.length - 1];

        let num_hours = Math.ceil(moment.duration(end.diff(start)).asHours());
        let buckets = Array(num_hours).fill(0);

        for (let timestamp of timestamps) {
            let offset = moment.duration(timestamp.diff(start));
            buckets[Math.floor(offset.asHours())] += 1;
        }

        let result = [];
        for (let i = 0; i < num_hours; ++i) {
            result.push({
                x: moment(start).add(i, 'hour').set('second', 0).set('millisecond', 0),
                y: buckets[i],
            });
        }
        return result;
    }
}
