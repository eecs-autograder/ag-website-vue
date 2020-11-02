// CommitChart.ts
import { Bar } from 'vue-chartjs';
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
    extends: Bar,
})
export default class SubmissionScoreHistogramChart extends Mixins(Bar) {
    @Prop({required: true, type: Array})
    all_percentages!: number[];

    @Prop({required: true, type: Array})
    individual_percentages!: number[];

    @Prop({required: true, type: Array})
    group_percentages!: number[];

    @Prop({required: true, type: Number})
    num_buckets!: number;

    get label_increment() {
        return 100 / this.num_buckets;
    }

    mounted() {
        this.update_chart();
    }

    @Watch('all_percentages')
    on_all_percentages_change() {
        this.update_chart();
    }

    update_chart() {
        // Overwriting base render method with actual data.
        this.renderChart(
            {
                labels: this.labels,
                datasets: [
                    {
                        label: 'All Students',
                        backgroundColor: '#38C1C7',
                        data: this.compute_buckets(this.all_percentages)
                    },
                    {
                        label: 'Individuals Only',
                        backgroundColor: '#C738C1',
                        data: this.compute_buckets(this.individual_percentages)
                    },
                    {
                        label: 'Groups Only',
                        backgroundColor: '#C1C738',
                        data: this.compute_buckets(this.group_percentages)
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

    compute_buckets(percentages: number[]) {
        let buckets = Array(this.num_buckets).fill(0);
        for (let score of percentages) {
            // Prevent off-by-one when percent is 100
            let bucket_index = Math.min(
                this.num_buckets - 1,
                Math.floor(score / this.label_increment)
            );
            buckets[bucket_index] += 1;
        }

        return buckets;
    }

    get labels() {
        let labels = [];
        for (let i = 0; i < this.num_buckets; ++i) {
            labels.push(`${this.label_increment * i} - ${this.label_increment * (i + 1)}`);
        }
        return labels;
    }
}
