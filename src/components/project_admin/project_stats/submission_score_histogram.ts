// CommitChart.ts
import { Bar } from 'vue-chartjs';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { SubmissionResultFeedback } from 'ag-client-typescript';

@Component({
    extends: Bar,
})
export default class SubmissionScoreHistogram extends Vue<Bar> {
    @Prop({required: true})
    submission_results!: SubmissionResultFeedback[];

    d_percentages: number[] = [];

    mounted() {
        this.update_chart();
    }

    @Watch('submission_results')
    on_submission_results_change() {
        this.update_chart();
    }

    update_chart() {
        let [buckets, labels] = this.compute_buckets();

        // Overwriting base render method with actual data.
        this.renderChart(
            {
                // labels: [],
                labels: labels,
                datasets: [
                    {
                        label: 'Autograder Score',
                        backgroundColor: '#f87979',
                        data: buckets
                    }
                ],
            },
            {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: '% Score'
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
                            labelString: '# of Students'
                        }
                    }]
                }
            }
        );
    }

    compute_buckets() {
        let num_buckets = 20;  // 100 should be evenly divisible by this value
        let label_increment = 100 / num_buckets;
        this.d_percentages = this.submission_results.map(
            result => {
                let points_possible = Number(result.total_points_possible);
                if (points_possible === 0) {
                    return 0;
                }
                return Math.floor((Number(result.total_points) / points_possible) * 100);
            }
        );

        let buckets = Array(num_buckets).fill(0);
        for (let score of this.d_percentages) {
            // Prevent off-by-one when percent is 100
            let bucket_index = Math.min(num_buckets - 1, Math.floor(score / label_increment));
            buckets[bucket_index] += 1;
        }

        let labels = [];
        for (let i = 0; i < num_buckets; ++i) {
            labels.push(`${label_increment * i} - ${label_increment * (i + 1)}`);
        }
        this.$emit('stats_updated', this.descriptive_stats);
        return [buckets, labels];
    }

    get descriptive_stats() {
        return {
            mean: this.mean.toFixed(2),
            stdev: this.stdev?.toFixed(2),
            q1: this.percentile(25).toFixed(2),
            median: this.median?.toFixed(2),
            q3: this.percentile(75).toFixed(2),
            min: Math.min(...this.d_percentages).toFixed(2),
            max: Math.max(...this.d_percentages).toFixed(2),
        };
    }

    get mean() {
        return this.d_percentages.reduce(
            (total, current_val) => total + current_val) / this.d_percentages.length;
    }

    get median() {
        if (this.sorted_percentages.length === 0) {
            return null;
        }

        if (this.sorted_percentages.length % 2 !== 0) {
            return this.sorted_percentages[Math.floor(this.sorted_percentages.length / 2)];
        }

        let left = Math.floor(this.sorted_percentages.length / 2);
        let right = left - 1;
        return (this.sorted_percentages[left] + this.sorted_percentages[right]) / 2;
    }

    get stdev() {
        if (this.d_percentages.length === 0) {
            return null;
        }

        let sum_of_squares = this.d_percentages.reduce(
            (sum, current_value) => sum + Math.pow((current_value - this.mean), 2)
        );
        return Math.sqrt(sum_of_squares / this.d_percentages.length);
    }

    percentile(p: number) {
        let rank = (p / 100) * (this.sorted_percentages.length - 1) + 1;
        let int_part = Math.floor(rank);
        let float_part = rank % 1;

        if (rank === 0) {
            return 0;
        }
        if (rank === this.sorted_percentages.length) {
            return this.sorted_percentages[this.sorted_percentages.length - 1];
        }
        return this.sorted_percentages[int_part - 1]
            + float_part
            * (this.sorted_percentages[int_part] - this.sorted_percentages[int_part - 1]);
    }

    get sorted_percentages() {
        return this.d_percentages.slice().sort((first, second) => first - second);
    }
}
