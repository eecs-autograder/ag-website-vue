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

        @Component({
            template: `<div>
              <dropdown-typeahead ref="dropdown_typeahead"
                  incoming_placeholder_text="Enter a State"
                  :incoming_choices="states"
                  :incoming_filter_fn="states_filter_fn"
                  min_width_in="200px"
                  @update_item_chosen="add_item($event)">
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

            add_item(item: object) {
                console.log(item);
            }
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'dropdown_typeahead'}).vm;

        expect(dropdown_typeahead.choices).toEqual(wrapper.vm.$data.states);
        expect(dropdown_typeahead.placeholder_text).toEqual("Enter a State");
        expect(dropdown_typeahead.filter_fn).toBeDefined();
    });

    test('Different values of "filter_text" produce different filtered_choices',
         async () => {
        @Component({
            template: `<div>
              <dropdown-typeahead ref="dropdown_typeahead"
                  incoming_placeholder_text="Enter a State"
                  :incoming_choices="states"
                  :incoming_filter_fn="states_filter_fn"
                  @update_item_chosen="add_item($event)">
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

            add_item(item: object) {
                console.log(item);
            }
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'dropdown_typeahead'}).vm;
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

    test('Chosen items are emitted to the parent component',
         async () => {
        @Component({
            template: `<div>
          <dropdown-typeahead ref="dropdown_typeahead"
              incoming_placeholder_text="Enter a State"
              :incoming_choices="states"
              :incoming_filter_fn="states_filter_fn"
              @update_item_chosen="add_item($event)">
              <template slot-scope="{ item }">
                <span> {{ item.state }}</span>
              </template>
          </dropdown-typeahead>
          <div class="typeahead-1-selections">
            <h3> Chosen from Typeahead: </h3>
            <p v-for="item of chosen_items"> {{item.state}} </p>
          </div>
        </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            states = [ {state: "Missouri"},
                       {state: "Mississippi"},
                       {state: "Minnesota"},
                       {state: "Massachusetts"},
                       {state: "Maine"},
                       {state: "Montana"},
                       {state: "Michigan"},
                       {state: "Maryland"}
                     ];

            states_filter_fn(item: {state: string}, filter_text: string) {
                return item.state.indexOf(filter_text) >= 0;
            }

            add_item(item: object) {
                this.chosen_items.push(item);
            }

            chosen_items: object[] = [];
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'dropdown_typeahead'}).vm;
        let search_bar = wrapper.find('input');

        search_bar.trigger("click");

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        dropdown_typeahead.filter_text = "an";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(3);
        expect(dropdown_menu_content.text()).toContain("Montana");
        expect(dropdown_menu_content.text()).toContain("Michigan");
        expect(dropdown_menu_content.text()).toContain("Maryland");

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(wrapper.vm.$data.chosen_items.length).toEqual(1);
    });

    test('Pressing any key but enter after pressing enter to select an entry will reopen ' +
         'the dropdown',
         async () => {
        @Component({
                template: `<div>
          <dropdown-typeahead ref="dropdown_typeahead"
                              incoming_placeholder_text="Enter a Name"
                              :incoming_choices="strangers"
                              :incoming_filter_fn="stranger_things_filter_fn"
                              @update_item_chosen="add_item($event)">
              <template slot-scope="{ item }">
                <span> {{ item.first_name }} {{ item.last_name}}</span>
              </template>
          </dropdown-typeahead>
          <div class="typeahead-1-selections">
            <h3> Chosen from Typeahead: </h3>
            <p v-for="item of chosen_items"> {{item.last_name}}, {{item.first_name}} </p>
          </div>
        </div>`,
                components: {
                    'dropdown-typeahead': DropdownTypeahead
                },
            })
        class WrapperComponent extends Vue {
            strangers = [ {first_name: "Joyce", last_name: "Byers"},
                          {first_name: "Will", last_name: "Byers"},
                          {first_name: "Jonathan", last_name: "Byers"},
                          {first_name: "Nancy", last_name: "Wheeler"},
                          {first_name: "Mike", last_name: "Wheeler"},
                          {first_name: "Steve", last_name: "Harrington"},
                          {first_name: "Jim", last_name: "Hopper"}
            ];

            stranger_things_filter_fn(item: {first_name: string, last_name: string},
                                      filter_text: string) {
                let full_name: string = item.first_name + " " + item.last_name;
                return full_name.indexOf(filter_text) >= 0;
            }

            add_item(item: object) {
                this.chosen_items.push(item);
            }

            chosen_items: object[] = [];
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'dropdown_typeahead'}).vm;
        let search_bar = wrapper.find('input');

        search_bar.trigger("click");

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        dropdown_typeahead.filter_text = "y";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(4);
        expect(dropdown_menu_content.text()).toContain("Joyce Byers");
        expect(dropdown_menu_content.text()).toContain("Will Byers");
        expect(dropdown_menu_content.text()).toContain("Jonathan Byers");
        expect(dropdown_menu_content.text()).toContain("Nancy Wheeler");

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(wrapper.vm.$data.chosen_items.length).toEqual(1);
        expect(wrapper.vm.$data.chosen_items[0]).toEqual(
            {first_name: "Joyce", last_name: "Byers"}
        );

        let dropdown_component = <Dropdown> dropdown_typeahead.$refs.dropdown_component;
        expect(dropdown_component.is_open).toBe(false);

        search_bar.trigger('keydown', { code: 'Space' });
        expect(dropdown_component.is_open).toBe(true);

        dropdown_typeahead.filter_text = "y ";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_menu_content.text()).toContain("Nancy Wheeler");

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(wrapper.vm.$data.chosen_items.length).toEqual(2);
        expect(wrapper.vm.$data.chosen_items[1]).toEqual(
            {first_name: "Nancy", last_name: "Wheeler"}
        );
    });

    test("Pressing enter twice while there are results in the dropdown menu doesn't emit " +
         "the object to the parent twice",
         async () => {
        @Component({
            template: `<div>
      <dropdown-typeahead ref="dropdown_typeahead"
                          incoming_placeholder_text="Enter a Name"
                          :incoming_choices="strangers"
                          :incoming_filter_fn="stranger_things_filter_fn"
                          @update_item_chosen="add_item($event)">
          <template slot-scope="{ item }">
            <span> {{ item.first_name }} {{ item.last_name}}</span>
          </template>
      </dropdown-typeahead>
      <div class="typeahead-1-selections">
        <h3> Chosen from Typeahead: </h3>
        <p v-for="item of chosen_items"> {{item.last_name}}, {{item.first_name}} </p>
      </div>
    </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            strangers = [ {first_name: "Joyce", last_name: "Byers"},
                          {first_name: "Will", last_name: "Byers"},
                          {first_name: "Jonathan", last_name: "Byers"},
                          {first_name: "Nancy", last_name: "Wheeler"},
                          {first_name: "Mike", last_name: "Wheeler"},
                          {first_name: "Steve", last_name: "Harrington"},
                          {first_name: "Jim", last_name: "Hopper"}
            ];

            stranger_things_filter_fn(item: {first_name: string, last_name: string},
                                      filter_text: string) {
                let full_name: string = item.first_name + " " + item.last_name;
                return full_name.indexOf(filter_text) >= 0;
            }

            add_item(item: object) {
                this.chosen_items.push(item);
            }

            chosen_items: object[] = [];
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'dropdown_typeahead'}).vm;
        let search_bar = wrapper.find('input');

        search_bar.trigger("click");

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        dropdown_typeahead.filter_text = "y";
        await dropdown_typeahead.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(4);
        expect(dropdown_menu_content.text()).toContain("Joyce Byers");
        expect(dropdown_menu_content.text()).toContain("Will Byers");
        expect(dropdown_menu_content.text()).toContain("Jonathan Byers");
        expect(dropdown_menu_content.text()).toContain("Nancy Wheeler");

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(wrapper.vm.$data.chosen_items.length).toEqual(1);
        expect(wrapper.vm.$data.chosen_items[0]).toEqual(
            {first_name: "Joyce", last_name: "Byers"}
        );

        let dropdown_component = <Dropdown> dropdown_typeahead.$refs.dropdown_component;
        expect(dropdown_component.is_open).toBe(false);

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(dropdown_component.is_open).toBe(false);
        expect(wrapper.vm.$data.chosen_items.length).toEqual(1);
    });


    test("Objects in the dropdown typeahead are displayed in their original form by " +
         "default if a scoped-slot is not supplied",
         async () => {
        @Component({
            template: `<div>
                        <dropdown-typeahead ref="dropdown_typeahead"
                          incoming_placeholder_text="Enter a Name"
                          :incoming_choices="strangers"
                          :incoming_filter_fn="stranger_things_filter_fn"
                          @update_item_chosen="add_item($event)">
                        </dropdown-typeahead>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            strangers = [ {first_name: "Joyce", last_name: "Byers"},
                          {first_name: "Will", last_name: "Byers"},
                          {first_name: "Jonathan", last_name: "Byers"},
                          {first_name: "Nancy", last_name: "Wheeler"},
                          {first_name: "Mike", last_name: "Wheeler"},
                          {first_name: "Steve", last_name: "Harrington"},
                          {first_name: "Jim", last_name: "Hopper"}
            ];

            stranger_things_filter_fn(item: {first_name: string, last_name: string},
                                      filter_text: string) {
                let full_name: string = item.first_name + " " + item.last_name;
                return full_name.indexOf(filter_text) >= 0;
            }

            add_item(item: object) {
                this.chosen_items.push(item);
            }

            chosen_items: object[] = [];
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'dropdown_typeahead'}).vm;
        let search_bar = wrapper.find('input');

        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "J";
        await dropdown_typeahead.$nextTick();

        // console.log(dropdown_entries.html());

        let dropdown_menu_content = wrapper.find('.dropdown-content');
        let dropdown_entries = dropdown_menu_content.findAll('.dropdown-row');

        expect(dropdown_typeahead.filtered_choices.length).toEqual(3);
        expect(dropdown_entries.at(0).text()).toContain("{");
        expect(dropdown_entries.at(0).text()).toContain("}");
        expect(dropdown_entries.at(0).text()).toContain("\"first_name\":");
        expect(dropdown_entries.at(0).text()).toContain("\"last_name\":");
        expect(dropdown_entries.at(0).text()).toContain("\"Joyce\"");
        expect(dropdown_entries.at(0).text()).toContain("\"Byers\"");
    });
});
