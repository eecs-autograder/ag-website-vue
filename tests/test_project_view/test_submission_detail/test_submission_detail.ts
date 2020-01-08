import * as ag_cli from 'ag-client-typescript';
import * as FileSaver from 'file-saver';
import * as sinon from 'sinon';

import MutationSuiteResults from '@/components/project_view/submission_detail/mutation_suite_results.vue';
import SubmissionDetail from '@/components/project_view/submission_detail/submission_detail.vue';

import * as data_ut from '@/tests/data_utils.ts';
import { managed_mount } from '@/tests/setup';
import { compress_whitespace, expect_html_element_has_value, find_by_name } from '@/tests/utils';

jest.mock('file-saver');

let user: ag_cli.User;
let course: ag_cli.Course;
let project: ag_cli.Project;
let group: ag_cli.Group;
let submission_with_results: ag_cli.SubmissionWithResults;
let get_submission_result_stub: sinon.SinonStub;

function make_wrapper(is_ultimate_submission: boolean = false) {
    let wrapper = managed_mount(SubmissionDetail, {
        propsData: {
            submission_with_results: submission_with_results,
            course: course,
            group: group,
            is_ultimate_submission: is_ultimate_submission
        }
    });

    return wrapper;
}

beforeEach(() => {
    user = data_ut.make_user();
    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);

    group = data_ut.make_group(
        project.pk,
        3,
        {member_names: [user.username, "David", "Alexis"]}
    );

    submission_with_results = data_ut.make_submission_with_results(
        group, {status: ag_cli.GradingStatus.finished_grading});

    get_submission_result_stub = sinon.stub(
        ag_cli, 'get_submission_result'
    ).resolves(submission_with_results.results);

    data_ut.set_global_current_user(user);
    data_ut.set_global_current_course(course);
    data_ut.set_global_current_project(project);
});

describe('SubmissionDetail tests', () => {
    test('Submitted by', () => {
        let wrapper = make_wrapper();
        expect(wrapper.vm.submission.submitter).toEqual(user.username);
        expect(wrapper.find('#submitter').text()).toEqual(user.username);
    });

    test('Bonus submission message hidden', () => {
        let wrapper = make_wrapper();
        expect(wrapper.find('#is-bonus-submission-message').exists()).toBe(false);
    });

    test('Bonus submission message shown', () => {
        submission_with_results.is_bonus_submission = true;
        let wrapper = make_wrapper();
        expect(wrapper.find('#is-bonus-submission-message').text()).toEqual(
           "This submission used one of your bonus submissions."
        );
    });

    test('Submission does not count for current user', () => {
        submission_with_results.does_not_count_for = [user.username];
        let wrapper = make_wrapper();
        expect(wrapper.find('#does-not-count-for-user-message').exists()).toBe(true);
        expect(wrapper.find('#does-not-count-for-user-message').text()).toContain('late days');
    });

    test('Submission does not count for other member of group', () => {
        submission_with_results.does_not_count_for = [group.member_names[1], group.member_names[2]];
        let wrapper = make_wrapper();

        expect(wrapper.find('#does-not-count-for-user-message').exists()).toBe(false);
        let usernames = wrapper.findAll('#does-not-count-for-list .username');
        expect(usernames.wrappers.map(w => w.text())).toEqual(
            [group.member_names[1], group.member_names[2]]);
    });

    test('Page will update automatically message', async () => {
        do_auto_update_message_test(ag_cli.GradingStatus.being_graded, true);
        do_auto_update_message_test(ag_cli.GradingStatus.error, false);
        do_auto_update_message_test(ag_cli.GradingStatus.finished_grading, false);
        do_auto_update_message_test(ag_cli.GradingStatus.received, true);
        do_auto_update_message_test(ag_cli.GradingStatus.removed_from_queue, false);
        do_auto_update_message_test(ag_cli.GradingStatus.queued, true);
        do_auto_update_message_test(ag_cli.GradingStatus.waiting_for_deferred, false);

        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));
        do_auto_update_message_test(ag_cli.GradingStatus.waiting_for_deferred, true);
    });

    function do_auto_update_message_test(status: ag_cli.GradingStatus, visible: boolean) {
        submission_with_results.status = status;
        let wrapper = make_wrapper();
        expect(wrapper.find('#auto-update-message').exists()).toBe(visible);
        if (visible) {
            expect(wrapper.find('#auto-update-message').text()).toContain(
                'This page will update automatically');
        }
        wrapper.destroy();
    }
});

describe('Score and status display tests', () => {
    test('Grading status text', () => {
        do_status_message_test(
            ag_cli.GradingStatus.received, 'We got your submission! It should be queued soon.');

        submission_with_results.position_in_queue = 3;
        do_status_message_test(
            ag_cli.GradingStatus.queued, 'Your submission is at position 3 in the queue');

        do_status_message_test(
            ag_cli.GradingStatus.being_graded, 'Your submission is being graded');
        do_status_message_test(
            ag_cli.GradingStatus.removed_from_queue, 'You removed this submission from the queue');
        do_status_message_test(ag_cli.GradingStatus.error, 'An unexpected error occurred');
    });

    function do_status_message_test(
        status: ag_cli.GradingStatus, status_message: string | null
    ) {
        submission_with_results.status = status;
        let wrapper = make_wrapper();
        let status_wrapper = wrapper.find('#grading-status-section.grading-status');
        if (status_message === null) {
            expect(status_wrapper.exists()).toBe(false);
        }
        else {
            expect(compress_whitespace(status_wrapper.text())).toContain(status_message);
        }
        wrapper.destroy();
    }

    test('Status received, no score shown', () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {status: ag_cli.GradingStatus.received},
            {total_points: '10.25', total_points_possible: '15'}
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        let wrapper = make_wrapper();
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('Status removed_from_queue, no score shown', () => {
        submission_with_results = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.removed_from_queue},
            {total_points: '10.25', total_points_possible: '15'}
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        let wrapper = make_wrapper();
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('Status being_graded, no score shown', () => {
        submission_with_results = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.being_graded},
            {total_points: '10.25', total_points_possible: '15'}
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        let wrapper = make_wrapper();
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('Status error, no score shown', () => {
        submission_with_results = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.error},
            {total_points: '10.25', total_points_possible: '15'}
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        let wrapper = make_wrapper();
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('Status waiting_for_deferred, points possible nonzero, score shown', () => {
        submission_with_results.status = ag_cli.GradingStatus.waiting_for_deferred;
        submission_with_results.results.total_points = 0;
        submission_with_results.results.total_points_possible = 8;

        let wrapper = make_wrapper();

        expect(wrapper.find('#submission-score').exists()).toBe(true);
        expect(wrapper.find('#submission-score').text()).toContain("0/8");
    });

    test('Status waiting_for_deferred, points possible zero, no score shown', () => {
        submission_with_results.status = ag_cli.GradingStatus.waiting_for_deferred;
        submission_with_results.results.total_points = 0;
        submission_with_results.results.total_points_possible = 0;

        let wrapper = make_wrapper();
        expect(wrapper.find('#submission-score').exists()).toBe(false);

        expect(wrapper.find('#deferred-tests-message').text()).toContain('Core tests finished');
    });

    test('Status finished_grading, points possible nonzero, score shown', () => {
        submission_with_results.status = ag_cli.GradingStatus.finished_grading;
        submission_with_results.results.total_points = 0;
        submission_with_results.results.total_points_possible = 5;

        let wrapper = make_wrapper();
        expect(wrapper.find('#submission-score').text()).toContain("0/5");
    });

    test('Status finished_grading, points possible zero, no score shown', () => {
        submission_with_results.status = ag_cli.GradingStatus.finished_grading;
        submission_with_results.results.total_points = 0;
        submission_with_results.results.total_points_possible = 0;

        let wrapper = make_wrapper();
        expect(wrapper.find('#submission-score').exists()).toBe(false);

        expect(wrapper.find('#deferred-tests-message').text()).toContain('All tests finished');
    });
});

describe('Submitted files tests', () => {
    beforeEach(() => {
        submission_with_results.submitted_filenames = [
            "file_a",
            "file_b",
            "file_c"
        ];
    });

    test('submitted files are listed', async () => {
        let wrapper = make_wrapper();

        expect(wrapper.findAll('.submitted-file').length).toEqual(3);
        expect(wrapper.findAll('.submitted-file').at(0).text()).toEqual("file_a");
        expect(wrapper.findAll('.submitted-file').at(1).text()).toEqual("file_b");
        expect(wrapper.findAll('.submitted-file').at(2).text()).toEqual("file_c");
    });

    test('downloading a file', async () => {
        let wrapper = make_wrapper();

        let get_file_content_stub = sinon.stub(
            wrapper.vm.submission, 'get_file_content'
        ).withArgs('file_b').callsFake((filename, on_download_progress) => {
            // tslint:disable-next-line: no-object-literal-type-assertion
            on_download_progress!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 6});
            return Promise.resolve(new Blob(["File b contents"]));
        });

        let middle_file = wrapper.findAll('.submitted-file').at(1);
        middle_file.find('.download-file-icon').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_file_content_stub.callCount).toEqual(1);
        expect(FileSaver.saveAs).toBeCalled();
    });

    test('viewing a file', async () => {
        let wrapper = make_wrapper();

        expect(wrapper.findAll('.submitted-file').length).toEqual(3);

        let get_file_content_stub = sinon.stub(
            wrapper.vm.submission, 'get_file_content'
        ).callsFake((filename, callback) => {
            // tslint:disable-next-line: no-object-literal-type-assertion
            callback!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 15});
            return Promise.resolve(new Blob(["File b contents"]));
        });
        expect(wrapper.vm.current_filename).toBeNull();

        let submitted_files = wrapper.findAll('.submitted-file');
        submitted_files.at(1).find('.open-file-link').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_file_content_stub.calledOnce).toBe(true);
        expect(wrapper.vm.current_filename).toEqual('file_b');

        submitted_files.at(0).find('.open-file-link').trigger('click');
        await wrapper.vm.$nextTick();
        submitted_files.at(1).find('.open-file-link').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
    });
});

describe('Adjust feedback tests', () => {
    test('adjust_feedback - is_staff === false', () => {
        let wrapper = make_wrapper();
        expect(wrapper.find('#adjust-feedback-section').exists()).toBe(false);
    });

    test('adjust_feedback - is_staff === true && status === removed_from_queue', () => {
        submission_with_results.status = ag_cli.GradingStatus.removed_from_queue;
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

        let wrapper = make_wrapper();

        expect(wrapper.vm.submission.status).toEqual(ag_cli.GradingStatus.removed_from_queue);
        expect(wrapper.find('#adjust-feedback-section').exists()).toBe(false);
    });

    test('adjust_feedback - is_staff === true && is_group_member === false', () => {
        data_ut.set_global_current_user(data_ut.make_user());
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

        let wrapper = make_wrapper();

        expect(wrapper.find({ref: 'staff_viewer_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'ultimate_submission_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'normal_feedback_option'}).exists()).toBe(false);
        expect(wrapper.find({ref: 'past_limit_feedback_option'}).exists()).toBe(false);
        expect(wrapper.find({ref: 'max_feedback_option'}).exists()).toBe(false);
    });

    test('adjust_feedback - is_staff === true && is_group_member === true', () => {
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

        let wrapper = make_wrapper();

        expect(wrapper.find({ref: 'staff_viewer_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'ultimate_submission_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'normal_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'past_limit_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'max_feedback_option'}).exists()).toBe(true);
    });

    test('adjust_feedback - is_admin === true && is_group_member === false', () => {
        data_ut.set_global_current_user(data_ut.make_user());
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_admin: true, is_staff: true}));

        let wrapper = make_wrapper();

        expect(wrapper.find({ref: 'staff_viewer_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'ultimate_submission_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'normal_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'past_limit_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'max_feedback_option'}).exists()).toBe(true);
    });

    test('adjust_feedback - select different feedback category', async () => {
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

        let wrapper = make_wrapper();

        expect(get_submission_result_stub.callCount).toEqual(0);

        let adjust_feedback_category_input = wrapper.find('#adjust-feedback-select');
        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.staff_viewer);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.staff_viewer);
        expect(get_submission_result_stub.callCount).toEqual(1);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.staff_viewer)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.ultimate_submission);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.feedback_category).toEqual(
            ag_cli.FeedbackCategory.ultimate_submission);
        expect(get_submission_result_stub.callCount).toEqual(2);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.ultimate_submission)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.normal);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.normal);
        expect(get_submission_result_stub.callCount).toEqual(3);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.normal)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.past_limit_submission);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.feedback_category).toEqual(
            ag_cli.FeedbackCategory.past_limit_submission
        );
        expect(get_submission_result_stub.callCount).toEqual(4);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.past_limit_submission)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.max);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_submission_result_stub.callCount).toEqual(5);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.max)
        ).toBe(true);
    });

    test('submission_with_results Watcher', async () => {
        let filename = 'i_am_file.txt';
        let first_content = 'content 1';
        let second_content = 'content 2';
        submission_with_results.submitted_filenames = [filename];
        let another_submission_with_results = data_ut.make_submission_with_results(
            group, {submitted_filenames: [filename]});

        let wrapper = make_wrapper();
        // We'll open a file to make sure it gets closed when the watched
        // submission changes.
        sinon.stub(wrapper.vm.submission, 'get_file_content').resolves(new Blob([first_content]));
        let submitted_files = wrapper.findAll('.submitted-file');
        submitted_files.at(0).find('.open-file-link').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.current_filename).toEqual(filename);
        expect(await wrapper.vm.current_file_contents).toEqual(first_content);

        wrapper.vm.d_submission_fdbk_override = submission_with_results.results;
        wrapper.vm.d_fdbk_category_override = ag_cli.FeedbackCategory.max;

        // Mocking get_file_content messes up this check, so we just check
        // the SubmissionData fields.
        expect(
            new ag_cli.SubmissionData(wrapper.vm.submission)
        ).toEqual(new ag_cli.SubmissionData(submission_with_results));
        expect(wrapper.vm.submission_result).toEqual(submission_with_results.results);
        expect(get_submission_result_stub.callCount).toEqual(0);

        wrapper.setProps({submission_with_results: another_submission_with_results});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_fdbk_category_override).toBeNull();
        expect(wrapper.vm.d_submission_fdbk_override).toBeNull();
        expect(wrapper.vm.current_filename).toEqual(null);
        expect(
            new ag_cli.SubmissionData(wrapper.vm.submission)
        ).toEqual(new ag_cli.SubmissionData(another_submission_with_results));

        // The file contents should be re-requested, even though the file has
        // the same name. This will indicate that the stored file data was
        // cleared.
        sinon.stub(wrapper.vm.submission, 'get_file_content').resolves(new Blob([second_content]));
        submitted_files.at(0).find('.open-file-link').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.current_filename).toEqual(filename);
        expect(await wrapper.vm.current_file_contents).toEqual(second_content);
    });

    test('Submission feedback override', async () => {
        let staff_viewer_results = JSON.parse(JSON.stringify(submission_with_results.results));
        staff_viewer_results.total_points_possible = 4728;
        get_submission_result_stub.withArgs(
            submission_with_results.pk, ag_cli.FeedbackCategory.staff_viewer
        ).resolves(staff_viewer_results);

        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

        let wrapper = make_wrapper();

        expect(get_submission_result_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_submission_fdbk_override).toBeNull();
        expect(wrapper.vm.submission_result).toEqual(submission_with_results.results);

        let adjust_feedback_category_input = wrapper.find('#adjust-feedback-select');
        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.staff_viewer);
        await wrapper.vm.$nextTick();

        expect(get_submission_result_stub.calledOnce);
        expect(wrapper.vm.d_submission_fdbk_override).toEqual(staff_viewer_results);
        expect(wrapper.vm.d_fdbk_category_override).toEqual(ag_cli.FeedbackCategory.staff_viewer);
        expect(wrapper.vm.submission_result).toEqual(staff_viewer_results);
    });
});

describe('Suite results tests', () => {
    test('No mutation test suite results', () => {
        let wrapper = make_wrapper();
        expect(wrapper.find({name: 'MutationSuiteResults'}).exists()).toBe(false);
    });

    test('Mutation test suite results shown', () => {
        let mutation_test_suite_pk = 1;
        submission_with_results.results.student_test_suite_results = [
            data_ut.make_mutation_test_suite_result_feedback(mutation_test_suite_pk),
            data_ut.make_mutation_test_suite_result_feedback(mutation_test_suite_pk)
        ];

        let wrapper = make_wrapper();
        let mutation_suite_results = find_by_name<MutationSuiteResults>(
            wrapper, 'MutationSuiteResults');
        expect(mutation_suite_results.vm.mutation_test_suite_results
            ).toEqual(submission_with_results.results.student_test_suite_results);
    });

    test('No AG test suite results', () => {
        let wrapper = make_wrapper();
        expect(wrapper.findAll({name: 'AGSuiteResult'}).length).toEqual(0);
    });

    test('AG test suite results shown', () => {
        let ag_test_suite_pk = 1;
        submission_with_results.results.ag_test_suite_results = [
            data_ut.make_ag_test_suite_result_feedback(ag_test_suite_pk),
            data_ut.make_ag_test_suite_result_feedback(ag_test_suite_pk)
        ];

        let wrapper = make_wrapper();
        expect(wrapper.findAll({name: 'AGSuiteResult'}).length).toEqual(2);
    });
});

describe('Remove from queue tests', async () => {
    test('Remove from queue button shown when grading status is received or queued', async () => {
        do_remove_from_queue_button_test(ag_cli.GradingStatus.being_graded, false);
        do_remove_from_queue_button_test(ag_cli.GradingStatus.error, false);
        do_remove_from_queue_button_test(ag_cli.GradingStatus.queued, true);
        do_remove_from_queue_button_test(ag_cli.GradingStatus.finished_grading, false);
        do_remove_from_queue_button_test(ag_cli.GradingStatus.received, true);
        do_remove_from_queue_button_test(ag_cli.GradingStatus.removed_from_queue, false);
        do_remove_from_queue_button_test(ag_cli.GradingStatus.waiting_for_deferred, false);
    });

    function do_remove_from_queue_button_test(status: ag_cli.GradingStatus, visible: boolean) {
        submission_with_results.status = ag_cli.GradingStatus.being_graded;
        let wrapper = make_wrapper();
        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(false);
        wrapper.destroy();
    }

    test('Remove submission from queue - cancel action', async () => {
        submission_with_results.status = ag_cli.GradingStatus.queued;
        let wrapper = make_wrapper();

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(false);

        wrapper.find('#remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(true);

        wrapper.find('#cancel-remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(false);
    });

    test('Remove submission from queue - confirm action - successful', async () => {
        submission_with_results.status = ag_cli.GradingStatus.queued;

        let wrapper = make_wrapper();
        let remove_submission_from_queue_stub = sinon.stub(
            wrapper.vm.submission, 'remove_from_queue');

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(false);

        wrapper.find('#remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(true);

        wrapper.find('#confirm-remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(remove_submission_from_queue_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(false);
        expect(wrapper.find({ref: 'api_errors'}).exists()).toBe(false);
    });

    test('Remove submission from queue - confirm action - unsuccessful', async () => {
        submission_with_results.status = ag_cli.GradingStatus.queued;

        let wrapper = make_wrapper();

        let remove_submission_from_queue_stub = sinon.stub(
            wrapper.vm.submission, 'remove_from_queue'
        ).rejects(
            new ag_cli.HttpError(400, {__all__: "This submission is not currently queued"})
        );

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(false);

        wrapper.find('#remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(true);

        wrapper.find('#confirm-remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(remove_submission_from_queue_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(true);
        expect(wrapper.find({ref: 'api_errors'}).exists()).toBe(true);
    });
});

describe('Feedback category deduction tests', () => {
    test('Staff group member, max feedback', () => {
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

        let wrapper = make_wrapper();
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.max);
        expect_html_element_has_value(
            wrapper.find('#adjust-feedback-select'), ag_cli.FeedbackCategory.max);
    });

    test('Admin non group member, ultimate_submission, max feedback', () => {
        data_ut.set_global_current_user(data_ut.make_user());
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_admin: true, is_staff: true}));

        let wrapper = make_wrapper(true);
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.max);
        expect_html_element_has_value(
            wrapper.find('#adjust-feedback-select'), ag_cli.FeedbackCategory.max);
    });

    test('Staff non group member, staff_viewer feedback', () => {
        data_ut.set_global_current_user(data_ut.make_user());
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

        let wrapper = make_wrapper();
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.staff_viewer);
        expect_html_element_has_value(
            wrapper.find('#adjust-feedback-select'), ag_cli.FeedbackCategory.staff_viewer);
    });

    test('Student viewing own ultimate submission, ultimate submission feedback', () => {
        let wrapper = make_wrapper(true);
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.ultimate_submission);
    });

    test('Student viewing own past limit submission, past limit submission feedback', () => {
        submission_with_results.is_past_daily_limit = true;

        let wrapper = make_wrapper();
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.past_limit_submission);
    });

    test('Student viewing own normal submission, normal feedback', () => {
        let wrapper = make_wrapper();
        expect(wrapper.vm.feedback_category).toEqual(ag_cli.FeedbackCategory.normal);
    });
});
