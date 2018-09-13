import Dropdown from '@/components/dropdown.vue';
import { config, mount } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Dropdown.vue', () => {

    test('Dropdown data is set to default value if only the array of items is provided',
         () => {

        @Component({
            template: `<dropdown :incoming_items="food" ref="dropdown_example_1">
                 <template slot="header">
                  <p ref="dropdown_header"> Pick A Food Item </p>
                 </template>
                </dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {
            food = ["Lettuce", "Pineapple", "Onion"];
        }

        const wrapper = mount(WrapperComponent);
        let dropdown_menu_container = wrapper.find({ref: 'dropdown_example_1'});
        expect(dropdown_menu_container.vm.$data.items).toEqual(wrapper.vm.$data.food);
        expect(dropdown_menu_container.vm.$data.chosen_item).toEqual(wrapper.vm.$data.food[0]);
        expect(dropdown_menu_container.vm.$data.content_min_width).toEqual("");
        expect(dropdown_menu_container.vm.$data.content_max_width).toEqual("");
        expect(dropdown_menu_container.vm.$data.content_styling).toEqual({});
    });

    test('Width of dropdown content is set to min-width when size of header is smaller ' +
         'than the min-width',
         () => {

        @Component({
            template: `<dropdown ref="dropdown_example_1"
                                 :incoming_items="cakes"
                                 dropdown_content_min_width="200px">
             <template slot="header">
              <p ref="dropdown_header"
                 style="width: 150px">
                 Pick A Cake
             </p>
             </template>
            </dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {
            cakes = ["Fruitcake", "Pineapple Upside Down Cake", "Molten Chocolate Cake"];
        }

        const wrapper = mount(WrapperComponent);
        let dropdown_component = wrapper.find({ref: 'dropdown_example_1'});
        expect(dropdown_component.vm.$data.items).toEqual(wrapper.vm.$data.cakes);
        expect(dropdown_component.vm.$data.chosen_item).toEqual(wrapper.vm.$data.cakes[0]);
        expect(dropdown_component.vm.$data.content_min_width).toEqual("200px");
        expect(dropdown_component.vm.$data.content_max_width).toEqual("");
        expect(dropdown_component.vm.$data.content_styling).toEqual(
            {'minWidth' : "200px"}
        );

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});
        let dropdown_menu_content = wrapper.find(".dropdown-content");
        dropdown_header.trigger("click");

        expect(dropdown_header.element.style.width).toEqual("150px");
        expect(dropdown_menu_content.element.style.display).toEqual("block");
        expect(dropdown_menu_content.element.style.minWidth).toEqual("200px");

    });

    test('Width of dropdown content is set to max-width when max-width is provided as ' +
         'input and the size of the header is greater than the max-width specified',
         () => {

        @Component({
            template: `<dropdown ref="dropdown_example_1"
                                 :incoming_items="letters"
                                 dropdown_content_max_width="100px">
                        <template slot="header">
                          <p ref="dropdown_header"
                               style="width: 150px">
                                 Pick A Cake
                          </p>
                        </template>
                      </dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {
            letters = ["A", "B", "C"];
        }

        const wrapper = mount(WrapperComponent);
        let dropdown_component = wrapper.find({ref: 'dropdown_example_1'});
        expect(dropdown_component.vm.$data.items).toEqual(wrapper.vm.$data.letters);
        expect(dropdown_component.vm.$data.chosen_item).toEqual(wrapper.vm.$data.letters[0]);
        expect(dropdown_component.vm.$data.content_min_width).toEqual("");
        expect(dropdown_component.vm.$data.content_max_width).toEqual("100px");
        expect(dropdown_component.vm.$data.content_styling).toEqual(
            {'maxWidth' : "100px"}
        );

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});
        let dropdown_menu_content = wrapper.find(".dropdown-content");
        dropdown_header.trigger("click");

        expect(dropdown_header.element.style.width).toEqual("150px");
        expect(dropdown_menu_content.element.style.display).toEqual("block");
        expect(dropdown_menu_content.element.style.maxWidth).toEqual("100px");
    });

    test('Pressing the up and down keys changes the highlighted item', () => {

        @Component({
            template: `<dropdown :incoming_items="states" ref="dropdown_example_2">
                 <template slot="header">
                  <p ref="dropdown_header"> States that Start with M </p>
                 </template>
                </dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {
            states = ["Missouri", "Mississippi", "Minnesota", "Massachusetts", "Maine",
                      "Montana", "Michigan", "Maryland"];
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_component = wrapper.find({ref: 'dropdown_example_2'});

        let dropdown_menu_content = wrapper.find(".dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        dropdown_header.trigger('click');

        expect(dropdown_menu_content.element.children.length).toEqual(
            wrapper.vm.$data.states.length
        );

        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");
        expect(dropdown_menu_content.text()).toContain("Minnesota");
        expect(dropdown_menu_content.text()).toContain("Massachusetts");
        expect(dropdown_menu_content.text()).toContain("Maine");
        expect(dropdown_menu_content.text()).toContain("Montana");
        expect(dropdown_menu_content.text()).toContain("Michigan");
        expect(dropdown_menu_content.text()).toContain("Maryland");

        expect(dropdown_component.vm.$data.highlighted_index).toEqual(0);
        expect(dropdown_menu_content.element.style.display).toEqual("block");

        let highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Missouri");

        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Mississippi");

        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Minnesota");

        // highlighted_index doesn't go off the end of the array
        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });
        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });
        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });
        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Michigan");

        dropdown_menu_content.trigger("keydown", { code: "ArrowUp" });
        dropdown_menu_content.trigger("keydown", { code: "ArrowUp" });
        dropdown_menu_content.trigger("keydown", { code: "ArrowUp" });

        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Massachusetts");
    });

    test('Clicking on an item in the menu emits the item and closes the menu', () => {

        @Component({
            template: `<div>
                 <dropdown :incoming_items="states"
                                 ref="dropdown_example_2"
                                 @update_item_selected="add_item($event)">
                    <template slot="header">
                      <p ref="dropdown_header"> States that Start with M </p>
                    </template>
                  </dropdown>
                  <p v-for="state of selected_states"> {{ state }} </p>
                </div>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {
            states = ["Missouri", "Mississippi"];

            selected_states: string[] = [];

            add_item(item: string) {
                this.selected_states.push(item);
            }
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_component = wrapper.find({ref: 'dropdown_example_2'});

        let dropdown_menu_content = wrapper.find(".dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        dropdown_header.trigger('click');

        expect(dropdown_menu_content.element.children.length).toEqual(
            wrapper.vm.$data.states.length
        );

        expect(wrapper.vm.$data.selected_states.length).toEqual(0);

        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        expect(dropdown_component.vm.$data.highlighted_index).toEqual(0);
        expect(dropdown_menu_content.element.style.display).toEqual("block");

        let highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Missouri");

        highlighted_item.trigger('click');

        expect(dropdown_menu_content.element.style.display).toEqual("none");

        expect(wrapper.vm.$data.selected_states.length).toEqual(1);
        expect(wrapper.vm.$data.selected_states[0]).toEqual("Missouri");
    });

    test('Pressing enter emits the selected item and closes the menu', () => {

        @Component({
            template: `<div>
                    <dropdown :incoming_items="states"
                              ref="dropdown_example_2"
                              @update_item_selected="add_item($event)">
                    <template slot="header">
                      <p ref="dropdown_header"> States that Start with M </p>
                    </template>
                  </dropdown>
                  <p v-for="state of selected_states"> {{ state }} </p>
                </div>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {
            states = ["Missouri", "Mississippi"];

            selected_states: string[] = [];

            add_item(item: string) {
                this.selected_states.push(item);
            }
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_component = wrapper.find({ref: 'dropdown_example_2'});

        let dropdown_menu_content = wrapper.find(".dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        dropdown_header.trigger('click');

        expect(dropdown_menu_content.element.children.length).toEqual(
            wrapper.vm.$data.states.length
        );

        expect(wrapper.vm.$data.selected_states.length).toEqual(0);

        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        expect(dropdown_component.vm.$data.highlighted_index).toEqual(0);
        expect(dropdown_menu_content.element.style.display).toEqual("block");

        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown'});

        let highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Mississippi");

        dropdown_menu_content.trigger("keydown", { code: "Enter" });
        expect(dropdown_menu_content.element.style.display).toEqual("none");

        expect(wrapper.vm.$data.selected_states.length).toEqual(1);
        expect(wrapper.vm.$data.selected_states[0]).toEqual("Mississippi");
    });

    test('Buttons can be used in the header slot', () => {

        @Component({
            template: `<div class="surround-2">
                        <dropdown ref="dropdown_on_a_button"
                                  :incoming_items="names"
                                  :incoming_chosen_item="chosen_name"
                                  @update_item_selected="update_name($event)">
                          <template slot="header">
                            <button ref="dropdown_header"
                                    class="header-button"
                                    @focus="transfer_focus_to_parent()">
                              {{ chosen_name }}
                            </button>
                          </template>
                        </dropdown>
                       </div>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {

            names = ["Elora", "Brittany", "Sam", "Jordan", "Michelle"];

            chosen_name = "Brittany";

            update_name(name_in: string) {
                this.chosen_name = name_in;
            }

            transfer_focus_to_parent() {
                let dropdown_component = <Dropdown> this.$refs.dropdown_on_a_button;
                dropdown_component.invoke_focus_on_dropdown();
            }
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_menu_content = wrapper.find(".dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        dropdown_header.trigger('click');

        // let focused_element = document.activeElement;
        // expect(document.activeElement).toEqual(dropdown_menu_content);

        // expect(dropdown_menu_content.element.hasAttribute("focus"));

        expect(dropdown_menu_content.element.style.display).toEqual("block");

        expect(wrapper.vm.$data.chosen_name).toEqual("Brittany");

        let highlighted_name = wrapper.find('#highlight');

        expect(highlighted_name.text()).toContain("Brittany");

        expect(dropdown_menu_content.text()).toContain("Elora");
        expect(dropdown_menu_content.text()).toContain("Brittany");
        expect(dropdown_menu_content.text()).toContain("Sam");
        expect(dropdown_menu_content.text()).toContain("Jordan");
        expect(dropdown_menu_content.text()).toContain("Michelle");

        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown' });
        dropdown_menu_content.trigger('keydown', { code: 'Enter' });

        expect(dropdown_menu_content.element.style.display).toEqual("none");

        // expect(dropdown_menu_content.element.hasAttribute("blur"));

        expect(wrapper.vm.$data.chosen_name).toEqual("Sam");

    });

    test('Clicking away from an open dropdown menu closes the dropdown', () => {

        @Component({
            template: `<div>
                        <dropdown ref="dropdown_with_colors"
                                  :incoming_items="colors">
                          <template slot="header">
                            <p ref="dropdown_header"
                               class="header-button">
                              Chooses a Color
                            </p>
                          </template>
                        </dropdown>
                        <p class="hello-para"> Hello </p>
                       </div>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {

            colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"];

        }

        const wrapper = mount(WrapperComponent);

        let dropdown_menu_content = wrapper.find(".dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        let unrelated_para_element = wrapper.find('.hello-para');

        dropdown_header.trigger('click');

        // expect(dropdown_menu_content.element.hasAttribute("focus"));

        expect(dropdown_menu_content.element.style.display).toEqual("block");

        let highlighted_color = wrapper.find('#highlight');

        expect(highlighted_color.text()).toContain("Red");

        // unrelated_para_element.trigger('click');

        dropdown_menu_content.trigger('blur');

        expect(dropdown_menu_content.element.style.display).toEqual("none");

    });

    test('Hitting esc in the dropdown menu causes the first item to become highlighted',
         () => {

        @Component({
            template: `<div>
                        <dropdown ref="dropdown_with_colors"
                                  :incoming_items="colors">
                          <template slot="header">
                            <p ref="dropdown_header"
                               class="header-button">
                              Chooses a Color
                            </p>
                          </template>
                        </dropdown>
                       </div>`,
            components: {
                'dropdown': Dropdown
            }
        })

        class WrapperComponent extends Vue {

            colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"];

        }

        const wrapper = mount(WrapperComponent);

        let dropdown_menu_content = wrapper.find(".dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        dropdown_header.trigger('click');

        expect(dropdown_menu_content.element.style.display).toEqual("block");

        let highlighted_color = wrapper.find('#highlight');

        expect(highlighted_color.text()).toContain("Red");

        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown'});
        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown'});
        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown'});

        highlighted_color = wrapper.find('#highlight');

        expect(highlighted_color.text()).toContain("Green");

        dropdown_menu_content.trigger('keydown', { code: 'Escape'});

        highlighted_color = wrapper.find('#highlight');

        expect(highlighted_color.text()).toContain("Red");
    });
});
