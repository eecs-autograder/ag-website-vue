import { mount, Wrapper } from '@vue/test-utils';

import moment from 'moment-timezone';
import * as sinon from 'sinon';
// @ts-ignore
import * as timezone_mock from 'timezone-mock';

import DatetimePicker, { InvalidDatetimeStrError } from '@/components/datetime/datetime_picker.vue';
import TimePicker from "@/components/datetime/time_picker.vue";

import { emitted, set_props } from '@/tests/utils';



describe('DatetimePicker tests', () => {
    test('Month, year, day, and time are initialized from input', async () => {
        sinon.stub(moment.tz, 'guess').returns('US/Eastern');
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-12-25T18:36:37.746Z"
            },

        });
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_month).toEqual(11);
        expect(wrapper.vm.d_year).toEqual(2019);

        expect(wrapper.vm.d_selected_day).toEqual(25);
        expect(wrapper.vm.d_selected_month).toEqual(11);
        expect(wrapper.vm.d_selected_year).toEqual(2019);

        expect(wrapper.vm.d_date.date()).toEqual(25);
        expect(wrapper.vm.d_date.month()).toEqual(11);
        expect(wrapper.vm.d_date.year()).toEqual(2019);

        let time_picker = <Wrapper<TimePicker>> wrapper.findComponent({ref: 'time_picker'});
        expect(time_picker.vm.d_time.hours).toEqual(13);
        expect(time_picker.vm.d_time.minutes).toEqual(36);
    });

    test('Initial value null, no day highlighted until day selected', async () => {
        // Intentionally NOT mocking moment.tz.guess()
        let wrapper = mount(DatetimePicker);
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        let now = moment();

        expect(wrapper.vm.d_month).toEqual(now.month());
        expect(wrapper.vm.d_year).toEqual(now.year());

        expect(wrapper.vm.d_selected_day).toBeNull();
        expect(wrapper.vm.d_selected_month).toBeNull();
        expect(wrapper.vm.d_selected_year).toBeNull();

        expect(wrapper.vm.d_date.date()).toEqual(now.date());
        expect(wrapper.vm.d_date.month()).toEqual(now.month());
        expect(wrapper.vm.d_date.year()).toEqual(now.year());

        let time_picker = <Wrapper<TimePicker>> wrapper.findComponent({ref: 'time_picker'});
        expect(time_picker.vm.d_time.hours).toEqual(now.hours());
        let minutes_diff = Math.abs(time_picker.vm.d_time.minutes - now.minutes());
        expect(minutes_diff).toBeLessThan(1);

        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        let selected_day = wrapper.findAll('.selected-day');
        expect(selected_day.length).toEqual(0);

        let first_week = wrapper.findAll('.week').at(0);
        await first_week.findAll('.available-day').at(0).trigger('click');

        expect(wrapper.vm.d_selected_day).toEqual(1);
        expect(wrapper.vm.d_selected_month).toEqual(now.month());
        expect(wrapper.vm.d_selected_year).toEqual(now.year());

        expect(emitted(wrapper, 'input').length).toBe(1);
        let emitted_date = new Date(emitted(wrapper, 'input')[0][0]);
        expect(emitted_date.getFullYear()).toEqual(now.year());
        expect(emitted_date.getMonth()).toEqual(now.month());
        expect(emitted_date.getDate()).toEqual(1);
    });

    test('Initial value null, time change before day selected does not emit', async () => {
        sinon.stub(moment.tz, 'guess').returns('US/Eastern');
        let wrapper = mount(DatetimePicker);
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        let time_picker = <Wrapper<TimePicker>> wrapper.findComponent({ref: 'time_picker'});
        time_picker.vm.go_to_prev_minute();
        await wrapper.vm.$nextTick();
        expect(emitted(time_picker, 'input').length).toEqual(1);

        expect(wrapper.emitted('input')).toBeUndefined();

        await set_props(wrapper, {value: "2019-12-25T18:36:37.746Z"});
        time_picker.vm.go_to_prev_minute();
        await wrapper.vm.$nextTick();
        expect(emitted(wrapper, 'input').length).toEqual(1);

        let emitted_date = new Date(emitted(wrapper, 'input')[0][0]);
        expect(emitted_date.getMinutes()).toEqual(35);
    });

    test('Invalid date str throws exception', () => {
        sinon.stub(console, 'error');
        sinon.stub(console, 'warn');
        // timezone_mock.unregister();
        expect(() => {
            mount(DatetimePicker, {
                propsData: {
                    value: 'invalid'
                }
            });
        }).toThrow(InvalidDatetimeStrError);
    });

    test('Select different day in calendar, event emitted', async () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-12-25T18:36:37.746Z"
            },

        });
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_date.month()).toEqual(11);
        await wrapper.find('.next-month-button').trigger('click');

        expect(wrapper.vm.d_month).toEqual(0);
        expect(wrapper.vm.d_year).toEqual(2020);

        let second_week = wrapper.findAll('.week').at(1);
        await second_week.findAll('.available-day').at(0).trigger('click');

        expect(wrapper.vm.d_selected_day).toEqual(5);
        expect(wrapper.findAll('.selected-day').length).toEqual(1);

        expect(wrapper.vm.d_date.month()).toEqual(0);
        expect(wrapper.vm.d_selected_month).toEqual(0);
        expect(wrapper.vm.d_date.year()).toEqual(2020);
        expect(wrapper.vm.d_selected_year).toEqual(2020);

        expect(emitted(wrapper, 'input').length).toBe(1);

        let emitted_date = new Date(emitted(wrapper, 'input')[0][0]);
        expect(emitted_date.getFullYear()).toEqual(2020);
        expect(emitted_date.getMonth()).toEqual(0);
        expect(emitted_date.getDate()).toEqual(5);
    });

    test("Value passed into 'value' prop changed by parent component", async () => {
        sinon.stub(moment.tz, 'guess').returns('US/Eastern');
        let orig_date_string = "2019-07-21T12:20:40.746Z";
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: orig_date_string
            }
        });
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_selected_day).toEqual(21);
        expect(wrapper.vm.d_selected_month).toEqual(6);
        expect(wrapper.vm.d_selected_year).toEqual(2019);

        expect(wrapper.vm.d_date.date()).toEqual(21);
        expect(wrapper.vm.d_date.month()).toEqual(6);
        expect(wrapper.vm.d_date.year()).toEqual(2019);

        let time_picker = <Wrapper<TimePicker>> wrapper.findComponent({ref: 'time_picker'});
        expect(time_picker.vm.d_time.hours).toEqual(8);
        expect(time_picker.vm.d_time.minutes).toEqual(20);

        await set_props(wrapper, {'value': "2021-03-08T23:49:40.746Z"});

        expect(wrapper.vm.d_selected_day).toEqual(8);
        expect(wrapper.vm.d_selected_month).toEqual(2);
        expect(wrapper.vm.d_selected_year).toEqual(2021);

        expect(wrapper.vm.d_date.date()).toEqual(8);
        expect(wrapper.vm.d_date.month()).toEqual(2);
        expect(wrapper.vm.d_date.year()).toEqual(2021);

        expect(time_picker.vm.d_time.hours).toEqual(18);
        expect(time_picker.vm.d_time.minutes).toEqual(49);
    });

    test("Toggle visibility of the DatetimePicker", async () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-03-08T23:20:40.746Z"
            }
        });

        expect(wrapper.vm.is_visible).toBe(false);
        expect(wrapper.find('.datetime-picker').exists()).toEqual(false);

        wrapper.vm.toggle_visibility();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_visible).toBe(true);
        expect(wrapper.find('.datetime-picker').exists()).toEqual(true);

        wrapper.vm.hide();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.is_visible).toBe(false);
        expect(wrapper.find('.datetime-picker').exists()).toEqual(false);

        wrapper.vm.show();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.is_visible).toBe(true);
        expect(wrapper.find('.datetime-picker').exists()).toEqual(true);
    });
});

describe('DatetimePicker keyboard inputs', () => {
    beforeEach(() => {
        sinon.stub(moment.tz, 'guess').returns('US/Eastern');
    });

    test('Pressing left arrow goes to previous month (with year wraparound)', async () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-01-25T18:36:37.746Z"
            }
        });
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_month).toEqual(0);
        expect(wrapper.vm.d_year).toEqual(2019);

        await wrapper.find('.prev-month-button').trigger('click');
        expect(wrapper.vm.d_month).toEqual(11);
        expect(wrapper.vm.d_year).toEqual(2018);
        await wrapper.find('.prev-month-button').trigger('click');
        expect(wrapper.vm.d_month).toEqual(10);
        await wrapper.find('.prev-month-button').trigger('click');
        expect(wrapper.vm.d_month).toEqual(9);
    });

    test('Pressing right arrow goes to the next month (with year wraparound)', async () => {
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: "2019-12-25T18:36:37.746Z"
            }
        });
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_month).toEqual(11);
        expect(wrapper.vm.d_year).toEqual(2019);

        await wrapper.find('.next-month-button').trigger('click');
        expect(wrapper.vm.d_month).toEqual(0);
        expect(wrapper.vm.d_year).toEqual(2020);
        await wrapper.find('.next-month-button').trigger('click');
        expect(wrapper.vm.d_month).toEqual(1);
        await wrapper.find('.next-month-button').trigger('click');
        expect(wrapper.vm.d_month).toEqual(2);
    });
});

describe('Timezone select tests', () => {
    beforeEach(() => {
        sinon.stub(moment.tz, 'guess').returns('US/Pacific');
    });

    afterEach(() => {
        timezone_mock.unregister();
    });

    test('Change timezone', async () => {
        let original_time = moment().seconds(0).milliseconds(0);  // Avoid precision issues
        let wrapper = mount(DatetimePicker, {
            propsData: {
                value: original_time.format()
            }
        });
        wrapper.vm.show();
        await wrapper.vm.$nextTick();

        wrapper.find('[data-testid=timezone-select]').setValue('US/Eastern');
        let new_time = emitted(wrapper, 'input')[0][0] as string;
        let diff = moment.duration(moment(original_time).diff(new_time));
        expect(diff.asHours()).toEqual(3);

        set_props(wrapper, {value: new_time});
        expect(wrapper.vm.d_timezone).toEqual('US/Eastern');
        expect(wrapper.vm.d_date.format()).toEqual(new_time);
    });
});
