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

import { Submission } from 'ag-client-typescript';
import { BarController, BarElement, Chart, Legend, LinearScale, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-moment';
// @ts-ignore
import * as zoom_plugin from 'chartjs-plugin-zoom';
import moment from "moment-timezone";

import { assert_not_null } from '@/utils';

Chart.register(LinearScale, TimeScale, BarElement, BarController);
Chart.register(zoom_plugin.default, Legend, Tooltip);

@Component
export default class SubmissionsOverTimeGraph extends Vue {
  @Prop({required: true})
  submissions!: Submission[];

  d_timezone: string = moment.tz.guess();
  d_chart: Chart<'bar', {x: moment.Moment, y: number}[]> | null = null;

  mounted() {
    this.create_chart();
  }

  destroyed() {
    this.d_chart?.destroy();
  }

  @Watch('submissions')
  on_submissions_change() {
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
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'Submissions Per Hour',
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
                text: 'Time'
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
                }
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
                text: '# of Submissions'
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
            // @ts-ignore
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              },
              zoom: {
                enabled: true,
                mode: 'x',
                // @ts-ignore
                wheelModifierKey: 'shift',
              }
            },
          }
        },
      },
    );
  }

  compute_data_points() {
    if (this.submissions.length === 0) {
      return [];
    }

    let timestamps = this.submissions.map(submission => moment(submission.timestamp));
    timestamps.sort((first, second) => first.diff(second));

    // The first and last ticks should be the nearest hour before/after the
    // first and last submissions.
    let start = moment(timestamps[0]).minutes(0).seconds(0).milliseconds(0);
    let end = moment(
      timestamps[timestamps.length - 1]
    ).add(1, 'hour').minutes(0).seconds(0).milliseconds(0);

    let num_hours = Math.ceil(moment.duration(end.diff(start)).asHours());
    // console.log(num_hours);
    let buckets: number[] = Array(num_hours).fill(0);

    for (let timestamp of timestamps) {
      // console.log(timestamp)
      let offset = moment.duration(timestamp.diff(start));
      // console.log(offset.asHours());
      buckets[Math.floor(offset.asHours())] += 1;
    }

    let result = [];
    for (let i = 0; i < num_hours; ++i) {
      result.push({
        x: start.clone().add(i, 'hour').set('second', 0).set('millisecond', 0),
        y: buckets[i],
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
