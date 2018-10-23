import ContextMenu from '@/components/context_menu.vue';
import ContextMenuItem from '@/components/context_menu_item.vue';
import { config, mount } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

import { patch_object_prototype } from './mocking';

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

describe('ContextMenu.vue', () => {
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
    });


    test("Clicking on a context menu item closes the context menu",
         async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;

        let context_menu_area = wrapper.find('.context-menu-area');
        let greeting = wrapper.find('.greeting');

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        expect(context_menu.$el.style.visibility).toBe('visible');
        expect(context_menu.menu_is_open).toBe(true);

        let context_menu_item_1 = wrapper.find({ref: 'item_1'});

        context_menu_item_1.trigger('click');
        await context_menu.$nextTick();

        expect(context_menu.$el.style.visibility).toBe('hidden');
        expect(context_menu.menu_is_open).toBe(false);
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
    });

    test("Clicking inside the context menu area makes the menu visible, and clicking" +
         "outside the context menu area hides it",
         async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;
        let context_menu_area = wrapper.find('.context-menu-area');
        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        expect(context_menu.$el.style.visibility).toBe("visible");

        let outside_input = wrapper.find('#outside');

        outside_input.trigger('click');
        outside_input.element.focus();
        await context_menu.$nextTick();

        expect(context_menu.$el.style.visibility).toBe("hidden");
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
                  <context-menu-item ref="item_2"
                    @context_menu_item_clicked="change_value_of_disabled()">
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

            change_value_of_disabled() {
                this.is_disabled = !this.is_disabled;
            }
        }
        let wrapper = mount(WrapperComponent2);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;
        let context_menu_area = wrapper.find('.context-menu-area');
        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_1 = <ContextMenuItem> wrapper.find({ref: 'item_1'}).vm;
        let context_menu_item_2 = wrapper.find({ref: 'item_2'});

        expect(context_menu_item_1.d_disabled).toBe(true);

        context_menu_item_2.trigger('click');
        await context_menu.$nextTick();

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        expect(context_menu_item_1.d_disabled).toBe(false);
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
                // let greeting = <HTMLElement> this.$el.getElementsByClassName(
                //     'greeting'
                // )[0];
                // greeting.style.color = color_in;
            }

        }
        let wrapper = mount(WrapperComponent2);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;
        let context_menu_area = wrapper.find('.context-menu-area');
        let greeting = wrapper.find('.greeting');

        expect(greeting.element.style.color).toBe("black");

        context_menu_area.trigger('click');
        await context_menu.$nextTick();

        let context_menu_item_1 = wrapper.find({ref: 'item_1'});
        expect(context_menu_item_1.vm.$data.d_disabled).toBe(true);

        context_menu_item_1.trigger('click');
        await context_menu.$nextTick();

        expect(greeting.element.style.color).toBe("black");
    });

    test("When a user clicks too near to the right edge, the positioning of the " +
              "context menu is adjusted",
         async () => {
        @Component({
            template: `<div>
                         <div class="too-far-right-square"
                              @click="$refs.context_menu.show_context_menu($event)"
                              :style="[{height: '500px',
                                       width: '800px',
                                       backgroundColor: 'blue'}]">
                         </div>
                        <context-menu ref="context_menu">
                          <template slot="context_menu_items">
                              <context-menu-item ref="item_1"
                                @context_menu_item_clicked="change_greeting_color('red')">
                                <template slot="label">
                                <p :style="[{width: '200px',
                                             height: '20px'}]">
                                             One
                                </p>
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
        let menu = wrapper.find({ref: 'context_menu'});
        let far_right_square = wrapper.find('.too-far-right-square');

        let fake_body = {
            clientWidth: 800,
            clientHeight: 500
        };

        patch_object_prototype(document.body, fake_body, () => {
            context_menu.show_context_menu(798, 2);
            let new_left = context_menu.$el.style.left;
            new_left = new_left.substr(0, new_left.length - 2);
            let number_new_left: number = parseInt(new_left, 10);
            expect(number_new_left).toBeLessThan(798);
        });


        expect(document.body.clientHeight).toEqual(0);
        expect(document.body.clientWidth).toEqual(0);
    });

    test("When a user clicks too near to the bottom edge, the positioning of the " +
         "context menu is adjusted",
         async () => {
        @Component({
            template: `<div>
                     <div :style="[{height: '1000px', width: '300px'}]"> </div>
                     <div class="too-far-right-square"
                          @click="$refs.context_menu.show_context_menu($event)"
                          :style="[{height: '500px',
                                   width: '800px',
                                   backgroundColor: 'blue'}]">
                     </div>
                    <context-menu ref="context_menu">
                      <template slot="context_menu_items">
                          <context-menu-item ref="item_1"
                            :style="[{width: '200px', height: '200px'}]"
                            @context_menu_item_clicked="change_greeting_color('red')">
                            <template slot="label">
                            <p :style="[{width: '200px',
                                         height: '20px'}]">
                                         One
                            </p>
                            </template>
                          </context-menu-item>
                          <context-menu-item ref="item_2"
                            @context_menu_item_clicked="change_greeting_color('blue')">
                            <template slot="label">
                            <div :style="[{width: '200px', height: '200px'}]">
                              Two
                            </div>
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
        let menu = wrapper.find({ref: 'context_menu'});
        let far_right_square = wrapper.find('.too-far-right-square');

        let fake_body = {
            clientWidth: 800,
            clientHeight: 500
        };

        patch_object_prototype(document.body, fake_body, () => {
            context_menu.show_context_menu(2, 498);
            let new_top = context_menu.$el.style.top;
            new_top = new_top.substr(0, new_top.length - 2);
            let number_new_top: number = parseInt(new_top, 10);
            expect(number_new_top).toBeLessThan(498);
        });

        expect(document.body.clientHeight).toEqual(0);
        expect(document.body.clientWidth).toEqual(0);
    });


    test("Scrolling via wheel event is disallowed while the context menu is open",
         async () => {
        let wrapper = mount(WrapperComponent);
        let context_menu = <ContextMenu> wrapper.find({ref: 'context_menu'}).vm;
        let cm = wrapper.find({ref: 'context_menu'});
        let body = document.body;

        let context_menu_area = wrapper.find('.context-menu-area');

        let outermost = wrapper.find('.outermost');

        console.log(context_menu_area.html());
        console.log(cm.html());

        // const scroll_to_spy = jest.fn();
        // global.scrollTo = scroll_to_spy;

        // test being able to scroll while the context menu isn't open
        // document.body.scrollTo(4, 10);
        // wrapper.trigger('keydown');
        // await context_menu.$nextTick();

        // expect(scroll_to_spy).toHaveBeenCalled();
        //
        // context_menu_area.trigger('click');
        // await context_menu.$nextTick();
        //
        // // test not being able to scroll while the context menu is open
        // what can I even check?
        context_menu_area.trigger('wheel');

        context_menu_area.trigger('click');

        context_menu_area.trigger('wheel');

        console.log(cm.html());

        // outermost.trigger('wheel');

        // console.log(wrapper.vm.$children);

        window.scrollTo(0, 20);

        // console.log(wrapper.html());

        // console.log(document.body.onmousewheel);
        // let fake_body = {
        //     clientWidth: 800,
        //     clientHeight: 500
        // };
        //
        // patch_object_prototype(document.body, fake_body, () => {
        //   console.log(document.body.scrollWidth);
        //   console.log(document.body.onscroll);
        // });
        // await context_menu.$nextTick();
    });
});
