import { mount } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import SubmissionList from '@/components/submission_list/submission_list.vue';

import * as data_ut from '@/tests/data_utils';

let user: ag_cli.User;
let course: ag_cli.Course;
let project: ag_cli.Project;
let group: ag_cli.Group;

let get_submissions_with_results_stub: sinon.SinonStub;
let get_submissions_stub: sinon.SinonStub;
let get_ultimate_submission_stub: sinon.SinonStub;
let get_submission_result_stub: sinon.SinonStub;

beforeEach(() => {
    user = data_ut.make_user();
    // data_ut.set_global_current_user(user);

    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);
    group = data_ut.make_group(project.pk, 1, {member_names: [user.username]});

    get_submissions_with_results_stub = sinon.stub(
        ag_cli.Submission, 'get_all_from_group_with_results').rejects();
    get_submissions_stub = sinon.stub(ag_cli.Submission, 'get_all_from_group').rejects();

    get_ultimate_submission_stub = sinon.stub(
        ag_cli.Submission, 'get_final_graded_submission_from_group'
    ).rejects(new ag_cli.HttpError(403, ''));
    get_submission_result_stub = sinon.stub(ag_cli, 'get_submission_result').rejects();
});

describe('Submission list tests', () => {
    test('Initialization with no submissions', async () => {
        get_submissions_with_results_stub.withArgs(group.pk).resolves([]);
        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.findAll({name: 'SubmissionPanel'}).length).toEqual(0);
        expect(wrapper.findAll('.selected-submission').length).toEqual(0);
        expect(wrapper.vm.d_selected_submission).toBeNull();
    });

    test('Most recent submission selected automatically on load', async () => {
        let submission3 = data_ut.make_submission_with_results(group);
        let submission2 = data_ut.make_submission_with_results(group);
        let submission1 = data_ut.make_submission_with_results(group);
        get_submissions_with_results_stub.withArgs(group.pk).resolves(
            [submission1, submission2, submission3]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll({name: 'SubmissionPanel'}).length).toEqual(3);
        expect(wrapper.findAll('.selected-submission').length).toEqual(1);
        expect(wrapper.vm.d_selected_submission).toEqual(submission1);
    });

    test('Group input change', async () => {
        let current_group_submission = data_ut.make_submission_with_results(group);
        get_submissions_with_results_stub.withArgs(group.pk).resolves([current_group_submission]);

        let other_group = data_ut.make_group(project.pk);
        let other_group_submission2 = data_ut.make_submission_with_results(other_group);
        let other_group_submission = data_ut.make_submission_with_results(other_group);
        get_submissions_with_results_stub.withArgs(other_group.pk).resolves(
            [other_group_submission, other_group_submission2]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll({name: 'SubmissionPanel'}).length).toEqual(1);
        expect(wrapper.vm.d_submissions).toEqual([current_group_submission]);

        wrapper.setProps({group: other_group});
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll({name: 'SubmissionPanel'}).length).toEqual(2);
        expect(wrapper.vm.d_submissions).toEqual(
            [other_group_submission, other_group_submission2]);

        expect(wrapper.vm.d_selected_submission).toEqual(other_group_submission);
    });

    test('Submission status icons', async () => {
        let received = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.received});
        let queued = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.queued});
        let being_graded = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.being_graded});

        let waiting_for_deferred = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.waiting_for_deferred});
        let waiting_for_deferred_with_points = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.waiting_for_deferred},
            {total_points: 1, total_points_possible: 4});
        let finished_grading = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.finished_grading});
        let finished_grading_with_points = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.finished_grading},
            {total_points: 3, total_points_possible: 5});

        let removed_from_queue = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.removed_from_queue});
        let error = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.error});

        get_submissions_with_results_stub.withArgs(group.pk).resolves([
            received
            queued
            being_graded
            waiting_for_deferred
            waiting_for_deferred_with_points
            finished_grading
            finished_grading_with_points
            removed_from_queue
            error
        ]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        fail();
    });

    test('Selected submission highlighted', async () => {
        fail();
    });

    test('update_submission_created', async () => {
        fail();
    });
});

describe('Ultimate submission tests', () => {
    test('Ultimate submission available, results requested', async () => {
        fail();
    });

    test('Ultimate submission selected automatically on load', async () => {
        fail();
    });

    test('403 and 404 responses ignored', async () => {
        fail();
    });
});

describe('Polling tests', () => {
    test('New submission found', async () => {
        fail();
    });

    test('Multiple new submissions found', async () => {
        fail();
    });

    test('Submission status change no result refresh needed', async () => {
        fail();
    });

    test('Result refresh needed, staff viewing their own submission', async () => {
        fail();
    });

    test('Result refresh needed, staff viewing student submission', async () => {
        fail();
    });

    test('Result refresh needed, student viewing past limit submission', async () => {
        fail();
    });

    test('Result refresh needed, student viewing normal submission', async () => {
        fail();
    });
});
