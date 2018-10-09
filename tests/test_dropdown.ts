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
        expect(dropdown_menu_container.element.style.minWidth).toEqual("");
        expect(dropdown_menu_container.element.style.maxWidth).toEqual("");
    });

    test('Pressing the up and down keys changes the highlighted item', () => {

        @Component({
            template: `<dropdown :incoming_items="states" ref="dropdown_example_2">
                 <template slot="header">
                  <p ref="dropdown_header"> States that Start with M </p>
                 </template>
                  <div slot-scope="{item}">
                    <span> {{item.name}} </span>
                  </div>
                 </dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        })
        class WrapperComponent extends Vue {
            states = [{name: "Missouri"},
                      {name: "Mississippi"},
                      {name: "Minnesota"},
                      {name: "Massachusetts"},
                      {name: "Maine"},
                      {name: "Montana"},
                      {name: "Michigan"},
                      {name: "Maryland"}
                      ];
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_component = wrapper.find({ref: 'dropdown_example_2'});

        let dropdown_menu_content = dropdown_component.find("#dropdown-content");

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
                    <div slot-scope="{item}">
                      <span> {{item.name}} </span>
                    </div>
                  </dropdown>
                  <p v-for="state of selected_states"> {{ state }} </p>
                </div>`,
            components: {
                'dropdown': Dropdown
            }
        })
        class WrapperComponent extends Vue {
            states = [{name: "Missouri"},
                      {name: "Mississippi"}
                     ];

            selected_states: string[] = [];

            add_item(item: string) {
                this.selected_states.push(item);
            }
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_component = wrapper.find({ref: 'dropdown_example_2'});

        let dropdown_menu_content = wrapper.find("#dropdown-content");

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
        expect(wrapper.vm.$data.selected_states[0].name).toEqual("Missouri");
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
                    <div slot-scope="{item}">
                      <span> {{item.name}} </span>
                    </div>
                  </dropdown>
                  <p v-for="state of selected_states"> {{ state }} </p>
                </div>`,
            components: {
                'dropdown': Dropdown
            }
        })
        class WrapperComponent extends Vue {
            states = [{name: "Missouri"},
                      {name: "Mississippi"}
            ];

            selected_states: string[] = [];

            add_item(item: string) {
                this.selected_states.push(item);
            }
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_component = wrapper.find({ref: 'dropdown_example_2'});

        let dropdown_menu_content = wrapper.find("#dropdown-content");

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
        expect(wrapper.vm.$data.selected_states[0].name).toEqual("Mississippi");
    });

    test('Buttons can be used in the header slot', () => {

        @Component({
            template: `<div class="surround-2">
                        <dropdown ref="dropdown_on_a_button"
                                  :incoming_items="employees"
                                  @update_item_selected="update_employee($event)">
                          <template slot="header">
                            <button ref="dropdown_header"
                                    class="header-button">
                              {{chosen_employee.last_name}}, {{chosen_employee.first_name}}
                            </button>
                          </template>
                          <div slot-scope="{item}">
                           <span> {{item.last_name}} </span>
                          </div>
                        </dropdown>
                       </div>`,
            components: {
                'dropdown': Dropdown
            }
        })
        class WrapperComponent extends Vue {

            employees = [{first_name: "Elora", last_name: "Blue"},
                         {first_name: "Brittany", last_name: "Cost"},
                         {first_name: "Sam", last_name: "Sanchez"},
                         {first_name: "Jordan", last_name: "Johnson"},
                         {first_name: "Michelle", last_name: "Smith"}
                        ];

            chosen_employee = {first_name: "Michelle", last_name: "Smith"};

            update_employee(employee_in: {first_name: string, last_name: string}) {
                this.chosen_employee = employee_in;
            }
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_menu = wrapper.find({ref: 'dropdown_on_a_button'});

        let dropdown_menu_content = dropdown_menu.find('#dropdown-content');

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        dropdown_header.trigger('click');

        let highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Blue");

        expect(dropdown_menu.vm.$data.highlighted_index).toEqual(0);

        expect(dropdown_menu_content.text()).toContain("Blue");
        expect(dropdown_menu_content.text()).toContain("Cost");
        expect(dropdown_menu_content.text()).toContain("Sanchez");
        expect(dropdown_menu_content.text()).toContain("Johnson");
        expect(dropdown_menu_content.text()).toContain("Smith");

        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown' });
        expect(dropdown_menu.vm.$data.highlighted_index).toEqual(1);
        dropdown_menu_content.trigger('keydown', { code: 'Enter' });

        expect(dropdown_menu_content.element.style.display).toEqual("none");

        expect(dropdown_menu_content.element.hasAttribute("blur"));

        expect(wrapper.vm.$data.chosen_employee.last_name).toBe("Cost");

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
                          <template slot-scope="{item}">
                            <div class="swatch" :style="{ background: item.hex }"></div>
                            <span>{{item.name}}</span>
                          </template>
                        </dropdown>
                        <p class="hello-para"> Hello </p>
                       </div>`,
            components: {
                'dropdown': Dropdown
            }
        })
        class WrapperComponent extends Vue {

            colors = [{ name: "Red", hex: "#FF0000"},
                      { name: "Green", hex: "#00FF00"},
                      { name: "Blue", hex: "#0000FF"}
                     ];
        }

        const wrapper = mount(WrapperComponent);

        let dropdown_menu_content = wrapper.find("#dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        let unrelated_para_element = wrapper.find('.hello-para');

        dropdown_header.trigger('click');

        expect(dropdown_menu_content.element.style.display).toEqual("block");

        let highlighted_color = wrapper.find('#highlight');

        expect(highlighted_color.text()).toContain("Red");

        dropdown_header.trigger('blur');

        expect(dropdown_menu_content.element.style.display).toEqual("none");

    });

    test('Hitting esc in the dropdown menu causes menu to close',
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
                          <template slot-scope="{item}">
                            <div class="swatch" :style="{ background: item.hex }"></div>
                            <span>{{item.name}}</span>
                          </template>
                        </dropdown>
                        </dropdown>
                       </div>`,
            components: {
                'dropdown': Dropdown
            }
        })
        class WrapperComponent extends Vue {

            colors = [{ name: "Red", hex: "#FF0000"},
                      { name: "Green", hex: "#00FF00"},
                      { name: "Blue", hex: "#0000FF"}
            ];

        }

        const wrapper = mount(WrapperComponent);

        let dropdown_menu_content = wrapper.find("#dropdown-content");

        let dropdown_header = wrapper.find({ref: 'dropdown_header'});

        dropdown_header.trigger('click');

        expect(dropdown_menu_content.element.style.display).toEqual("block");

        let highlighted_color = wrapper.find('#highlight');

        expect(highlighted_color.text()).toContain("Red");

        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown'});
        dropdown_menu_content.trigger('keydown', { code: 'ArrowDown'});

        highlighted_color = wrapper.find('#highlight');

        expect(highlighted_color.text()).toContain("Blue");

        dropdown_menu_content.trigger('keydown', { code: 'Escape'});
        let dropdown = <Dropdown> wrapper.find({ref: 'dropdown_with_colors'}).vm;
        expect(dropdown.is_open).toBe(false);
        expect(dropdown_menu_content.element.style.display).toEqual("none");

        // Make sure pressing esc again doesn't open it.
        dropdown_menu_content.trigger('keydown', { code: 'Escape'});
        expect(dropdown.is_open).toBe(false);
    });

    test('Public show and hide dropdown functions', () => {
        const component = {
            template: `
<dropdown :incoming_items="[1, 2, 3]" ref="dropdown">
    <template slot="header">
        <p>Hello</p>
    </template>
</dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        };

        const wrapper = mount(component);
        let dropdown = <Dropdown> wrapper.find({ref: 'dropdown'}).vm;
        expect(dropdown.is_open).toBe(false);

        dropdown.show_the_dropdown_menu();
        expect(dropdown.is_open).toBe(true);

        dropdown.hide_the_dropdown_menu();
        expect(dropdown.is_open).toBe(false);
    });

    test("Arrow key navigation doesn't go off the end", async () => {
        const component = {
            template: `
<dropdown :incoming_items="[1, 2]" ref="dropdown">
    <template slot="header">
        <p ref="header">Hello</p>
    </template>
</dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        };

        const wrapper = mount(component);
        let dropdown = <Dropdown> wrapper.find({ref: 'dropdown'}).vm;
        let header = wrapper.find({ref: 'header'});

        header.trigger('click');
        expect(dropdown.is_open).toBe(true);
        expect(dropdown.$data.highlighted_index).toBe(0);

        let content = wrapper.find('#dropdown-content');
        content.trigger('keydown', { code: 'ArrowUp'});
        expect(dropdown.$data.highlighted_index).toBe(0);

        content.trigger('keydown', { code: 'ArrowDown'});
        expect(dropdown.$data.highlighted_index).toBe(1);
        content.trigger('keydown', { code: 'ArrowDown'});
        expect(dropdown.$data.highlighted_index).toBe(1);

        content.trigger('keydown', { code: 'ArrowUp'});
        expect(dropdown.$data.highlighted_index).toBe(0);
        content.trigger('keydown', { code: 'ArrowUp'});
        expect(dropdown.$data.highlighted_index).toBe(0);
    });

    test("Other keys don't open menu", async () => {
        const component = {
            template: `
<dropdown :incoming_items="[1, 2]" ref="dropdown">
    <template slot="header">
        <p ref="header">Hello</p>
    </template>
</dropdown>`,
            components: {
                'dropdown': Dropdown
            }
        };

        const wrapper = mount(component);
        let dropdown = <Dropdown> wrapper.find({ref: 'dropdown'}).vm;
        let header = wrapper.find({ref: 'header'});

        header.trigger('click');
        expect(dropdown.is_open).toBe(true);

        dropdown.hide_the_dropdown_menu();
        let content = wrapper.find('#dropdown-content');
        content.trigger('keydown', { code: 'A'});
        expect(dropdown.is_open).toBe(false);
    });

    test("Dropdown contents can change and the highlighted index adjusts appropriately",
         async () => {
        @Component({
            template: `<div>
                          <p class="change-breed-button" @click="change_breeds()"> Change Breeds!
                          </p>
                          <dropdown ref="dropdown_component"
                            :incoming_items="dog_breeds"
                            @update_item_selected="add_breed($event)">
                              <template slot="header">
                                <p ref="header" tabindex="1" class="header-para">
                                    Dropdown Header
                                </p>
                              </template>
                              <template slot-scope="breed">
                                <span> {{breed}} </span>
                              </template>
                          </dropdown>
                      </div>`,
            components: {
                'dropdown': Dropdown
            },
        })

        class WrapperComponent extends Vue {

            dog_breeds: string[] = ["Boxer", "Siberian Husky", "Border Collie"];

            cat_breeds: string[] = ["Tonkinese", "Maine Coon"];

            chosen_words: object[] = [];

            add_breed(word: object) {
                this.chosen_words.push(word);
            }

            change_breeds() {
                this.dog_breeds = this.cat_breeds;
            }
        }

        const wrapper = mount(WrapperComponent);
        let dropdown = <Dropdown> wrapper.find({ref: 'dropdown_component'}).vm;
        let header = wrapper.find({ref: 'header'});

        header.trigger("click");

        let dropdown_menu_content = wrapper.find("#dropdown-content");
        expect(dropdown_menu_content.element.children.length).toEqual(3);

        expect(dropdown_menu_content.text()).toContain("Boxer");
        expect(dropdown_menu_content.text()).toContain("Siberian Husky");
        expect(dropdown_menu_content.text()).toContain("Border Collie");

        expect(dropdown.highlighted_index).toEqual(0);

        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });

        dropdown_menu_content.trigger("keydown", { code: "ArrowDown" });

        expect(dropdown.highlighted_index).toEqual(2);

        let changer_button = wrapper.find('.change-breed-button');
        changer_button.trigger("click");

        await dropdown.$nextTick();

        expect(dropdown_menu_content.text()).toContain("Tonkinese");
        expect(dropdown_menu_content.text()).toContain("Maine Coon");

        expect(dropdown.highlighted_index).toEqual(1);
    });
});
