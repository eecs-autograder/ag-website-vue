import { mount, Wrapper } from '@vue/test-utils';

import {
    Course,
    Group,
    HttpError,
    Project,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import GroupMembersForm from '@/components/group_members_form.vue';
import CreateSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';

import * as data_ut from '@/tests/data_utils';
import { wait_until } from '@/tests/utils';


describe('CreateSingleGroup tests', () => {
    let wrapper: Wrapper<CreateSingleGroup>;
    let course: Course;
    let project: Project;

    beforeEach(() => {
        course = data_ut.make_course({allowed_guest_domain: '@cornell.edu'});
        project = data_ut.make_project(course.pk, {min_group_size: 2, max_group_size: 3});

        wrapper = mount(CreateSingleGroup, {
            propsData: {
                course: course,
                project: project
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Successful creation of a group', async () => {
        let create_group_stub = sinon.stub(Group, 'create').resolves();
        let group_members = ["abernard@cornell.edu", "amartin@cornell.edu"];

        wrapper.findComponent(GroupMembersForm).vm.$emit('submit', group_members);
        expect(await wait_until(
            wrapper, w => w.find('.create-group-button').attributes('disabled') === undefined
        )).toBe(true);

        expect(create_group_stub.calledOnceWith(
            project.pk, {member_names: group_members})).toBe(true);
        expect(wrapper.find('.create-group-button').attributes('disabled')).toBeUndefined();
        expect(wrapper.findAll('.error-msg').length).toBe(0);
    });

    test('Handle API create group error', async () => {
        let create_group_stub = sinon.stub(Group, 'create');
        create_group_stub.returns(Promise.reject(
            new HttpError(
                400,
                {__all__: "Error in \"members\": This project only accepts submissions "
                          + "from enrolled students."}
            )
        ));

        wrapper.findComponent(GroupMembersForm).vm.$emit(
            'submit', ["abernard@cornell.edu", "amartin@cornell.edu"]);
        expect(await wait_until(
            wrapper, w => w.find('.create-group-button').attributes('disabled') === undefined
        )).toBe(true);

        let error_messages = wrapper.findAll('.error-msg');
        expect(error_messages.length).toBe(1);
        expect(error_messages.at(0).text()).toContain(
            'This project only accepts submissions from enrolled students.');
    });
});
