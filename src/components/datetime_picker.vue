<template>
  <div id="datetime-picker" v-if="is_open">

    <div id="calender">
      <div class="calender-header">
        <button @click="go_to_prev_month" class="prev-month-button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="display-month-and-year">
          {{months[month]}} <span>{{year}}</span>
        </div>
        <button @click="go_to_next_month" class="next-month-button">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="calender-body">
        <table>
          <tr class="days-of-the-week">
            <th v-for="day of days_of_the_week">{{day}}</th>
          </tr>
          <tr class="week" v-for="(row, row_num) of num_rows">
            <td v-for="(col, col_num) of num_cols"
                :class="{'unavailable-day': calender[row_num][col_num] === 0}">
              <div v-if="calender[row_num][col_num] !== 0"
                   :class="['available-day',
                           {'selected-day': calender[row_num][col_num] === selected_day
                                           && year === selected_year
                                           && month === selected_month}]"
                   @click="update_day_selected(calender[row_num][col_num])">
                  {{calender[row_num][col_num]}}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div id="timepicker">
      <div class="timepicker-header">

        <div class="time-unit-col">
          <button ref="next_hour_button"
                  @click="go_to_next_hour"
                  class="up-button">
            <i class="fas fa-chevron-up up-arrow"></i>
          </button>
          <div>
            <input type="text"
                   ref="hour_input"
                   id="hour-input"
                   v-model="hours_str"
                   @keydown="update_hours">
          </div>
          <button ref="prev_hour_button"
                  @click="go_to_prev_hour"
                  class="down-button">
            <i class="fas fa-chevron-down down-arrow"></i>
          </button>
        </div>

        <div> : </div>

        <div class="time-unit-col">
          <button ref="next_minute_button"
                  @click="go_to_next_minute"
                  class="up-button">
            <i class="fas fa-chevron-up up-arrow"></i>
          </button>
          <div>
            <input type="text"
                   ref="minute_input"
                   id="minute-input"
                   v-model="minutes_str"
                   @keydown="update_minutes"/>
          </div>
          <button ref="prev_minute_button"
                  @click="go_to_prev_minute"
                  class="down-button">
            <i class="fas fa-chevron-down down-arrow"></i>
          </button>
        </div>

        <div></div>

        <div class="time-unit-col">
          <div>
            <input id="period-input"
                   type="button"
                   v-model="period_str"
                   @click="toggle_period_value"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Dropdown from '@/components/dropdown.vue';

export enum HourInputState {
  awaiting_first_digit,
  first_digit_was_one,
  first_digit_was_zero
}

export enum MinuteInputState {
  awaiting_first_digit,
  awaiting_second_digit
}

@Component({
  components: {
    Dropdown
  }
})
export default class DatetimePicker extends Vue {

  @Prop({default: '', type: String})
  value!: string;

  @Watch('value')
  on_value_changed(new_value: string, old_value: string) {
    this.d_date = new Date(new_value);
  }

  months = [
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

  days_of_the_week = [
    "Su",
    "M",
    "Tu",
    "W",
    "Th",
    "F",
    "Sa"
  ];

  d_date!: Date;
  is_open = false;
  num_rows = 6;
  num_cols = 7;
  selected_day = 0;
  month = 0;
  selected_month = 0;
  year = 2000;
  selected_year = 0;
  hours_str = '12';
  minutes_str = '00';
  period_str = "PM";
  calender: number[][] = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ];

  hour_input_state: HourInputState = HourInputState.awaiting_first_digit;
  minute_input_state: MinuteInputState = MinuteInputState.awaiting_first_digit;

  toggle_show_hide() {
    this.is_open = !this.is_open;
  }

  toggle_period_value() {
    if (this.period_str === "AM") {
      this.period_str = "PM";
    }
    else {
      this.period_str = "AM";
    }
    this.update_time_selected();
  }

  is_number(str: string) {
    if (str.trim() === '') {
      return false;
    }
    return !isNaN(Number(str.trim()));
  }

  go_to_next_minute() {
    let minutes = (Number(this.minutes_str) + 1) % 60;
    this.minutes_str = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
    this.update_time_selected();
  }

  go_to_prev_minute() {
    let minutes = Number(this.minutes_str) - 1;
    if (minutes === -1) {
      minutes = 59;
    }
    this.minutes_str = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
    this.update_time_selected();
  }

  go_to_next_hour() {
    let hours = (Number(this.hours_str) + 1) % 13;
    if (hours === 0) {
      hours = 1;
    }
    this.hours_str = hours < 10 ? '0' + hours.toString() : hours.toString();
    this.update_time_selected();
  }

  go_to_prev_hour() {
    let hours = Number(this.hours_str) - 1;
    if (hours === 0) {
      hours = 12;
    }
    this.hours_str = hours < 10 ? '0' + hours.toString() : hours.toString();
    this.update_time_selected();
  }

  update_minutes(event: KeyboardEvent) {
    if (event.code === "ArrowUp") {
      this.go_to_next_minute();
    }
    else if (event.code === "ArrowDown") {
      this.go_to_prev_minute();
    }
    else if (event.code === "Backspace") {
      this.minutes_str = "";
    }
    else if (this.is_number(event.key)) {
      event.preventDefault();
      if (this.minute_input_state === MinuteInputState.awaiting_first_digit) {
        this.minutes_str = "0" + event.key;
        this.update_time_selected();
        if (Number(event.key) <= 5) {
          this.minute_input_state = MinuteInputState.awaiting_second_digit;
        }
      }
      else if (this.minute_input_state === MinuteInputState.awaiting_second_digit) {
        this.minutes_str = (Number(this.minutes_str) + event.key).toString();
        this.minute_input_state = MinuteInputState.awaiting_first_digit;
        this.update_time_selected();
      }
    }
    else {
      event.preventDefault();
    }
  }

  update_hours(event: KeyboardEvent) {
    if (event.code === "ArrowUp") {
      this.go_to_next_hour();
    }
    else if (event.code === "ArrowDown") {
      this.go_to_prev_hour();
    }
    else if (event.code === "Backspace") {
      this.hours_str = "";
    }
    else if (this.is_number(event.key)) {
      event.preventDefault();
      if (this.hour_input_state === HourInputState.awaiting_first_digit) {
        this.hours_str = "0" + event.key;
        this.update_time_selected();
        if (event.key === '0') {
          this.hour_input_state = HourInputState.first_digit_was_zero;
        }
        else if (event.key === '1') {
          this.hour_input_state = HourInputState.first_digit_was_one;
        }
      }
      else if (this.hour_input_state === HourInputState.first_digit_was_zero) {
        this.hours_str = "0" + event.key;
        if (Number(this.hours_str) === 0) {
          this.hours_str = "01";
        }
        this.hour_input_state = HourInputState.awaiting_first_digit;
        this.update_time_selected();
      }
      else if (this.hour_input_state === HourInputState.first_digit_was_one) {
        this.hours_str = Number(this.hours_str) + event.key;
        if (Number(this.hours_str) > 12) {
          this.hours_str = "12";
        }
        this.hour_input_state = HourInputState.awaiting_first_digit;
        this.update_time_selected();
      }
    }
    else {
      event.preventDefault();
    }
  }

  go_to_next_month() {
    if (this.month === 11) {
      this.year += 1;
    }
    this.month = (this.month + 1) % this.months.length;
    this.calculate_days();
  }

  go_to_prev_month() {
    if (this.month === 0) {
      this.month = this.months.length - 1;
      this.year -= 1;
    }
    else {
      this.month = this.month - 1;
    }
    this.calculate_days();
  }

  calculate_days() {
    let first_day = new Date(this.year, this.month, 1);
    let last_day = new Date(this.year, this.month + 1, 0);
    let offset = first_day.getDay();
    let day_count = 1;

    for (let row = 0; row < this.num_rows; ++row) {
      for (let col = 0; col < this.num_cols; ++col) {
        if (offset === 0) {
          this.calender[row][col] = day_count > last_day.getDate() ? 0 : day_count;
          day_count += 1;
        }
        else {
          this.calender[row][col] = 0;
          offset--;
        }
      }
    }
  }

  update_day_selected(day: number) {
    this.selected_day = day;
    this.selected_month = this.month;
    this.selected_year = this.year;
    this.d_date.setFullYear(this.selected_year, this.selected_month, this.selected_day);
    this.$emit('input', this.d_date.toISOString());
  }

  update_time_selected() {
    let hours = this.period_str === "AM" ? Number(this.hours_str) % 12
                                         : (Number(this.hours_str) % 12) + 12;
    this.d_date.setHours(hours, Number(this.minutes_str));
    this.$emit('input', this.d_date.toISOString());
  }

  created() {
    if (this.value === null) {
      this.d_date = new Date();
    }
    else {
      this.d_date = new Date(this.value);
    }
    this.year = this.d_date.getFullYear();
    this.month = this.d_date.getMonth();
    this.calculate_days();
    let hours = this.d_date.getHours() % 12;
    this.hours_str = (hours % 12 === 0) ? "12" : hours < 10 ? "0" + hours : hours.toString();
    let minutes = this.d_date.getMinutes();
    this.minutes_str = minutes < 10 ? "0" + minutes : minutes.toString();
    this.period_str = this.d_date.getHours() >= 12 ? "PM" : "AM";
  }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

$current-lang-choice: "Poppins";

// DATETIMEPICKER *******************************************************

#datetime-picker {
  display: flex;
  font-family: $current-lang-choice;
}

// DATEPICKER ***********************************************************

#calender {
  background-color: white;
  box-sizing: border-box;
  box-shadow: 0 0 2px 1px $pebble-dark;
  border-radius: 2px;
  display: inline-block;
  width: 350px;
}

.calender-header {
  align-items: center;
  background-color: teal;
  border-radius: 2px 2px 0 0;
  color: white;
  display: flex;
  flex-wrap: nowrap;
  font-weight: bold;
  justify-content: space-between;
  padding: 15px 20px;
}

.calender-body {
  border-radius: 0 0 2px 2px;
  border-top: none;
  box-sizing: border-box;
  padding: 10px;
}

.prev-month-button, .next-month-button {
  background-color: inherit;
  border: none;
  color: $pebble-light;
  cursor: pointer;
  font-size: 18px;
  padding: 5px 10px 5px 8px;
  text-align: center;
  vertical-align: middle;
}

.prev-month-button:focus, .next-month-button:focus {
  outline: none;
}

.prev-month-button:active, .next-month-button:active {
  color: white;
}

.display-month-and-year {
  font-size: 19px;
  vertical-align: middle;
}

.display-month-and-year span {
  padding-left: 4px;
}

table {
  width: 100%;
}

th {
  border: 1px solid transparent;
  color: lighten(black, 32);
  font-weight: normal;
  padding-bottom: 8px;
}

td {
  border: 1px solid transparent;
  padding: 4px;
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

#timepicker {
  border: 1px solid white;
  border-radius: 2px;
  box-sizing: border-box;
  box-shadow: 0 0 2px 1px $pebble-dark;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 5px;
  position: relative;
  width: 210px;
}

.timepicker-header {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 15px;
  text-align: center;
}

#hour-input, #minute-input {
  background-color: #fff;
  border-radius: .25rem;
  border: 1px solid #ced4da;
  box-sizing: border-box;
  color: #495057;
  font-family: $current-lang-choice;
  font-size: 1rem;
  line-height: 1;
  padding: 5px;
  text-align: center;
  width: 40px;
  height: 38px;
}

#hour-input:focus, #minute-input:focus, #period-input:focus {
  outline: none;
  box-shadow: 0 0 2px 1px teal;
}

#period-input {
  @extend .teal-button;
  color: white;
  /*font-size: 1rem;*/
  width: 40px;
  height: 38px;
  padding: 0;
}

#period-input:focus {
  box-shadow: none;
}

.up-button, .down-button {
  background-color: $white-gray;
  border: 1px solid darken($white-gray, 1);
  border-radius: 5px;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 18px;
  padding: 5px 0;
  width: 100%;
}

.up-button {
  margin-bottom: 10px;
}

.down-button {
  margin-top: 10px;
}

.up-button:focus, .down-button:focus {
  outline: none;
}

.up-button:hover, .down-button:hover {
  background-color: darken($white-gray, 1);
  border: 1px solid darken($white-gray, 2);
  border-radius: 5px;
}

.up-button:active, .down-button:active {
  background-color: darken($white-gray, 5);
  border: 1px solid darken($white-gray, 6);
}

</style>
