<template>
  <div class="datetime-picker" v-if="d_is_open">

    <div class="calendar">
      <div class="calendar-header">
        <button type="button" @click="go_to_prev_month" class="prev-month-button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="display-month-and-year">
          {{months[d_month - 1]}} <span>{{d_year}}</span>
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

    <time-picker v-model="d_time"
                 @input="update_time_selected"
                 ref="time_picker"
                 class="time-picker"></time-picker>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { DateTime } from 'luxon';

import TimePicker from "@/components/datetime/time_picker.vue";

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

  d_date: DateTime = DateTime.now();
  d_time: string = '12:00';

  private d_is_open = false;

  d_selected_day: number | null = null;
  d_selected_month: number | null = null;
  d_selected_year: number | null = null;

  d_month = DateTime.now().month;  // The current month shown on the calendar
  d_year = DateTime.now().year;  // The current year shown on the calendar

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

    this.d_year = this.d_date.year;
    this.d_month = this.d_date.month;
    this.calculate_days();
  }

  set_date_and_time(value: string | null) {
    if (value === null) {
      this.d_date = DateTime.now();
    }
    else {
      this.d_date = DateTime.fromISO(value);
      if (!this.d_date.isValid) {
        throw new InvalidDatetimeStrError(
          `Invalid datetime string: ${value}\n`
          + `Reason: ${this.d_date.invalidReason}\n`
          + `Explanation: ${this.d_date.invalidExplanation}`
        );
      }

      this.d_selected_day = this.d_date.day;
      this.d_selected_month = this.d_date.month;
      this.d_selected_year = this.d_date.year;
    }

    this.d_time = DateTime.fromObject({
      hour: this.d_date.hour,
      minute: this.d_date.minute
    }).toFormat('HH:mm');
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
    if (this.d_month === this.months.length) {
      this.d_year += 1;
      this.d_month = 1;
    }
    else {
      this.d_month += 1;
    }
    this.calculate_days();
  }

  go_to_prev_month() {
    if (this.d_month === 1) {
      this.d_month = this.months.length;
      this.d_year -= 1;
    }
    else {
      this.d_month -= 1;
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
    this.d_date = this.d_date.set({
      year: this.d_selected_year,
      month: this.d_selected_month,
      day: this.d_selected_day,
    });
    this.$emit('input', this.d_date.toISO());
  }

  update_time_selected() {
    let time = DateTime.fromISO(this.d_time);
    this.d_date = this.d_date.set({hour: time.hour, minute: time.minute});
    if (this.d_selected_day !== null) {
      this.$emit('input', this.d_date.toISO());
    }
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

.calendar, .time-picker {
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
  justify-content: space-evenly;
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

.time-picker {
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 100%;
  max-width: 210px;
}

</style>
