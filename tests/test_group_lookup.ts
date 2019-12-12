import { Route, VueRouter } from 'vue-router/types/router';

import { config, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import GroupLookup from '@/components/group_lookup.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';

beforeAll(() => {
    config.logModifiedComponents = false;
});

let groups: ag_cli.Group[];
let router_replace: sinon.SinonStub;

beforeEach(() => {
    let project = data_ut.make_project(data_ut.make_course().pk);
    groups = [
        data_ut.make_group(project.pk),
        data_ut.make_group(project.pk),
        data_ut.make_group(project.pk, 1, {member_names: ['filterme1']}),
        data_ut.make_group(project.pk, 2, {member_names: ['userrr', 'filtermee2']}),
        data_ut.make_group(project.pk),
    ];
    router_replace = sinon.stub();
});

describe('GroupLookup tests', () => {
    let wrapper: Wrapper<GroupLookup>;
    let component: GroupLookup;

    beforeEach(() => {
        wrapper = managed_mount(GroupLookup, {
            propsData: {
                groups: groups
            },
            mocks: get_router_mocks(),
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('filter text matches username (case_insensitive)', async () => {
        await component.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.filter_text = "ILTERm";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(groups[2]);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(groups[3]);
    });

    test('When a group is selected from the typeahead, an event is emitted', () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.$emit('update_item_chosen', groups[3]);

        expect(wrapper.emitted().update_group_selected.length).toEqual(1);
        expect(wrapper.emitted().update_group_selected[0][0]).toEqual(groups[3]);
        check_replace_call(groups[3].pk);
    });
});

test('Group selected initially from query param', () => {
    let wrapper = managed_mount(GroupLookup, {
        propsData: {
            groups: groups,
            initialize_from_url: true,
        },
        mocks: get_router_mocks(groups[2].pk),
    });
    expect(wrapper.emitted().update_group_selected.length).toEqual(1);
    expect(wrapper.emitted().update_group_selected[0][0]).toEqual(groups[2]);
    check_replace_call(groups[2].pk);
});

test('Group not selected from query param by default', async () => {
    let wrapper = managed_mount(GroupLookup, {
        propsData: {
            groups: groups,
            initialize_from_url: false,
        },
        mocks: get_router_mocks(groups[2].pk),
    });
    expect(wrapper.emitted().update_group_selected).toBeUndefined();
    expect(router_replace.notCalled).toBe(true);
});

function get_router_mocks(group_pk?: number) {
    let mocks: {$route: Route, $router: VueRouter} = {
        $route: <Route> <unknown> {
            query: {other_param: 'other_param'}
        },
        $router: <VueRouter> <unknown> {
            replace: router_replace
        }
    };
    if (group_pk !== undefined) {
        mocks.$route.query = {
            other_param: 'other_param', current_student_lookup: group_pk.toString()
        };
    }
    return mocks;
}

function check_replace_call(expected_group_pk: number, call_index = 0) {
    expect(router_replace.getCall(0).args).toEqual([{
        query: {
            other_param: 'other_param',
            current_student_lookup: expected_group_pk.toString()
        }
    }]);
}
