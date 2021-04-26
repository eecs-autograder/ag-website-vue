<template>
  <!-- See https://www.chartjs.org/docs/latest/configuration/responsive.html#important-note -->
  <div style="position: relative; height: 70vh">
    <canvas ref="submissions_over_time_canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { BarController, BarElement, CategoryScale, Chart, Legend, Tooltip } from 'chart.js';

import { assert_not_null } from '@/utils';

Chart.register(BarElement, BarController, CategoryScale);
Chart.register(Legend, Tooltip);

@Component
export default class SubmissionScoreHistogramChart extends Vue {
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

  d_chart: Chart | null = null;

  mounted() {
    this.update_chart();
  }

  @Watch('all_percentages')
  on_all_percentages_change() {
    this.update_chart();
  }

  update_chart() {
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
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: '% Score'
              },
            },
            y: {
              ticks: {
                // Only use integer y ticks
                callback: value => Number(value) % 1 === 0 ? value : undefined
              },
              title: {
                  display: true,
                  text: '# of Students'
              }
            }
          }
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
</script>
