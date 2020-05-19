import { mount } from '@vue/test-utils';

import Toggle from '@/components/toggle.vue';


describe('Toggle.vue', () => {

    test('Toggle data set to default values when not specified by parent', () => {
        const wrapper = mount(Toggle);

        const vm = wrapper.vm;
        expect(vm.$data.is_on).toBe(false);
    });

    test('Toggle data set to values passed in by parent', () => {
        const wrapper = mount(Toggle, {
            propsData: {
                value: true,
            },
            slots: {
                on: "<p> Come in, we're open! </p>",
                off: "<p> Sorry, we're closed </p>"
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.is_on).toBe(true);
        let toggle_on_side = wrapper.find('.active-option-style');
        expect(toggle_on_side.text()).toContain("Come in, we're open!");
        let toggle_off_side = wrapper.find('.inactive-option-style');
        expect(toggle_off_side.text()).toBe("Sorry, we're closed");
    });

    test('Toggle from off to on then off again', () => {
        const wrapper = mount(Toggle, {
            propsData: {
                switch_is_on_text: "Come in, we're open!",
                switch_is_off_text: "Sorry, we're closed"
            },
            slots: {
                on: "<p> Come in, we're open! </p>",
                off: "<p> Sorry, we're closed </p>"
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.is_on).toBe(false);

        // Turn on
        let toggle_on_side = wrapper.find('.inactive-option-style');
        expect(toggle_on_side.text()).toContain("Come in, we're open!");
        toggle_on_side.trigger('click');
        expect(vm.$data.is_on).toBe(true);

        // Turn off
        let toggle_off_side = wrapper.find('.inactive-option-style');
        expect(toggle_off_side.text()).toContain("Sorry, we're closed");
        toggle_off_side.trigger('click');
        expect(vm.$data.is_on).toBe(false);

        // Turn on
        toggle_on_side = wrapper.find('.inactive-option-style');
        expect(toggle_on_side.text()).toContain("Come in, we're open!");
        toggle_on_side.trigger('click');
        expect(vm.$data.is_on).toBe(true);
    });

    test("test click to turn off while already off doesn't change value of 'is_on'", () => {
        const wrapper = mount(Toggle);

        const vm = wrapper.vm;
        expect(vm.$data.is_on).toBe(false);

        let toggle_off_side = wrapper.find('.active-option-style');
        toggle_off_side.trigger('click');
        expect(vm.$data.is_on).toBe(false);
    });

    test("test click to turn on while already on doesn't change value of 'is_on'", () => {
        const wrapper = mount(Toggle, {
            propsData: {
                value: true
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.is_on).toBe(true);

        let toggle_on_side = wrapper.find('.active-option-style');
        toggle_on_side.trigger('click');
        expect(vm.$data.is_on).toBe(true);
    });

    test("v-model binding", () => {
        const component = {
            template:  `<toggle ref="toggle" v-model="my_toggle"></toggle>`,
            components: {
                'toggle': Toggle
            },
            data: () => {
                return {
                    my_toggle: false
                };
            }
        };

        const wrapper = mount(component);
        const toggle = wrapper.find({ref: 'toggle'});
        expect(toggle.vm.$data.is_on).toEqual(false);

        wrapper.setData({my_toggle: true});
        expect(toggle.vm.$data.is_on).toEqual(true);

        toggle.find('.inactive-option-style').trigger('click');
        expect(toggle.vm.$data.is_on).toEqual(false);
        expect(wrapper.vm.$data.my_toggle).toEqual(false);
    });
});
