<template>
  <div id="timepicker">
    <div class="timepicker-header">

      <div class="time-unit-col">
        <button type="button"
                ref="next_hour_button"
                @click="go_to_next_hour"
                class="up-button">
          <i class="fas fa-chevron-up up-arrow"></i>
        </button>
        <div>
          <input type="text"
                 ref="hour_input"
                 id="hour-input"
                 :value="hours_str"
                 @keydown="update_hours">
        </div>
        <button type="button"
                ref="prev_hour_button"
                @click="go_to_prev_hour"
                class="down-button">
          <i class="fas fa-chevron-down down-arrow"></i>
        </button>
      </div>

      <div> : </div>

      <div class="time-unit-col">
        <button type="button"
                ref="next_minute_button"
                @click="go_to_next_minute"
                class="up-button">
          <i class="fas fa-chevron-up up-arrow"></i>
        </button>
        <div>
          <input type="text"
                 ref="minute_input"
                 id="minute-input"
                 :value="minutes_str"
                 @keydown="update_minutes"/>
        </div>
        <button type="button"
                ref="prev_minute_button"
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
                 v-model="am_pm_str"
                 @click="toggle_period_value"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
// @ts-ignore

import moment from 'moment';

export class Time {
  readonly hours: number;
  readonly minutes: number;

  constructor(hours: number = 12, minutes: number = 0) {
    this.hours =  hours;
    this.minutes = minutes;
  }

  with_hours(hours: number) {
    return new Time(hours, this.minutes);
  }

  with_minutes(minutes: number) {
    return new Time(this.hours, minutes);
  }

  static from_moment(moment_: moment.Moment): Time {
    return new Time(moment_.hours(), moment_.minutes());
  }

  as_moment() {
    return moment({hours: this.hours, minutes: this.minutes});
  }
}

export enum HourInputState {
  awaiting_first_digit,
  first_digit_was_one
}

export enum MinuteInputState {
  awaiting_first_digit,
  awaiting_second_digit
}

@Component
export default class TimePicker extends Vue {
  @Prop({type: String, default: '12:00'})
  value!: string;

  @Watch('value')
  on_value_changed(new_value: string, old_value: string) {
    this.set_d_time(new_value);
  }

  d_time: Time = new Time();

  hour_input_state: HourInputState = HourInputState.awaiting_first_digit;
  minute_input_state: MinuteInputState = MinuteInputState.awaiting_first_digit;

  created() {
    this.set_d_time(this.value);
  }

  set_d_time(value: string | null) {
    if (value === null) {
      this.d_time = new Time();
      return;
    }

    let time = moment(this.value, ['HH:mm', 'HH:mm:ss']);
    if (!time.isValid()) {
      throw new InvalidTimeStrError(`Invalid time string: ${value}`);
    }

    this.d_time = new Time(time.hours(), time.minutes());
  }

  get hours_str(): string {
    return this.d_time.as_moment().format('hh');
  }

  get minutes_str(): string {
    return this.d_time.as_moment().format('mm');
  }

  get am_pm_str() {
    return this.d_time.as_moment().format('A');
  }

  // Note: When incrementing/decrementing hours and minutes, we don't want changing
  // minutes to change hours, so we won't use moment's add or subtract methods.
  go_to_next_minute() {
    this.d_time = this.d_time.with_minutes((this.d_time.minutes + 1) % 60);
    this.update_time_selected();
  }

  go_to_prev_minute() {
    // +59 and -1 are equivalent mod 60
    this.d_time = this.d_time.with_minutes((this.d_time.minutes + 59) % 60);
    this.update_time_selected();
  }

  go_to_next_hour() {
    this.d_time = this.d_time.with_hours((this.d_time.hours + 1) % 24);
    this.update_time_selected();
  }

  go_to_prev_hour() {
    // +23 and -1 are equivalent mod 24
    this.d_time = this.d_time.with_hours((this.d_time.hours + 23) % 24);
    this.update_time_selected();
  }

  update_minutes(event: KeyboardEvent) {
    event.preventDefault();
    if (event.code === "ArrowUp") {
      this.go_to_next_minute();
    }
    else if (event.code === "ArrowDown") {
      this.go_to_prev_minute();
    }
    else if (event.code === "Backspace") {
      this.d_time = this.d_time.with_minutes(0);
      this.update_time_selected();
    }
    else if (this.is_number(event.key)) {
      if (this.minute_input_state === MinuteInputState.awaiting_first_digit) {
        this.d_time = this.d_time.with_minutes(Number(event.key));
        this.update_time_selected();
        if (Number(event.key) <= 5) {
          this.minute_input_state = MinuteInputState.awaiting_second_digit;
        }
      }
      else if (this.minute_input_state === MinuteInputState.awaiting_second_digit) {
        this.d_time = this.d_time.with_minutes(
          this.d_time.minutes * 10 + Number(event.key));
        this.minute_input_state = MinuteInputState.awaiting_first_digit;
        this.update_time_selected();
      }
    }
  }

  update_hours(event: KeyboardEvent) {
    event.preventDefault();
    if (event.code === "ArrowUp") {
      this.go_to_next_hour();
    }
    else if (event.code === "ArrowDown") {
      this.go_to_prev_hour();
    }
    else if (event.code === "Backspace") {
      this.d_time = this.d_time.with_hours(12);
      this.update_time_selected();
    }
    else if (this.is_number(event.key)) {
      if (this.hour_input_state === HourInputState.awaiting_first_digit && event.key !== '0') {
        this.d_time = this.d_time.with_hours(Number(event.key));
        this.update_time_selected();
        if (event.key === '1') {
          this.hour_input_state = HourInputState.first_digit_was_one;
        }
      }
      else if (this.hour_input_state === HourInputState.first_digit_was_one) {
        if (Number(event.key) > 2) {
          this.d_time = this.d_time.with_hours(Number(event.key));
        }
        else {
          this.d_time = this.d_time.with_hours(this.d_time.hours * 10 + Number(event.key));
        }
        this.hour_input_state = HourInputState.awaiting_first_digit;
        this.update_time_selected();
      }
    }
  }

  is_number(str: string) {
    if (str.trim() === '') {
      return false;
    }
    return !isNaN(Number(str.trim()));
  }

  toggle_period_value() {
    if (this.am_pm_str === "AM") {
      this.d_time = Time.from_moment(this.d_time.as_moment().add(12, 'hours'));
    }
    else {
      this.d_time = Time.from_moment(this.d_time.as_moment().subtract(12, 'hours'));
    }
    this.update_time_selected();
  }

  update_time_selected() {
    this.$emit('input', this.d_time.as_moment().format('HH:mm'));
  }
}

export class InvalidTimeStrError extends Error {
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

#timepicker {
  display: flex;
  flex-direction: column;
  justify-content: center;
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
