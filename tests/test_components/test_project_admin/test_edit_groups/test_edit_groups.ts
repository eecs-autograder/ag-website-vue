import { Wrapper } from '@vue/test-utils';

import {
    Course,
    Group,
    Project,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import EditGroups from '@/components/project_admin/edit_groups/edit_groups.vue';
import MergeGroups from "@/components/project_admin/edit_groups/merge_groups.vue";
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_shallow_mount } from '@/tests/setup';
import { set_data, wait_for_load } from '@/tests/utils';


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
        course = data_ut.make_course({allowed_guest_domain: '@cornell.edu'});

        project = data_ut.make_project(course.pk, {
            name: "Project 1 - Statistics",
            min_group_size: 2,
            max_group_size: 3,
        });

        group_1 = data_ut.make_group(project.pk, 2, {
            member_names: [
                "andy@cornell.edu",
                "roy@cornell.edu"
            ],
        });

        group_2 = data_ut.make_group(project.pk, 2, {
            extended_due_date: "2019-08-18T15:25:06.965696Z",
            member_names: [
                "kelly@cornell.edu",
                "meredith@cornell.edu"
            ],
        });

        group_3 = data_ut.make_group(project.pk, 2, {
            extended_due_date: "2019-08-18T15:25:06.965696Z",
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu"
            ],
        });

        group_4 = data_ut.make_group(project.pk, 2, {
            extended_due_date: "2019-08-18T15:24:06.965696Z",
            member_names: [
                "phyllis@cornell.edu",
                "stanley@cornell.edu"
            ],
        });

        groups = [group_1, group_2, group_3, group_4];

        let get_all_groups_stub = sinon.stub(Group, 'get_all_from_project');
        get_all_groups_stub.returns(Promise.resolve(groups));

        let get_course_by_pk_stub = sinon.stub(Course, 'get_by_pk');
        get_course_by_pk_stub.returns(Promise.resolve(course));

        wrapper = managed_shallow_mount(EditGroups, {
            propsData: {
                project: project,
                course: course,
            }
        });
        console.log(wrapper.html())
        component = wrapper.vm;
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
        let new_group = data_ut.make_group(project.pk, 2, {
            extended_due_date: null,
            member_names: [
                "angela@cornell.edu",
                "creed@cornell.edu"
            ],
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
        let new_group = data_ut.make_group(project.pk, 1, {
            member_names: [
                "toby@cornell.edu"
            ],
        });

        expect(component.groups_by_members.size()).toEqual(4);
        expect(component.groups_by_pk.size()).toEqual(4);

        Group.notify_group_created(new_group);
        expect(component.groups_by_members.size()).toEqual(5);
        expect(component.groups_by_pk.size()).toEqual(5);
        expect(component.selected_group).toEqual(new_group);
     });

    test('Selected group set to group selected in GroupLookup', () => {
        expect(component.selected_group).toBeNull();

        let group_lookup = wrapper.findComponent({ref: 'group_lookup'});
        group_lookup.vm.$emit('update_group_selected', group_1);

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

    test('Change the members of a group with an extension - extension list gets updated',
         async () => {
        expect(component.groups_with_extensions.length).toEqual(3);

        let changed_group = deep_copy(group_3, Group);
        changed_group.member_names[0] = "creed@cornell.edu";
        Group.notify_group_changed(changed_group);
        await component.$nextTick();

        expect(component.groups_with_extensions.length).toEqual(3);
        expect(component.groups_with_extensions[0]).toEqual(group_4);
        expect(component.groups_with_extensions[1]).toEqual(changed_group);
        expect(component.groups_with_extensions[2]).toEqual(group_2);
    });

    test('Remove an extension from a group - extension list gets updated', async () => {
        let group_2_without_extension = deep_copy(group_2, Group);
        group_2_without_extension.extended_due_date = null;

        expect(component.groups_with_extensions.length).toEqual(3);

        Group.notify_group_changed(group_2_without_extension);
        await component.$nextTick();

        expect(component.groups_with_extensions.length).toEqual(2);
        expect(component.groups_with_extensions[0]).toEqual(group_4);
        expect(component.groups_with_extensions[1]).toEqual(group_3);
    });

    test('groups_by_members passed to merge-groups', async () => {
        component.d_show_merge_groups_modal = true;
        await component.$nextTick();

        let merge_groups = <Wrapper<MergeGroups>> wrapper.findComponent({ref: 'merge_groups'});
        expect(merge_groups.vm.groups).toEqual(component.groups_by_members.data);
    });

    test('Toggling d_show_create_group_modal', async () => {
        expect(wrapper.findComponent({ref: 'create_group_modal'}).exists()).toBe(false);

        await set_data(wrapper, {d_show_create_group_modal: true});
        expect(wrapper.vm.d_show_create_group_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'create_group_modal'}).exists()).toBe(true);

        await set_data(wrapper, {d_show_create_group_modal: false});
        expect(wrapper.vm.d_show_create_group_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'create_group_modal'}).exists()).toBe(false);
    });

    test('Toggling d_show_merge_groups_modal', async () => {
        expect(wrapper.findComponent({ref: 'create_group_modal'}).exists()).toBe(false);

        await set_data(wrapper, {d_show_merge_groups_modal: true});
        expect(wrapper.vm.d_show_merge_groups_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'merge_groups_modal'}).exists()).toBe(true);

        await set_data(wrapper, {d_show_merge_groups_modal: false});
        expect(wrapper.vm.d_show_merge_groups_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'merge_groups_modal'}).exists()).toBe(false);
    });

    test('merge groups - one group has an extension', async () => {
        let new_group_from_merge = data_ut.make_group(project.pk, 4, {
            extended_due_date: group_3.extended_due_date,
            member_names: [
                "andy@cornell.edu",
                "kevin@cornell.edu",
                "oscar@cornell.edu",
                "roy@cornell.edu"
            ],
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
        let new_group_from_merge = data_ut.make_group(project.pk, 4, {
            extended_due_date: group_4.extended_due_date,
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu",
                "phyllis@cornell.edu",
                "stanley@cornell.edu"
            ],
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
        let group_without_an_extension = data_ut.make_group(project.pk, 1, {
            extended_due_date: null,
            member_names: [
                "toby@cornell.edu"
            ],
        });

        let new_group_from_merge = data_ut.make_group(project.pk, 3, {
            extended_due_date: null,
            member_names: [
                "andy@cornell.edu",
                "roy@cornell.edu",
                "toby@cornell.edu"
            ],
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

test('Observer updates from other project ignored', async () => {
    let course = data_ut.make_course();
    let project = data_ut.make_project(course.pk);
    let other_project = data_ut.make_project(course.pk) ;
    let other_group = data_ut.make_group(other_project.pk);
    sinon.stub(Group, 'get_all_from_project').resolves([]);

    let wrapper = managed_shallow_mount(EditGroups, {
        propsData: {
            project: project,
            course: course,
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);

    Group.notify_group_created(other_group);
    Group.notify_group_changed(other_group);
    Group.notify_group_merged(other_group, 1, 2);

    expect(wrapper.vm.groups_by_members.empty()).toBe(true);
    expect(wrapper.vm.groups_by_pk.empty()).toBe(true);
});
