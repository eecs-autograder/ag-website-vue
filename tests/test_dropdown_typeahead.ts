import Dropdown from '@/components/dropdown.vue';
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
                incoming_filter_fn: (item: {name: string}, filter_text: string) => {
                                 return item.name.indexOf(filter_text) >= 0;
                }
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.choices).toEqual([{name: "Reba McEntire"},
                                          {name: "JoAnna Garcia Swisher"}, {name: "Steve Howey"},
                                          {name: "Christopher Rich"}, {name: "Melissa Peterman"},
                                          {name: "Scarlett Pomers"}]);
        expect(vm.$data.placeholder_text).toEqual("Enter a Name");
    });

    test('Different values of "filter_text" produce different filtered_choices',
         async () => {
        @Component({
            template: `<div>
              <dropdown-typeahead ref="dropdown_typeahead"
                  incoming_placeholder_text="Enter a State"
                  :incoming_choices="states"
                  :incoming_filter_fn="states_filter_fn"
                  @update_item_chosen="print_item($event)">
                  <template slot-scope="{ item }">
                    <span> {{ item }}</span>
                  </template>
              </dropdown-typeahead>
            </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            states = ["Missouri", "Mississippi", "Minnesota", "Massachusetts", "Maine",
                      "Montana", "Michigan", "Maryland"];

            states_filter_fn(item: string, filter_text: string) {
                return item.indexOf(filter_text) >= 0;
            }
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'dropdown_typeahead'}).vm;
        // let dropdown_component = wrapper.find({ref: 'dropdown_typeahead'}).find(
        //     'dropdown_component'
        // );
        let search_bar = wrapper.find('input');

        search_bar.trigger("click");

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        expect(dropdown_typeahead.filtered_choices.length).toEqual(8);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");
        expect(dropdown_menu_content.text()).toContain("Minnesota");
        expect(dropdown_menu_content.text()).toContain("Massachusetts");
        expect(dropdown_menu_content.text()).toContain("Maine");
        expect(dropdown_menu_content.text()).toContain("Montana");
        expect(dropdown_menu_content.text()).toContain("Michigan");
        expect(dropdown_menu_content.text()).toContain("Maryland");

        dropdown_typeahead.filter_text = "Mi";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(4);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");
        expect(dropdown_menu_content.text()).toContain("Minnesota");
        expect(dropdown_menu_content.text()).toContain("Michigan");

        dropdown_typeahead.filter_text = "Mis";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        dropdown_typeahead.filter_text = "Miss";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        dropdown_typeahead.filter_text = "Missi";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        dropdown_typeahead.filter_text = "Missiz";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(0);

        dropdown_typeahead.filter_text = "Missi";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_menu_content.text()).toContain("Mississippi");
    });
});
