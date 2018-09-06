import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import Component from 'vue-class-component';
import Vue from 'vue';

import { config, mount, Wrapper } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('DropdownTypeahead.vue', () => {

    test('DropdownTypeahead data set to values passed in by parent', () => {
        const wrapper = mount(DropdownTypeahead, {
            propsData: {
                incoming_choices: [{name: "Reba McEntire"}, {name: "JoAnna Garcia Swisher"},
                                   {name: "Steve Howey"}, {name: "Christopher Rich"},
                                   {name: "Melissa Peterman"}, {name: "Scarlett Pomers"}],
                incoming_placeholder_text: "Enter a Name",
                item_field_name: "name"
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.choices).toEqual([{name: "Reba McEntire"},
                                          {name: "JoAnna Garcia Swisher"}, {name: "Steve Howey"},
                                          {name: "Christopher Rich"}, {name: "Melissa Peterman"},
                                          {name: "Scarlett Pomers"}]);
        expect(vm.$data.placeholder_text).toEqual("Enter a Name");
        expect(vm.$data.field_name).toEqual("name");
    });

    test('Different values of "filter_text" produce different filtered_choices', () => {
        let states = ["Missouri", "Mississippi", "Minnesota", "Massachusetts", "Maine",
                      "Montana", "Michigan", "Maryland"];
        const wrapper = mount(DropdownTypeahead, {
            propsData: {
                incoming_choices: states,
                incoming_placeholder_text: "Enter a State"
            }
        });

        const vm = wrapper.vm;
        let input = wrapper.find('input');
        let dropdown_menu = wrapper.find(".dropdown-content");

        input.trigger('click');

        expect(dropdown_menu.element.style.display).toEqual("block");

        wrapper.setData({filter_text: 'M'});

        expect(vm.$data.filtered_choices_priv).toEqual(states);

        wrapper.setData({filter_text: 'Mi'});

        expect(vm.$data.filtered_choices_priv).toEqual(["Missouri", "Mississippi",
                                                        "Minnesota", "Michigan"]);

        wrapper.setData({filter_text: 'Mis'});

        expect(vm.$data.filtered_choices_priv).toEqual(["Missouri", "Mississippi"]);

        wrapper.setData({filter_text: 'Miss'});

        expect(vm.$data.filtered_choices_priv).toEqual(["Missouri", "Mississippi"]);

        wrapper.setData({filter_text: 'Missi'});

        expect(vm.$data.filtered_choices_priv).toEqual(["Mississippi"]);

        wrapper.setData({filter_text: 'Missiz'});

        expect(vm.$data.filtered_choices_priv).toEqual([]);
    });

    test('Pressing the up and down keys changes the highlighted item', () => {
        let states = ["Missouri", "Mississippi", "Minnesota", "Massachusetts", "Maine",
                      "Montana", "Michigan", "Maryland"];
        const wrapper = mount(DropdownTypeahead, {
            propsData: {
                incoming_choices: states,
                incoming_placeholder_text: "Enter a State"
            }
        });

        const vm = wrapper.vm;
        let input = wrapper.find('input');
        let dropdown_menu = wrapper.find(".dropdown-content");

        input.trigger('click');

        expect(dropdown_menu.element.style.display).toEqual("block");

        wrapper.setData({filter_text: 'M'});

        expect(vm.$data.filtered_choices_priv).toEqual(states);

        wrapper.setData({filter_text: 'Mi'});

        expect(vm.$data.filtered_choices_priv).toEqual(["Missouri", "Mississippi",
                                                        "Minnesota", "Michigan"]);

        expect(vm.$data.highlighted_index).toEqual(0);

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Missouri");

        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Mississippi");

        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Minnesota");

        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Michigan");

        // highlighted_index doesn't go off the end of the array
        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Michigan");

        input.trigger("keydown", { code: "ArrowUp" });
        input.trigger("keydown", { code: "ArrowUp" });
        input.trigger("keydown", { code: "ArrowUp" });
        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Missouri");

    });

    test('Clicking on an item in the dropdown closes the dropdown', () => {
        const wrapper = mount(DropdownTypeahead, {
            propsData: {
                incoming_choices: [{name: "Reba McEntire"}, {name: "JoAnna Garcia Swisher"},
                    {name: "Steve Howey"}, {name: "Christopher Rich"}, {name: "Melissa Peterman"},
                    {name: "Scarlett Pomers"}],
                incoming_placeholder_text: "Enter a Name",
                item_field_name: "name"
            }
        });

        const vm = wrapper.vm;

        let input = wrapper.find('input');

        let dropdown_menu = wrapper.find(".dropdown-content");

        // this doesn't work
        // expect(dropdown_menu.element.style.display).toEqual("none");

        input.trigger('click');

        expect(dropdown_menu.element.style.display).toEqual("block");

        wrapper.setData({filter_text: 'P'});

        expect(vm.$data.filtered_choices_priv.length).toEqual(2);

        let first_result = wrapper.find(".highlight");

        first_result.trigger('click');

        expect(dropdown_menu.element.style.display).toEqual("none");
    });

    test('Item selected is delivered to the parent', () => {
        @Component({
            template: `<div>
                          <dropdown-typeahead ref="dropT" :incoming_choices="arr"
                                               incoming_placeholder_text="Enter a Word"
                                               @add_item_selected="add_item_selected($event)">
                          </dropdown-typeahead>
                          <div class="selected_stuff">
                           <p v-for="item in selected_items">{{item}}</p>
                          </div>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })

        class WrapperComponent extends Vue {
            arr: string[] = ["Bye", "By", "Buy"];
            selected_items: object[] = [];

            add_item_selected(menu_item: object) {
                this.selected_items.push(menu_item);
            }
        }

        const wrapper = mount(WrapperComponent);

        const dropdown_typeahead = wrapper.find({ref: 'dropT'});

        expect(dropdown_typeahead.vm.$data.choices).toEqual(["Bye", "By", "Buy"]);
        expect(dropdown_typeahead.vm.$data.placeholder_text).toEqual("Enter a Word");
        expect(dropdown_typeahead.vm.$data.field_name).toBeNull();

        let input = dropdown_typeahead.find('input');

        input.trigger('click');

        dropdown_typeahead.setData({filter_text: 'By'});

        expect(dropdown_typeahead.vm.$data.filtered_choices_priv).toEqual(["Bye", "By"]);

        input.trigger('keydown', { code: 'ArrowDown' });

        input.trigger('keydown', { code: 'Enter'});

        expect(wrapper.vm.$data.selected_items.length).toEqual(1);

        expect(wrapper.vm.$data.selected_items[0]).toContain("By");
    });

    test('Items cannot be selected and sent to parent if there are no filtered ' +
         'results', () => {
        @Component({
            template: `<div>
                          <dropdown-typeahead ref="dropT" :incoming_choices="arr"
                                               incoming_placeholder_text="Enter a Carolina"
                                               @add_item_selected="add_item_selected($event)">
                          </dropdown-typeahead>
                          <div class="selected_stuff">
                           <p v-for="item in selected_items">{{item}}</p>
                          </div>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })

        class WrapperComponent extends Vue {
            arr: string[] = ["North Carolina", "South Carolina"];
            selected_items: object[] = [];

            add_item_selected(menu_item: object) {
                this.selected_items.push(menu_item);
            }
        }

        const wrapper = mount(WrapperComponent);

        const dropdown_typeahead = wrapper.find({ref: 'dropT'});

        expect(dropdown_typeahead.vm.$data.choices).toEqual(["North Carolina",
                                                             "South Carolina"]);
        expect(dropdown_typeahead.vm.$data.placeholder_text).toEqual("Enter a Carolina");
        expect(dropdown_typeahead.vm.$data.field_name).toBeNull();

        let input = dropdown_typeahead.find('input');

        input.trigger('click');

        dropdown_typeahead.setData({filter_text: 'Carolina'});

        expect(dropdown_typeahead.vm.$data.filtered_choices_priv).toEqual(
            ["North Carolina", "South Carolina"]
        );

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(0);

        input.trigger('keydown', { code: 'ArrowDown' });

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(1);

        dropdown_typeahead.setData({filter_text: 'Carolinaa'});

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(-1);

        input.trigger('keydown', { code: 'Enter'});

        expect(wrapper.vm.$data.selected_items.length).toEqual(0);

        dropdown_typeahead.setData({filter_text: 'Carolina'});

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(0);
    });

    test('Hitting enter twice consecutively only adds the highlighted item once', () => {
        @Component({
            template: `<div>
                          <dropdown-typeahead ref="dropT" :incoming_choices="arr"
                                               incoming_placeholder_text="Enter a Continent"
                                               @add_item_selected="add_item_selected($event)">
                          </dropdown-typeahead>
                          <div class="selected_stuff">
                           <p v-for="item in selected_items">{{item}}</p>
                          </div>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })

        class WrapperComponent extends Vue {
            arr: string[] = ["Africa", "Asia", "Europe", "North America", "South America",
                             "Antarctica", "Australia"];
            selected_items: object[] = [];

            add_item_selected(menu_item: object) {
                this.selected_items.push(menu_item);
            }
        }

        const wrapper = mount(WrapperComponent);

        const dropdown_typeahead = wrapper.find({ref: 'dropT'});

        expect(dropdown_typeahead.vm.$data.choices).toEqual(["Africa", "Asia", "Europe",
                                                             "North America", "South America",
                                                             "Antarctica", "Australia"]);
        expect(dropdown_typeahead.vm.$data.placeholder_text).toEqual("Enter a Continent");
        expect(dropdown_typeahead.vm.$data.field_name).toBeNull();

        let input = dropdown_typeahead.find('input');

        input.trigger('click');

        dropdown_typeahead.setData({filter_text: 'rica'});

        expect(dropdown_typeahead.vm.$data.filtered_choices_priv).toEqual(
            ["Africa", "North America", "South America"]
        );

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(0);

        input.trigger('keydown', { code: 'Enter' });
        input.trigger('keydown', { code: 'Enter' });

        expect(wrapper.vm.$data.selected_items.length).toEqual(1);

        expect(wrapper.vm.$data.selected_items[0]).toContain("Africa");
    });

    test('Hitting escape while in the dropdown menu will cause the first item ' +
         'in the results to become highlighted', () => {
        @Component({
            template: `<div>
                          <dropdown-typeahead ref="dropT" :incoming_choices="arr"
                                               incoming_placeholder_text="Enter a Continent"
                                               @add_item_selected="add_item_selected($event)">
                          </dropdown-typeahead>
                          <div class="selected_stuff">
                           <p v-for="item in selected_items">{{item}}</p>
                          </div>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })

        class WrapperComponent extends Vue {
            arr: string[] = ["Africa", "Asia", "Europe", "North America", "South America",
                             "Antarctica", "Australia"];
            selected_items: object[] = [];

            add_item_selected(menu_item: object) {
                this.selected_items.push(menu_item);
            }
        }

        const wrapper = mount(WrapperComponent);

        const dropdown_typeahead = wrapper.find({ref: 'dropT'});

        expect(dropdown_typeahead.vm.$data.choices).toEqual(["Africa", "Asia", "Europe",
                                                             "North America", "South America",
                                                             "Antarctica", "Australia"]);
        expect(dropdown_typeahead.vm.$data.placeholder_text).toEqual("Enter a Continent");
        expect(dropdown_typeahead.vm.$data.field_name).toBeNull();

        let input = dropdown_typeahead.find('input');

        input.trigger('click');

        dropdown_typeahead.setData({filter_text: 'rica'});

        expect(dropdown_typeahead.vm.$data.filtered_choices_priv).toEqual(
            ["Africa", "North America", "South America"]
        );

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(0);

        input.trigger('keydown', { code: 'ArrowDown' });
        input.trigger('keydown', { code: 'ArrowDown' });

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(2);

        input.trigger('keydown', { code: 'Escape'});

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(0);
    });

    test('Clicking away from the dropdown menu closes the menu', () => {
        @Component({
            template: `<div>
                          <dropdown-typeahead ref="dropT" :incoming_choices="arr"
                                               incoming_placeholder_text="Enter a Last Name"
                                               item_field_name="last_name"
                                               @add_item_selected="add_item_selected($event)">
                          </dropdown-typeahead>
                          <div class="selected_stuff">
                           <p v-for="item in selected_items">{{item}}</p>
                          </div>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })

        class WrapperComponent extends Vue {
            arr: object[] = [{last_name: "Jones"}, {last_name: "Johnson"}];
            selected_items: object[] = [];

            add_item_selected(menu_item: object) {
                this.selected_items.push(menu_item);
            }
        }

        const wrapper = mount(WrapperComponent);

        const dropdown_typeahead = wrapper.find({ref: 'dropT'});

        console.log(wrapper.html());

        expect(dropdown_typeahead.vm.$data.choices).toEqual(
            [{last_name: "Jones"}, {last_name: "Johnson"}]
        );
        expect(dropdown_typeahead.vm.$data.placeholder_text).toEqual(
            "Enter a Last Name"
        );
        expect(dropdown_typeahead.vm.$data.field_name).toEqual("last_name");

        let input = dropdown_typeahead.find('input');

        input.trigger('click');
        input.trigger('focus');

        let dropdown_content = dropdown_typeahead.find('.dropdown-content');

        expect(dropdown_content.element.style.display).toEqual("block");

        let collection_of_items_in_parent = wrapper.find('.selected_stuff');

        // Calling focus on a collection of items in parent doesn't cause blur on input
        input.trigger('blur');

        expect(dropdown_content.element.style.display).toEqual("none");

    });
});
