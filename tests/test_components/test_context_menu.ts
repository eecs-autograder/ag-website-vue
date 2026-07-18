import Vue, { defineComponent } from 'vue';
import Component from 'vue-class-component';

import { mount, Wrapper } from '@vue/test-utils';

import * as sinon from 'sinon';

import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

import { emitted, wait_until } from '@/tests/utils';


@Component({
    template: `<div class="outermost">
                <div>
                  <div class="context-menu-area"
                       @click="show_menu">
                    <p class="greeting"
                       :style="[{color: color, font: font}]"> {{ text }} </p>
                  </div>
                  <context-menu ref="context_menu" :is_open="is_open" :coordinates="coordinates"
                                @close="is_open = false">
                    <context-menu-item data-testid="item_1" @click="change_greeting_color('orange')">
                      One
                    </context-menu-item>
                    <context-menu-item data-testid="item_2" @click="make_greeting_cursive()">
                      Two
                    </context-menu-item>
                    <context-menu-item data-testid="item_3" @click="change_greeting_text('Boo!')">
                      Three
                    </context-menu-item>
                    <context-menu-item data-testid="disabled_item" :disabled="true">
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
    color = 'black';
    font = 'Arial';
    text = 'Happy Halloween';

    change_greeting_color(color_in: string) {
        this.color = color_in;
    }

    make_greeting_cursive() {
        this.font = 'cursive';
    }

    change_greeting_text(new_text: string) {
        this.text = new_text;
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

        let context_menu_item_1 = wrapper.find('[data-testid=item_1] [role=menuitem]');
        await context_menu_item_1.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.color).toBe('orange');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_2 = wrapper.find('[data-testid=item_2] [role=menuitem]');
        context_menu_item_2.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.font).toBe('cursive');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_3 = wrapper.find('[data-testid=item_3] [role=menuitem]');

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
        let menu_wrapper = wrapper.findComponent(ContextMenu);
        await wrapper.find('.context-menu-area').trigger('click');
        await menu_wrapper.vm.$nextTick();

        let disabled_wrapper = wrapper.find('[data-testid=disabled_item] [role=menuitem]');
        expect(disabled_wrapper.element).toBeDisabled();
        console.log(disabled_wrapper.html())
        await disabled_wrapper.trigger('click');

        expect(
            menu_wrapper.findAllComponents(ContextMenuItem).at(3).emitted('click')
        ).toBeUndefined();
        expect(menu_wrapper.isVisible()).toBe(true);
    });

    test.skip("Position adjusted when too near right edge", async () => {
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

    test.skip("Position adjusted when too close to bottom edge", async () => {
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

        context_menu_wrapper.trigger('keydown.esc');
        await wrapper.vm.$nextTick();

        expect(context_menu_wrapper.isVisible()).toBe(false);

        wrapper.destroy();
    });

    // Regression: focus() is a no-op on a hidden element, so the menu must be
    // visible by the time it's focused, else ESC-to-close never works.
    test("Menu is visible at the moment it is focused on open", async () => {
        let wrapper = mount(WrapperComponent);
        let container = <HTMLElement> wrapper.find('.context-menu-container').element;

        let display_when_focused: string | null = null;
        let focus_stub = sinon.stub(container, 'focus').callsFake(() => {
            display_when_focused = window.getComputedStyle(container).display;
        });

        wrapper.find('.context-menu-area').trigger('click');
        await wait_until(wrapper, () => focus_stub.called);

        expect(focus_stub.called).toBe(true);
        expect(display_when_focused).not.toEqual('none');

        wrapper.destroy();
    });
});

describe('ContextMenu keyboard navigation tests', () => {
    let wrapper: Wrapper<WrapperComponent>;
    let container: Wrapper<Vue>;
    let item_1: Wrapper<Vue>;
    let item_2: Wrapper<Vue>;
    let item_3: Wrapper<Vue>;
    let disabled_item: Wrapper<Vue>;

    beforeEach(async () => {
        wrapper = mount(WrapperComponent);

        await wrapper.find('.context-menu-area').trigger('click');
        container = wrapper.find('.context-menu-container');

        [item_1, item_2, item_3, disabled_item] = [
            'item_1',
            'item_2',
            'item_3',
            'disabled_item'
        ].map((test_id) => wrapper.find(`[data-testid=${test_id}] [role=menuitem]`));
    });

    afterEach(() => {
        wrapper.destroy();
    });

    async function expect_cycle(key: string, expected_order: Wrapper<Vue>[]) {
        for (const expected_active of expected_order) {
            await container.trigger(`keydown.${key}`);

            for (const item of expected_order) {
                expect(item.classes().includes('active-descendant')).toBe(
                    item === expected_active
                );
            }
        }
    }

    test("Right arrow moves focus to next item, wrapping to the first item", async () => {
        await expect_cycle('right', [item_2, item_3, disabled_item, item_1]);
    });

    test("Down arrow moves focus to next item, wrapping to the first item", async () => {
        await expect_cycle('down', [item_2, item_3, disabled_item, item_1]);
    });

    test("Left arrow moves focus to prev item, wrapping to the last item", async () => {
        await expect_cycle('left', [disabled_item, item_3, item_2, item_1]);
    });

    test("Up arrow moves focus to prev item, wrapping to the last item", async () => {
        await expect_cycle('up', [disabled_item, item_3, item_2, item_1]);
    });
});

describe('Keyboard item activation', () => {
    const TestComponent = defineComponent({
        template: `<div>
            <context-menu :is_open="true" :coordinates="{x: 0, y: 0}">
                <context-menu-item @click="$emit('item1')">Not disabled</context-menu-item>
                <context-menu-item @click="$emit('item2')">Not disabled 2</context-menu-item>
                <context-menu-item @click="$emit('item3')" :disabled="true">Disabled</context-menu-item>
            </context-menu>
        </div>
        `,
        components: {ContextMenu, ContextMenuItem}
    });

    test("Activate item with enter", async () => {
        const wrapper = mount(TestComponent);
        let context_menu_wrapper = wrapper.find('.context-menu-container');
        expect(wrapper.emitted()).toEqual({});

        await context_menu_wrapper.trigger('keydown.enter');
        expect(Object.keys(wrapper.emitted())).toHaveLength(1);
        expect(wrapper.emitted()).toHaveProperty('item1');

        await context_menu_wrapper.trigger('keydown.down');
        await context_menu_wrapper.trigger('keydown.enter');
        expect(Object.keys(wrapper.emitted())).toHaveLength(2);
        expect(wrapper.emitted()).toHaveProperty('item2');
    });

    test("Activate item with space", async () => {
        const wrapper = mount(TestComponent);
        let context_menu_wrapper = wrapper.find('.context-menu-container');
        expect(wrapper.emitted()).toEqual({});

        await context_menu_wrapper.trigger('keydown.enter');
        expect(Object.keys(wrapper.emitted())).toHaveLength(1);
        expect(wrapper.emitted()).toHaveProperty('item1');

        await context_menu_wrapper.trigger('keydown.down');
        await context_menu_wrapper.trigger('keydown.enter');
        expect(Object.keys(wrapper.emitted())).toHaveLength(2);
        expect(wrapper.emitted()).toHaveProperty('item2');
    });

    test("Disabled item can't be activated with keyboard", async () => {
        const wrapper = mount(TestComponent);
        let context_menu_wrapper = wrapper.find('.context-menu-container');
        expect(wrapper.emitted()).toEqual({});

        // Navigate to disabled item
        await context_menu_wrapper.trigger('keydown.down');
        expect(wrapper.emitted()).toEqual({});
        await context_menu_wrapper.trigger('keydown.down');
        expect(wrapper.emitted()).toEqual({});

        await context_menu_wrapper.trigger('keydown.enter');
        expect(wrapper.emitted()).toEqual({});
        await context_menu_wrapper.trigger('keydown.space');

        expect(wrapper.emitted()).toEqual({});

        // Wrap around to first item and select
        await context_menu_wrapper.trigger('keydown.down');

        await context_menu_wrapper.trigger('keydown.enter');
        expect(Object.keys(wrapper.emitted())).toHaveLength(1);
        expect(wrapper.emitted()).toHaveProperty('item1');
    });
});
