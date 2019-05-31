<template>
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
                 :value="hours_str"
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
                 :value="minutes_str"
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
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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

    @Prop({type: Time, default: () => new Time()})
    value!: Time;

    @Watch('value')
    on_value_changed(new_value: Time, old_value: Time) {
      this.d_time = new Time(new_value.hours, new_value.minutes);
    }

    d_time: Time = new Time();

    // hours_str = '12';
    // minutes_str = '00';
    // period_str: "AM" | "PM" = 'PM';

    hour_input_state: HourInputState = HourInputState.awaiting_first_digit;
    minute_input_state: MinuteInputState = MinuteInputState.awaiting_first_digit;

    created() {
      this.d_time = new Time(this.value.hours, this.value.minutes);
    }

    get hours_str(): string {
      let hours = this.d_time.hours % 12;
      if (hours === 0) {
        return "12";
      }
      if (hours < 10) {
        return "0" + hours.toString();
      }

      return hours.toString();
    }

    get minutes_str(): string {
      return this.d_time.minutes < 10 ? '0' + this.d_time.minutes.toString()
                                      : this.d_time.minutes.toString();
    }

    get period_str() {
      return this.d_time.hours < 12 ? "AM" : "PM";
    }

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
          this.d_time = this.d_time.with_minutes(this.d_time.minutes * 10 + Number(event.key));
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
        this.update_time_selected()
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
      if (this.period_str === "AM") {
        this.d_time = this.d_time.with_hours(this.d_time.hours + 12);
      }
      else {
        this.d_time = this.d_time.with_hours(this.d_time.hours - 12);
      }
      this.update_time_selected();
    }

    update_time_selected() {
      this.$emit('input', this.d_time);
      // let hours = this.period_str === "AM" ? Number(this.hours_str) % 12
      //   : (Number(this.hours_str) % 12) + 12;
      // this.d_date.setHours(hours, Number(this.minutes_str));
      // this.$emit('input', this.d_date.toISOString());
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import '@/styles/button_styles.scss';

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
