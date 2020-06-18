import { mount, Wrapper } from "@vue/test-utils";

import * as sinon from 'sinon';

import TimePicker, {
    HourInputState,
    InvalidTimeStrError,
    MinuteInputState,
} from "@/components/datetime/time_picker.vue";

import { emitted, set_props } from '../utils';

describe('TimePicker Tests', () => {
    let wrapper: Wrapper<TimePicker>;

    beforeEach(() => {
        wrapper = mount(TimePicker, {
            propsData: {
                value: '13:58'
            }
        });
    });

    test('Default input value', () => {
        wrapper = mount(TimePicker);
        expect(wrapper.vm.hours_str).toEqual('12');
        expect(wrapper.vm.minutes_str).toEqual('00');
        expect(wrapper.vm.am_pm_str).toEqual('PM');
        expect(wrapper.vm.d_time.hours).toEqual(12);
        expect(wrapper.vm.d_time.minutes).toEqual(0);
    });

    test('Null input value', () => {
        wrapper = mount(TimePicker, {
            propsData: {
                value: null
            }
        });
        expect(wrapper.vm.hours_str).toEqual('12');
        expect(wrapper.vm.minutes_str).toEqual('00');
        expect(wrapper.vm.am_pm_str).toEqual('PM');
        expect(wrapper.vm.d_time.hours).toEqual(12);
        expect(wrapper.vm.d_time.minutes).toEqual(0);
    });

    test('Input watcher', async () => {
        expect(wrapper.vm.d_time.hours).toEqual(13);
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        await set_props(wrapper, {value: '04:22'});

        expect(wrapper.vm.d_time.hours).toEqual(4);
        expect(wrapper.vm.d_time.minutes).toEqual(22);
    });

    test('Invalid time str throws exception', () => {
        sinon.stub(console, 'error');
        sinon.stub(console, 'warn');
        expect(() => {
            mount(TimePicker, {
                propsData: {
                    value: 'invalid'
                }
            });
        }).toThrow(InvalidTimeStrError);
    });

    test('Valid time string formats', async  () => {
        expect(wrapper.vm.d_time.hours).toEqual(13);
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        await set_props(wrapper, {value: '05:21:00'});

        expect(wrapper.vm.d_time.hours).toEqual(5);
        expect(wrapper.vm.d_time.minutes).toEqual(21);
    });

    test('Pressing the up and down buttons increases/decreases hours_str', async () => {
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.am_pm_str).toEqual("PM");
        expect(wrapper.vm.d_time.hours).toEqual(13);

        await wrapper.find('[data-testid=prev_hour_button]').trigger('click');
        expect(wrapper.vm.hours_str).toEqual("12");
        expect(wrapper.vm.am_pm_str).toEqual("PM");
        expect(wrapper.vm.d_time.hours).toEqual(12);

        await wrapper.find('[data-testid=prev_hour_button]').trigger('click');
        expect(wrapper.vm.hours_str).toEqual("11");
        expect(wrapper.vm.am_pm_str).toEqual("AM");
        expect(wrapper.vm.d_time.hours).toEqual(11);

        await wrapper.find('[data-testid=next_hour_button]').trigger('click');
        expect(wrapper.vm.hours_str).toEqual("12");
        expect(wrapper.vm.am_pm_str).toEqual("PM");
        expect(wrapper.vm.d_time.hours).toEqual(12);

        await wrapper.find('[data-testid=next_hour_button]').trigger('click');
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.d_time.hours).toEqual(13);
        expect(emitted(wrapper, 'input').length).toBe(4);

        await set_props(wrapper, {value: '23:00'});
        expect(wrapper.vm.hours_str).toEqual("11");
        expect(wrapper.vm.am_pm_str).toEqual("PM");
        expect(wrapper.vm.d_time.hours).toEqual(23);

        await wrapper.find('[data-testid=next_hour_button]').trigger('click');
        expect(wrapper.vm.hours_str).toEqual("12");
        expect(wrapper.vm.am_pm_str).toEqual("AM");
        expect(wrapper.vm.d_time.hours).toEqual(0);

        await wrapper.find('[data-testid=prev_hour_button]').trigger('click');
        expect(wrapper.vm.hours_str).toEqual("11");
        expect(wrapper.vm.am_pm_str).toEqual("PM");
        expect(wrapper.vm.d_time.hours).toEqual(23);
    });

    test('Pressing the up arrow while the hours input has focus', async () => {
        let hours_input = wrapper.find('.hour-input');
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.d_time.hours).toEqual(13);

        await hours_input.trigger('keydown', {code: "ArrowUp"});

        expect(wrapper.vm.hours_str).toEqual("02");
        expect(wrapper.vm.d_time.hours).toEqual(14);

        await hours_input.trigger('keydown', {code: "ArrowUp"});

        expect(wrapper.vm.hours_str).toEqual("03");
        expect(wrapper.vm.d_time.hours).toEqual(15);
        expect(emitted(wrapper, 'input').length).toBe(2);
    });

    test('Pressing the down arrow while the hours input has focus', async () => {
        let hours_input = wrapper.find('.hour-input');
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.d_time.hours).toEqual(13);

        await hours_input.trigger('keydown', {code: "ArrowDown"});

        expect(wrapper.vm.hours_str).toEqual("12");
        expect(wrapper.vm.d_time.hours).toEqual(12);

        await hours_input.trigger('keydown', {code: "ArrowDown"});
        await hours_input.trigger('keydown', {code: "ArrowDown"});
        await hours_input.trigger('keydown', {code: "ArrowDown"});

        expect(wrapper.vm.hours_str).toEqual("09");
        expect(wrapper.vm.d_time.hours).toEqual(9);
        expect(emitted(wrapper, 'input').length).toBe(4);
    });


    test('Pressing key besides digit, backspace, up arrow has no effect on hours', async () => {
        let hours_input = wrapper.find('.hour-input');
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.d_time.hours).toEqual(13);

        await hours_input.trigger('keydown', {code: "ArrowLeft"});

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.d_time.hours).toEqual(13);

        await hours_input.trigger('keydown', {code: "KeyE"});

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.d_time.hours).toEqual(13);

        expect(wrapper.emitted('input')).toBeUndefined();
    });

    test('Pressing the up and down buttons increases/decreases the minutes_str', async () => {
        expect(wrapper.vm.minutes_str).toEqual("58");
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        await wrapper.find('[data-testid=next_minute_button]').trigger('click');
        expect(wrapper.vm.minutes_str).toEqual("59");
        expect(wrapper.vm.d_time.minutes).toEqual(59);

        await wrapper.find('[data-testid=next_minute_button]').trigger('click');
        expect(wrapper.vm.minutes_str).toEqual("00");
        expect(wrapper.vm.d_time.minutes).toEqual(0);

        await wrapper.find('[data-testid=next_minute_button]').trigger('click');
        expect(wrapper.vm.minutes_str).toEqual("01");
        expect(wrapper.vm.d_time.minutes).toEqual(1);

        await wrapper.find('[data-testid=prev_minute_button]').trigger('click');
        expect(wrapper.vm.minutes_str).toEqual("00");
        expect(wrapper.vm.d_time.minutes).toEqual(0);

        await wrapper.find('[data-testid=prev_minute_button]').trigger('click');
        expect(wrapper.vm.minutes_str).toEqual("59");
        expect(wrapper.vm.d_time.minutes).toEqual(59);
        expect(emitted(wrapper, 'input').length).toBe(5);
    });

    test('Pressing the up arrow while the minutes input has focus', async () => {
        let minute_input = wrapper.find('.minute-input');
        expect(wrapper.vm.minutes_str).toEqual("58");
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        await minute_input.trigger('keydown', {code: "ArrowUp"});

        expect(wrapper.vm.minutes_str).toEqual("59");
        expect(wrapper.vm.d_time.minutes).toEqual(59);

        await minute_input.trigger('keydown', {code: "ArrowUp"});

        expect(wrapper.vm.minutes_str).toEqual("00");
        expect(wrapper.vm.d_time.minutes).toEqual(0);
        expect(emitted(wrapper, 'input').length).toBe(2);
    });

    test('Pressing the down arrow while the minutes input has focus', async () => {
        let minute_input = wrapper.find('.minute-input');
        expect(wrapper.vm.minutes_str).toEqual("58");
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        await minute_input.trigger('keydown', {code: "ArrowDown"});

        expect(wrapper.vm.minutes_str).toEqual("57");
        expect(wrapper.vm.d_time.minutes).toEqual(57);

        await minute_input.trigger('keydown', {code: "ArrowDown"});

        expect(wrapper.vm.minutes_str).toEqual("56");
        expect(wrapper.vm.d_time.minutes).toEqual(56);
        expect(emitted(wrapper, 'input').length).toBe(2);
    });

    test('Pressing key besides digit, backspace, up arrow has no effect on minutes', async () => {
        let minutes_input = wrapper.find('.minute-input');
        expect(wrapper.vm.minutes_str).toEqual("58");
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        await minutes_input.trigger('keydown', {code: "ArrowLeft"});

        expect(wrapper.vm.minutes_str).toEqual("58");
        expect(wrapper.vm.d_time.minutes).toEqual(58);

        await minutes_input.trigger('keydown', {code: "KeyE"});

        expect(wrapper.vm.minutes_str).toEqual("58");
        expect(wrapper.vm.d_time.minutes).toEqual(58);
        expect(wrapper.emitted('input')).toBeUndefined();
    });

    test('Clicking on the period input toggles the value of period_str', async () => {
        let period_input = wrapper.find('.period-input');
        expect(wrapper.vm.am_pm_str).toEqual("PM");

        await period_input.trigger('click');
        expect(wrapper.vm.am_pm_str).toEqual("AM");

        await period_input.trigger('click');
        expect(wrapper.vm.am_pm_str).toEqual("PM");
    });

    test('Pressing backspace in the hours input sets the value to "12"', async () => {
        let hours_input = wrapper.find('.hour-input');
        expect(wrapper.vm.hours_str).toEqual("01");

        await hours_input.trigger('click');
        await hours_input.trigger('keydown', {code: "Backspace"});

        expect(wrapper.vm.hours_str).toEqual("12");
        expect(wrapper.vm.d_time.hours).toEqual(12);
    });

    test('Pressing backspace in the minutes input sets the value to "00"', async () => {
        let minutes_input = wrapper.find('.minute-input');
        expect(wrapper.vm.minutes_str).toEqual("58");

        await minutes_input.trigger('click');
        await minutes_input.trigger('keydown', {code: "Backspace"});

        expect(wrapper.vm.minutes_str).toEqual("00");
        expect(wrapper.vm.d_time.minutes).toEqual(0);
    });
});

describe('TimePicker HourInputState tests', () => {
    let wrapper: Wrapper<TimePicker>;

    beforeEach(() => {
        wrapper = mount(TimePicker, {
            propsData: {
                value: '1:58'
            }
        });
    });

    test("The hour_input_state begins in the 'awaiting_first_digit' state", () => {
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(wrapper.emitted('input')).toBeUndefined();
    });

    test("The hour_input_state remains in the 'awaiting_first_digit' state if a number" +
         " greater than 1 is entered",
         async () => {
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find('[data-testid=hour_input]');
        await hour_input.trigger("keydown", {code: "Digit3", key: "3"});

        expect(wrapper.vm.hours_str).toEqual("03");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(emitted(wrapper, 'input').length).toBe(1);

        await hour_input.trigger("keydown", {code: "Digit7", key: "7"});

        expect(wrapper.vm.hours_str).toEqual("07");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(emitted(wrapper, 'input').length).toBe(2);
    });

    test("The hour_input_state changes from the 'awaiting_first_digit' state to the " +
         "'first_digit_was_one' state when 1 is entered",
         async () => {
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find('[data-testid=hour_input]');
        await hour_input.trigger("keydown", {code: "Digit1", key: "1"});

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.first_digit_was_one);
        expect(emitted(wrapper, 'input').length).toEqual(1);
        });

    test("When the hour_input_state is 'awaiting_first_digit' and the user enters a zero," +
         "nothing happens",
         async () => {

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find('[data-testid=hour_input]');
        await hour_input.trigger("keydown", {code: "Digit0", key: "0"});

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(wrapper.emitted('input')).toBeUndefined();
    });

    test("The hour_input_state changes from the 'first_digit_was_one' state to the " +
         "'awaiting_first_input' state when any number is entered",
         async () => {

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find('[data-testid=hour_input]');
        await hour_input.trigger("keydown", {code: "Digit1", key: "1"});

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.first_digit_was_one);
        expect(emitted(wrapper, 'input').length).toEqual(1);

        await hour_input.trigger("keydown", {code: "Digit1", key: "1"});

        expect(wrapper.vm.hours_str).toEqual("11");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(emitted(wrapper, 'input').length).toEqual(2);
    });

    test("When the hour_input_state is 'first_digit_was_one' and the user enters a digit," +
         "greater than 2, hours is set to that number",
         async () => {
        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);

        let hour_input = wrapper.find('[data-testid=hour_input]');
        await hour_input.trigger("keydown", {code: "Digit1", key: "1"});

        expect(wrapper.vm.hours_str).toEqual("01");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.first_digit_was_one);
        expect(emitted(wrapper, 'input').length).toEqual(1);

        await hour_input.trigger("keydown", {code: "Digit8", key: "8"});

        expect(wrapper.vm.hours_str).toEqual("08");
        expect(wrapper.vm.hour_input_state).toEqual(HourInputState.awaiting_first_digit);
        expect(emitted(wrapper, 'input').length).toEqual(2);
    });
});

describe('TimePicker MinuteInputState tests', () => {
    let wrapper: Wrapper<TimePicker>;

    beforeEach(() => {
        wrapper = mount(TimePicker, {
            propsData: {
                value: '18:36'
            }
        });
    });

    test("The minute_input_state begins in the 'awaiting_first_digit' state", () => {
        expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
    });

    test("The minute_input_state stays in the 'awaiting_first_digit' state if a digit " +
         "greater than 6 is entered",
         async () => {
            expect(wrapper.vm.minutes_str).toEqual("36");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);

            let minute_input = wrapper.find('.minute-input');
            await minute_input.trigger("keydown", {code: "Digit6", key: "6"});

            expect(wrapper.vm.minutes_str).toEqual("06");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
            expect(emitted(wrapper, 'input').length).toEqual(1);

            await minute_input.trigger("keydown", {code: "Digit9", key: "9"});

            expect(wrapper.vm.minutes_str).toEqual("09");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
            expect(emitted(wrapper, 'input').length).toEqual(2);
        });

    test("The minute_input_state changes from the 'awaiting_first_digit' state if a digit " +
         "less than 6 is entered",
         async () => {
            expect(wrapper.vm.minutes_str).toEqual("36");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);

            let minute_input = wrapper.find('.minute-input');
            await minute_input.trigger("keydown", {code: "Digit4", key: "4"});

            expect(wrapper.vm.minutes_str).toEqual("04");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_second_digit);
            expect(emitted(wrapper, 'input').length).toEqual(1);
        });

    test("The minute_input_state changes from the 'awaiting_second_digit' state if any " +
         "digit is entered",
         async () => {
            expect(wrapper.vm.minutes_str).toEqual("36");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);

            let minute_input = wrapper.find('.minute-input');
            await minute_input.trigger("keydown", {code: "Digit4", key: "4"});

            expect(wrapper.vm.minutes_str).toEqual("04");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_second_digit);
            expect(emitted(wrapper, 'input').length).toEqual(1);

            await minute_input.trigger("keydown", {code: "Digit9", key: "9"});

            expect(wrapper.vm.minutes_str).toEqual("49");
            expect(wrapper.vm.minute_input_state).toEqual(MinuteInputState.awaiting_first_digit);
            expect(emitted(wrapper, 'input').length).toEqual(2);
        });
});
