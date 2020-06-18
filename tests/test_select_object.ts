import Vue from 'vue';
import Component from 'vue-class-component';

import { mount, Wrapper } from '@vue/test-utils';

import SelectObject from '@/components/select_object.vue';

import { managed_mount } from '@/tests/setup';
import { emitted, expect_html_element_has_value, find_by_name, set_data } from '@/tests/utils';

interface Thing {
    id: number;
    name: string;
}

let things = [
    {id: 1, name: 'Thing 1'},
    {id: 4, name: 'Thing 2'},
    {id: 2, name: 'Thing 3'},
    {id: 3, name: 'Thing 4'},
];

describe('select-object tests', () => {
    let wrapper: Wrapper<SelectObject>;

    beforeEach(() => {
        wrapper = managed_mount(SelectObject, {
            propsData: {
                value: things[1],
                items: things,
                id_field: 'id'
            }
        });
    });

    test('Initial value', () => {
        expect(wrapper.vm.d_items).toEqual(things);
        expect(wrapper.vm.d_value).toEqual(things[1].id);
        expect_html_element_has_value(wrapper.find('select'), things[1].id.toString());
    });

    test('Input value changed', async () => {
        expect(wrapper.vm.d_value).toEqual(things[1].id);

        await wrapper.setProps({value: things[0]});
        expect(wrapper.vm.d_value).toEqual(things[0].id);
        expect_html_element_has_value(wrapper.find('select'), things[0].id.toString());
    });

    test('Items list changed', async () => {
        expect(wrapper.vm.d_items).toEqual(things);

        let new_things = [
            {id: 5, name: 'Thing 5'},
            {id: 6, name: 'Thing 6'},
        ];
        await wrapper.setProps({items: new_things, value: new_things[1]});

        expect(wrapper.vm.d_items).toEqual(new_things);
        expect(wrapper.vm.d_value).toEqual(new_things[1].id);
        expect(wrapper.findAll('option').length).toBe(2);
    });

    test('New option selected', async () => {
        await wrapper.findAll('option').at(3).setSelected();
        expect(wrapper.vm.d_value).toEqual(things[3].id);
        expect(emitted(wrapper, 'change')[0][0]).toEqual(things[3]);
    });
});

test('Override body slot, no initial value', () => {
    let wrapper = managed_mount(SelectObject, {
        propsData: {
            items: things,
            id_field: 'id'
        },
        slots: {
            default: '<option selected disabled>-- Select plz --</option>'
        }
    });

    expect(wrapper.findAll('option').length).toBe(things.length + 1);
    expect(wrapper.findAll('option').at(0).element).toHaveAttribute('selected');
    expect(wrapper.findAll('option').at(1).element).not.toHaveAttribute('selected');
    expect(wrapper.findAll('option').at(3).element).not.toHaveAttribute('selected');
});

test('Null option', async () => {
    let wrapper = managed_mount(SelectObject, {
        propsData: {
            items: things,
            id_field: 'id',
            value: null,
        },
        slots: {
            default: '<option :value="null">-- None --</option>'
        }
    });

    expect(wrapper.vm.d_value).toBeNull();
    expect_html_element_has_value(wrapper.find('select'), '');

    await wrapper.setProps({value: things[1]});
    expect(wrapper.findAll('option').length).toBe(things.length + 1);
    expect(wrapper.findAll('option').at(0).element).not.toHaveAttribute('selected');
    expect_html_element_has_value(wrapper.find('select'), things[1].id.toString());

    await wrapper.setProps({value: null});
    expect(wrapper.vm.d_value).toBeNull();
    expect_html_element_has_value(wrapper.find('select'), '');
});

test('Default option-text slot', () => {
    let wrapper = managed_mount(SelectObject, {
        propsData: {
            value: things[1],
            items: things,
            id_field: 'id'
        }
    });

    for (let [index, thing] of things.entries()) {
        expect(wrapper.findAll('option').at(index).text()).toEqual(thing.id.toString());
    }
});

test('Override option-text slot', () => {
    let wrapper = managed_mount(SelectObject, {
        propsData: {
            value: things[1],
            items: things,
            id_field: 'id'
        },
        scopedSlots: {
            "option-text": '<template>{{props.item.name}}</template>'
        }
    });

    for (let [index, thing] of things.entries()) {
        expect(wrapper.findAll('option').at(index).text()).toEqual(thing.name.toString());
    }
});


test('v-model usage', async () => {
    @Component({
        template: `<select-object :items="things"
                                  id_field="id"
                                  v-model="selected"></select-object>
        `,
        components: {
            'select-object': SelectObject
        }
    })
    class WrapperComponent extends Vue {
        readonly things = things;
        selected = things[1];
    }

    let wrapper = mount(WrapperComponent);
    let select_object = find_by_name<SelectObject>(wrapper, 'SelectObject');
    expect(select_object.vm.value).toEqual(wrapper.vm.selected);

    await set_data(wrapper, {selected: things[2]}, false);
    expect(select_object.vm.value).toEqual(things[2]);

    await select_object.findAll('option').at(0).setSelected();
    expect(wrapper.vm.selected).toEqual(things[0]);
});

test('Initially selected disabled option', async () => {
    let wrapper = managed_mount(SelectObject, {
        propsData: {
            items: things,
            id_field: 'id',
        },
        slots: {
            default: '<option selected disabled :value="null">-- Select plz --</option>'
        }
    });

    expect(wrapper.vm.d_value).toBeNull();
    expect_html_element_has_value(wrapper.find('select'), '');
    expect(wrapper.findAll('option').at(0).element).toHaveAttribute('selected');
});
