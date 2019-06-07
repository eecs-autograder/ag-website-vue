import Vue from 'vue';
import Component from 'vue-class-component';

import { config, mount } from '@vue/test-utils';

import * as sinon from 'sinon';

import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Make sure that you call wrapper.vm.$destroy() at the end of each test case. Otherwise,
// the lingering wheel event listeners attached to window could cause other tests to fail.

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
                            @context_menu_item_clicked="change_greeting_color('orange')">
                            <template slot="label">
                              One
                            </template>
                          </context-menu-item>
                          <context-menu-item ref="item_2"
                            @context_menu_item_clicked="make_greeting_cursive()">
                            <template slot="label">
                              Two
                            </template>
                          </context-menu-item>
                          <context-menu-item ref="item_3"
                            @context_menu_item_clicked="change_greeting_text('Boo!')">
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
                        @context_menu_item_clicked="fun('one')">
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
                        @context_menu_item_clicked="fun('three')">
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
         expect(context_menu_item_1.$el.classList).toContain('first-child');
         expect(context_menu_item_3.$el.classList).toContain('last-child');

         wrapper.destroy();
    });

    test("Clicking on a context menu item closes the context menu",
         async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;

        let context_menu_area = wrapper.find('.context-menu-area');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        expect((<HTMLElement> context_menu.$el).style.visibility).toBe('visible');
        expect(context_menu.menu_is_open).toBe(true);

        let context_menu_item_1 = wrapper.find({ref: 'item_1'});

        context_menu_item_1.trigger('click');
        await context_menu.$nextTick();

        expect((<HTMLElement> context_menu.$el).style.visibility).toBe('hidden');
        expect(context_menu.menu_is_open).toBe(false);

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
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;
        let context_menu_area = wrapper.find('.context-menu-area');
        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        expect((<HTMLElement> context_menu.$el).style.visibility).toBe("visible");

        let outside_input = wrapper.find('#outside');
        outside_input.trigger('click');
        outside_input.element.focus();
        await context_menu.$nextTick();

        expect((<HTMLElement> context_menu.$el).style.visibility).toBe("hidden");

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
                    @context_menu_item_clicked="print_label('One')">
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

        expect(context_menu_item_1.emitted('context_menu_item_clicked')).not.toBeTruthy();

        wrapper.vm.is_disabled = false;
        context_menu_item_1.trigger('click');

        expect(context_menu_item_1.emitted().context_menu_item_clicked.length).toBe(1);

        wrapper.destroy();
    });

    test("parent component is not notified when disabled context menu items are clicked",
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
                @context_menu_item_clicked="change_greeting_color('red')">
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
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;
        let context_menu_area = wrapper.find('.context-menu-area');
        let greeting = wrapper.find('.greeting');

        expect(greeting.element.style.color).toBe("black");

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_1 = <ContextMenuItem> wrapper.find({ref: 'item_1'}).vm;
        expect(context_menu_item_1.d_disabled).toBe(true);

        wrapper.find({ref: 'item_1'}).trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.color).toBe("black");

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
                                @context_menu_item_clicked="change_greeting_color('red')">
                                <template slot="label">
                                 One
                                </template>
                              </context-menu-item>
                              <context-menu-item ref="item_2"
                                @context_menu_item_clicked="change_greeting_color('blue')">
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
        sinon.stub(context_menu, 'd_width_of_menu').value(10);

        context_menu.show_context_menu(798, 2);
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
                            @context_menu_item_clicked="change_greeting_color('red')">
                            <template slot="label">
                              One
                            </template>
                          </context-menu-item>
                          <context-menu-item ref="item_2"
                            @context_menu_item_clicked="change_greeting_color('blue')">
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
        sinon.stub(context_menu, 'd_height_of_menu').value(15);

        context_menu.show_context_menu(2, 498);
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

    test("Scrolling via wheel event is disallowed while the context menu is open",
         () => {
        let wrapper = mount(WrapperComponent, {attachToDocument: true});
        let context_menu_area = wrapper.find('.context-menu-area');

        let handle_wheel_event = sinon.fake();
        context_menu_area.element.addEventListener('wheel', handle_wheel_event);

        context_menu_area.trigger('wheel');
        expect(handle_wheel_event.calledOnce).toBe(true);

        context_menu_area.trigger('click');

        context_menu_area.trigger('wheel');
        expect(handle_wheel_event.calledOnce).toBe(true);

        wrapper.destroy();
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
