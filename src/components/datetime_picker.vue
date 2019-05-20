<template>
  <div id="datetime-picker" v-if="is_open">

    <div id="calender">

      <div class="calender-header">
        <button @click="go_to_prev_month" class="prev-month-button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="display-month-and-year"> {{months[month]}} <span> {{year}} </span> </div>
        <button @click="go_to_next_month" class="next-month-button">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <div class="calender-body">
        <table>
          <tr class="days-of-the-week">
            <th v-for="day of days"> {{day}} </th>
          </tr>
          <tr class="week" v-for="(row, row_num) of num_rows">
            <td :class="{'empty-week': calender[row_num][col_num] === 0}"
                v-for="(col, col_num) of num_cols">
              <div class="date">
                <div v-if="calender[row_num][col_num] !== 0"
                     :class="[{'select-date': calender[row_num][col_num] !== 0},
                             {'active-day': calender[row_num][col_num] === selected_day
                                            && year === selected_year && month === selected_month}]"
                     @click="update_day_selected(calender[row_num][col_num])">
                    {{calender[row_num][col_num] === 0 ? ' ' : calender[row_num][col_num]}}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>

    </div>

    <div id="timepicker">
      <div class="timepicker-header">

        <div class="time-unit-col">
          <button @click="go_to_next_hour" class="up-button">
            <i class="fas fa-chevron-up up-arrow"></i>
          </button>

          <div>
            <input type="text"
                   id="hour-input"
                   v-model="hours_str"
                   @keydown="validate_hours"
                   @blur="fix_hours">
          </div>
          <button @click="go_to_prev_hour" class="down-button">
            <i class="fas fa-chevron-down down-arrow"></i>
          </button>
        </div>

        <div> : </div>

        <div class="time-unit-col">
          <button @click="go_to_next_minute" class="up-button">
            <i class="fas fa-chevron-up up-arrow"></i>
          </button>
          <div>
            <input type="text"
                   id="minute-input"
                   v-model="minutes_str"
                   @keydown="validate_minutes"
                   @blur="fix_minutes"/>
          </div>
          <button @click="go_to_prev_minute" class="down-button">
            <i class="fas fa-chevron-down down-arrow"></i>
          </button>
        </div>

        <div class="time-unit-col">
          <button @click="toggle_period_value" class="up-button">
            <i class="fas fa-chevron-up up-arrow"></i>
          </button>
          <div>
            <input type="text"
                   id="period-input"
                   v-model="period_str"
                   @keydown.prevent/>
          </div>

          <button @click="toggle_period_value" class="down-button">
            <i class="fas fa-chevron-down down-arrow"></i>
          </button>
        </div>

      </div>

      <div class="timepicker-footer">
        <div class="timezone">
          <dropdown ref="dropdown_timezone"
                    :items="timezones"
                    @update_item_selected="timezone_selected = $event">
            <template slot="header">
              <div tabindex="1" class="dropdown-header-wrapper">
                <div id="timezone-dropdown" class="dropdown-header">
                  {{timezone_selected}}
                  <i class="fas fa-caret-down dropdown-caret"></i>
                </div>
              </div>
            </template>
            <span slot-scope="{item}">
              <span class="timezone-item">{{item}}</span>
            </span>
          </dropdown>
        </div>
      </div>
    </div>
  </div>
</template>2

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  import Dropdown from '@/components/dropdown.vue';

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

  days = [
    "Su",
    "M",
    "Tu",
    "W",
    "Th",
    "F",
    "Sa"
  ];

  timezones = [
    'US/Central',
    'US/Eastern',
    'US/Mountain',
    'US/Pacific',
    'UTC'
  ];

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

  timezone_selected = this.timezones[0];

  calender = [
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0]
  ];

  d_date!: Date;

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

  fix_hours() {
    if (!this.is_number(this.hours_str) || Number(this.hours_str) <= 0) {
      this.hours_str = "01";
    }
    else if (Number(this.hours_str) >= 13) {
      this.hours_str = "12";
    }
    else if (Number(this.hours_str) < 10 && this.hours_str.length <= 1) {
      this.hours_str = '0' + this.hours_str;
    }
    this.update_time_selected();
  }

  validate_minutes(event: KeyboardEvent) {
    if (event.key === "ArrowUp") {
      this.go_to_next_minute();
    }
    else if (event.key === "ArrowDown") {
      this.go_to_prev_minute();
    }
    else if (this.is_number(event.key) || event.key === "Backspace"
        || event.key === "ArrowLeft" || event.key === "ArrowRight") {
      if (this.is_number(event.key)) {
        if (this.minutes_str.length == 2) {
          event.preventDefault();
        }
      }
    }
    else {
      event.preventDefault();
    }
  }

  validate_hours(event: KeyboardEvent) {
    if (event.key === "ArrowUp") {
      this.go_to_next_hour();
    }
    else if (event.key === "ArrowDown") {
      this.go_to_prev_hour();
    }
    else if (this.is_number(event.key) || event.key === "Backspace"
        || event.key === "ArrowLeft" || event.key === "ArrowRight") {
      if (this.is_number(event.key)) {
        if (this.hours_str.length >= 2) {
          event.preventDefault();
        }
      }
    }
    else {
      event.preventDefault();
    }
  }

  fix_minutes() {
    if (!this.is_number(this.minutes_str) || Number(this.minutes_str) < 0) {
      this.minutes_str = "00";
    }
    else if (Number(this.minutes_str) >= 60) {
      this.minutes_str = "59";
    }
    else if (Number(this.minutes_str) < 10 && this.minutes_str.length <= 1) {
      this.minutes_str = '0' + this.minutes_str;
    }
    this.update_time_selected();
  }

  go_to_next_month() {
    if (this.month == 11) {
      this.year += 1;
    }
    this.month = (this.month + 1) % this.months.length;
    this.calculate_days();
  }

  go_to_prev_month() {
    if (this.month == 0) {
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

    this.calender = [
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0]
    ];

    for (let row = 0; row < this.num_rows; ++row) {
      for (let col = 0; col < this.num_cols; ++col) {
        if (offset === 0) {
          if (day_count > last_day.getDate()) {
            break;
          }
          this.calender[row][col] = day_count;
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
  }

}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';

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
  padding-bottom: 5px;
}

td {
  border: 1px solid transparent;
  padding: 4px;
  text-align: center;
}

.empty-week {
  padding: 0;
  border: none;
}

.select-date {
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
}

.select-date:hover {
  background-color: $white-gray;
}

.active-day, .active-day:hover {
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

#hour-input, #minute-input, #period-input {
  background-color: #fff;
  border-radius: .25rem;
  border: 1px solid #ced4da;
  box-sizing: border-box;
  color: #495057;
  font-family: $current-lang-choice;
  font-size: 1rem;
  line-height: 1;
  padding: 5px 5px;
  text-align: center;
  width: 40px;
}

#period-input {
  cursor: default;
}

#period-input:focus {
  cursor: default;
}

#hour-input:focus, #minute-input:focus, #period-input:focus {
  outline: none;
  box-shadow: 0 0 2px 1px teal;
}

.up-button, .down-button {
  background-color: lighten($white-gray, 2);
  border: 1px solid lighten($white-gray, 1);
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
  background-color: $white-gray;
  border-radius: 5px;
}

.up-button:active, .down-button:active {
  background-color: darken($white-gray, 5);
}

.timepicker-footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 0 0 30px 0;
}

// TIMEZONE DROPDOWN ****************************************************

#timezone-dropdown {
  width: 160px;
}

.dropdown-header-wrapper {
  display: inline-block;
  margin: 0;
  position: relative;
}

.dropdown-header {
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  box-sizing: border-box;
  color: #495057;
  cursor: default;
  display: block;
  font-size: .92rem;
  line-height: 1.5;
  padding: .375rem .75rem;
  position: relative;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.dropdown-header:focus {
  border-color: $ocean-blue;
}

.dropdown-caret {
  cursor: pointer;
  font-size: 30px;
  position: absolute;
  right: 18px;
  top: 3px;
}

.timezone-item {
  font-size: 14px;
  padding: 0;
}

</style>
