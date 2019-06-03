import TimePicker, {
    HourInputState,
    InvalidTimeStrError,
    MinuteInputState,
    Time
} from "@/components/datetime/time_picker.vue";
import { mount, Wrapper } from "@vue/test-utils";

describe('TimePicker Tests', () => {
    let wrapper: Wrapper<TimePicker>;
    let component: TimePicker;

    beforeEach(() => {
        wrapper = mount(TimePicker, {
            propsData: {
                value: '13:58'
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Default input value', () => {
        wrapper = mount(TimePicker);
        expect(wrapper.vm.hours_str).toEqual('12');
        expect(wrapper.vm.minutes_str).toEqual('00');
        expect(component.period_str).toEqual('PM');
        expect(wrapper.vm.d_time.hours).toEqual(12);
        expect(wrapper.vm.d_time.minutes).toEqual(0);
    });

    test('Input watcher', () => {
        expect(component.d_time.hours).toEqual(13);
        expect(component.d_time.minutes).toEqual(58);

        wrapper.setProps({value: '04:22'});

        expect(component.d_time.hours).toEqual(4);
        expect(component.d_time.minutes).toEqual(22);
    });

    test('Invalid time str throws exception', () => {
        expect(() => {
            mount(TimePicker, {
                propsData: {
                    value: 'invalid'
                }
            });
        }).toThrow(InvalidTimeStrError);
    });

    test('Valid time string formats', () => {
        expect(wrapper.vm.d_time.hours).toEqual(13);
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        wrapper.setProps({value: '05:21:00'});

        expect(wrapper.vm.d_time.hours).toEqual(5);
        expect(wrapper.vm.d_time.minutes).toEqual(21);
    });

    test('Pressing the up and down buttons increases/decreases hours_str', () => {
        expect(component.hours_str).toEqual("01");
        expect(component.period_str).toEqual("PM");
        expect(component.d_time.hours).toEqual(13);

        wrapper.find({ref: 'prev_hour_button'}).trigger('click');
        expect(component.hours_str).toEqual("12");
        expect(component.period_str).toEqual("PM");
        expect(component.d_time.hours).toEqual(12);

        wrapper.find({ref: 'prev_hour_button'}).trigger('click');
        expect(component.hours_str).toEqual("11");
        expect(component.period_str).toEqual("AM");
        expect(component.d_time.hours).toEqual(11);

        wrapper.find({ref: 'next_hour_button'}).trigger('click');
        expect(component.hours_str).toEqual("12");
        expect(component.period_str).toEqual("PM");
        expect(component.d_time.hours).toEqual(12);

        wrapper.find({ref: 'next_hour_button'}).trigger('click');
        expect(component.hours_str).toEqual("01");
        expect(component.d_time.hours).toEqual(13);
        expect(wrapper.emitted().input.length).toBe(4);

        wrapper.setProps({value: '23:00'});
        expect(component.hours_str).toEqual("11");
        expect(component.period_str).toEqual("PM");
        expect(component.d_time.hours).toEqual(23);

        wrapper.find({ref: 'next_hour_button'}).trigger('click');
        expect(component.hours_str).toEqual("12");
        expect(component.period_str).toEqual("AM");
        expect(component.d_time.hours).toEqual(0);

        wrapper.find({ref: 'prev_hour_button'}).trigger('click');
        expect(component.hours_str).toEqual("11");
        expect(component.period_str).toEqual("PM");
        expect(component.d_time.hours).toEqual(23);
    });

    test('Pressing the up arrow while the hours input has focus', () => {
        let hours_input = wrapper.find('#hour-input');
        expect(component.hours_str).toEqual("01");
        expect(component.d_time.hours).toEqual(13);

        hours_input.trigger('keydown', {code: "ArrowUp"});

        expect(component.hours_str).toEqual("02");
        expect(component.d_time.hours).toEqual(14);

        hours_input.trigger('keydown', {code: "ArrowUp"});

        expect(component.hours_str).toEqual("03");
        expect(component.d_time.hours).toEqual(15);
        expect(wrapper.emitted().input.length).toBe(2);
    });

    test('Pressing the down arrow while the hours input has focus', () => {
        let hours_input = wrapper.find('#hour-input');
        expect(component.hours_str).toEqual("01");
        expect(component.d_time.hours).toEqual(13);

        hours_input.trigger('keydown', {code: "ArrowDown"});

        expect(component.hours_str).toEqual("12");
        expect(component.d_time.hours).toEqual(12);

        hours_input.trigger('keydown', {code: "ArrowDown"});
        hours_input.trigger('keydown', {code: "ArrowDown"});
        hours_input.trigger('keydown', {code: "ArrowDown"});

        expect(component.hours_str).toEqual("09");
        expect(component.d_time.hours).toEqual(9);
        expect(wrapper.emitted().input.length).toBe(4);
    });


    test('Pressing key besides digit, backspace, up arrow has no effect on hours', () => {
        let hours_input = wrapper.find('#hour-input');
        expect(component.hours_str).toEqual("01");
        expect(component.d_time.hours).toEqual(13);

        hours_input.trigger('keydown', {code: "ArrowLeft"});

        expect(component.hours_str).toEqual("01");
        expect(component.d_time.hours).toEqual(13);

        hours_input.trigger('keydown', {code: "KeyE"});

        expect(component.hours_str).toEqual("01");
        expect(component.d_time.hours).toEqual(13);

        expect(wrapper.emitted().input).toBeFalsy();
    });

    test('Pressing the up and down buttons increases/decreases the minutes_str', () => {
        expect(component.minutes_str).toEqual("58");
        expect(component.d_time.minutes).toEqual(58);

        wrapper.find({ref: 'next_minute_button'}).trigger('click');
        expect(component.minutes_str).toEqual("59");
        expect(component.d_time.minutes).toEqual(59);

        wrapper.find({ref: 'next_minute_button'}).trigger('click');
        expect(component.minutes_str).toEqual("00");
        expect(component.d_time.minutes).toEqual(0);

        wrapper.find({ref: 'next_minute_button'}).trigger('click');
        expect(component.minutes_str).toEqual("01");
        expect(component.d_time.minutes).toEqual(1);

        wrapper.find({ref: 'prev_minute_button'}).trigger('click');
        expect(component.minutes_str).toEqual("00");
        expect(component.d_time.minutes).toEqual(0);

        wrapper.find({ref: 'prev_minute_button'}).trigger('click');
        expect(component.minutes_str).toEqual("59");
        expect(component.d_time.minutes).toEqual(59);
        expect(wrapper.emitted().input.length).toBe(5);
    });

    test('Pressing the up arrow while the minutes input has focus', () => {
        let minute_input = wrapper.find('#minute-input');
        expect(component.minutes_str).toEqual("58");
        expect(component.d_time.minutes).toEqual(58);

        minute_input.trigger('keydown', {code: "ArrowUp"});

        expect(component.minutes_str).toEqual("59");
        expect(component.d_time.minutes).toEqual(59);

        minute_input.trigger('keydown', {code: "ArrowUp"});

        expect(component.minutes_str).toEqual("00");
        expect(component.d_time.minutes).toEqual(0);
        expect(wrapper.emitted().input.length).toBe(2);
    });

    test('Pressing the down arrow while the minutes input has focus', () => {
        let minute_input = wrapper.find('#minute-input');
        expect(component.minutes_str).toEqual("58");
        expect(component.d_time.minutes).toEqual(58);

        minute_input.trigger('keydown', {code: "ArrowDown"});

        expect(component.minutes_str).toEqual("57");
        expect(component.d_time.minutes).toEqual(57);

        minute_input.trigger('keydown', {code: "ArrowDown"});

        expect(component.minutes_str).toEqual("56");
        expect(component.d_time.minutes).toEqual(56);
        expect(wrapper.emitted().input.length).toBe(2);
    });

    test('Pressing key besides digit, backspace, up arrow has no effect on minutes', () => {
        let minutes_input = wrapper.find('#minute-input');
        expect(component.minutes_str).toEqual("58");
        expect(component.d_time.minutes).toEqual(58);

        minutes_input.trigger('keydown', {code: "ArrowLeft"});

        expect(component.minutes_str).toEqual("58");
        expect(component.d_time.minutes).toEqual(58);

        minutes_input.trigger('keydown', {code: "KeyE"});

        expect(component.minutes_str).toEqual("58");
        expect(component.d_time.minutes).toEqual(58);
        expect(wrapper.emitted().input).toBeFalsy();
    });

    test('Clicking on the period input toggles the value of period_str', () => {
        let period_input = wrapper.find('#period-input');
        expect(component.period_str).toEqual("PM");

        period_input.trigger('click');
        expect(component.period_str).toEqual("AM");

        period_input.trigger('click');
        expect(component.period_str).toEqual("PM");
    });

    test('Pressing backspace in the hours input sets the value to "12"', () => {
        let hours_input = wrapper.find('#hour-input');
        expect(component.hours_str).toEqual("01");

        hours_input.trigger('click');
        hours_input.trigger('keydown', {code: "Backspace"});

        expect(component.hours_str).toEqual("12");
        expect(component.d_time.hours).toEqual(12);
    });

    test('Pressing backspace in the minutes input sets the value to "00"', () => {
        let minutes_input = wrapper.find('#minute-input');
        expect(component.minutes_str).toEqual("58");

        minutes_input.trigger('click');
        minutes_input.trigger('keydown', {code: "Backspace"});

        expect(component.minutes_str).toEqual("00");
        expect(component.d_time.minutes).toEqual(0);
    });
});

describe('TimePicker HourInputState tests', () => {
    let wrapper: Wrapper<TimePicker>;
    let component: TimePicker;

    beforeEach(() => {
        wrapper = mount(TimePicker, {
            propsData: {
                value: '1:58'
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test("The hour_input_state begins in the 'awaiting_first_digit' state", () => {
        expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(wrapper.emitted().input).toBeFalsy();
    });

    test("The hour_input_state remains in the 'awaiting_first_digit' state if a number" +
         " greater than 1 is entered",
         () => {
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
         "'first_digit_was_one' state when 1 is entered",
         () => {
        expect(component.hours_str).toEqual("01");
        expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find({ref: 'hour_input'});
        hour_input.trigger("keydown", {code: "Digit1", key: "1"});

        expect(component.hours_str).toEqual("01");
        expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_one);
        expect(wrapper.emitted().input.length).toEqual(1);
        });

    test("When the hour_input_state is 'awaiting_first_digit' and the user enters a zero," +
         "nothing happens",
         () => {

        expect(component.hours_str).toEqual("01");
        expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find({ref: 'hour_input'});
        hour_input.trigger("keydown", {code: "Digit0", key: "0"});

        expect(component.hours_str).toEqual("01");
        expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(wrapper.emitted().input).toBeUndefined();
    });

    test("The hour_input_state changes from the 'first_digit_was_one' state to the " +
         "'awaiting_first_input' state when any number is entered",
         () => {

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
         "greater than 2, hours is set to that number",
         () => {
        expect(component.hours_str).toEqual("01");
        expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find({ref: 'hour_input'});
        hour_input.trigger("keydown", {code: "Digit1", key: "1"});

        expect(component.hours_str).toEqual("01");
        expect(component.hour_input_state).toEqual(HourInputState.first_digit_was_one);
        expect(wrapper.emitted().input.length).toEqual(1);

        hour_input.trigger("keydown", {code: "Digit8", key: "8"});

        expect(component.hours_str).toEqual("08");
        expect(component.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(wrapper.emitted().input.length).toEqual(2);
    });
});

describe('TimePicker MinuteInputState tests', () => {
    let wrapper: Wrapper<TimePicker>;
    let component: TimePicker;

    beforeEach(() => {
        wrapper = mount(TimePicker, {
            propsData: {
                value: '18:36'
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test("The minute_input_state begins in the 'awaiting_first_digit' state", () => {
        expect(component.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
    });

    test("The minute_input_state stays in the 'awaiting_first_digit' state if a digit " +
         "greater than 6 is entered",
         () => {
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
         () => {
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
         () => {
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
