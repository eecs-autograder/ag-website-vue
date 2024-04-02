<template>
  <div>
    <div class="controls-wrapper">
      <div>
        <select v-model="d_timezone" class="select">
          <option v-for="timezone of timezones" :value="timezone" :key="timezone">
            {{timezone}}
          </option>
        </select>
      </div>
      <div class="zoom-buttons-wrapper">
        Use shift + scroll wheel to zoom.
        <!-- We might add zoom buttons later -->
        <!-- <div>
          <button type="button" class="white-button">
            <i class="fas fa-search-minus"></i>
          </button>
        </div>
        <div>
          <button type="button" class="white-button">
            <i class="fas fa-search-plus"></i>
          </button>
        </div> -->
      </div>
    </div>

    <!-- See https://www.chartjs.org/docs/latest/configuration/responsive.html#important-note -->
    <div style="position: relative; height: 70vh">
      <canvas ref="submissions_over_time_canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { FullUltimateSubmissionResult } from 'ag-client-typescript';
import { Chart, Legend, LinearScale, LineElement, PointElement, ScatterController, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-moment';
import * as zoom_plugin from 'chartjs-plugin-zoom';
import moment from "moment-timezone";

import { SafeMap } from '@/safe_map';
import { assert_not_null } from '@/utils';

import { FirstSubmissionData } from './project_stats.vue';

Chart.register(LinearScale, TimeScale, ScatterController, PointElement, LineElement);
Chart.register(zoom_plugin.default, Legend, Tooltip);

@Component
export default class FirstSubmissionTimeVsFinalScore extends Vue {
  @Prop({required: true})
  ultimate_submission_entries!: FullUltimateSubmissionResult[];

  @Prop({required: true})
  first_submissions_by_group!: SafeMap<number, FirstSubmissionData>;

  d_timezone: string = moment.tz.guess();
  d_chart: Chart<'scatter', {x: string, y: number}[]> | null = null;

  mounted() {
    this.create_chart();
  }

  @Watch('ultimate_submission_entries')
  on_ultimate_submission_entries_change() {
    if (this.d_chart !== null) {
      this.d_chart.data.datasets[0].data = this.compute_data_points();
      this.d_chart.update();
    }
  }

  @Watch('d_timezone')
  on_timezone_change(new_value: string, old_value: string) {
    this.d_chart?.update();
  }

  get timezones() {
    return moment.tz.names();
  }

  create_chart() {
    let context = (<HTMLCanvasElement> this.$refs.submissions_over_time_canvas).getContext('2d');
    assert_not_null(context);
    this.d_chart = new Chart(
      context,
      {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Final Score vs. First Submission Time',
              backgroundColor: '#f87979',
              data: this.compute_data_points(),
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              title: {
                display: true,
                text: 'Time of First Submission'
              },
              time: {
                unit: 'hour',
                stepSize: 1,
              },
              bounds: 'data',
              ticks: {
                callback: (value, index, values) => {
                  let res = moment(
                    values[index].value
                  ).tz(this.d_timezone).format('MMM D, h:mm a z');
                  return res;
                },
              },
            },
            y: {
              type: 'linear',
              ticks: {
                // Only use integer y ticks
                callback: value => Number(value) % 1 === 0 ? value : undefined
              },
              title: {
                display: true,
                text: '% Score'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  return moment(ctx.parsed.x).tz(this.d_timezone).format('MMM D, YYYY, h:mm a z');
                },
                title: ctx => ''
              }
            },
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              },
              zoom: {
                mode: 'x',
                wheel: {
                  enabled: true,
                  modifierKey: 'shift',
                },
                pinch: {
                  enabled: true
                }
              }
            },
          }
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
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

.controls-wrapper {
  margin: 1rem 0;
  max-width: 600px;

  display: flex;
  align-items: center;

  .zoom-buttons-wrapper {
    display: flex;
    margin-left: .75rem;

    & > * {
      margin-right: .125rem;
    }
  }
}
</style>
