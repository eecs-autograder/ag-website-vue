import { Component, Vue } from 'vue-property-decorator';

import { mount, Wrapper } from '@vue/test-utils';

import Toggle from '@/components/toggle.vue';

import { set_data } from '@/tests/utils';


describe('Toggle.vue', () => {

    test('Toggle data set to default values when not specified by parent', () => {
        const wrapper = mount(Toggle);
        expect(wrapper.vm.is_on).toBe(false);
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

        expect(wrapper.vm.is_on).toBe(true);
        let toggle_on_side = wrapper.find('.active-option-style');
        expect(toggle_on_side.text()).toContain("Come in, we're open!");
        let toggle_off_side = wrapper.find('.inactive-option-style');
        expect(toggle_off_side.text()).toBe("Sorry, we're closed");
    });

    test('Toggle from off to on then off again', async () => {
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

        expect(wrapper.vm.is_on).toBe(false);

        // Turn on
        let toggle_on_side = wrapper.find('.inactive-option-style');
        expect(toggle_on_side.text()).toContain("Come in, we're open!");
        await toggle_on_side.trigger('click');
        expect(wrapper.vm.is_on).toBe(true);

        // Turn off
        let toggle_off_side = wrapper.find('.inactive-option-style');
        expect(toggle_off_side.text()).toContain("Sorry, we're closed");
        await toggle_off_side.trigger('click');
        expect(wrapper.vm.is_on).toBe(false);

        // Turn on
        toggle_on_side = wrapper.find('.inactive-option-style');
        expect(toggle_on_side.text()).toContain("Come in, we're open!");
        await toggle_on_side.trigger('click');
        expect(wrapper.vm.is_on).toBe(true);
    });

    test("test click to turn off while already off doesn't change value of 'is_on'", async () => {
        const wrapper = mount(Toggle);
        expect(wrapper.vm.is_on).toBe(false);

        let toggle_off_side = wrapper.find('.active-option-style');
        await toggle_off_side.trigger('click');
        expect(wrapper.vm.is_on).toBe(false);
    });

    test("test click to turn on while already on doesn't change value of 'is_on'", async () => {
        const wrapper = mount(Toggle, {
            propsData: {
                value: true
            }
        });

        expect(wrapper.vm.is_on).toBe(true);

        let toggle_on_side = wrapper.find('.active-option-style');
        await toggle_on_side.trigger('click');
        expect(wrapper.vm.is_on).toBe(true);
    });

    test("v-model binding", async () => {
        @Component({
            template:  `<toggle ref="toggle" v-model="my_toggle"></toggle>`,
            components: {
                'toggle': Toggle
            }
        })
        class WrapperComponent extends Vue {
            my_toggle = false;
        }

        const wrapper = mount(WrapperComponent);
        const toggle = <Wrapper<Toggle>> wrapper.findComponent(Toggle);
        expect(toggle.vm.is_on).toEqual(false);

        await set_data(wrapper, {my_toggle: true});
        expect(toggle.vm.is_on).toEqual(true);

        await toggle.find('.inactive-option-style').trigger('click');
        expect(toggle.vm.is_on).toEqual(false);
        expect(wrapper.vm.my_toggle).toEqual(false);
    });
});
