import { config, mount, Wrapper } from '@vue/test-utils';

import {
    Group,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import MergeGroups from '@/components/project_admin/edit_groups/merge_groups.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MergeGroups tests', () => {
    let wrapper: Wrapper<MergeGroups>;
    let component: MergeGroups;
    let group_1: Group;
    let group_2: Group;
    let group_3: Group;
    let group_4: Group;
    let groups: Group[];
    let project: Project;

    beforeEach(() => {
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
            expected_student_files: []
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

        wrapper = mount(MergeGroups, {
            propsData: {
                groups: groups,
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
        expect(component.available_groups).toEqual(component.groups);
        expect(component.available_groups[0]).toEqual(group_1);
        expect(component.available_groups[1]).toEqual(group_2);
        expect(component.available_groups[2]).toEqual(group_3);
        expect(component.available_groups[3]).toEqual(group_4);
    });

    test('available_groups when both group_1 is null', async () => {
        component.group_2 = group_3;
        await component.$nextTick();

        expect(component.available_groups.length).toEqual(component.groups.length - 1);
        expect(component.available_groups[0]).toEqual(group_1);
        expect(component.available_groups[1]).toEqual(group_2);
        expect(component.available_groups[2]).toEqual(group_4);
    });

    test('available_groups when both group_2 is null', async () => {
        component.group_1 = group_4;
        await component.$nextTick();

        expect(component.available_groups.length).toEqual(component.groups.length - 1);
        expect(component.available_groups[0]).toEqual(group_1);
        expect(component.available_groups[1]).toEqual(group_2);
        expect(component.available_groups[2]).toEqual(group_3);
    });

    test('available_groups when both group_1 and group_2 are both NOT null', async () => {
        component.group_1 = group_4;
        await component.$nextTick();

        component.group_2 = group_3;
        await component.$nextTick();

        expect(component.available_groups.length).toEqual(component.groups.length - 2);
        expect(component.available_groups[0]).toEqual(group_1);
        expect(component.available_groups[1]).toEqual(group_2);
    });

    test('merge groups - successful', async () => {
        component.group_1 = group_1;
        component.group_2 = group_3;
        await component.$nextTick();

        let merge_groups_stub = sinon.stub(component.group_1, 'merge_groups');

        wrapper.find('#merge-groups-button').trigger('click');
        await component.$nextTick();

        expect(merge_groups_stub.firstCall.thisValue.pk).toEqual(group_1.pk);
        expect(merge_groups_stub.firstCall.calledWith(group_3.pk)).toBe(true);
    });

    test('merge_groups - unsuccessful', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Error in \"members\": Groups with any staff users must consist " +
                             "of only staff users."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        component.group_1 = group_2;
        component.group_2 = group_4;
        await component.$nextTick();

        let merge_groups_stub = sinon.stub(component.group_1, 'merge_groups');
        merge_groups_stub.returns(Promise.reject(axios_response_instance));

        wrapper.find('#merge-groups-button').trigger('click');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(merge_groups_stub.firstCall.thisValue.pk).toEqual(group_2.pk);
        expect(merge_groups_stub.firstCall.calledWith(group_4.pk)).toBe(true);
    });
});
