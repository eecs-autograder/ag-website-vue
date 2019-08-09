import { config, mount, Wrapper } from '@vue/test-utils';

import {
    Course,
    Group,
    Project,
    Semester,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import * as sinon from "sinon";

import Modal from "@/components/modal.vue";
import EditGroups from '@/components/project_admin/edit_groups/edit_groups.vue';
import MergeGroups from "@/components/project_admin/edit_groups/merge_groups.vue";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('EditGroups tests', () => {
    let wrapper: Wrapper<EditGroups>;
    let component: EditGroups;
    let course: Course;
    let group_1: Group;
    let group_2: Group;
    let group_3: Group;
    let group_4: Group;
    let groups: Group[];
    let project: Project;

    beforeEach(() => {

        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '@cornell.edu', last_modified: ''
        });

        group_1 = new Group({
            pk: 1,
            project: 2,
            extended_due_date: null,
            member_names: [
                "andy@cornell.edu",
                "roy@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        group_2 = new Group({
            pk: 2,
            project: 2,
            extended_due_date: "2019-08-18T15:25:06.965696Z",
            member_names: [
                "kelly@cornell.edu",
                "meredith@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        group_3 = new Group({
            pk: 3,
            project: 2,
            extended_due_date: "2019-08-18T15:25:06.965696Z",
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        group_4 = new Group({
            pk: 4,
            project: 2,
            extended_due_date: "2019-08-18T15:24:06.965696Z",
            member_names: [
                "phyllis@cornell.edu",
                "stanley@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        groups = [group_1, group_2, group_3, group_4];

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
            min_group_size: 2,
            max_group_size: 3,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false,
        });

        let get_all_groups_stub = sinon.stub(Group, 'get_all_from_project');
        get_all_groups_stub.returns(Promise.resolve(groups));

        let get_course_by_pk_stub = sinon.stub(Course, 'get_by_pk');
        get_course_by_pk_stub.returns(Promise.resolve(course));

        wrapper = mount(EditGroups, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('groups_with_extensions sorted by extension ASC, first group member name ASC ' +
         '(groups are sorted by first group member name ASC - server side)',
         async () => {
        expect(component.d_loading).toBe(false);
        expect(component.groups_by_members.size()).toEqual(groups.length);
        expect(component.groups_by_members.data[0]).toEqual(group_1);
        expect(component.groups_by_members.data[1]).toEqual(group_2);
        expect(component.groups_by_members.data[2]).toEqual(group_3);
        expect(component.groups_by_members.data[3]).toEqual(group_4);

        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions[0]).toEqual(group_4);
        expect(component.groups_with_extensions[1]).toEqual(group_2);
        expect(component.groups_with_extensions[2]).toEqual(group_3);
    });

    test('selected_group set to new group on successful creation and new group inserted ' +
         'at an index < groups.length',
         async () => {
        let new_group = new Group({
            pk: 5,
            project: 2,
            extended_due_date: null,
            member_names: [
                "angela@cornell.edu",
                "creed@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        expect(component.groups_by_members.size()).toEqual(4);
        expect(component.groups_by_pk.size()).toEqual(4);

        Group.notify_group_created(new_group);
        expect(component.groups_by_members.size()).toEqual(5);
        expect(component.groups_by_pk.size()).toEqual(5);
        expect(component.selected_group).toEqual(new_group);
    });

    test('selected_group set to new group on successful creation and new group inserted ' +
         'at an index === groups.length',
         async () => {
        let new_group = new Group({
            pk: 5,
            project: 2,
            extended_due_date: null,
            member_names: [
                "toby@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        expect(component.groups_by_members.size()).toEqual(4);
        expect(component.groups_by_pk.size()).toEqual(4);

        Group.notify_group_created(new_group);
        expect(component.groups_by_members.size()).toEqual(5);
        expect(component.groups_by_pk.size()).toEqual(5);
        expect(component.selected_group).toEqual(new_group);
     });

    test('Selected group set to group selected in GroupLookup',
         async () => {
        expect(component.selected_group).toBeNull();

        let group_lookup = wrapper.find({ref: 'group_lookup'});
        let search_bar = group_lookup.find({ref: 'group_typeahead'}).find('input');
        search_bar.trigger("click");
        search_bar.trigger('keydown', { code: 'Enter' });
        await component.$nextTick();

        expect(component.selected_group).toEqual(group_1);
    });

    test('Add a group member to a group - groups stays sorted', async () => {
        group_3.member_names.unshift("angela@cornell.edu");
        Group.notify_group_changed(group_3);
        await component.$nextTick();

        expect(component.groups_by_members.size()).toEqual(groups.length);
        expect(component.groups_by_members.data[0]).toEqual(group_1);
        expect(component.groups_by_members.data[1]).toEqual(group_3);
        expect(component.groups_by_members.data[2]).toEqual(group_2);
        expect(component.groups_by_members.data[3]).toEqual(group_4);
    });

    test('Remove a group member from a group - groups stays sorted',
         async () => {
        group_1.member_names.splice(0, 1);
        Group.notify_group_changed(group_1);
        await component.$nextTick();

        expect(component.groups_by_members.size()).toEqual(groups.length);
        expect(component.groups_by_members.data[0]).toEqual(group_2);
        expect(component.groups_by_members.data[1]).toEqual(group_3);
        expect(component.groups_by_members.data[2]).toEqual(group_4);
        expect(component.groups_by_members.data[3]).toEqual(group_1);
    });

    test('Give a group an extension - extension list gets updated', async () => {
        expect(component.groups_with_extensions.length).toEqual(3);

        group_1.extended_due_date = "2019-08-18T15:22:06.965696Z";
        Group.notify_group_changed(group_1);
        await component.$nextTick();

        expect(component.groups_with_extensions.length).toEqual(4);
        expect(component.groups_with_extensions[0]).toEqual(group_1);
        expect(component.groups_with_extensions[1]).toEqual(group_4);
        expect(component.groups_with_extensions[2]).toEqual(group_2);
        expect(component.groups_with_extensions[3]).toEqual(group_3);
    });

    test('Change the time/date of an extension for a group - extension list gets updated',
         async () => {
        expect(component.groups_with_extensions.length).toEqual(3);

        group_2.extended_due_date = "2019-08-18T15:22:06.965696Z";
        Group.notify_group_changed(group_2);
        await component.$nextTick();

        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions[0]).toEqual(group_2);
        expect(component.groups_with_extensions[1]).toEqual(group_4);
        expect(component.groups_with_extensions[2]).toEqual(group_3);
    });

    test('Change the member(s) of a group with an extension - extension list gets updated',
         async () => {
        expect(component.groups_with_extensions.length).toEqual(3);

        group_3.member_names[0] = "creed@cornell.edu";
        Group.notify_group_changed(group_3);
        await component.$nextTick();

        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions[0]).toEqual(group_4);
        expect(component.groups_with_extensions[1]).toEqual(group_3);
        expect(component.groups_with_extensions[2]).toEqual(group_2);
    });

    test('Remove an extension from a group - extension list gets updated', async () => {
        let group_2_without_extension = new Group({
            pk: 2,
            project: 2,
            extended_due_date: null,
            member_names: [
                "kelly@cornell.edu",
                "meredith@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        expect(component.groups_with_extensions.length).toEqual(3);

        Group.notify_group_changed(group_2_without_extension);
        await component.$nextTick();

        expect(component.groups_with_extensions.length).toEqual(2);
        expect(component.groups_with_extensions[0]).toEqual(group_4);
        expect(component.groups_with_extensions[1]).toEqual(group_3);
    });

    test('groups_by_members passed to merge-groups', async () => {
        (<Modal> wrapper.find({ref: 'merge_groups_modal'}).vm).open();

        await component.$nextTick();

        let merge_groups = <Wrapper<MergeGroups>> wrapper.find({ref: 'merge_groups'});
        expect(merge_groups.vm.groups).toEqual(component.groups_by_members.data);
    });

    test('merge groups - one group has an extension', async () => {
        let new_group_from_merge = new Group({
            pk: 5,
            project: 2,
            extended_due_date: group_3.extended_due_date,
            member_names: [
                "andy@cornell.edu",
                "kevin@cornell.edu",
                "oscar@cornell.edu",
                "roy@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        expect(component.groups_by_pk.size()).toEqual(4);
        expect(component.groups_by_pk.has(group_1)).toEqual(true);
        expect(component.groups_by_pk.has(group_3)).toEqual(true);
        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions).toContainEqual(group_3);

        Group.notify_group_merged(new_group_from_merge, group_1.pk, group_3.pk);
        await component.$nextTick();

        expect(component.groups_by_pk.size()).toEqual(3);
        expect(component.groups_by_pk.has(group_1)).toEqual(false);
        expect(component.groups_by_pk.has(group_3)).toEqual(false);
        expect(component.groups_by_pk.has(new_group_from_merge)).toEqual(true);
        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions).not.toContainEqual(group_3);
        expect(component.groups_with_extensions).toContainEqual(new_group_from_merge);
    });

    test('merge groups - both groups have an extension', async () => {
        let new_group_from_merge = new Group({
            pk: 5,
            project: 2,
            extended_due_date: group_4.extended_due_date,
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu",
                "phyllis@cornell.edu",
                "stanley@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        expect(component.groups_by_pk.size()).toEqual(4);
        expect(component.groups_by_pk.has(group_3)).toEqual(true);
        expect(component.groups_by_pk.has(group_4)).toEqual(true);
        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions).toContainEqual(group_3);
        expect(component.groups_with_extensions).toContainEqual(group_4);

        Group.notify_group_merged(new_group_from_merge, group_3.pk, group_4.pk);
        await component.$nextTick();

        expect(component.groups_by_pk.size()).toEqual(3);
        expect(component.groups_by_pk.has(group_3)).toEqual(false);
        expect(component.groups_by_pk.has(group_4)).toEqual(false);
        expect(component.groups_by_pk.has(new_group_from_merge)).toEqual(true);
        expect(component.groups_with_extensions.length).toEqual(2);
        expect(component.groups_with_extensions).not.toContainEqual(group_3);
        expect(component.groups_with_extensions).not.toContainEqual(group_4);
        expect(component.groups_with_extensions).toContainEqual(new_group_from_merge);
    });

    test('merge groups - neither group has an extension', async () => {
        let group_without_an_extension = new Group({
            pk: 5,
            project: 2,
            extended_due_date: null,
            member_names: [
                "toby@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        let new_group_from_merge = new Group({
            pk: 6,
            project: 2,
            extended_due_date: null,
            member_names: [
                "andy@cornell.edu",
                "roy@cornell.edu",
                "toby@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        Group.notify_group_created(group_without_an_extension);
        await component.$nextTick();

        expect(component.groups_by_pk.size()).toEqual(5);
        expect(component.groups_by_pk.has(group_without_an_extension)).toEqual(true);
        expect(component.groups_by_pk.has(group_1)).toEqual(true);
        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions).not.toContainEqual(group_1);
        expect(component.groups_with_extensions).not.toContainEqual(group_without_an_extension);

        Group.notify_group_merged(new_group_from_merge, group_1.pk, group_without_an_extension.pk);
        await component.$nextTick();

        expect(component.groups_by_pk.size()).toEqual(4);
        expect(component.groups_by_pk.has(group_without_an_extension)).toEqual(false);
        expect(component.groups_by_pk.has(group_1)).toEqual(false);
        expect(component.groups_by_pk.has(new_group_from_merge)).toEqual(true);
        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions).not.toContainEqual(new_group_from_merge);
    });
});
