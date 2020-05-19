import { Wrapper } from '@vue/test-utils';

import {
    Group,
    HttpError,
    Project,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import MergeGroups from '@/components/project_admin/edit_groups/merge_groups.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';


describe('MergeGroups tests', () => {
    let wrapper: Wrapper<MergeGroups>;
    let group_1: Group;
    let group_2: Group;
    let group_3: Group;
    let group_4: Group;
    let groups: Group[];
    let project: Project;

    beforeEach(() => {
        let course = data_ut.make_course();
        project = data_ut.make_project(course.pk);

        group_1 = data_ut.make_group(project.pk);
        group_2 = data_ut.make_group(project.pk);
        group_3 = data_ut.make_group(project.pk);
        group_4 = data_ut.make_group(project.pk);

        groups = [group_1, group_2, group_3, group_4];

        wrapper = managed_mount(MergeGroups, {
            propsData: {
                groups: groups,
                project: project
            },
            stubs: {
                'group-lookup': true
            }
        });
    });

    test('Merge button disabled when less than 2 groups selected', async () => {
        let merge_button = wrapper.find('#merge-groups-button');
        expect(merge_button.is('[disabled]')).toEqual(true);

        wrapper.vm.group_1 = group_1;
        wrapper.vm.group_2 = group_2;

        await wrapper.vm.$nextTick();
        expect(merge_button.is('[disabled]')).toEqual(false);

        wrapper.vm.group_1 = null;
        await wrapper.vm.$nextTick();
        expect(merge_button.is('[disabled]')).toEqual(true);

        wrapper.vm.group_1 = group_1;
        await wrapper.vm.$nextTick();
        expect(merge_button.is('[disabled]')).toEqual(false);

        wrapper.vm.group_2 = null;
        await wrapper.vm.$nextTick();
        expect(merge_button.is('[disabled]')).toEqual(true);
    });

    test('available_groups when both group_1 and group_2 are null', async () => {
        expect(wrapper.vm.available_groups).toEqual(wrapper.vm.groups);
        expect(wrapper.vm.available_groups[0]).toEqual(group_1);
        expect(wrapper.vm.available_groups[1]).toEqual(group_2);
        expect(wrapper.vm.available_groups[2]).toEqual(group_3);
        expect(wrapper.vm.available_groups[3]).toEqual(group_4);
    });

    test('available_groups when both group_1 is null', async () => {
        wrapper.vm.group_2 = group_3;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.available_groups.length).toEqual(wrapper.vm.groups.length - 1);
        expect(wrapper.vm.available_groups[0]).toEqual(group_1);
        expect(wrapper.vm.available_groups[1]).toEqual(group_2);
        expect(wrapper.vm.available_groups[2]).toEqual(group_4);
    });

    test('available_groups when both group_2 is null', async () => {
        wrapper.vm.group_1 = group_4;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.available_groups.length).toEqual(wrapper.vm.groups.length - 1);
        expect(wrapper.vm.available_groups[0]).toEqual(group_1);
        expect(wrapper.vm.available_groups[1]).toEqual(group_2);
        expect(wrapper.vm.available_groups[2]).toEqual(group_3);
    });

    test('available_groups when both group_1 and group_2 are both NOT null', async () => {
        wrapper.vm.group_1 = group_4;
        await wrapper.vm.$nextTick();

        wrapper.vm.group_2 = group_3;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.available_groups.length).toEqual(wrapper.vm.groups.length - 2);
        expect(wrapper.vm.available_groups[0]).toEqual(group_1);
        expect(wrapper.vm.available_groups[1]).toEqual(group_2);
    });

    test('merge groups - successful', async () => {
        wrapper.vm.group_1 = group_1;
        wrapper.vm.group_2 = group_3;
        await wrapper.vm.$nextTick();

        let merge_groups_stub = sinon.stub(wrapper.vm.group_1, 'merge_groups');

        wrapper.find('#merge-groups-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(merge_groups_stub.firstCall.thisValue.pk).toEqual(group_1.pk);
        expect(merge_groups_stub.firstCall.calledWith(group_3.pk)).toBe(true);
    });

    test('merge_groups - unsuccessful', async () => {
        wrapper.vm.group_1 = group_2;
        wrapper.vm.group_2 = group_4;
        await wrapper.vm.$nextTick();

        let merge_groups_stub = sinon.stub(wrapper.vm.group_1, 'merge_groups');
        merge_groups_stub.returns(Promise.reject(
            new HttpError(
                400,
                {__all__: "Error in \"members\": Groups with any staff users must consist "
                          + "of only staff users."}
            )
        ));

        wrapper.find('#merge-groups-button').trigger('click');
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(merge_groups_stub.firstCall.thisValue.pk).toEqual(group_2.pk);
        expect(merge_groups_stub.firstCall.calledWith(group_4.pk)).toBe(true);
    });
});
