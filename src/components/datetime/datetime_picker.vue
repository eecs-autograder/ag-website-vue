<template>
  <div class="datetime-picker" v-if="d_is_open">

    <div class="calendar">
      <div class="calendar-header">
        <button type="button" @click="go_to_prev_month" class="prev-month-button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="display-month-and-year">
          {{months[d_month]}} <span>{{d_year}}</span>
        </div>
        <button type="button" @click="go_to_next_month" class="next-month-button">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="calendar-body">
        <table class="calendar-table">
          <tr class="days-of-the-week">
            <th class="day-of-week" v-for="day of days_of_the_week">{{day}}</th>
          </tr>
          <tr class="week" v-for="(row, row_num) of num_rows">
            <td class="date-cell" v-for="(col, col_num) of num_cols"
                :class="{'unavailable-day': calendar[row_num][col_num] === 0}">
              <div v-if="calendar[row_num][col_num] !== 0"
                   :class="['available-day',
                            {'selected-day': calendar[row_num][col_num] === d_selected_day
                                             && d_year === d_selected_year
                                             && d_month === d_selected_month}]"
                   @click="update_day_selected(calendar[row_num][col_num])">
                {{calendar[row_num][col_num]}}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div class="time-column">
      <time-picker v-model="d_time"
                  @input="update_time_selected"
                  ref="time_picker"></time-picker>

      <select
        :value="d_timezone"
        @change="update_timezone_selected"
        data-testid="timezone-select"
        class="select timezone-select"
      >
        <option v-for="timezone of timezones" :value="timezone" :key="timezone">
          {{timezone}}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

// @ts-ignore
import moment from 'moment';

import TimePicker from "@/components/datetime/time_picker.vue";
import { assert_not_null } from '@/utils';

@Component({
  components: {
    TimePicker
  }
})
export default class DatetimePicker extends Vue {

  @Prop({default: null, type: String})
  value!: string;

  @Watch('value')
  on_value_changed(new_value: string | null, old_value: string | null) {
    this.set_date_and_time(new_value);
  }

  d_date: moment.Moment = moment();
  d_time: string = '12:00';

  private d_is_open = false;

  d_selected_day: number | null = null;
  d_selected_month: number | null = null;
  d_selected_year: number | null = null;

  d_month = moment().month();  // The current month shown on the calendar
  d_year = moment().year();  // The current year shown on the calendar

  d_timezone: string | null = null;

  calendar: number[][] = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ];

  get num_rows() {
    return this.calendar.length;
  }
  get num_cols() {
    return this.calendar[0].length;
  }

  created() {
    this.set_date_and_time(this.value);

    this.d_year = this.d_date.year();
    this.d_month = this.d_date.month();
    this.calculate_days();
  }

  set_date_and_time(value: string | null) {
    if (value === null) {
      this.d_date = moment();
    }
    else {
      this.d_date = moment(value);
      if (!this.d_date.isValid()) {
        throw new InvalidDatetimeStrError(`Invalid datetime string: ${value}`);
      }

      this.d_selected_day = this.d_date.date();
      this.d_selected_month = this.d_date.month();
      this.d_selected_year = this.d_date.year();
    }
    // We only want to guess the timezone the first time this component
    // instance is inintalized, so that when the user changes the timezone
    // it shows their selected datetime in that timezone unless they refresh
    // the page.
    this.d_timezone = this.d_timezone ?? moment.tz.guess();

    this.d_date.tz(this.d_timezone, false);

    this.d_time = moment({hours: this.d_date.hours(),
                          minutes: this.d_date.minutes()}).format('HH:mm');
  }

  get is_visible() {
    return this.d_is_open;
  }

  toggle_visibility() {
    this.d_is_open = !this.d_is_open;
  }

  show() {
    this.d_is_open = true;
  }

  hide() {
    this.d_is_open = false;
  }

  go_to_next_month() {
    if (this.d_month === 11) {
      this.d_year += 1;
    }
    this.d_month = (this.d_month + 1) % this.months.length;
    this.calculate_days();
  }

  go_to_prev_month() {
    if (this.d_month === 0) {
      this.d_month = this.months.length - 1;
      this.d_year -= 1;
    }
    else {
      this.d_month = this.d_month - 1;
    }
    this.calculate_days();
  }

  calculate_days() {
    let first_day = new Date(this.d_year, this.d_month, 1);
    let last_day = new Date(this.d_year, this.d_month + 1, 0);
    let offset = first_day.getDay();
    let day_count = 1;

    for (let row = 0; row < this.num_rows; ++row) {
      for (let col = 0; col < this.num_cols; ++col) {
        if (offset === 0) {
          this.calendar[row][col] = day_count > last_day.getDate() ? 0 : day_count;
          day_count += 1;
        }
        else {
          this.calendar[row][col] = 0;
          offset--;
        }
      }
    }
  }

  update_day_selected(day: number) {
    this.d_selected_day = day;
    this.d_selected_month = this.d_month;
    this.d_selected_year = this.d_year;
    this.d_date = this.d_date.clone().set({
      year: this.d_selected_year,
      month: this.d_selected_month,
      date: this.d_selected_day,
    });
    this.$emit('input', this.d_date.format());
  }

  update_time_selected() {
    let time = moment(this.d_time, 'HH:mm');
    this.d_date = this.d_date.clone().set({hours: time.hours(), minutes: time.minutes()});
    if (this.d_selected_day !== null) {
      this.$emit('input', this.d_date.format());
    }
  }

  update_timezone_selected(event: Event) {
    let timezone = event?.target?.value;
    assert_not_null(timezone);
    this.d_timezone = timezone;
    this.d_date = this.d_date.tz(timezone, true);
    this.$emit('input', this.d_date.format());
  }

  get timezones() {
    return moment.tz.names();
  }

  readonly months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  readonly days_of_the_week = [
    "Su",
    "M",
    "Tu",
    "W",
    "Th",
    "F",
    "Sa"
  ];
}

export class InvalidDatetimeStrError extends Error {
  // See https://github.com/Microsoft/TypeScript/issues/13965
  __proto__: Error; // tslint:disable-line

  constructor(msg?: string) {
    const actual_proto = new.target.prototype;
    super(msg);
    this.__proto__ = actual_proto;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

// DATETIMEPICKER *******************************************************

.datetime-picker {
  display: flex;
  flex-wrap: wrap;
}

.calendar, .time-column {
  border: 1px solid $pebble-dark;
  border-radius: 2px;
}

// DATEPICKER ***********************************************************

.calendar {
  background-color: white;

  width: 100%;
  max-width: 300px;

  margin-right: .5rem;
}

.calendar-header {
  align-items: center;
  background-color: teal;
  border-radius: 2px 2px 0 0;
  color: white;
  display: flex;
  flex-wrap: nowrap;
  font-weight: bold;
  justify-content: space-between;
  align-items: center;
  padding: .5rem .75rem;
}

.prev-month-button, .next-month-button {
  background-color: inherit;
  border: none;
  color: $pebble-light;
  cursor: pointer;
  font-size: 1.125rem;
  padding: .25rem;
}

.prev-month-button:focus, .next-month-button:focus {
  outline: none;
}

.prev-month-button:active, .next-month-button:active {
  color: white;
}

.display-month-and-year {
  font-size: 1.125rem;
  vertical-align: middle;
}

.calendar-body {
  border-radius: 0 0 2px 2px;
  border-top: none;
  box-sizing: border-box;
  padding: .625rem;
}

.calendar-table {
  width: 100%;
}

.day-of-week {
  border: 1px solid transparent;
  color: lighten(black, 32);
  font-weight: normal;
  padding-bottom: .5rem;
}

.date-cell {
  border: 1px solid transparent;
  padding: .25rem;
  text-align: center;
}

.unavailable-day {
  padding: 0;
  border: none;
}

.available-day {
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
}

.available-day:hover {
  background-color: $white-gray;
}

.selected-day, .selected-day:hover {
  background-color: $dark-pink;
  color: white;
}

// TIMEPICKER ***********************************************************

.time-column {
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 1rem;

  // width: 100%;
  // max-width: 210px;
}

.timezone-select {
  margin-top: .5rem;
}

</style>
