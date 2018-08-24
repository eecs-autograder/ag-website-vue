import { Tab, Tabs } from "@/components/tabs";
import { config, mount } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Tabs tests', () => {
    test.only('First tab selected by default', async () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <template slot="header">
      Tab 1
    </template>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <template slot="header">
      Tab 2
    </template>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        const wrapper = mount(component);
        const tabs = wrapper.find({ref: 'tabs'});

        expect(tabs.vm.$data.active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');
    });

    test.only('Custom initial active tab', async () => {
        const component = {
            template:  `<tabs ref="tabs" v-model="selected_tab">
  <tab>
    <template slot="header">
      Tab 1
    </template>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <template slot="header">
      Tab 2
    </template>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    selected_tab: 1
                };
            }
        };

        const wrapper = mount(component);
        const tabs = wrapper.find({ref: 'tabs'});

        expect(tabs.vm.$data.active_tab_index).toEqual(1);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');
    });

    test.only('Tab selected on click', async () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <template slot="header">
      Tab 1
    </template>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab ref="tab_2">
    <template slot="header">
      Tab 2
    </template>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        const wrapper = mount(component);
        const tabs = wrapper.find({ref: 'tabs'});

        expect(tabs.vm.$props.value).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_2 = tabs.find({ref: 'tab_2'});
        tab_2.trigger('click');

        expect(tabs.vm.$data.active_tab_index).toEqual(1);

        active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');
    });

    test('Custom click handler on <tab>', async () => {
        fail();
    });

    test('Tab v-model change', async () => {
        fail();
    });

    test('Active index off end selects last tab', async () => {
        fail();
    });

    test('Closing first tab selects second', async () => {
        fail();
    });

    test('Closing middle tab selects left sibling', async () => {
        fail();
    });

    test('Closing last tab selects left sibling', async () => {
        fail();
    });

    test('Empty tabset', async () => {
        fail();
    });

    test('Error non <tab> tag in <tabs>', async () => {
        fail();
    });

    test('Error string content in <tabs>', async () => {
        fail();
    });

    test('Error extra children in <tab>', async () => {
        fail();
    });

    test('Error missing header in <tab>', async () => {
        fail();
    });

    test('Error tab header not <template>', async () => {
        fail();
    });

    test('Error missing body in <tab>', async () => {
        fail();
    });

    test('Error tab body not <template>', async () => {
        fail();
    });
});
