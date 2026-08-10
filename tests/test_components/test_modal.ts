import { mount } from '@vue/test-utils';

import Modal from '@/components/modal.vue';

import { emitted } from '@/tests/utils';
import { vi } from 'vitest';

describe('Modal.vue', () => {
    beforeEach(() => {
        vi.useRealTimers();
    });

    test('Open and close modal using external boolean', async () => {
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
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(false);

        wrapper.setData({show_modal: true});
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(true);
        wrapper.setData({show_modal: true});
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(true);

        wrapper.setData({show_modal: false});
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(false);
        wrapper.setData({show_modal: false});
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(false);
    });

    test('Close modal with ESC key', async () => {
        const component = {
            template:  `<modal ref="modal"
                               v-if="show_modal"
                               @close="show_modal = false">
                            <input type="text" data-testid="input" />
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
        await wrapper.setData({show_modal: true});
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(true);

        await wrapper.find('[data-testid=input]').trigger('keydown.esc');

        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(false);
    });

    test('Ensure content is only displayed if external boolean is true', async () => {
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

        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(false);
        expect(wrapper.find('.modal-mask').exists()).toBe(false);
        expect(wrapper.find('.modal-container').exists()).toBe(false);
        expect(wrapper.find('.close-button').exists()).toBe(false);

        wrapper.setData({show_modal: true});
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(true);
        expect(wrapper.find('.modal-mask').isVisible()).toBe(true);
        expect(wrapper.find('.modal-container').isVisible()).toBe(true);
        expect(wrapper.find('.close-button').isVisible()).toBe(true);
    });

    test('Modal emits "close" on click of x when include_closing_x is true', async () => {
        const wrapper = mount(Modal);
        expect(wrapper.emitted('close')).toBeUndefined();

        let close_button = wrapper.find('.close-button');
        await close_button.trigger('click');

        expect(emitted(wrapper, 'close').length).toBe(1);
    });

    test('Modal container is labelled as a modal dialog', () => {
        const wrapper = mount(Modal, {
            propsData: {
                aria_label: "Clone course"
            }
        });

        const modal_container = wrapper.find('.modal-container');
        expect(modal_container.attributes('role')).toBe('dialog');
        expect(modal_container.attributes('aria-modal')).toBe('true');
        expect(modal_container.attributes('aria-label')).toBe('Clone course');
    });

    test('Modal emits "close" when clicking outside the modal and ' +
         'click_outside_to_close is true',
         async () => {
        const wrapper = mount(Modal);
        const outside_modal = wrapper.find('.modal-mask');
        const inside_modal = wrapper.find('.modal-container');

        expect(wrapper.vm.click_outside_to_close).toBe(false);

        await inside_modal.trigger('click');
        expect(wrapper.emitted('close')).toBeUndefined();

        await outside_modal.trigger('click');
        expect(wrapper.emitted('close')).toBeUndefined();

        await wrapper.setProps({click_outside_to_close: true});
        expect(wrapper.vm.click_outside_to_close).toBe(true);

        await inside_modal.trigger('click');
        expect(wrapper.emitted('close')).toBeUndefined();

        await outside_modal.trigger('click');
        expect(emitted(wrapper, 'close').length).toEqual(1);
    });

    test('Modal container contains content inside parent\'s <modal></modal> tags', async () => {
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
        await wrapper.vm.$nextTick();
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
         async () => {
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
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$data.show_modal).toBe(true);

        let close_button = wrapper.find('.close-button');
        await close_button.trigger('click');

        expect(wrapper.vm.$data.show_modal).toBe(false);

        wrapper.setData({show_modal: true});
        await wrapper.vm.$nextTick();

        const outside_modal = wrapper.find('.modal-mask');
        const inside_modal = wrapper.find('.modal-container');
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(true);
        expect(wrapper.vm.$data.show_modal).toBe(true);

        await inside_modal.trigger('click');
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(true);
        expect(wrapper.vm.$data.show_modal).toBe(true);

        await outside_modal.trigger('click');
        expect(wrapper.findComponent({ref: 'modal'}).exists()).toBe(false);
        expect(wrapper.vm.$data.show_modal).toBe(false);
    });
});

// focus-trap defers its initial and returning focus with setTimeout, so these
// tests keep the fake timers set up in tests/setup.ts.
describe('Modal.vue focus management', () => {
    const component = {
        template:  `<div>
                        <button data-testid="trigger"
                                @click="show_modal = true">Open</button>
                        <modal v-if="show_modal" @close="show_modal = false">
                            <input type="text" data-testid="first_input" />
                            <input type="text" data-testid="second_input" />
                        </modal>
                    </div>`,
        components: {
            'modal': Modal
        },
        data: () => {
            return {
                show_modal: false
            };
        }
    };

    // jsdom performs no layout, so getClientRects() is empty for every element.
    // focus-trap uses getClientRects() to find the elements to cycle through,
    // so it considers them all hidden. Stub it so the tabbable elements are
    // actually found.
    beforeEach(() => {
        vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue(
            [{width: 10, height: 10}] as unknown as DOMRectList
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Focus moves to the first tabbable element when the modal opens', async () => {
        const wrapper = mount(component, {attachTo: document.body});
        await wrapper.setData({show_modal: true});
        vi.runAllTimers();

        expect(document.activeElement).toBe(
            wrapper.find('[data-testid=first_input]').element);

        wrapper.destroy();
    });

    test('Tab from the last tabbable element wraps to the first', async () => {
        const wrapper = mount(component, {attachTo: document.body});
        await wrapper.setData({show_modal: true});
        vi.runAllTimers();

        const close_button = wrapper.find('.close-button');
        (close_button.element as HTMLElement).focus();
        expect(document.activeElement).toBe(close_button.element);

        await close_button.trigger('keydown.tab');

        expect(document.activeElement).toBe(
            wrapper.find('[data-testid=first_input]').element);

        wrapper.destroy();
    });

    test('Shift+Tab from the first tabbable element wraps to the last', async () => {
        const wrapper = mount(component, {attachTo: document.body});
        await wrapper.setData({show_modal: true});
        vi.runAllTimers();

        const first_input = wrapper.find('[data-testid=first_input]');
        expect(document.activeElement).toBe(first_input.element);

        await first_input.trigger('keydown.tab', {shiftKey: true});

        expect(document.activeElement).toBe(wrapper.find('.close-button').element);

        wrapper.destroy();
    });

    test('Focus returns to the previously focused element when the modal closes',
         async () => {
        const wrapper = mount(component, {attachTo: document.body});
        const trigger = wrapper.find('[data-testid=trigger]').element as HTMLElement;

        trigger.focus();
        await wrapper.find('[data-testid=trigger]').trigger('click');
        vi.runAllTimers();
        expect(document.activeElement).not.toBe(trigger);

        await wrapper.setData({show_modal: false});
        vi.runAllTimers();
        expect(document.activeElement).toBe(trigger);

        wrapper.destroy();
    });
});
