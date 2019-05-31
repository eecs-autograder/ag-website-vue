import DatetimePicker from '@/components/datetime_picker.vue';
import { config, mount, Wrapper } from '@vue/test-utils';

// @ts-ignore
import * as timezone_mock from 'timezone-mock';

beforeAll(() => {
  config.logModifiedComponents = false;
});

export enum HourInputState {
  awaiting_first_digit,
  first_digit_was_one,
  first_digit_was_zero
}

export enum MinuteInputState {
  awaiting_first_digit,
  awaiting_second_digit
}

beforeEach(() => {
   timezone_mock.register('US/Eastern');
});

afterEach(() => {
   timezone_mock.unregister();
});

describe('TimePicker Tests', () => {
  let wrapper: Wrapper<DatetimePicker>;
  let component: DatetimePicker;

  beforeEach(() => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: "2019-12-25T18:58:40.746Z"
      }
    });
    component = wrapper.vm;
    wrapper.setData({'is_open': true});
  });

  afterEach(() => {
    if (wrapper.exists()) {
      wrapper.destroy();
    }
  });

  test('Pressing the up and down buttons increases/decreases the hours_str respectively',
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.period_str).toEqual("PM");
    expect(component.d_date.getHours()).toEqual(13);

    wrapper.find({ref: 'prev_hour_button'}).trigger('click');
    expect(component.hours_str).toEqual("12");
    expect(component.d_date.getHours()).toEqual(12);

    wrapper.find({ref: 'prev_hour_button'}).trigger('click');
    expect(component.hours_str).toEqual("11");
    expect(component.d_date.getHours()).toEqual(23);

    wrapper.find({ref: 'next_hour_button'}).trigger('click');
    expect(component.hours_str).toEqual("12");
    expect(component.d_date.getHours()).toEqual(12);

    wrapper.find({ref: 'next_hour_button'}).trigger('click');
    expect(component.hours_str).toEqual("01");
    expect(component.d_date.getHours()).toEqual(13);
    expect(wrapper.emitted().input.length).toBe(4);
  });

  test('Pressing the up arrow while the hours input has focus',
       async () => {
    let hours_input = wrapper.find('#hour-input');
    expect(component.hours_str).toEqual("01");
    expect(component.d_date.getHours()).toEqual(13);

    hours_input.trigger('keydown', {code: "ArrowUp"});

    expect(component.hours_str).toEqual("02");
    expect(component.d_date.getHours()).toEqual(14);

    hours_input.trigger('keydown', {code: "ArrowUp"});

    expect(component.hours_str).toEqual("03");
    expect(component.d_date.getHours()).toEqual(15);
    expect(wrapper.emitted().input.length).toBe(2);
  });

  test('Pressing the down arrow while the hours input has focus',
       async () => {
    let hours_input = wrapper.find('#hour-input');
    expect(component.hours_str).toEqual("01");
    expect(component.d_date.getHours()).toEqual(13);

    hours_input.trigger('keydown', {code: "ArrowDown"});
    await component.$nextTick();

    expect(component.hours_str).toEqual("12");
    expect(component.d_date.getHours()).toEqual(12);

    hours_input.trigger('keydown', {code: "ArrowDown"});
    hours_input.trigger('keydown', {code: "ArrowDown"});
    hours_input.trigger('keydown', {code: "ArrowDown"});

    expect(component.hours_str).toEqual("09");
    expect(component.d_date.getHours()).toEqual(21);
    expect(wrapper.emitted().input.length).toBe(4);
  });


  test('Pressing a key (in the hour input) that is not a digit, backspace, up arrow ' +
       'or down arrow has no effect on the hours_str',
       async () => {
    let hours_input = wrapper.find('#hour-input');
    expect(component.hours_str).toEqual("01");
    expect(component.d_date.getHours()).toEqual(13);

    hours_input.trigger('keydown', {code: "ArrowLeft"});

    expect(component.hours_str).toEqual("01");
    expect(component.d_date.getHours()).toEqual(13);

    hours_input.trigger('keydown', {code: "KeyE"});

    expect(component.hours_str).toEqual("01");
    expect(component.d_date.getHours()).toEqual(13);

    expect(wrapper.emitted().input).toBeFalsy();
  });

  test('Pressing the up and down buttons increases/decreases the minutes_str respectively',
       async () => {
    expect(component.minutes_str).toEqual("58");
    expect(component.d_date.getMinutes()).toEqual(58);

    wrapper.find({ref: 'next_minute_button'}).trigger('click');
    expect(component.minutes_str).toEqual("59");
    expect(component.d_date.getMinutes()).toEqual(59);

    wrapper.find({ref: 'next_minute_button'}).trigger('click');
    expect(component.minutes_str).toEqual("00");
    expect(component.d_date.getMinutes()).toEqual(0);

    wrapper.find({ref: 'next_minute_button'}).trigger('click');
    expect(component.minutes_str).toEqual("01");
    expect(component.d_date.getMinutes()).toEqual(1);

    wrapper.find({ref: 'prev_minute_button'}).trigger('click');
    expect(component.minutes_str).toEqual("00");
    expect(component.d_date.getMinutes()).toEqual(0);

    wrapper.find({ref: 'prev_minute_button'}).trigger('click');
    expect(component.minutes_str).toEqual("59");
    expect(component.d_date.getMinutes()).toEqual(59);
    expect(wrapper.emitted().input.length).toBe(5);
  });

  test('Pressing the up arrow while the minutes input has focus',
       async () => {
    let minute_input = wrapper.find('#minute-input');
    expect(component.minutes_str).toEqual("58");
    expect(component.d_date.getMinutes()).toEqual(58);

    minute_input.trigger('keydown', {code: "ArrowUp"});

    expect(component.minutes_str).toEqual("59");
    expect(component.d_date.getMinutes()).toEqual(59);

    minute_input.trigger('keydown', {code: "ArrowUp"});

    expect(component.minutes_str).toEqual("00");
    expect(component.d_date.getMinutes()).toEqual(0);
    expect(wrapper.emitted().input.length).toBe(2);
  });

  test('Pressing the down arrow while the minutes input has focus',
       async () => {
    let minute_input = wrapper.find('#minute-input');
    expect(component.minutes_str).toEqual("58");
    expect(component.d_date.getMinutes()).toEqual(58);

    minute_input.trigger('keydown', {code: "ArrowDown"});

    expect(component.minutes_str).toEqual("57");
    expect(component.d_date.getMinutes()).toEqual(57);

    minute_input.trigger('keydown', {code: "ArrowDown"});

    expect(component.minutes_str).toEqual("56");
    expect(component.d_date.getMinutes()).toEqual(56);
    expect(wrapper.emitted().input.length).toBe(2);
  });

  test('Pressing a key (in the minute input) that is not a digit, backspace, up arrow ' +
       'or down arrow has no effect on the minutes_str',
       async () => {
    let minutes_input = wrapper.find('#minute-input');
    expect(component.minutes_str).toEqual("58");
    expect(component.d_date.getMinutes()).toEqual(58);

    minutes_input.trigger('keydown', {code: "ArrowLeft"});

    expect(component.minutes_str).toEqual("58");
    expect(component.d_date.getMinutes()).toEqual(58);

    minutes_input.trigger('keydown', {code: "KeyE"});

    expect(component.minutes_str).toEqual("58");
    expect(component.d_date.getMinutes()).toEqual(58);
    expect(wrapper.emitted().input).toBeFalsy();
  });

  test('Clicking on the period input toggles the value of period_str', async () => {
    let period_input = wrapper.find('#period-input');
    expect(component.period_str).toEqual("PM");

    period_input.trigger('click');
    expect(component.period_str).toEqual("AM");

    period_input.trigger('click');
    expect(component.period_str).toEqual("PM");
  });

  test('Pressing backspace in the hours input sets the value to "00"',
       async () => {
    let hours_input = wrapper.find('#hour-input');
    expect(component.hours_str).toEqual("01");

    hours_input.trigger('click');
    hours_input.trigger('keydown', {code: "Backspace"});

    expect(component.hours_str).toEqual("00");
  });

  test("If the hours input loses focus after pressing Backspace (and no digit or " +
       "arrow keys), the hours input gets set to '12'",
       async () => {
    let hours_input = wrapper.find('#hour-input');
    expect(component.hours_str).toEqual("01");

    hours_input.trigger('click');
    hours_input.trigger('keydown', {code: "Backspace"});

    expect(component.hours_str).toEqual("00");

    hours_input.trigger('blur');
    expect(component.hours_str).toEqual("12");

    hours_input.trigger('click');
    hours_input.trigger('keydown', {code: "Backspace"});

    expect(component.hours_str).toEqual("00");

    hours_input.trigger("keydown", {code: "Digit1", key: "1"});
    hours_input.trigger('blur');

    expect(component.hours_str).toEqual("01");
  });

  test('Pressing backspace in the minutes input sets the value to "00"',
       async () => {
    let minutes_input = wrapper.find('#minute-input');
    expect(component.minutes_str).toEqual("58");

    minutes_input.trigger('click');
    minutes_input.trigger('keydown', {code: "Backspace"});

    expect(component.minutes_str).toEqual("00");
  });
});

describe('TimePicker HourInputState tests', () => {
  let wrapper: Wrapper<DatetimePicker>;
  let component: DatetimePicker;

  beforeEach(() => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: "2019-12-25T18:36:37.746Z"
      }
    });
    component = wrapper.vm;

    wrapper.setData({'is_open': true});
  });

  afterEach(() => {
    if (wrapper.exists()) {
      wrapper.destroy();
    }
  });

  test("The hour_input_state begins in the 'awaiting_first_digit' state", async () => {
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
    expect(wrapper.emitted().input).toBeFalsy();
  });

  test("The hour_input_state remains in the 'awaiting_first_digit' state if a number" +
       " greater than 1 is entered",
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

    let hour_input = wrapper.find({ref: 'hour_input'});
    hour_input.trigger("keydown", {code: "Digit3", key: "3"});

    expect(component.hours_str).toEqual("03");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toBe(1);

    hour_input.trigger("keydown", {code: "Digit7", key: "7"});

    expect(component.hours_str).toEqual("07");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toBe(2);
  });

  test("The hour_input_state changes from the 'awaiting_first_digit' state to the " +
       "'first_digit_was_zero' state when 0 is entered",
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

    let hour_input = wrapper.find({ref: 'hour_input'});
    hour_input.trigger("keydown", {code: "Digit0", key: "0"});

    expect(component.hours_str).toEqual("00");
    expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_zero);
    expect(wrapper.emitted().input.length).toEqual(1);
  });

  test("The hour_input_state changes from the 'awaiting_first_digit' state to the " +
       "'first_digit_was_one' state when 1 is entered",
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

    let hour_input = wrapper.find({ref: 'hour_input'});
    hour_input.trigger("keydown", {code: "Digit1", key: "1"});

    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_one);
    expect(wrapper.emitted().input.length).toEqual(1);
  });

  test("The hour_input_state changes from the 'first_digit_was_zero' state to the " +
       "'awaiting_first_input' state when any number is entered",
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

    let hour_input = wrapper.find({ref: 'hour_input'});
    hour_input.trigger("keydown", {code: "Digit0", key: "0"});

    expect(component.hours_str).toEqual("00");
    expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_zero);
    expect(wrapper.emitted().input.length).toEqual(1);

    hour_input.trigger("keydown", {code: "Digit5", key: "5"});

    expect(component.hours_str).toEqual("05");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toEqual(2);
  });

  test("When the hour_input_state is 'first_digit_was_zero' and the user enters a zero," +
       "the hours_str is set to 01",
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

    let hour_input = wrapper.find({ref: 'hour_input'});
    hour_input.trigger("keydown", {code: "Digit0", key: "0"});

    expect(component.hours_str).toEqual("00");
    expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_zero);
    expect(wrapper.emitted().input.length).toEqual(1);

    hour_input.trigger("keydown", {code: "Digit0", key: "0"});

    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toEqual(2);
  });

  test("The hour_input_state changes from the 'first_digit_was_one' state to the " +
       "'awaiting_first_input' state when any number is entered",
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

    let hour_input = wrapper.find({ref: 'hour_input'});
    hour_input.trigger("keydown", {code: "Digit1", key: "1"});

    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_one);
    expect(wrapper.emitted().input.length).toEqual(1);

    hour_input.trigger("keydown", {code: "Digit1", key: "1"});

    expect(component.hours_str).toEqual("11");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toEqual(2);
  });

  test("When the hour_input_state is 'first_digit_was_one' and the user enters a digit," +
       "greater than 2, hours_str is set to 12",
       async () => {
    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

    let hour_input = wrapper.find({ref: 'hour_input'});
    hour_input.trigger("keydown", {code: "Digit1", key: "1"});

    expect(component.hours_str).toEqual("01");
    expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_one);
    expect(wrapper.emitted().input.length).toEqual(1);

    hour_input.trigger("keydown", {code: "Digit8", key: "8"});

    expect(component.hours_str).toEqual("12");
    expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toEqual(2);
  });
});

describe('TimePicker MinuteInputState tests', () => {
  let wrapper: Wrapper<DatetimePicker>;
  let component: DatetimePicker;

  beforeEach(() => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: "2019-12-25T18:36:37.746Z"
      }
    });
    component = wrapper.vm;

    wrapper.setData({'is_open': true});
  });

  afterEach(() => {
    if (wrapper.exists()) {
      wrapper.destroy();
    }
  });

  test("The minute_input_state begins in the 'awaiting_first_digit' state", async () => {
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
  });

  test("The minute_input_state stays in the 'awaiting_first_digit' state if a digit " +
       "greater than 6 is entered",
       async () => {
    expect(component.minutes_str).toEqual("36");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);

    let minute_input = wrapper.find({ref: 'minute_input'});
    minute_input.trigger("keydown", {code: "Digit6", key: "6"});

    expect(component.minutes_str).toEqual("06");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toEqual(1);

    minute_input.trigger("keydown", {code: "Digit9", key: "9"});

    expect(component.minutes_str).toEqual("09");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toEqual(2);
  });

  test("The minute_input_state changes from the 'awaiting_first_digit' state if a digit " +
       "less than 6 is entered",
       async () => {
    expect(component.minutes_str).toEqual("36");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);

    let minute_input = wrapper.find({ref: 'minute_input'});
    minute_input.trigger("keydown", {code: "Digit4", key: "4"});

    expect(component.minutes_str).toEqual("04");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_second_digit);
    expect(wrapper.emitted().input.length).toEqual(1);
  });

  test("The minute_input_state changes from the 'awaiting_second_digit' state if any " +
       "digit is entered",
       async () => {
    expect(component.minutes_str).toEqual("36");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);

    let minute_input = wrapper.find({ref: 'minute_input'});
    minute_input.trigger("keydown", {code: "Digit4", key: "4"});

    expect(component.minutes_str).toEqual("04");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_second_digit);
    expect(wrapper.emitted().input.length).toEqual(1);

    minute_input.trigger("keydown", {code: "Digit9", key: "9"});

    expect(component.minutes_str).toEqual("49");
    expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
    expect(wrapper.emitted().input.length).toEqual(2);
  });
});

describe('DatePicker Tests', () => {
  let wrapper: Wrapper<DatetimePicker>;
  let component: DatetimePicker;

  beforeEach(() => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: "2019-12-25T18:36:37.746Z"
      }
    });
    component = wrapper.vm;
  });

  afterEach(() => {
    if (wrapper.exists()) {
      wrapper.destroy();
    }
  });

  test('Month, year, and day are initialized to the correct values',
       async () => {
    wrapper.setData({'is_open': true});

    expect(component.month).toEqual(11);
    expect(component.year).toEqual(2019);
    expect(component.selected_day).toEqual(0);
  });

  test('Pressing the left arrow takes you to the previous month (and year if the month ' +
       'was previously January',
       async () => {
    wrapper.setData({'is_open': true});
    wrapper.setData({'d_date': "2019-01-25T18:36:37.746Z"});
    wrapper.setData({'month': 0});

    expect(component.month).toEqual(0);
    expect(component.year).toEqual(2019);

    wrapper.find('.prev-month-button').trigger('click');
    expect(component.month).toEqual(11);
    expect(component.year).toEqual(2018);
    wrapper.find('.prev-month-button').trigger('click');
    expect(component.month).toEqual(10);
    wrapper.find('.prev-month-button').trigger('click');
    expect(component.month).toEqual(9);
  });

  test('Pressing the right arrow takes you to the next month (and year if the month ' +
       'was previously December',
       async () => {
    wrapper.setData({'is_open': true});

    expect(component.month).toEqual(11);
    expect(component.year).toEqual(2019);

    wrapper.find('.next-month-button').trigger('click');
    expect(component.month).toEqual(0);
    expect(component.year).toEqual(2020);
    wrapper.find('.next-month-button').trigger('click');
    expect(component.month).toEqual(1);
    wrapper.find('.next-month-button').trigger('click');
    expect(component.month).toEqual(2);
  });

  test('Selecting a day in the calender', async () => {
    wrapper.setData({'is_open': true});

    expect(component.d_date.getMonth()).toEqual(11);
    wrapper.find('.next-month-button').trigger('click');

    expect(component.month).toEqual(0);
    expect(component.year).toEqual(2020);

    let second_week = wrapper.findAll('.week').at(1);
    second_week.findAll('.available-day').at(0).trigger('click');

    expect(component.selected_day).not.toEqual(0);
    expect(wrapper.findAll('.selected-day').length).toEqual(1);
    expect(component.d_date.getMonth()).toEqual(0);
    expect(component.selected_month).toEqual(0);
    expect(component.d_date.getFullYear()).toEqual(2020);
    expect(component.selected_year).toEqual(2020);
    expect(wrapper.emitted().input.length).toBe(1);
  });

});

describe('DatetimePicker Tests', () => {
  let wrapper: Wrapper<DatetimePicker>;
  let component: DatetimePicker;

  afterEach(() => {
    if (wrapper.exists()) {
      wrapper.destroy();
    }
  });

  test('Hours and minutes are less than 10', async () => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: "2019-12-25T09:06:37.746Z"
      }
    });
    component = wrapper.vm;
    expect(component.hours_str).toEqual("04");
    expect(component.minutes_str).toEqual("06");
    expect(component.period_str).toEqual("AM");
  });

  test('Hours and minutes are greater than 10', async () => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: "2019-12-25T17:16:37.746Z"
      }
    });
    component = wrapper.vm;
    expect(component.hours_str).toEqual("12");
    expect(component.minutes_str).toEqual("16");
    expect(component.period_str).toEqual("PM");
  });

  test('The date passed in is null', () => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: null
      }
    });
    component = wrapper.vm;

    let today = new Date();
    expect(component.year).toEqual(today.getFullYear());
    expect(component.month).toEqual(today.getMonth());
    expect(component.selected_day).toEqual(0);
    expect(Number(component.hours_str)).toEqual(
      (today.getHours() % 12) === 0 ? 12 : today.getHours() % 12
    );
    expect(Number(component.minutes_str)).toEqual(today.getMinutes());
    expect(component.period_str).toEqual(today.getHours() >= 12 ? "PM" : "AM");
  });

  test("Value passed into 'value' prop changed by parent component", async () => {
    let orig_date_string = "2019-07-21T12:20:40.746Z";
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: orig_date_string
      }
    });
    component = wrapper.vm;

    let orig_date = new Date(orig_date_string);
    expect(component.d_date).toEqual(orig_date);

    wrapper.setProps({'value': "2019-03-08T23:20:40.746Z"});

    expect(component.d_date).not.toEqual(orig_date);
  });

  test("Toggle visibility of the DatetimePicker", async () => {
    wrapper = mount(DatetimePicker, {
      propsData: {
        value: "2019-03-08T23:20:40.746Z"
      }
    });
    component = wrapper.vm;

    expect(component.is_open).toBe(false);

    component.toggle_show_hide();

    expect(component.is_open).toBe(true);
  });
});
