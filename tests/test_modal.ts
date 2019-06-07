import { mount } from '@vue/test-utils';

import Modal from '@/components/modal.vue';

describe('Modal.vue', () => {
    test('Modal open, close, and toggle methods open and close modal', () => {
        const wrapper = mount(Modal);
        const vm = wrapper.vm;
        expect(vm.$data.is_open).toBe(false);

        vm.open();
        expect(vm.$data.is_open).toBe(true);
        vm.open();
        expect(vm.$data.is_open).toBe(true);

        vm.close();
        expect(vm.$data.is_open).toBe(false);
        vm.close();
        expect(vm.$data.is_open).toBe(false);

        vm.toggle();
        expect(vm.$data.is_open).toBe(true);
        vm.toggle();
        expect(vm.$data.is_open).toBe(false);
    });

    test('Ensure content is only displayed if is_open is true', () => {
        const wrapper = mount(Modal);
        const vm = wrapper.vm;

        expect(vm.$data.is_open).toBe(false);
        expect(wrapper.find('#modal-mask').exists()).toBe(false);
        expect(wrapper.find('.modal-container').exists()).toBe(false);
        expect(wrapper.find('#close-button').exists()).toBe(false);

        vm.open();
        expect(vm.$data.is_open).toBe(true);
        expect(wrapper.find('#modal-mask').isVisible()).toBe(true);
        expect(wrapper.find('.modal-container').isVisible()).toBe(true);
        expect(wrapper.find('#close-button').isVisible()).toBe(true);
    });

    test('Modal runs close function on click of x', () => {
        const wrapper = mount(Modal);

        const vm = wrapper.vm;
        vm.open();
        expect(vm.$data.is_open).toBe(true);
        let close_button = wrapper.find('#close-button');
        close_button.trigger('click');
        expect(vm.$data.is_open).toBe(false);
    });

    test('Modal does not run close function on click of shadow by default', () => {
        const wrapper = mount(Modal);
        const vm = wrapper.vm;
        vm.open();

        const outside_modal = wrapper.find('#modal-mask');
        const inside_modal = wrapper.find('.modal-container');
        expect(vm.$data.is_open).toBe(true);

        inside_modal.trigger('click');
        expect(vm.$data.is_open).toBe(true);

        outside_modal.trigger('click');
        expect(vm.$data.is_open).toBe(true);
    });

    test('Modal runs close function on click of shadow with close_on_click flag', () => {
        const wrapper = mount(Modal, {
            propsData: {
                click_outside_to_close: true
            }
        });

        const vm = wrapper.vm;
        vm.open();

        const outside_modal = wrapper.find('#modal-mask');
        const inside_modal = wrapper.find('.modal-container');
        expect(vm.$data.is_open).toBe(true);

        inside_modal.trigger('click');
        expect(vm.$data.is_open).toBe(true);

        outside_modal.trigger('click');
        expect(vm.$data.is_open).toBe(false);
    });

    test('Modal container contains content inside parent\'s <modal></modal> tags', () => {
        const wrapper = mount(Modal, {
            slots: {
                default: "<p>Look at me! Text inside the modal!</p>"
            }
        });

        wrapper.vm.open();
        const modal_container = wrapper.find('.modal-container');
        expect(modal_container.text()).toContain("Look at me! Text inside the modal!");
    });

    test('Modal resized according to size prop', () => {
        const wrapper = mount(Modal, {
            propsData: {
                size: 'small'
            }
        });

        wrapper.vm.open();
        const modal_container = wrapper.find('.modal-container');
        expect(modal_container.classes()).toContain('small');
    });

    test('Modal changes width according to custom_width prop', () => {
        const wrapper = mount(Modal, {
            propsData: {
                custom_width: '50px'
            }
        });

        wrapper.vm.open();
        const modal_container = wrapper.find('.modal-container');
        expect(modal_container.attributes().style).toBe('width: 50px;');
    });

    test('Modal does not show close button with remove_x flag', () => {
        const wrapper = mount(Modal, {
            propsData: {
                include_closing_x: false
            }
        });

        expect(wrapper.find('#close-button').exists()).toBe(false);
    });
});
