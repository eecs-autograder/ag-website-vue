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

        expect(tabs.vm.$data.active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_2 = tabs.find({ref: 'tab_2'});
        tab_2.trigger('click');

        expect(tabs.vm.$data.active_tab_index).toEqual(1);

        active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');
    });

    test.only('Custom click handler on <tab>', async () => {
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
  <tab ref="tab_2" @click="datum += 1">
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
                    datum: 0
                };
            }
        };

        const wrapper = mount(component);
        const tabs = wrapper.find({ref: 'tabs'});

        expect(wrapper.vm.$data.datum).toEqual(0);
        expect(tabs.vm.$data.active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_2 = tabs.find({ref: 'tab_2'});
        tab_2.trigger('click');

        expect(wrapper.vm.$data.datum).toEqual(1);
        expect(tabs.vm.$data.active_tab_index).toEqual(1);

        active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');

        tab_2.trigger('click');
        expect(wrapper.vm.$data.datum).toEqual(2);
    });

    test.only('Tab v-model binding', async () => {
        const component = {
            template:  `<tabs ref="tabs" v-model="current_tab">
  <tab ref="tab_1">
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
                    current_tab: 0
                };
            }
        };

        const wrapper = mount(component);
        const tabs = wrapper.find({ref: 'tabs'});

        expect(tabs.vm.$data.active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        // Set current_tab, active tab should change
        wrapper.setData({current_tab: 1});

        expect(tabs.vm.$data.active_tab_index).toEqual(1);

        active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');

        // Click on inactive tab, current_tab should change
        let tab_1 = tabs.find({ref: 'tab_1'});
        tab_1.trigger('click');

        expect(active_body.text()).toEqual('Tab 1 body');
        expect(tabs.vm.$data.active_tab_index).toEqual(0);
        expect(wrapper.vm.$data.current_tab).toEqual(0);
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
