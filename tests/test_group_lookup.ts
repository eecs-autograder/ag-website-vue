import { config, mount, Wrapper } from '@vue/test-utils';

import { Group } from 'ag-client-typescript';

import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import GroupLookup from '@/components/group_lookup.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('GroupLookup.vue', () => {
    let wrapper: Wrapper<GroupLookup>;
    let component: GroupLookup;
    let group1: Group;
    let group2: Group;
    let group3: Group;
    let group4: Group;
    let groups: Group[];

    beforeEach(() => {
        group1 = new Group({
            pk: 1,
            project: 2,
            extended_due_date: "no",
            member_names: [
                "chuckfin@umich.edu",
                "tpickles@umich.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {"chuckfin@umich.edu": 2},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        group2 = new Group({
            pk: 2,
            project: 2,
            extended_due_date: "no",
            member_names: [
                "dpickles@umich.edu",
                "lmjdev@umich.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 0,
            created_at: "4pm",
            last_modified: "6pm"
        });

        group3 = new Group({
            pk: 3,
            project: 2,
            extended_due_date: "yes",
            member_names: [
                "kwatfin@umich.edu",
                "prbdev@umich.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 0,
            created_at: "11am",
            last_modified: "5pm"
        });

        group4 = new Group({
            pk: 4,
            project: 2,
            extended_due_date: "no",
            member_names: [
                "suscarm@umich.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 0,
            created_at: "2pm",
            last_modified: "2:45pm"
        });

        groups = [group1, group2, group3, group4];

        wrapper = mount(GroupLookup, {
            propsData: {
                groups: groups
            }
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

        dropdown_typeahead.filter_text = "dev";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group3);

        dropdown_typeahead.filter_text = "PICKLES";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group1);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group2);
    });

    test('When a group is selected from the typeahead, an event is emitted', async () => {
        await component.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        let search_bar = wrapper.find({ref: 'group_typeahead'}).find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "susc";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group4);

        search_bar.trigger('keydown', { code: 'Enter' });
        await component.$nextTick();

        expect(wrapper.emitted().update_group_selected.length).toEqual(1);
    });
});
