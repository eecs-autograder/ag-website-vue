import Vue from 'vue';
import Component from 'vue-class-component';

import { mount, Wrapper } from '@vue/test-utils';

import * as sinon from 'sinon';

import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

import { emitted } from '@/tests/utils';


@Component({
    template: `<div class="outermost">
                <div>
                  <div class="context-menu-area"
                       @click="show_menu">
                    <p class="greeting"
                       :style="[{color: 'black', font: 'Arial'}]"> Happy Halloween </p>
                  </div>
                  <context-menu ref="context_menu" :is_open="is_open" :coordinates="coordinates"
                                @close="is_open = false">
                    <context-menu-item ref="item_1" @click="change_greeting_color('orange')">
                      One
                    </context-menu-item>
                    <context-menu-item ref="item_2" @click="make_greeting_cursive()">
                      Two
                    </context-menu-item>
                    <context-menu-item ref="item_3" @click="change_greeting_text('Boo!')">
                      Three
                    </context-menu-item>
                    <context-menu-item ref="disabled_item" :disabled="true">
                      Disabled
                    </context-menu-item>
                  </context-menu>
                </div>
              <input id="outside" type="text"/>
             </div>`,
    components: {
        'context-menu': ContextMenu,
        'context-menu-item': ContextMenuItem
    }
})
class WrapperComponent extends Vue {
    coordinates = {x: 0, y: 0};
    is_open = false;

    change_greeting_color(color_in: string) {
        let greeting = <HTMLElement> this.$el.getElementsByClassName(
            'greeting'
        )[0];
        greeting.style.color = color_in;
    }

    make_greeting_cursive() {
        let greeting = <HTMLElement> this.$el.getElementsByClassName(
            'greeting'
        )[0];
        greeting.style.font = "cursive";
    }

    change_greeting_text(new_text: string) {
        let greeting = <HTMLElement> this.$el.getElementsByClassName(
            'greeting'
        )[0];
        greeting.innerHTML = new_text;
    }

    show_menu(event: MouseEvent) {
        this.is_open = true;
        this.coordinates = {x: event.pageX, y: event.pageY};
    }
}

describe('ContextMenu tests', () => {
    test("Context Menu Item click handlers", async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.findComponent({ref: 'context_menu'}).vm;

        let context_menu_area = wrapper.find('.context-menu-area');
        let greeting = wrapper.find('.greeting');

        expect(greeting.element.style.color).toBe("black");
        expect(greeting.element.style.font).toBe("Arial");
        expect(greeting.text()).toBe("Happy Halloween");

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_1 = wrapper.findComponent({ref: 'item_1'});
        context_menu_item_1.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.color).toBe('orange');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_2 = wrapper.findComponent({ref: 'item_2'});
        context_menu_item_2.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.font).toBe('cursive');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_3 = wrapper.findComponent({ref: 'item_3'});

        context_menu_item_3.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.text()).toBe('Boo!');

        wrapper.destroy();
    });

    test.skip("Clicking outside the context menu emits close event", async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <Wrapper<ContextMenu>> wrapper.findComponent({ref: 'context_menu'});
        let context_menu_area = wrapper.find('.context-menu-area');
        context_menu_area.trigger('click');
        await context_menu.vm.$nextTick();

        expect(context_menu.isVisible()).toBe(true);

        let outside_input = wrapper.find('#outside');
        outside_input.trigger('click');
        outside_input.element.focus();
        await context_menu.vm.$nextTick();

        expect(emitted(context_menu, 'close').length).not.toEqual(0);
        expect(context_menu.isVisible()).toBe(false);

        wrapper.destroy();
    });

    test("Click event not emitted when disabled item clicked", async () => {
        let wrapper = mount(WrapperComponent);
        let menu_wrapper = <Wrapper<ContextMenu>> wrapper.findComponent({ref: 'context_menu'});
        wrapper.find('.context-menu-area').trigger('click');
        await menu_wrapper.vm.$nextTick();

        let disabled_wrapper = wrapper.findComponent({ref: 'disabled_item'});
        disabled_wrapper.trigger('click');
        expect(disabled_wrapper.emitted('click')).toBeUndefined();
    });

    test("Position adjusted when too near right edge", async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.findComponent({ref: 'context_menu'}).vm;

        sinon.stub(document.body, 'clientWidth').value(800);
        sinon.stub(document.body, 'clientHeight').value(500);
        sinon.stub(context_menu.$el, 'clientWidth').value(10);

        wrapper.vm.coordinates = {x: 798, y: 2};
        wrapper.vm.is_open = true;
        await context_menu.$nextTick();
        let new_left = (<HTMLElement> context_menu.$el).style.left;
        expect(new_left).not.toBeNull();
        // Chop off 'px'
        new_left = new_left!.substring(0, new_left!.length - 2);
        let number_new_left: number = parseInt(new_left, 10);
        expect(number_new_left).toBeLessThan(798);

        sinon.restore();
        wrapper.destroy();
    });

    test("Position adjusted when too close to bottom edge", async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.findComponent({ref: 'context_menu'}).vm;

        sinon.stub(document.body, 'clientWidth').value(800);
        sinon.stub(document.body, 'clientHeight').value(500);
        sinon.stub(context_menu.$el, 'clientHeight').value(15);

        wrapper.vm.coordinates = {x: 2, y: 498};
        wrapper.vm.is_open = true;
        await context_menu.$nextTick();
        let new_top = (<HTMLElement> context_menu.$el).style.top;
        expect(new_top).not.toBeNull();
        new_top = new_top!.substring(0, new_top!.length - 2);
        let number_new_top: number = parseInt(new_top, 10);
        expect(number_new_top).toBeLessThan(498);

        sinon.restore();
        wrapper.destroy();
     });

    test('Arbitrary Context Menu Content', () => {
        const component = {
            template:  `<context_menu ref="context_menu"
                                      :is_open="is_open" :coordinates="coordinates">
                          <div>Hello</div>
                        </context_menu>`,
            components: {
                'context_menu': ContextMenu,
            },
            data: function() {
                return {
                    is_open: true,
                    coordinates: {x: 0, y: 0}
                };
            }
        };

        let wrapper = mount(component);
        expect(wrapper.findComponent({ref: 'context_menu'}).text()).toContain('Hello');
    });

    test("Pressing esc closes the context menu", async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu_area = wrapper.find('.context-menu-area');
        let context_menu_wrapper = wrapper.find('.context-menu-container');

        context_menu_area.trigger('click');
        await wrapper.vm.$nextTick();
        expect(context_menu_wrapper.isVisible()).toBe(true);

        context_menu_wrapper.trigger('keyup.esc');
        await wrapper.vm.$nextTick();

        expect(context_menu_wrapper.isVisible()).toBe(false);

        wrapper.destroy();
    });
});
