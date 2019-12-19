import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import GroupLookup from '@/components/group_lookup.vue';
import StudentLookup from '@/components/project_view/student_lookup.vue';
import SubmissionList from '@/components/submission_list/submission_list.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_shallow_mount } from '@/tests/setup';
import { find_by_name, wait_for_load } from '@/tests/utils';

let project: ag_cli.Project;
let groups: ag_cli.Group[];
let wrapper: Wrapper<StudentLookup>;

beforeEach(async () => {
    let course = data_ut.make_course();
    project = data_ut.make_project(course.pk);
    groups = [
        data_ut.make_group(project.pk, 1, {member_names: ['user1']}),
        data_ut.make_group(project.pk, 1, {member_names: ['user2']}),
        data_ut.make_group(project.pk, 1, {member_names: ['user4']}),
    ];

    sinon.stub(ag_cli.Group, 'get_all_from_project').withArgs(project.pk).resolves(groups.slice());

    wrapper = managed_shallow_mount(StudentLookup, {
        propsData: {
            course: course,
            project: project,
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);
});

test('Group lookup and submission list input and event bindings', async () => {
    let group_lookup = find_by_name<GroupLookup>(wrapper, 'GroupLookup');
    expect(group_lookup.vm.groups).toEqual(groups);
    let submission_list = find_by_name<SubmissionList>(wrapper, 'SubmissionList');
    expect(submission_list.exists()).toBe(false);

    group_lookup.vm.$emit('update_group_selected', groups[1]);
    await wrapper.vm.$nextTick();

    submission_list = find_by_name<SubmissionList>(wrapper, 'SubmissionList');
    expect(submission_list.exists()).toBe(true);
    expect(submission_list.vm.group).toBe(groups[1]);
});

test('New group created', () => {
    let new_group = data_ut.make_group(project.pk, 1, {member_names: ['user3']});
    ag_cli.Group.notify_group_created(new_group);

    let actual_names = wrapper.vm.d_groups.data.map(group => group.member_names[0]);
    expect(actual_names).toEqual(['user1', 'user2', 'user3', 'user4']);
});

test('New group from other project ignored', () => {
    let other_project = data_ut.make_project(data_ut.make_course().pk);
    let new_group = data_ut.make_group(other_project.pk, 1, {member_names: ['user3']});

    ag_cli.Group.notify_group_created(new_group);
    let actual_names = wrapper.vm.d_groups.data.map(group => group.member_names[0]);
    expect(actual_names).toEqual(['user1', 'user2', 'user4']);
});
