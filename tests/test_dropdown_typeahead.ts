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
});
