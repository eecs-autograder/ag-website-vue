import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import { prependListener } from 'cluster';
import Vue from 'vue';
import Component from 'vue-class-component';

import { config, mount, Wrapper } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

interface Group {
    partner1: string;
    partner2: string;
}

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

        let dropdown_content = wrapper.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(states.length);

        expect(dropdown_content.text()).toContain("Missouri");
        expect(dropdown_content.text()).toContain("Mississippi");
        expect(dropdown_content.text()).toContain("Minnesota");
        expect(dropdown_content.text()).toContain("Massachusetts");
        expect(dropdown_content.text()).toContain("Maine");
        expect(dropdown_content.text()).toContain("Montana");
        expect(dropdown_content.text()).toContain("Michigan");
        expect(dropdown_content.text()).toContain("Maryland");

        wrapper.setData({filter_text: 'Mi'});

        expect(dropdown_content.element.children.length).toEqual(4);
        expect(dropdown_content.text()).toContain("Missouri");
        expect(dropdown_content.text()).toContain("Mississippi");
        expect(dropdown_content.text()).toContain("Minnesota");
        expect(dropdown_content.text()).toContain("Michigan");

        wrapper.setData({filter_text: 'Mis'});

        expect(dropdown_content.element.children.length).toEqual(2);
        expect(dropdown_content.text()).toContain("Missouri");
        expect(dropdown_content.text()).toContain("Mississippi");

        wrapper.setData({filter_text: 'Miss'});

        expect(dropdown_content.element.children.length).toEqual(2);
        expect(dropdown_content.text()).toContain("Missouri");
        expect(dropdown_content.text()).toContain("Mississippi");

        wrapper.setData({filter_text: 'Missi'});

        expect(dropdown_content.element.children.length).toEqual(1);
        expect(dropdown_content.text()).toContain("Mississippi");

        wrapper.setData({filter_text: 'Missiz'});

        expect(dropdown_content.element.children.length).toEqual(0);

        wrapper.setData({filter_text: 'Missi'});

        expect(dropdown_content.element.children.length).toEqual(1);
        expect(dropdown_content.text()).toContain("Mississippi");
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

        let dropdown_content = wrapper.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(states.length);

        expect(dropdown_content.text()).toContain("Missouri");
        expect(dropdown_content.text()).toContain("Mississippi");
        expect(dropdown_content.text()).toContain("Minnesota");
        expect(dropdown_content.text()).toContain("Massachusetts");
        expect(dropdown_content.text()).toContain("Maine");
        expect(dropdown_content.text()).toContain("Montana");
        expect(dropdown_content.text()).toContain("Michigan");
        expect(dropdown_content.text()).toContain("Maryland");

        wrapper.setData({filter_text: 'Mi'});

        expect(dropdown_content.element.children.length).toEqual(4);
        expect(dropdown_content.text()).toContain("Missouri");
        expect(dropdown_content.text()).toContain("Mississippi");
        expect(dropdown_content.text()).toContain("Minnesota");
        expect(dropdown_content.text()).toContain("Michigan");

        expect(vm.$data.highlighted_index).toEqual(0);

        let highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Missouri");

        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Mississippi");

        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Minnesota");

        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Michigan");

        // highlighted_index doesn't go off the end of the array
        input.trigger("keydown", { code: "ArrowDown" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Michigan");

        input.trigger("keydown", { code: "ArrowUp" });
        input.trigger("keydown", { code: "ArrowUp" });
        input.trigger("keydown", { code: "ArrowUp" });
        highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("Missouri");
    });

    test('Clicking on an item in the dropdown closes the dropdown', () => {
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

        let input = wrapper.find('input');

        let dropdown_menu = wrapper.find(".dropdown-content");

        // this doesn't work
        // expect(dropdown_menu.element.style.display).toEqual("none");

        input.trigger('click');

        expect(dropdown_menu.element.style.display).toEqual("block");

        wrapper.setData({filter_text: 'P'});

        let dropdown_content = wrapper.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(2);

        let first_result = wrapper.find("#highlight");

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

        let dropdown_content = wrapper.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(2);

        expect(dropdown_content.text()).toContain("Bye");
        expect(dropdown_content.text()).toContain("By");

        input.trigger('keydown', { code: 'ArrowDown' });

        input.trigger('keydown', { code: 'Enter'});

        expect(wrapper.vm.$data.selected_items.length).toEqual(1);

        expect(wrapper.vm.$data.selected_items[0]).toContain("By");
    });

    test('Items cannot be selected and sent to parent if there are no filtered results', () => {
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

        let dropdown_content = dropdown_typeahead.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(2);
        expect(dropdown_content.text()).toContain("North Carolina");
        expect(dropdown_content.text()).toContain("South Carolina");
        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(0);

        input.trigger('keydown', { code: 'ArrowDown' });

        dropdown_typeahead.setData({filter_text: 'Carolinaa'});

        expect(dropdown_content.element.children.length).toEqual(0);
        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(-1);

        input.trigger('keydown', { code: 'Enter'});

        expect(wrapper.vm.$data.selected_items.length).toEqual(0);
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

        let dropdown_content = dropdown_typeahead.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(3);

        expect(dropdown_content.text()).toContain("Africa");
        expect(dropdown_content.text()).toContain("North America");
        expect(dropdown_content.text()).toContain("South America");

        expect(dropdown_typeahead.vm.$data.highlighted_index).toEqual(0);

        input.trigger('keydown', { code: 'Enter' });
        input.trigger('keydown', { code: 'Enter' });

        expect(wrapper.vm.$data.selected_items.length).toEqual(1);

        expect(wrapper.vm.$data.selected_items[0]).toContain("Africa");
    });

    test('Hitting esc in the dropdown menu causes the first item to become highlighted', () => {
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

        let dropdown_content = dropdown_typeahead.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(3);

        expect(dropdown_content.text()).toContain("Africa");
        expect(dropdown_content.text()).toContain("North America");
        expect(dropdown_content.text()).toContain("South America");

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

        // let collection_of_items_in_parent = wrapper.find('.selected_stuff');

        // Calling focus on a collection of items in parent doesn't cause blur on input
        input.trigger('blur');

        expect(dropdown_content.element.style.display).toEqual("none");
    });

    test('Custom filter and display functions are used when provided', () => {
        @Component({
            template: `<div>
                          <dropdown-typeahead ref="dropT" :incoming_choices="group_partners"
                                               incoming_placeholder_text="Enter a Name"
                                               :incoming_display_item_fn="custom_display_function"
                                               :incoming_filter_fn="custom_filter_function"
                                               @add_item_selected="add_pair($event)">
                          </dropdown-typeahead>
                          <div class="collection-of-pairs">
                            <p v-for="pair of pairs"> {{pair.partner1}}, {{pair.partner2}} </p>
                          </div>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })

        class WrapperComponent extends Vue {

            group_partners: Group[] = [{partner1: "Jim H", partner2: "Dwight S"},
                                       {partner1: "Kelly K", partner2: "Ryan H"},
                                       {partner1: "Meredith P", partner2: "Creed B"},
                                       {partner1: "Angela M", partner2: "Kevin M"},
                                       {partner1: "Pam B", partner2: "Kelly H"}];

            custom_display_function(group: Group) {
                return group.partner1 + ", " + group.partner2;
            }

            custom_filter_function(group: Group, filter: string) {
                let partner1_result = group.partner1;
                let partner2_result = group.partner2;
                return partner1_result.indexOf(filter) >= 0 || partner2_result.indexOf(filter) >= 0;
            }

            pairs: object[] = [];

            add_pair(pairing: object) {
                this.pairs.push(pairing);
            }
        }

        const wrapper = mount(WrapperComponent);

        const dropdown_typeahead = wrapper.find({ref: 'dropT'});

        expect(dropdown_typeahead.vm.$data.choices).toEqual(wrapper.vm.$data.group_partners);


        expect(dropdown_typeahead.vm.$data.placeholder_text).toEqual("Enter a Name");
        expect(dropdown_typeahead.vm.$data.field_name).toBeNull();

        let input = dropdown_typeahead.find('input');

        input.trigger('click');

        dropdown_typeahead.setData({filter_text: 'Ke'});

        let dropdown_content = dropdown_typeahead.find('.dropdown-content');

        expect(dropdown_content.element.children.length).toEqual(3);

        expect(dropdown_content.text()).toContain("Kelly K");
        expect(dropdown_content.text()).toContain("Ryan H");
        expect(dropdown_content.text()).toContain("Pam B");
        expect(dropdown_content.text()).toContain("Kelly H");
        expect(dropdown_content.text()).toContain("Angela M");
        expect(dropdown_content.text()).toContain("Kevin M");
        expect(dropdown_content.text()).toContain("Kelly K");

        dropdown_typeahead.setData({filter_text: 'Kelly'});

        expect(dropdown_content.element.children.length).toEqual(2);

        expect(dropdown_content.text()).toContain("Kelly K");
        expect(dropdown_content.text()).toContain("Ryan H");
        expect(dropdown_content.text()).toContain("Pam B");
        expect(dropdown_content.text()).toContain("Kelly H");
        expect(dropdown_content.text()).toContain("Kelly K");

        input.trigger('keydown', { code: 'ArrowDown' });

        let currently_selected_pair = dropdown_typeahead.find("#highlight");

        expect(currently_selected_pair.text()).toEqual("Pam B, Kelly H");

        input.trigger('keydown', { code: 'Enter' });

        expect(wrapper.vm.$data.pairs.length).toEqual(1);

        expect(wrapper.vm.$data.pairs[0]).toEqual(
            {"partner1": "Pam B", "partner2": "Kelly H"}
        );
    });


    test('More than one item from the dropdown can be sent to the parent over time', () => {
        @Component({
            template: `<div>
                          <dropdown-typeahead ref="dropT" :incoming_choices="words"
                                               incoming_placeholder_text="Enter a Word"
                                               @add_item_selected="add_word($event)">
                          </dropdown-typeahead>
                          <div class="collection-of-words">
                            <p v-for="word of chosen_words"> {{word}} </p>
                          </div>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })

        class WrapperComponent extends Vue {

            words: string[] = ["Dog", "doug", "dough", "doughnut"];

            chosen_words: object[] = [];

            add_word(word: object) {
                this.chosen_words.push(word);
            }
        }

        const wrapper = mount(WrapperComponent);

        const dropdown_typeahead = wrapper.find({ref: 'dropT'});

        expect(dropdown_typeahead.vm.$data.choices).toEqual(wrapper.vm.$data.words);
        expect(dropdown_typeahead.vm.$data.placeholder_text).toEqual("Enter a Word");
        expect(dropdown_typeahead.vm.$data.field_name).toBeNull();

        let dropdown_content = dropdown_typeahead.find('.dropdown-content');
        let input = dropdown_typeahead.find('input');

        input.trigger('click');

        dropdown_typeahead.setData({filter_text: 'dough'});

        dropdown_typeahead.setData({filter_text: 'dough'});

        expect(dropdown_content.element.children.length).toEqual(2);
        expect(dropdown_content.text()).toContain("dough");
        expect(dropdown_content.text()).toContain("doughnut");

        let highlighted_item = wrapper.find("#highlight");
        expect(highlighted_item.text()).toContain("dough");

        input.trigger('keydown', { code: 'Enter'});

        expect(wrapper.vm.$data.chosen_words.length).toEqual(1);
        expect(wrapper.vm.$data.chosen_words[0]).toEqual("dough");

        expect(dropdown_content.element.style.display).toEqual("none");

        input.trigger('keydown', { code: 'Backspace'});

        dropdown_typeahead.setData({filter_text: 'doug'});

        expect(dropdown_content.element.style.display).toEqual("block");

        expect(dropdown_content.element.children.length).toEqual(3);
        expect(dropdown_content.text()).toContain("dough");
        expect(dropdown_content.text()).toContain("doughnut");
        expect(dropdown_content.text()).toContain("doug");

        input.trigger('keydown', { code: 'ArrowDown'});
        input.trigger('keydown', { code: 'ArrowDown'});

        highlighted_item = wrapper.find("#highlight");

        expect(highlighted_item.text()).toContain("doughnut");

        highlighted_item.trigger('click');

        expect(wrapper.vm.$data.chosen_words.length).toEqual(2);
        expect(wrapper.vm.$data.chosen_words[1]).toEqual("doughnut");

        input.trigger('keydown', { code: 'Keyd'});

        expect(dropdown_content.element.style.display).toEqual("block");

        dropdown_typeahead.setData({filter_text: 'dance'});

        expect(dropdown_content.element.children.length).toEqual(0);

        input.trigger('keydown', { code: 'Enter'});

        expect(wrapper.vm.$data.chosen_words.length).toEqual(2);

        input.trigger('keydown', { code: 'KeyD'});

        expect(dropdown_content.element.style.display).toEqual("block");

        dropdown_typeahead.setData({filter_text: 'Dog'});

        expect(dropdown_content.element.children.length).toEqual(1);
        expect(dropdown_content.text()).toContain("Dog");

        input.trigger('keydown', { code: 'Enter'});

        expect(wrapper.vm.$data.chosen_words.length).toEqual(3);
        expect(wrapper.vm.$data.chosen_words[2]).toEqual("Dog");
        expect(dropdown_content.element.style.display).toEqual("none");
    });
});
