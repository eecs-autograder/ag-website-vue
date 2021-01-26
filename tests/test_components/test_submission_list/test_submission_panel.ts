import { mount } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import SubmissionPanel from '@/components/submission_list/submission_panel.vue';
import { format_datetime_short } from '@/utils';

import * as data_ut from '@/tests/data_utils';

let group: ag_cli.Group;

beforeEach(() => {
    let course = data_ut.make_course();
    let project = data_ut.make_project(course.pk);
    group = data_ut.make_group(project.pk);
});

test('Submission timestamp displayed', async () => {
    let submission = data_ut.make_submission(group);
    let wrapper = mount(SubmissionPanel, {
        propsData: {
            submission: submission
        }
    });

    expect(wrapper.find('.submission-list-item').text()).toEqual(
        format_datetime_short(submission.timestamp));
});

describe('Submission status icons', () => {
    test('received icon', () => {
        let received = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.received});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: received
            }
        });

        expect(wrapper.find('.submission-status ').element.children.length).toEqual(0);
    });

    test('queued icon', () => {
        let queued = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.queued});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: queued
            }
        });

        expect(wrapper.find('.submission-status .queued-symbol').text()).toEqual('Q');
        expect(wrapper.find('.submission-status').element.children.length).toEqual(1);
    });

    test('being_graded icon', () => {
        let being_graded = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.being_graded});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: being_graded
            }
        });

        expect(wrapper.find('.submission-status .fa-list').exists()).toBe(true);
        expect(wrapper.find('.submission-status').element.children.length).toEqual(1);
    });

    test('waiting_for_deferred icon', () => {
        let waiting_for_deferred = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.waiting_for_deferred});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: waiting_for_deferred
            }
        });

        expect(wrapper.find('.submission-status .fa-check-circle').exists()).toBe(true);
        expect(wrapper.find('.submission-status .score').exists()).toBe(false);
    });

    test('waiting_for_deferred with points icon', () => {
        let waiting_for_deferred_with_points = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.waiting_for_deferred},
            {total_points: 1, total_points_possible: 4});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: waiting_for_deferred_with_points
            }
        });

        expect(wrapper.find('.submission-status .fa-check-circle').exists()).toBe(false);
        expect(wrapper.find('.submission-status .score').text()).toBe('1/4');
    });

    test('waiting_for_deferred with points possible "0" string', () => {
        let waiting_for_deferred = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.waiting_for_deferred},
            {total_points_possible: '0.00'});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: waiting_for_deferred
            }
        });

        expect(wrapper.find('.submission-status .fa-check-circle').exists()).toBe(true);
        expect(wrapper.find('.submission-status .score').exists()).toBe(false);
    });

    test('finished_grading icon', () => {
        let finished_grading = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.finished_grading});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: finished_grading
            }
        });

        expect(wrapper.find('.submission-status .fa-check-circle').exists()).toBe(true);
        expect(wrapper.find('.submission-status .score').exists()).toBe(false);
    });

    test('finished_grading with points icon', () => {
        let finished_grading_with_points = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.finished_grading},
            {total_points: 3, total_points_possible: 5});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: finished_grading_with_points
            }
        });

        expect(wrapper.find('.submission-status .fa-check-circle').exists()).toBe(false);
        expect(wrapper.find('.submission-status .score').text()).toBe('3/5');
    });

    test('finished_grading with points possible "0" string', () => {
        let finished_grading = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.finished_grading},
            {total_points_possible: '0.00'});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: finished_grading
            }
        });

        expect(wrapper.find('.submission-status .fa-check-circle').exists()).toBe(true);
        expect(wrapper.find('.submission-status .score').exists()).toBe(false);
    });

    test('removed_from_queue icon', () => {
        let removed_from_queue = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.removed_from_queue});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: removed_from_queue
            }
        });

        expect(wrapper.find('.submission-status .fa-eject').exists()).toBe(true);
        expect(wrapper.find('.submission-status').element.children.length).toEqual(1);
    });

    test('rejected icon', () => {
        let rejected = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.rejected});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: rejected
            }
        });

        expect(wrapper.find('.submission-status .fa-ban').exists()).toBe(true);
        expect(wrapper.find('.submission-status').element.children.length).toEqual(1);
    });

    test('error icon', () => {
        let error = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.error});
        let wrapper = mount(SubmissionPanel, {
            propsData: {
                submission: error
            }
        });

        expect(wrapper.find('.submission-status .fa-skull').exists()).toBe(true);
        expect(wrapper.find('.submission-status').element.children.length).toEqual(1);
    });
});

