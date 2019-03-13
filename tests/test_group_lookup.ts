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
    member_names: Member[];
    extended_due_date: string;
    num_submits_towards_limit: number;
    num_submissions: number;
    bonus_submissions_remaining: number;
}

describe('GroupLookup.vue', () => {
    let wrapper: Wrapper<GroupLookup>;
    let group_lookup: GroupLookup;
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
            member_names: [
                {username: "chuckfin@umich.edu", full_name: "Charles Finster"},
                {username: "tpickles@umich.edu", full_name: "Thomas Pickles"}
            ],
            extended_due_date: "no",
            num_submits_towards_limit: 1,
            num_submissions: 3,
            bonus_submissions_remaining: 0
        };

        group2 = {
            pk: 2,
            project: 2,
            member_names: [
                {username: "dpickles@umich.edu", full_name: "Dylan Pickles"},
                {username: "lmjdev@umich.edu", full_name: "Lillian DeVille"}
            ],
            extended_due_date: "no",
            num_submits_towards_limit: 0,
            num_submissions: 3,
            bonus_submissions_remaining: 0
        };

        group3 = {
            pk: 3,
            project: 2,
            member_names: [
                {username: "kwatfin@umich.edu", full_name: "Kimiko Watanabe-Finster"},
                {username: "prbdev@umich.edu", full_name: "Phillip DeVille"}
            ],
            extended_due_date: "no",
            num_submits_towards_limit: 0,
            num_submissions: 3,
            bonus_submissions_remaining: 0
        };

        group4 = {
            pk: 4,
            project: 2,
            member_names: [
                {username: "suscarm@umich.edu", full_name: "Susanna Carmichael"},
            ],
            extended_due_date: "no",
            num_submits_towards_limit: 0,
            num_submissions: 3,
            bonus_submissions_remaining: 0
        };
        groups = [group1, group2, group3, group4];

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
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test('filter text matches username', async () => {
        // patch getting groups
        wrapper = mount(GroupLookup, {
            propsData: {
                project: project
            }
        });
        group_lookup = wrapper.vm;
        await group_lookup.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.filter_text = "Kimiko";
        await group_lookup.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group3);
    });

    test('filter text matches full name', async () => {
        // patch getting groups
        wrapper = mount(GroupLookup, {
            propsData: {
                project: project
            }
        });
        group_lookup = wrapper.vm;
        await group_lookup.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.filter_text = "lm";
        await group_lookup.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
    });

    test('filter text matches full name (case_insensitive)', async () => {
        // patch getting groups
        wrapper = mount(GroupLookup, {
            propsData: {
                project: project
            }
        });
        group_lookup = wrapper.vm;
        await group_lookup.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        dropdown_typeahead.filter_text = "deville";
        await group_lookup.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group3);

        dropdown_typeahead.filter_text = "DEVILLE";
        await group_lookup.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group3);

        dropdown_typeahead.filter_text = "DeVille";
        await group_lookup.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(2);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group2);
        expect(dropdown_typeahead.filtered_choices[1]).toEqual(group3);
    });

    test('When a group is selected from the typeahead, an event is emitted', async () => {
        // patch getting groups
        wrapper = mount(GroupLookup, {
            propsData: {
                project: project
            }
        });
        group_lookup = wrapper.vm;
        await group_lookup.$nextTick();

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find({ref: 'group_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual(groups);

        let search_bar = wrapper.find({ref: 'group_typeahead'}).find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "susc";
        await group_lookup.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(group4);

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(group_lookup.group_selected).toEqual(group4);
        expect(wrapper.emitted().update_group_selected.length).toEqual(1);
        expect(dropdown_typeahead.filter_text).toEqual("");
    });
});
