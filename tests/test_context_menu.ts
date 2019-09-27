import Vue from 'vue';
import Component from 'vue-class-component';

import { config, mount, Wrapper } from '@vue/test-utils';

import * as sinon from 'sinon';

import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
    sinon.restore();
});

@Component({
    template: `<div class="outermost">
                <div>
                    <div class="context-menu-area"
                         @click="$refs.context_menu.show_context_menu($event.pageX, $event.pageY)">
                      <p class="greeting"
                         :style="[{color: 'black', font: 'Arial'}]"> Happy Halloween </p>
                    </div>
                    <context-menu ref="context_menu">
                      <template slot="context_menu_items">
                          <context-menu-item ref="item_1"
                            @click="change_greeting_color('orange')">
                            <template slot="label">
                              One
                            </template>
                          </context-menu-item>
                          <context-menu-item ref="item_2"
                            @click="make_greeting_cursive()">
                            <template slot="label">
                              Two
                            </template>
                          </context-menu-item>
                          <context-menu-item ref="item_3"
                            @click="change_greeting_text('Boo!')">
                            <template slot="label">
                              Three
                            </template>
                          </context-menu-item>
                      </template>
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
}

describe('ContextMenu tests', () => {
    test("Context Menu Item data is set to the values passed in",
         async () => {
         @Component({
             template: `<div>
                <div class="context-menu-area"
                     @click="$refs.context_menu.show_context_menu($event.pageX, $event.pageY)">
                  <p class="greeting"> Happy Halloween </p>
                </div>
                <context-menu ref="context_menu">
                  <template slot="context_menu_items">
                      <context-menu-item ref="item_1"
                        @click="fun('one')">
                        <template slot="label">
                          One
                        </template>
                      </context-menu-item>
                      <context-menu-item ref="item_2"
                        :disabled="true">
                        <template slot="label">
                          Two
                        </template>
                      </context-menu-item>
                      <context-menu-item ref="item_3"
                        @click="fun('three')">
                        <template slot="label">
                          Three
                        </template>
                      </context-menu-item>
                  </template>
                </context-menu>
              </div>`,
             components: {
                 'context-menu': ContextMenu,
                 'context-menu-item': ContextMenuItem
             }
         })
         class WrapperComponent2 extends Vue {
             fun(word: string) {}
         }
         let wrapper = mount(WrapperComponent2);
         let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;

         let context_menu_area = wrapper.find('.context-menu-area');

         context_menu_area.trigger('click');
         await context_menu.$nextTick();

         let context_menu_item_1 = <ContextMenuItem> wrapper.find({ref: 'item_1'}).vm;
         let context_menu_item_2 = <ContextMenuItem> wrapper.find({ref: 'item_2'}).vm;
         let context_menu_item_3 = <ContextMenuItem> wrapper.find({ref: 'item_3'}).vm;

         expect(context_menu_item_1.$el.classList).toContain('hoverable-item');
         expect(context_menu_item_2.$el.classList).toContain('disabled-item');
         expect(context_menu_item_3.$el.classList).toContain('hoverable-item');

         wrapper.destroy();
    });

    test("Clicking on a context menu item closes the context menu",
         async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <Wrapper<ContextMenu>> wrapper.find({ref: 'context_menu'});

        let context_menu_area = wrapper.find('.context-menu-area');

        context_menu_area.trigger('click');
        await context_menu.vm.$nextTick();

        expect(context_menu.isVisible()).toBe(true);
        expect(context_menu.vm.menu_is_open).toBe(true);
        expect(context_menu.emitted().is_open_changed[0][0]).toBe(true);

        let context_menu_item_1 = wrapper.find({ref: 'item_1'});

        context_menu_item_1.trigger('click');
        await context_menu.vm.$nextTick();

        expect(context_menu.isVisible()).toBe(false);
        expect(context_menu.vm.menu_is_open).toBe(false);
        expect(context_menu.emitted().is_open_changed[1][0]).toBe(false);

        wrapper.destroy();
    });

    test("Context Menu Items in a Context Menu can handle click events differently",
         async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;

        let context_menu_area = wrapper.find('.context-menu-area');
        let greeting = wrapper.find('.greeting');

        expect(greeting.element.style.color).toBe("black");
        expect(greeting.element.style.font).toBe("Arial");
        expect(greeting.text()).toBe("Happy Halloween");

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_1 = wrapper.find({ref: 'item_1'});
        context_menu_item_1.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.color).toBe('orange');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_2 = wrapper.find({ref: 'item_2'});
        context_menu_item_2.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.font).toBe('cursive');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_3 = wrapper.find({ref: 'item_3'});

        context_menu_item_3.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.text()).toBe('Boo!');

        wrapper.destroy();
    });

    test("Clicking inside the context menu area makes the menu visible, and clicking" +
         "outside the context menu area hides it",
         async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <Wrapper<ContextMenu>> wrapper.find({ref: 'context_menu'});
        let context_menu_area = wrapper.find('.context-menu-area');
        context_menu_area.trigger('click');
        await context_menu.vm.$nextTick();

        expect(context_menu.isVisible()).toBe(true);

        let outside_input = wrapper.find('#outside');
        outside_input.trigger('click');
        outside_input.element.focus();
        await context_menu.vm.$nextTick();

        expect(context_menu.isVisible()).toBe(false);

        wrapper.destroy();
    });

    test("toggle disabled property on context menu item",
         async () => {
        @Component({
            template: `<div>
            <div class="context-menu-area"
                 @click="$refs.context_menu.show_context_menu($event.pageX, $event.pageY)">
            </div>
            <context-menu ref="context_menu">
              <template slot="context_menu_items">
                  <context-menu-item ref="item_1"
                    :disabled="is_disabled"
                    @click="print_label('One')">
                    <template slot="label">
                      One
                    </template>
                  </context-menu-item>
              </template>
            </context-menu>
          </div>`,
            components: {
                'context-menu': ContextMenu,
                'context-menu-item': ContextMenuItem
            }
        })
        class WrapperComponent2 extends Vue {
            is_disabled = true;

            print_label(label: string) {}
        }
        let wrapper = mount(WrapperComponent2);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;
        let context_menu_area = wrapper.find('.context-menu-area');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_1 = wrapper.find({ref: 'item_1'});
        context_menu_item_1.trigger('click');

        expect(context_menu_item_1.emitted().click).toBeUndefined();

        wrapper.vm.is_disabled = false;
        context_menu_item_1.trigger('click');

        expect(context_menu_item_1.emitted().click.length).toBe(1);

        wrapper.destroy();
    });

    test("Menu is not closed when disabled context menu items are clicked",
         async () => {
        @Component({
            template: `<div>
        <div class="context-menu-area"
             @click="$refs.context_menu.show_context_menu($event.pageX, $event.pageY)">
          <p class="greeting" :style="[{color: 'black'}]"> Hello </p>
        </div>
        <context-menu ref="context_menu">
          <template slot="context_menu_items">
              <context-menu-item ref="item_1"
                :disabled="true"
                @click="change_greeting_color('red')">
                <template slot="label">
                  One
                </template>
              </context-menu-item>
          </template>
        </context-menu>
      </div>`,
            components: {
                'context-menu': ContextMenu,
                'context-menu-item': ContextMenuItem
            }
        })
        class WrapperComponent2 extends Vue {
            change_greeting_color(color_in: string) {
                let greeting_para = <HTMLElement> this.$el.getElementsByClassName(
                    'greeting'
                )[0];
                greeting_para.style.color = color_in;
            }
        }
        let wrapper = mount(WrapperComponent2);
        let context_menu = <Wrapper<ContextMenu>> wrapper.find({ref: 'context_menu'});
        let context_menu_area = wrapper.find('.context-menu-area');
        let greeting = wrapper.find('.greeting');

        expect(greeting.element.style.color).toBe("black");

        context_menu_area.trigger('click');
        await context_menu.vm.$nextTick();

        let context_menu_item_1 = <ContextMenuItem> wrapper.find({ref: 'item_1'}).vm;
        expect(context_menu_item_1.disabled).toBe(true);

        wrapper.find({ref: 'item_1'}).trigger('click');
        await context_menu.vm.$nextTick();

        expect(greeting.element.style.color).toBe("black");
        expect(context_menu.isVisible()).toBe(true);

        wrapper.destroy();
    });

    test("When a user clicks too near to the right edge, the positioning of the " +
              "context menu is adjusted",
         async () => {
        @Component({
            template: `<div>
                         <div class="too-far-right-square"
                              @click="$refs.context_menu.show_context_menu($event)">
                         </div>
                        <context-menu ref="context_menu">
                          <template slot="context_menu_items">
                              <context-menu-item ref="item_1"
                                @click="change_greeting_color('red')">
                                <template slot="label">
                                 One
                                </template>
                              </context-menu-item>
                              <context-menu-item ref="item_2"
                                @click="change_greeting_color('blue')">
                                <template slot="label">
                                  Two
                                </template>
                              </context-menu-item>
                          </template>
                        </context-menu>
                      </div>`,
            components: {
                'context-menu': ContextMenu,
                'context-menu-item': ContextMenuItem
            }
        })
        class WrapperComponent2 extends Vue {

            change_greeting_color(color_in: string) {
                let greeting = <HTMLElement> this.$el.getElementsByClassName(
                    'greeting'
                )[0];
                greeting.style.color = color_in;
            }
        }

        let wrapper = mount(WrapperComponent2);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;

        sinon.stub(document.body, 'clientWidth').value(800);
        sinon.stub(document.body, 'clientHeight').value(500);
        sinon.stub(context_menu.$el, 'clientWidth').value(10);

        context_menu.show_context_menu(798, 2);
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

    test("When a user clicks too near to the bottom edge, the positioning of the " +
              "context menu is adjusted",
         async () => {
        @Component({
            template: `<div>
                     <div class="too-far-right-square"
                          @click="$refs.context_menu.show_context_menu($event)">
                     </div>
                    <context-menu ref="context_menu">
                      <template slot="context_menu_items">
                          <context-menu-item ref="item_1"
                            @click="change_greeting_color('red')">
                            <template slot="label">
                              One
                            </template>
                          </context-menu-item>
                          <context-menu-item ref="item_2"
                            @click="change_greeting_color('blue')">
                            <template slot="label">
                              Two
                            </template>
                          </context-menu-item>
                      </template>
                    </context-menu>
                  </div>`,
            components: {
                'context-menu': ContextMenu,
                'context-menu-item': ContextMenuItem
            }
        })
        class WrapperComponent2 extends Vue {

            change_greeting_color(color_in: string) {
                let greeting = <HTMLElement> this.$el.getElementsByClassName(
                    'greeting'
                )[0];
                greeting.style.color = color_in;
            }
        }

        let wrapper = mount(WrapperComponent2);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;

        sinon.stub(document.body, 'clientWidth').value(800);
        sinon.stub(document.body, 'clientHeight').value(500);
        sinon.stub(context_menu.$el, 'clientHeight').value(15);

        context_menu.show_context_menu(2, 498);
        await context_menu.$nextTick();
        let new_top = (<HTMLElement> context_menu.$el).style.top;
        expect(new_top).not.toBeNull();
        new_top = new_top!.substring(0, new_top!.length - 2);
        let number_new_top: number = parseInt(new_top, 10);
        expect(number_new_top).toBeLessThan(498);

        sinon.restore();
        wrapper.destroy();
     });

    test('Default menu slot', () => {
        let wrapper = mount(ContextMenu);

        let menu_items = wrapper.findAll('.context-menu-option');
        expect(menu_items.length).toBe(1);

        wrapper.destroy();
    });

    test('Invalid Context Menu Content', () => {
        sinon.stub(console, 'error');
        const component = {
            template:  `<context_menu ref="context_menu">
                          <template slot="context_menu_items">
                            <div>Hello</div>
                          </template>
                        </context_menu>`,
            components: {
                'context_menu': ContextMenu,
            }
        };

        expect(
            () => mount(component)
        ).toThrow("Context Menus must contain at least one Context Menu Item");
    });

    test("Pressing esc closes the context menu", async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu_area = wrapper.find('.context-menu-area');
        let context_menu_wrapper = wrapper.find('#context-menu-container');
        let context_menu_component = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;

        context_menu_area.trigger('click');

        expect(context_menu_component.menu_is_open).toBe(true);

        context_menu_wrapper.trigger('keyup.esc');
        await context_menu_component.$nextTick();

        expect(context_menu_component.menu_is_open).toBe(false);
        wrapper.destroy();
    });
});
