import Vue from 'vue';
import Component from 'vue-class-component';

import { mount } from '@vue/test-utils';

import DropdownTypeahead from '@/components/dropdown_typeahead.vue';

import { emitted, find_component } from '@/tests/utils';


describe('DropdownTypeahead.vue', () => {
    test('choices array is empty', async () => {
        @Component({
                       template: `<div>
              <dropdown-typeahead ref="dropdown_typeahead"
                  typeahead_class="custom-style"
                  placeholder_text="Enter a State"
                  :choices="states"
                  :filter_fn="states_filter_fn">
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
            states = [];

            states_filter_fn(item: string, filter_text: string) {
                return item.indexOf(filter_text) >= 0;
            }
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = find_component(wrapper, DropdownTypeahead);

        expect(dropdown_typeahead.props('choices')).toEqual([]);

        let search_bar = wrapper.find('input');
        await search_bar.trigger('click');

        let dropdown_no_matches_message = wrapper.find('.no-matching-results');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(0);
        expect(dropdown_no_matches_message.text()).toContain(
            "We couldn't find any results containing: ''"
        );

        await search_bar.setValue('word');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(0);
        expect(dropdown_no_matches_message.text()).toContain(
            "We couldn't find any results containing: 'word'"
        );
    });

    test('calling clear_filter_text sets filter_text to an empty string', async () => {
        @Component({
                       template: `<div>
              <dropdown-typeahead ref="dropdown_typeahead"
                  typeahead_class="custom-style"
                  placeholder_text="Enter a State"
                  :choices="states"
                  :filter_fn="states_filter_fn">
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
            states = [];

            states_filter_fn(item: string, filter_text: string) {
                return item.indexOf(filter_text) >= 0;
            }
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = find_component(wrapper, DropdownTypeahead);
        let search_bar = wrapper.find('input');
        await search_bar.trigger('click');

        await search_bar.setValue('word');
        expect((search_bar.element as HTMLInputElement).value).toEqual('word');

        dropdown_typeahead.vm.clear_filter_text();
        await wrapper.vm.$nextTick();

        expect((search_bar.element as HTMLInputElement).value).toEqual('');
    });

    test('DropdownTypeahead data set to values passed in by parent', () => {
        @Component({
            template: `<div>
              <dropdown-typeahead ref="dropdown_typeahead"
                  typeahead_class="custom-style"
                  placeholder_text="Enter a State"
                  :choices="states"
                  :filter_fn="states_filter_fn">
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
        let dropdown_typeahead = find_component(wrapper, DropdownTypeahead);
        let search_bar = wrapper.find('input');

        expect(dropdown_typeahead.props('choices')).toEqual(wrapper.vm.states);
        expect(search_bar.attributes('placeholder')).toEqual('Enter a State');
        expect(search_bar.classes()).toContain('custom-style');
    });

    test('Different values of "filter_text" produce different filtered_choices',
         async () => {
        @Component({
            template: `<div>
              <dropdown-typeahead ref="dropdown_typeahead"
                  placeholder_text="Enter a State"
                  :choices="states"
                  :filter_fn="states_filter_fn">
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
        let search_bar = wrapper.find('input');

        await search_bar.trigger('click');

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(8);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");
        expect(dropdown_menu_content.text()).toContain("Minnesota");
        expect(dropdown_menu_content.text()).toContain("Massachusetts");
        expect(dropdown_menu_content.text()).toContain("Maine");
        expect(dropdown_menu_content.text()).toContain("Montana");
        expect(dropdown_menu_content.text()).toContain("Michigan");
        expect(dropdown_menu_content.text()).toContain("Maryland");

        await search_bar.setValue('Mi');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(4);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");
        expect(dropdown_menu_content.text()).toContain("Minnesota");
        expect(dropdown_menu_content.text()).toContain("Michigan");

        await search_bar.setValue('Mis');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(2);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        await search_bar.setValue('Miss');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(2);
        expect(dropdown_menu_content.text()).toContain("Missouri");
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        await search_bar.setValue('Missi');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(1);
        expect(dropdown_menu_content.text()).toContain("Mississippi");

        await search_bar.setValue('Missiz');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(0);

        await search_bar.setValue('Missi');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(1);
        expect(dropdown_menu_content.text()).toContain("Mississippi");
    });

    test('Chosen items are emitted to the parent component',
         async () => {
        @Component({
            template: `<div>
          <dropdown-typeahead ref="dropdown_typeahead"
              placeholder_text="Enter a State"
              :choices="states"
              :filter_fn="states_filter_fn">
              <template slot-scope="{ item }">
                <span> {{ item.state }}</span>
              </template>
          </dropdown-typeahead>
        </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            states = [
                {state: "Missouri"},
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
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = find_component(wrapper, DropdownTypeahead);
        let search_bar = wrapper.find('input');

        await search_bar.trigger('click');

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        await search_bar.setValue('an');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(3);
        expect(dropdown_menu_content.text()).toContain("Montana");
        expect(dropdown_menu_content.text()).toContain("Michigan");
        expect(dropdown_menu_content.text()).toContain("Maryland");

        await search_bar.trigger('keydown', { code: 'Enter' });

        expect(emitted(dropdown_typeahead, 'item_selected').length).toEqual(1);
        expect(emitted(dropdown_typeahead, 'item_selected')[0][0]).toEqual({state: "Montana"});
    });

    test('Pressing any key but enter after pressing enter to select an entry will reopen ' +
         'the dropdown',
         async () => {
        @Component({
                template: `<div>
          <dropdown-typeahead ref="dropdown_typeahead"
                              placeholder_text="Enter a Name"
                              :choices="strangers"
                              :filter_fn="stranger_things_filter_fn">
              <template slot-scope="{ item }">
                <span> {{ item.first_name }} {{ item.last_name}}</span>
              </template>
          </dropdown-typeahead>
        </div>`,
                components: {
                    'dropdown-typeahead': DropdownTypeahead
                },
            })
        class WrapperComponent extends Vue {
            strangers = [
                {first_name: "Joyce", last_name: "Byers"},
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
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = find_component(wrapper, DropdownTypeahead);
        let search_bar = wrapper.find('input');

        await search_bar.trigger('click');

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        await search_bar.setValue('y');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(4);
        expect(dropdown_menu_content.text()).toContain("Joyce Byers");
        expect(dropdown_menu_content.text()).toContain("Will Byers");
        expect(dropdown_menu_content.text()).toContain("Jonathan Byers");
        expect(dropdown_menu_content.text()).toContain("Nancy Wheeler");

        await search_bar.trigger('keydown', { code: 'Enter' });

        expect(emitted(dropdown_typeahead, 'item_selected')[0][0]).toEqual(
            {first_name: "Joyce", last_name: "Byers"}
        );
        expect(dropdown_menu_content.element.style.display).toEqual('none');

        await search_bar.trigger('keydown', { code: 'Space' });
        expect(dropdown_menu_content.element.style.display).toEqual('block');

        await search_bar.setValue('y ');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(1);
        expect(dropdown_menu_content.text()).toContain("Nancy Wheeler");

        await search_bar.trigger('keydown', { code: 'Enter' });

        expect(emitted(dropdown_typeahead, 'item_selected').length).toEqual(2);
        expect(emitted(dropdown_typeahead, 'item_selected')[1][0]).toEqual(
            {first_name: "Nancy", last_name: "Wheeler"}
        );
    });

    test("Pressing enter twice while there are results in the dropdown menu doesn't emit " +
         "the object to the parent twice",
         async () => {
        @Component({
            template: `<div>
      <dropdown-typeahead ref="dropdown_typeahead"
                          placeholder_text="Enter a Name"
                          :choices="strangers"
                          :filter_fn="stranger_things_filter_fn">
          <template slot-scope="{ item }">
            <span> {{ item.first_name }} {{ item.last_name}}</span>
          </template>
      </dropdown-typeahead>
    </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            strangers = [
                {first_name: "Joyce", last_name: "Byers"},
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
        }

        let wrapper = mount(WrapperComponent);
        let dropdown_typeahead = find_component(wrapper, DropdownTypeahead);
        let search_bar = wrapper.find('input');

        await search_bar.trigger('click');

        let dropdown_menu_content = wrapper.find('.dropdown-content');

        await search_bar.setValue('y');

        expect(wrapper.findAll('.dropdown-row').length).toEqual(4);
        expect(dropdown_menu_content.text()).toContain("Joyce Byers");
        expect(dropdown_menu_content.text()).toContain("Will Byers");
        expect(dropdown_menu_content.text()).toContain("Jonathan Byers");
        expect(dropdown_menu_content.text()).toContain("Nancy Wheeler");

        await search_bar.trigger('keydown', { code: 'Enter' });

        expect(emitted(dropdown_typeahead, 'item_selected').length).toEqual(1);
        expect(emitted(dropdown_typeahead, 'item_selected')[0][0]).toEqual(
            {first_name: "Joyce", last_name: "Byers"}
        );
        expect(dropdown_menu_content.element.style.display).toEqual('none');

        await search_bar.trigger('keydown', { code: 'Enter' });

        expect(dropdown_menu_content.element.style.display).toEqual('none');
        expect(emitted(dropdown_typeahead, 'item_selected').length).toEqual(1);
    });


    test("Objects in the dropdown typeahead are displayed in their original form by " +
         "default if a scoped-slot is not supplied",
         async () => {
        @Component({
            template: `<div>
                        <dropdown-typeahead ref="dropdown_typeahead"
                          placeholder_text="Enter a Name"
                          :choices="strangers"
                          :filter_fn="stranger_things_filter_fn">
                        </dropdown-typeahead>
                      </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            strangers = [
                {first_name: "Joyce", last_name: "Byers"},
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
        }

        let wrapper = mount(WrapperComponent);
        let search_bar = wrapper.find('input');

        await search_bar.trigger('click');

        await search_bar.setValue('J');

        let dropdown_menu_content = wrapper.find('.dropdown-content');
        let dropdown_entries = dropdown_menu_content.findAll('.dropdown-row');

        expect(dropdown_entries.length).toEqual(3);
        expect(dropdown_entries.at(0).text()).toContain("{");
        expect(dropdown_entries.at(0).text()).toContain("}");
        expect(dropdown_entries.at(0).text()).toContain("\"first_name\":");
        expect(dropdown_entries.at(0).text()).toContain("\"last_name\":");
        expect(dropdown_entries.at(0).text()).toContain("\"Joyce\"");
        expect(dropdown_entries.at(0).text()).toContain("\"Byers\"");
    });

    test("If there are no matching search results and a template for the " +
         "'no_matching_results' slot is not provided, the default no matching results message " +
         "is applied",
         async () => {
        @Component({
            template: `<div>
                    <dropdown-typeahead ref="dropdown_typeahead"
                      placeholder_text="Enter a Name"
                      :choices="strangers"
                      :filter_fn="stranger_things_filter_fn">
                    </dropdown-typeahead>
                  </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            strangers = [
                {first_name: "Joyce", last_name: "Byers"},
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
        }

        let wrapper = mount(WrapperComponent);
        let search_bar = wrapper.find('input');

        await search_bar.trigger('click');

        await search_bar.setValue('q');

        let dropdown_no_matches_message = wrapper.find('.no-matching-results');
        expect(wrapper.findAll('.dropdown-row').length).toEqual(0);
        expect(dropdown_no_matches_message.text()).toContain(
            "We couldn't find any results containing: 'q'"
        );
    });

    test("If there are no matching search results and a template for the " +
         "'no_matching_results' slot IS provided, the custom slot content is applied",
         async () => {
        @Component({
            template: `<div class="control-width-3">
                          <dropdown-typeahead ref="dropdown_typeahead"
                            placeholder_text="Enter a Season"
                            :choices="seasons"
                            :filter_fn="seasons_filter_fn">
                            <template slot="no_matching_results">
                              No Matching Results
                            </template>
                          </dropdown-typeahead>
                       </div>`,
            components: {
                'dropdown-typeahead': DropdownTypeahead
            },
        })
        class WrapperComponent extends Vue {
            seasons = [
                "Fall",
                "Winter",
                "Spring",
                "Summer"
            ];

            seasons_filter_fn(item: string, filter_text: string) {
                return item.indexOf(filter_text) >= 0;
            }
        }

        let wrapper = mount(WrapperComponent);
        let search_bar = wrapper.find('input');

        await search_bar.trigger('click');

        await search_bar.setValue('y');

        let dropdown_no_matches_message = wrapper.find('.no-matching-results');
        expect(wrapper.findAll('.dropdown-row').length).toEqual(0);
        expect(dropdown_no_matches_message.text()).toContain(
            "No Matching Results"
        );
    });

    test("'choices' changed by parent component", async () => {
        let choices = [
            "1",
            "2",
            "3",
        ];

        let wrapper = mount(DropdownTypeahead, {
            propsData: {
                choices: choices,
                filter_fn: () => true,
                placeholder_text: 'Spam'
            }
        });

        expect(wrapper.findAll('.dropdown-row').length).toEqual(3);

        choices.push('4');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.dropdown-row').length).toEqual(4);

        await wrapper.setProps({choices: ['new1', 'new2']});
        expect(wrapper.findAll('.dropdown-row').length).toEqual(2);
    });
});
