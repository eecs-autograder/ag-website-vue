import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import GroupLookup from '@/components/group_lookup.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';

beforeAll(() => {
    config.logModifiedComponents = false;
});

interface Member {
    username: string;
    full_name: string;
}

interface Group {
    pk: number;
    project: number;
    extended_due_date: string;
    member_names: Member[];
    bonus_submissions_remaining: number;
    late_days_used: {[username: string]: number};
    num_submissions: number;
    num_submits_towards_limit: number;
    created_at: string;
    last_modified: string;
}

describe('GroupLookup.vue', () => {
    let wrapper: Wrapper<GroupLookup>;
    let component: GroupLookup;
    let group1: Group;
    let group2: Group;
    let group3: Group;
    let group4: Group;
    let groups: Group[];
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {

        original_match_media = window.matchMedia;

        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        group1 = {
            pk: 1,
            project: 2,
            extended_due_date: "no",
            member_names: [
                {username: "chuckfin@umich.edu", full_name: "Charles Finster"},
                {username: "tpickles@umich.edu", full_name: "Thomas Pickles"}
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {"chuckfin@umich.edu": 2},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        };

        group2 = {
            pk: 2,
            project: 2,
            extended_due_date: "no",
            member_names: [
                {username: "dpickles@umich.edu", full_name: "Dylan Pickles"},
                {username: "lmjdev@umich.edu", full_name: "Lillian DeVille"}
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 0,
            created_at: "4pm",
            last_modified: "6pm"
        };

        group3 = {
            pk: 3,
            project: 2,
            extended_due_date: "yes",
            member_names: [
                {username: "kwatfin@umich.edu", full_name: "Kimiko Watanabe-Finster"},
                {username: "prbdev@umich.edu", full_name: "Phillip DeVille"}
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 0,
            created_at: "11am",
            last_modified: "5pm"
        };

        group4 = {
            pk: 4,
            project: 2,
            extended_due_date: "no",
            member_names: [
                {username: "suscarm@umich.edu", full_name: "Susanna Carmichael"},
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 0,
            created_at: "2pm",
            last_modified: "2:45pm"
        };

        project = new Project({
            pk: 2,
            name: "Project 1 - Statistics",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        groups = [group1, group2, group3, group4];

        wrapper = mount(GroupLookup, {
            propsData: {
                groups: groups,
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('filter text matches username', async () => {
        await component.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.filter_text = "kwatfin@um";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group3);
    });

    test('filter text matches full name', async () => {
        await component.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.filter_text = "lm";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
    });

    test('filter text matches full name (case_insensitive)', async () => {
        await component.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.filter_text = "deville";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group3);

        dropdown_typeahead.filter_text = "DEVILLE";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group3);

        dropdown_typeahead.filter_text = "DeVille";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group3);
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
        await dropdown_typeahead.$nextTick();

        expect(wrapper.emitted().update_group_selected.length).toEqual(1);
        // expect(dropdown_typeahead.filter_text).toEqual("");
    });

    test("When the prop 'groups' changes in the parent component, d_groups is updated",
         async () => {
        await component.$nextTick();

        expect(component.d_groups).toEqual(groups);

        wrapper.setProps({groups: [group1, group3]});
        await component.$nextTick();

        expect(component.d_groups).toEqual([group1, group3]);
    });
});
