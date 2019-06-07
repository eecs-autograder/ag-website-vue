import DatetimePicker, { InvalidDatetimeStrError } from '@/components/datetime/datetime_picker.vue';
import TimePicker from "@/components/datetime/time_picker.vue";
import { config, mount, Wrapper } from '@vue/test-utils';

// @ts-ignore
import * as timezone_mock from 'timezone-mock';

beforeAll(() => {
    config.logModifiedComponents = false;
});

beforeEach(() => {
    timezone_mock.register('US/Eastern');
});

afterEach(() => {
    timezone_mock.unregister();
});

describe('DatetimePicker tests', () => {
    test('Month, year, day, and time are initialized from input', () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-12-25T18:36:37.746Z"
            },

        });
        let component = wrapper.vm;
        component.show();

        expect(component.d_month).toEqual(11);
        expect(component.d_year).toEqual(2019);

        expect(component.d_selected_day).toEqual(25);
        expect(component.d_selected_month).toEqual(11);
        expect(component.d_selected_year).toEqual(2019);

        expect(component.d_date.date()).toEqual(25);
        expect(component.d_date.month()).toEqual(11);
        expect(component.d_date.year()).toEqual(2019);

        let time_picker = <Wrapper<TimePicker>> wrapper.find({ref: 'time_picker'});
        expect(time_picker.vm.d_time.hours).toEqual(13);
        expect(time_picker.vm.d_time.minutes).toEqual(36);
    });

    test('Initial value null, no day highlighted until day selected', () => {
        let wrapper = mount(DatetimePicker);
        let component = wrapper.vm;
        component.show();

        let now = new Date();

        expect(component.d_month).toEqual(now.getMonth());
        expect(component.d_year).toEqual(now.getFullYear());

        expect(component.d_selected_day).toBeNull();
        expect(component.d_selected_month).toBeNull();
        expect(component.d_selected_year).toBeNull();

        expect(component.d_date.date()).toEqual(now.getDate());
        expect(component.d_date.month()).toEqual(now.getMonth());
        expect(component.d_date.year()).toEqual(now.getFullYear());

        let time_picker = <Wrapper<TimePicker>> wrapper.find({ref: 'time_picker'});
        expect(time_picker.vm.d_time.hours).toEqual(now.getHours());
        let minutes_diff = Math.abs(time_picker.vm.d_time.minutes - now.getMinutes());
        expect(minutes_diff).toBeLessThan(1);

        component.show();

        let selected_day = wrapper.findAll('.selected-day');
        expect(selected_day.length).toEqual(0);

        let first_week = wrapper.findAll('.week').at(0);
        first_week.findAll('.available-day').at(0).trigger('click');

        expect(component.d_selected_day).toEqual(1);
        expect(component.d_selected_month).toEqual(now.getMonth());
        expect(component.d_selected_year).toEqual(now.getFullYear());

        expect(wrapper.emitted().input.length).toBe(1);
        let emitted = new Date(wrapper.emitted('input')[0][0]);
        expect(emitted.getFullYear()).toEqual(now.getFullYear());
        expect(emitted.getMonth()).toEqual(now.getMonth());
        expect(emitted.getDate()).toEqual(1);
    });

    test('Initial value null, time change before day selected does not emit', () => {
        let wrapper = mount(DatetimePicker);
        wrapper.vm.show();

        let time_picker = <Wrapper<TimePicker>> wrapper.find({ref: 'time_picker'});
        time_picker.vm.go_to_prev_minute();
        expect(time_picker.emitted('input').length).toEqual(1);

        expect(wrapper.emitted('input')).toBeUndefined();

        wrapper.setProps({value: "2019-12-25T18:36:37.746Z"});
        time_picker.vm.go_to_prev_minute();
        expect(wrapper.emitted('input').length).toEqual(1);

        let emitted = new Date(wrapper.emitted('input')[0][0]);
        expect(emitted.getMinutes()).toEqual(35);
    });

    test('Invalid date str throws exception', () => {
        timezone_mock.unregister();
        expect(() => {
            mount(DatetimePicker, {
                propsData: {
                    value: 'invalid'
                }
            });
        }).toThrow(InvalidDatetimeStrError);
    });

    test('Select different day in calendar, event emitted', () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-12-25T18:36:37.746Z"
            },

        });
        let component = wrapper.vm;
        component.show();

        expect(component.d_date.month()).toEqual(11);
        wrapper.find('.next-month-button').trigger('click');

        expect(component.d_month).toEqual(0);
        expect(component.d_year).toEqual(2020);

        let second_week = wrapper.findAll('.week').at(1);
        second_week.findAll('.available-day').at(0).trigger('click');

        expect(component.d_selected_day).toEqual(5);
        expect(wrapper.findAll('.selected-day').length).toEqual(1);

        expect(component.d_date.month()).toEqual(0);
        expect(component.d_selected_month).toEqual(0);
        expect(component.d_date.year()).toEqual(2020);
        expect(component.d_selected_year).toEqual(2020);

        expect(wrapper.emitted().input.length).toBe(1);

        let emitted = new Date(wrapper.emitted('input')[0][0]);
        expect(emitted.getFullYear()).toEqual(2020);
        expect(emitted.getMonth()).toEqual(0);
        expect(emitted.getDate()).toEqual(5);
    });

    test("Value passed into 'value' prop changed by parent component", () => {
        let orig_date_string = "2019-07-21T12:20:40.746Z";
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: orig_date_string
            }
        });
        let component = wrapper.vm;
        component.show();

        expect(component.d_selected_day).toEqual(21);
        expect(component.d_selected_month).toEqual(6);
        expect(component.d_selected_year).toEqual(2019);

        expect(component.d_date.date()).toEqual(21);
        expect(component.d_date.month()).toEqual(6);
        expect(component.d_date.year()).toEqual(2019);

        let time_picker = <Wrapper<TimePicker>> wrapper.find({ref: 'time_picker'});
        expect(time_picker.vm.d_time.hours).toEqual(8);
        expect(time_picker.vm.d_time.minutes).toEqual(20);

        wrapper.setProps({'value': "2021-03-08T23:49:40.746Z"});

        expect(component.d_selected_day).toEqual(8);
        expect(component.d_selected_month).toEqual(2);
        expect(component.d_selected_year).toEqual(2021);

        expect(component.d_date.date()).toEqual(8);
        expect(component.d_date.month()).toEqual(2);
        expect(component.d_date.year()).toEqual(2021);

        expect(time_picker.vm.d_time.hours).toEqual(18);
        expect(time_picker.vm.d_time.minutes).toEqual(49);
    });

    test("Toggle visibility of the DatetimePicker", () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-03-08T23:20:40.746Z"
            }
        });
        let component = wrapper.vm;

        expect(component.is_visible).toBe(false);
        expect(wrapper.find('#datetime-picker').exists()).toEqual(false);

        component.toggle_visibility();

        expect(component.is_visible).toBe(true);
        expect(wrapper.find('#datetime-picker').exists()).toEqual(true);

        component.hide();
        expect(component.is_visible).toBe(false);
        expect(wrapper.find('#datetime-picker').exists()).toEqual(false);

        component.show();
        expect(component.is_visible).toBe(true);
        expect(wrapper.find('#datetime-picker').exists()).toEqual(true);
    });
});

describe('DatetimePicker keyboard inputs', () => {
    test('Pressing the left arrow takes you to the previous month (and year if January)', () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-01-25T18:36:37.746Z"
            }
        });
        let component = wrapper.vm;
        component.show();

        expect(component.d_month).toEqual(0);
        expect(component.d_year).toEqual(2019);

        wrapper.find('.prev-month-button').trigger('click');
        expect(component.d_month).toEqual(11);
        expect(component.d_year).toEqual(2018);
        wrapper.find('.prev-month-button').trigger('click');
        expect(component.d_month).toEqual(10);
        wrapper.find('.prev-month-button').trigger('click');
        expect(component.d_month).toEqual(9);
    });

    test('Pressing the right arrow takes you to the next month (and year if December)', () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-12-25T18:36:37.746Z"
            }
        });
        let component = wrapper.vm;
        component.show();

        expect(component.d_month).toEqual(11);
        expect(component.d_year).toEqual(2019);

        wrapper.find('.next-month-button').trigger('click');
        expect(component.d_month).toEqual(0);
        expect(component.d_year).toEqual(2020);
        wrapper.find('.next-month-button').trigger('click');
        expect(component.d_month).toEqual(1);
        wrapper.find('.next-month-button').trigger('click');
        expect(component.d_month).toEqual(2);
    });
});
