import { config, mount, Wrapper } from '@vue/test-utils';

import {
    Course,
    Group,
    HttpError,
    Project,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import GroupMembersForm from '@/components/group_members_form.vue';
import CreateSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';

import * as data_ut from '@/tests/data_utils';


describe('CreateSingleGroup tests', () => {
    let wrapper: Wrapper<CreateSingleGroup>;
    let component: CreateSingleGroup;
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
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Successful creation of a group', async () => {
        let create_group_stub = sinon.stub(Group, 'create');
        let group_members = ["abernard@cornell.edu", "amartin@cornell.edu"];

        let group_form
            = <Wrapper<GroupMembersForm>> wrapper.findComponent({ref: 'create_group_form'});
        group_form.vm.$emit('submit', group_members);
        await component.$nextTick();

        expect(create_group_stub.firstCall.calledWith(project.pk, {member_names: group_members}));
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

        let group_form
            = <Wrapper<GroupMembersForm>> wrapper.findComponent({ref: 'create_group_form'});
        group_form.vm.$emit('submit', ["abernard@cornell.edu", "amartin@cornell.edu"]);
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
