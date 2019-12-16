import { mount } from '@vue/test-utils';

import Modal from '@/components/modal.vue';

describe('Modal.vue', () => {
    test('Open and close modal using external boolean', () => {
        const component = {
            template:  `<modal ref="modal"
                               v-if="show_modal"
                               @close="show_modal = false">
                        </modal>`,
            components: {
                'modal': Modal
            },
            data: () => {
                return {
                    show_modal: false
                };
            }
        };

        const wrapper = mount(component);
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(false);

        wrapper.setData({show_modal: true});
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(true);
        wrapper.setData({show_modal: true});
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(true);

        wrapper.setData({show_modal: false});
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(false);
        wrapper.setData({show_modal: false});
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(false);
    });

    test('Ensure content is only displayed if external boolean is true', () => {
        const component = {
            template:  `<modal ref="modal"
                               v-if="show_modal"
                               @close="show_modal = false">
                        </modal>`,
            components: {
                'modal': Modal
            },
            data: () => {
                return {
                    show_modal: false
                };
            }
        };
        const wrapper = mount(component);

        expect(wrapper.find({ref: 'modal'}).exists()).toBe(false);
        expect(wrapper.find('.modal-mask').exists()).toBe(false);
        expect(wrapper.find('.modal-container').exists()).toBe(false);
        expect(wrapper.find('.close-button').exists()).toBe(false);

        wrapper.setData({show_modal: true});
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(true);
        expect(wrapper.find('.modal-mask').isVisible()).toBe(true);
        expect(wrapper.find('.modal-container').isVisible()).toBe(true);
        expect(wrapper.find('.close-button').isVisible()).toBe(true);
    });

    test('Modal emits "close" on click of x when include_closing_x is true', () => {
        const wrapper = mount(Modal);
        expect(wrapper.emitted().close).toBeUndefined();

        let close_button = wrapper.find('.close-button');
        close_button.trigger('click');

        expect(wrapper.emitted('close').length).toBe(1);
    });

    test('Modal emits "close" when clicking outside the modal and ' +
         'click_outside_to_close is true',
         () => {
        const wrapper = mount(Modal);
        const outside_modal = wrapper.find('.modal-mask');
        const inside_modal = wrapper.find('.modal-container');

        expect(wrapper.vm.click_outside_to_close).toBe(false);

        inside_modal.trigger('click');
        expect(wrapper.emitted('close')).toBeUndefined();

        outside_modal.trigger('click');
        expect(wrapper.emitted('close')).toBeUndefined();

        wrapper.setProps({click_outside_to_close: true});
        expect(wrapper.vm.click_outside_to_close).toBe(true);

        inside_modal.trigger('click');
        expect(wrapper.emitted('close')).toBeUndefined();

        outside_modal.trigger('click');
        expect(wrapper.emitted('close').length).toEqual(1);
    });

    test('Modal container contains content inside parent\'s <modal></modal> tags', () => {
        const component = {
            template:  `<modal ref="modal"
                               v-if="show_modal"
                               @close="show_modal = false">
                               <p>Look at me! Text inside the modal!</p>
                        </modal>`,
            components: {
                'modal': Modal
            },
            data: () => {
                return {
                    show_modal: false
                };
            }
        };
        const wrapper = mount(component);

        wrapper.setData({show_modal: true});
        const modal_container = wrapper.find('.modal-container');
        expect(modal_container.text()).toContain("Look at me! Text inside the modal!");
    });

    test('Modal resized according to size prop', () => {
        const wrapper = mount(Modal, {
            propsData: {
                size: "small"
            }
        });

        const modal_container = wrapper.find('.modal-container');
        expect(modal_container.classes()).toContain('small');
    });

    test('Modal changes width according to custom_width prop', () => {
        const wrapper = mount(Modal, {
            propsData: {
                custom_width: "50px"
            }
        });

        const modal_container = wrapper.find('.modal-container');
        expect(modal_container.attributes().style).toBe('width: 50px;');
    });

    test('Modal does not show close button with remove_x flag', () => {
        const wrapper = mount(Modal, {
            propsData: {
                include_closing_x: false
            }
        });

        expect(wrapper.find('.close-button').exists()).toBe(false);
    });

    test('Using the emitted "close" event handler to toggle the external boolean ' +
         'controlling visibility of the modal',
         () => {
        const component = {
            template:  `<modal ref="modal"
                               v-if="show_modal"
                               @close="show_modal = false"
                               click_outside_to_close>
                        </modal>`,
            components: {
                'modal': Modal
            },
            data: () => {
                return {
                    show_modal: false
                };
            }
        };
        const wrapper = mount(component);
        wrapper.setData({show_modal: true});

        expect(wrapper.vm.$data.show_modal).toBe(true);

        let close_button = wrapper.find('.close-button');
        close_button.trigger('click');

        expect(wrapper.vm.$data.show_modal).toBe(false);

        wrapper.setData({show_modal: true});

        const outside_modal = wrapper.find('.modal-mask');
        const inside_modal = wrapper.find('.modal-container');
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(true);
        expect(wrapper.vm.$data.show_modal).toBe(true);

        inside_modal.trigger('click');
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(true);
        expect(wrapper.vm.$data.show_modal).toBe(true);

        outside_modal.trigger('click');
        expect(wrapper.find({ref: 'modal'}).exists()).toBe(false);
        expect(wrapper.vm.$data.show_modal).toBe(false);
    });
});
