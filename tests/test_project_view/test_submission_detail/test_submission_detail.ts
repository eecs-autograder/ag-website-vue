import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as FileSaver from 'file-saver';
import * as sinon from 'sinon';

import { GlobalData } from '@/app.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import SubmissionDetail from '@/components/project_view/submission_detail/submission_detail.vue';

import * as data_ut from '@/tests/data_utils.ts';

jest.mock('file-saver');

function make_wrapper(submission_with_results: ag_cli.SubmissionWithResults,
                      course: ag_cli.Course,
                      group: ag_cli.Group,
                      is_ultimate_submission: boolean,
                      globals: GlobalData) {

    let wrapper = mount(SubmissionDetail, {
        propsData: {
            submission_with_results: submission_with_results,
            course: course,
            group: group,
            is_ultimate_submission: is_ultimate_submission
        },
        provide: {
            globals: globals
        }
    });

    return wrapper;
}

describe('SubmissionDetail tests', () => {
    let wrapper: Wrapper<SubmissionDetail>;
    let course: ag_cli.Course;
    let globals: GlobalData;
    let group: ag_cli.Group;
    let project: ag_cli.Project;
    let submission_with_results: ag_cli.SubmissionWithResults;
    let user: ag_cli.User;
    let user_roles: ag_cli.UserRoles;

    let get_submission_result_stub: sinon.SinonStub;
    let get_file_content_stub: sinon.SinonStub;
    let remove_submission_from_queue_stub: sinon.SinonStub;

    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        user = new ag_cli.User({
            pk: 3,
            username: "alexis@umich.edu",
            first_name: "Alexis",
            last_name: "Bledel",
            email: "RoryGilmore@umich.edu",
            is_superuser: true
        });

        course = data_ut.make_course();
        user_roles = data_ut.make_user_roles();

        globals = new GlobalData();
        globals.current_user = user;
        globals.current_course = course;
        globals.user_roles = user_roles;

        project = data_ut.make_project(course.pk);

        group = data_ut.make_group(
            project.pk,
            3,
            {member_names: [user.username, "David", "Alexis"]}
        );

        get_submission_result_stub = sinon.stub(ag_cli, 'get_submission_result');

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return { matches: true };
            })
        });
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });
    });

    test('submission_with_results Watcher', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.finished_grading
            }
        );
        let past_limit_submission_results = data_ut.make_submission_with_results(group).results;
        let another_submission_with_results = data_ut.make_submission_with_results(group);

        get_submission_result_stub.onFirstCall().returns(
            Promise.resolve(past_limit_submission_results)
        );

        user_roles.is_staff = true;
        globals.user_roles = user_roles;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.submission).toEqual(new ag_cli.Submission(submission_with_results));
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(wrapper.vm.d_submission_fdbk_override).toEqual(submission_with_results.results);
        expect(wrapper.vm.submission_result).toEqual(submission_with_results.results);
        expect(get_submission_result_stub.callCount).toEqual(0);

        let adjust_feedback_category_input = wrapper.find('#adjust-feedback-select');
        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.past_limit_submission);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.past_limit_submission);
        expect(get_submission_result_stub.calledOnce).toBe(true);
        expect(wrapper.vm.submission).toEqual(
            new ag_cli.Submission(submission_with_results)
        );
        expect(wrapper.vm.d_submission_fdbk_override).toEqual(past_limit_submission_results);
        expect(wrapper.vm.submission_result).toEqual(past_limit_submission_results);

        wrapper.setProps({submission_with_results: another_submission_with_results});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(submission_with_results).not.toEqual(another_submission_with_results);
        expect(wrapper.vm.submission).toEqual(
            new ag_cli.Submission(another_submission_with_results)
        );
        expect(get_submission_result_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_submission_fdbk_override).toBeNull();
        expect(wrapper.vm.submission_result).toEqual(another_submission_with_results.results);
    });

    test('submission_result getter', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.finished_grading
            }
        );
        let another_submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.finished_grading
            }
        );
        let staff_viewer_results = data_ut.make_submission_with_results(group).results;

        get_submission_result_stub.onFirstCall().returns(
            Promise.resolve(staff_viewer_results)
        );

        user_roles.is_staff = true;
        globals.user_roles = user_roles;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(get_submission_result_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_submission_fdbk_override).not.toBeNull();
        expect(wrapper.vm.submission_result).toEqual(submission_with_results.results);

        wrapper.setProps({submission_with_results: another_submission_with_results});

        expect(get_submission_result_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_submission_fdbk_override).toBeNull();
        expect(wrapper.vm.submission_result).toEqual(another_submission_with_results.results);

        let adjust_feedback_category_input = wrapper.find('#adjust-feedback-select');
        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.staff_viewer);
        await wrapper.vm.$nextTick();

        expect(get_submission_result_stub.calledOnce);
        expect(wrapper.vm.d_submission_fdbk_override).not.toBeNull();
        expect(wrapper.vm.submission_result).toEqual(staff_viewer_results);
    });

    test('submitted by', async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.submission!.submitter).toEqual(user.username);
        expect(wrapper.find('#submitter').text()).toEqual(user.username);
    });

    test('grading status section', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.received});
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.submission!.status).toEqual(ag_cli.GradingStatus.received);
        expect(wrapper.find('#grading-status-section').text()).toContain(
            "We got your submission! It should be queued soon."
        );
    });

    test('is_bonus_submission message - is_bonus_submission === false', async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.submission!.is_bonus_submission).toBe(false);
        expect(wrapper.find('#is-bonus-submission-message').exists()).toBe(false);
    });

    test('is_bonus_submission message - is_bonus_submission === true', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                is_bonus_submission: true
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.submission!.is_bonus_submission).toBe(true);
        expect(wrapper.find('#is-bonus-submission-message').exists()).toBe(true);
        expect(wrapper.find('#is-bonus-submission-message').text()).toEqual(
           "This submission used one of your bonus submissions."
        );
    });

    test('does_not_count_for_user message - is group member === true ' +
         '&& does_not_count_for_current_user === true',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                does_not_count_for: [user.username]
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_group_member).toBe(true);
        expect(wrapper.vm.does_not_count_for_current_user).toBe(true);
        expect(wrapper.find('#does-not-count-for-user-message').exists()).toBe(true);
    });

    test('does_not_count_for_user message - is group member === true AND ' +
              'does_not_count_for_current_user === false',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                does_not_count_for: ["Alexis"]
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_group_member).toBe(true);
        expect(wrapper.vm.does_not_count_for_current_user).toBe(false);
        expect(wrapper.find('#does-not-count-for-user-message').exists()).toBe(false);
    });

    test('does_not_count_for_user message - is group member === false', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                does_not_count_for: ["Alexis"]
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        user.username = "Moira";
        globals.current_user = user;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_group_member).toBe(false);
        expect(wrapper.vm.does_not_count_for_current_user).toBe(false);
        expect(wrapper.find('#does-not-count-for-user-message').exists()).toBe(false);
    });

    test('show_score - status === received', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.received
            },
            {
                total_points: 10.25,
                total_points_possible: 15
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.show_score).toBe(false);
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('show_score - status === removed_from_queue', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.removed_from_queue
            },
            {
                total_points: 10.25,
                total_points_possible: 15
            }
        );

        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.show_score).toBe(false);
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('show_score - status === being_graded', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.being_graded
            },
            {
                total_points: 10.25,
                total_points_possible: 15
            }
        );

        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.show_score).toBe(false);
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('show_score - status === waiting_for_deferred', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.waiting_for_deferred
            },
            {
                total_points: 10.25,
                total_points_possible: 15
            }
        );

        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.show_score).toBe(true);
        expect(wrapper.find('#submission-score').exists()).toBe(true);
        expect(wrapper.find('#submission-score').text()).toContain("10.25/15");
    });

    test('show_score - status === error', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.error
            },
            {
                total_points: 10.25,
                total_points_possible: 15
            }
        );

        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.show_score).toBe(false);
        expect(wrapper.find('#submission-score').exists()).toBe(false);
    });

    test('show_score - status === finished_grading, points possible nonzero', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.finished_grading
            },
            {
                total_points: 10.25,
                total_points_possible: 15
            }
        );

        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.show_score).toBe(true);
        expect(wrapper.find('#submission-score').exists()).toBe(true);
        expect(wrapper.find('#submission-score').text()).toContain("10.25/15");
    });

    test('show_score - status === finished_grading, points possible zero', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.finished_grading
            },
            {
                total_points: 0,
                total_points_possible: 0
            }
        );

        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.show_score).toBe(false);
        expect(wrapper.find('#submission-score').exists()).toBe(false);

        expect(wrapper.find('#deferred-tests-message').text()).toContain('All tests finished');
    });

    test('submitted files are listed', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                submitted_filenames: [
                    "file_a",
                    "file_b",
                    "file_c"
                ]
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.submitted-file').length).toEqual(3);
        expect(wrapper.findAll('.submitted-file').at(0).text()).toEqual("file_a");
        expect(wrapper.findAll('.submitted-file').at(1).text()).toEqual("file_b");
        expect(wrapper.findAll('.submitted-file').at(2).text()).toEqual("file_c");
    });

    test('downloading a file', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                submitted_filenames: [
                    "file_a",
                    "file_b",
                    "file_c"
                ]
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        get_file_content_stub = sinon.stub(wrapper.vm.submission!, 'get_file_content').returns(
            Promise.resolve(
                "File b contents"
            )
        );

        let middle_file = wrapper.findAll('.submitted-file').at(1);
        middle_file.find('.download-file-icon').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_file_content_stub.callCount).toEqual(1);
        expect(FileSaver.saveAs).toBeCalled();
    });

    test('viewing a file', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                submitted_filenames: [
                    "file_a",
                    "file_b",
                    "file_c"
                ]
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.submitted-file').length).toEqual(3);

        get_file_content_stub = sinon.stub(wrapper.vm.submission!, 'get_file_content').returns(
            Promise.resolve(
                Promise.resolve("File b contents")
            )
        );
        let multi_file_viewer = <MultiFileViewer> (wrapper.find(
            {ref: 'view_submission_result_files'}
        )).vm;
        expect(multi_file_viewer.files_currently_viewing.length).toEqual(0);

        let file_b_row = wrapper.findAll('.submitted-file').at(1);
        file_b_row.find('.open-file').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_file_content_stub.calledOnce).toBe(true);
        expect(multi_file_viewer.files_currently_viewing.length).toEqual(1);
    });

    test('adjust_feedback - is_staff === false', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.find('#adjust-feedback-section').exists()).toBe(false);
    });

    test('adjust_feedback - is_staff === true && status === removed_from_queue', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.removed_from_queue
            }
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        user.username = "Moira";
        user_roles.is_staff = true;

        globals.user_roles = user_roles;
        globals.current_user = user;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.submission!.status).toEqual(ag_cli.GradingStatus.removed_from_queue);
        expect(wrapper.find('#adjust-feedback-section').exists()).toBe(false);
    });

    test('adjust_feedback - is_staff === true && is_admin === false ' +
         '&& is_group_member === false',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        user.username = "Moira";
        globals.current_user = user;
        user_roles.is_staff = true;
        globals.user_roles = user_roles;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_group_member).toBe(false);
        expect(wrapper.vm.d_globals.user_roles!.is_admin).toBe(false);
        expect(wrapper.find({ref: 'staff_viewer_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'ultimate_submission_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'normal_feedback_option'}).exists()).toBe(false);
        expect(wrapper.find({ref: 'past_limit_feedback_option'}).exists()).toBe(false);
        expect(wrapper.find({ref: 'max_feedback_option'}).exists()).toBe(false);
    });

    test('adjust_feedback - is_staff === true && is_admin === false ' +
         '&& is_group_member === true',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        user_roles.is_staff = true;
        globals.user_roles = user_roles;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_group_member).toBe(true);
        expect(wrapper.vm.d_globals.user_roles!.is_admin).toBe(false);
        expect(wrapper.find({ref: 'staff_viewer_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'ultimate_submission_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'normal_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'past_limit_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'max_feedback_option'}).exists()).toBe(true);
    });

    test('adjust_feedback - is_staff === true && is_admin === true ' +
         '&& is_group_member === false',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group
        );
        get_submission_result_stub.returns(Promise.resolve(submission_with_results.results));

        user.username = "Moira";
        user_roles.is_staff = true;
        user_roles.is_admin = true;
        globals.user_roles = user_roles;
        globals.current_user = user;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_group_member).toBe(false);
        expect(wrapper.vm.d_globals.user_roles!.is_admin).toBe(true);
        expect(wrapper.find({ref: 'staff_viewer_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'ultimate_submission_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'normal_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'past_limit_feedback_option'}).exists()).toBe(true);
        expect(wrapper.find({ref: 'max_feedback_option'}).exists()).toBe(true);
    });

    test('adjust_feedback - select different feedback category', async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.resolves(submission_with_results.results);

        user_roles.is_staff = true;
        globals.user_roles = user_roles;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(get_submission_result_stub.callCount).toEqual(0);

        let adjust_feedback_category_input = wrapper.find('#adjust-feedback-select');
        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.staff_viewer);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.staff_viewer);
        expect(get_submission_result_stub.callCount).toEqual(1);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.staff_viewer)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.ultimate_submission);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.ultimate_submission);
        expect(get_submission_result_stub.callCount).toEqual(2);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.ultimate_submission)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.normal);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.normal);
        expect(get_submission_result_stub.callCount).toEqual(3);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.normal)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.past_limit_submission);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_fdbk_category).toEqual(
            ag_cli.FeedbackCategory.past_limit_submission
        );
        expect(get_submission_result_stub.callCount).toEqual(4);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.past_limit_submission)
        ).toBe(true);

        adjust_feedback_category_input.setValue(ag_cli.FeedbackCategory.max);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_submission_result_stub.callCount).toEqual(5);
        expect(get_submission_result_stub.calledWith(
            submission_with_results.pk, ag_cli.FeedbackCategory.max)
        ).toBe(true);
    });

    test('mutation-suite-results -- student_test_suite_results.length === 0', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_submission_fdbk_override!.student_test_suite_results.length).toEqual(0);
        expect(wrapper.find({ref: 'mutation_suite_results'}).exists()).toBe(false);
    });

    test('mutation-suite-results -- student_test_suite_results.length !== 0', async () => {
        let mutation_test_suite_pk = 1;
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {},
            {
                student_test_suite_results: [
                    data_ut.make_mutation_test_suite_result_feedback(mutation_test_suite_pk),
                    data_ut.make_mutation_test_suite_result_feedback(mutation_test_suite_pk)
                ]
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_submission_fdbk_override!.student_test_suite_results.length).toEqual(2);
        expect(wrapper.find({ref: 'mutation_suite_results'}).exists()).toBe(true);
    });

    test('ag-test-suite-results -- ag_test_suite_results.length === 0', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_submission_fdbk_override!.ag_test_suite_results.length).toEqual(0);
        expect(wrapper.find({ref: 'ag_test_suite_results'}).exists()).toBe(false);
    });

    test('ag-test-suite-results -- ag_test_suite_results.length !== 0', async () => {
        let ag_test_suite_pk = 1;
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {},
            {
                ag_test_suite_results: [
                    data_ut.make_ag_test_suite_result_feedback(ag_test_suite_pk),
                    data_ut.make_ag_test_suite_result_feedback(ag_test_suite_pk)
                ]
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_submission_fdbk_override!.ag_test_suite_results.length).toEqual(2);
        expect(wrapper.find({ref: 'ag_test_suite_results'}).exists()).toBe(true);
    });

    test('remove-submission-from-queue button is present only while ' +
         'GradingStatus === (received || queued)',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.being_graded
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(false);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.error
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(false);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.finished_grading
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(false);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.queued
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(true);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.received
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(true);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.removed_from_queue
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(false);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.waiting_for_deferred
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.find('#remove-submission-from-queue-button').exists()).toBe(false);
    });

    test('Remove submission from queue - cancel action', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.queued
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(false);

        wrapper.find('#remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(true);

        wrapper.find('#cancel-remove-submission-from-queue-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_remove_submission_from_queue_modal).toBe(false);
    });

    test('Remove submission from queue - confirm action - successful', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.queued
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        remove_submission_from_queue_stub = sinon.stub(wrapper.vm.submission!, 'remove_from_queue');

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
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.queued
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        remove_submission_from_queue_stub = sinon.stub(
            wrapper.vm.submission!, 'remove_from_queue'
        ).returns(Promise.reject(
            new ag_cli.HttpError(400, {__all__: "This submission is not currently queued"})
        ));

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

    test('determine_feedback_type -- user is staff && is_group_member', async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.resolves(submission_with_results.results);

        user_roles.is_staff = true;
        globals.user_roles = user_roles;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles!.is_staff).toBe(true);
        expect(wrapper.vm.is_group_member).toBe(true);
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
    });

    test('determine_feedback_type -- is_ultimate_submission && is_admin', async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.resolves(submission_with_results.results);

        user.username = "Moira";
        user_roles.is_staff = true;
        user_roles.is_admin = true;
        globals.user_roles = user_roles;
        globals.current_user = user;

        wrapper = make_wrapper(submission_with_results, course, group, true, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles!.is_staff).toBe(true);
        expect(wrapper.vm.is_ultimate_submission).toBe(true);
        expect(wrapper.vm.d_globals.user_roles!.is_admin).toBe(true);
        expect(wrapper.vm.is_group_member).toBe(false);
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
    });

    test('determine_feedback_type -- !is_ultimate_submission && !is_admin && !is_group_member',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.resolves(submission_with_results.results);

        user.username = "Moira";
        user_roles.is_staff = true;
        globals.user_roles = user_roles;
        globals.current_user = user;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles!.is_staff).toBe(true);
        expect(wrapper.vm.is_ultimate_submission).toBe(false);
        expect(wrapper.vm.d_globals.user_roles!.is_admin).toBe(false);
        expect(wrapper.vm.is_group_member).toBe(false);
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.staff_viewer);
    });

    test('determine_feedback_type -- !is_staff && is_ultimate_submission', async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, true, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles!.is_staff).toBe(false);
        expect(wrapper.vm.is_ultimate_submission).toBe(true);
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.ultimate_submission);
    });

    test('determine_feedback_type -- !is_staff && !is_ultimate_submission ' +
         '&& is_past_daily_limit',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                is_past_daily_limit: true
            }
        );

        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles!.is_staff).toBe(false);
        expect(wrapper.vm.is_ultimate_submission).toBe(false);
        expect(wrapper.vm.submission!.is_past_daily_limit).toBe(true);
        expect(wrapper.vm.d_fdbk_category).toEqual(
            ag_cli.FeedbackCategory.past_limit_submission
        );
    });

    test('determine_feedback_type -- !is_staff && !is_ultimate_submission ' +
         '&& !is_past_daily_limit',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(group);
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles!.is_staff).toBe(false);
        expect(wrapper.vm.is_ultimate_submission).toBe(false);
        expect(wrapper.vm.submission!.is_past_daily_limit).toBe(false);
        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.normal);
    });

    test('show_auto_update_msg - is_staff === false', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.being_graded
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles.is_staff).toBe(false);
        expect(wrapper.vm.show_auto_update_msg).toBe(true);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.error
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.vm.show_auto_update_msg).toBe(false);
        expect(wrapper.find('#auto-update-message').exists()).toBe(false);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.finished_grading
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.vm.show_auto_update_msg).toBe(false);
        expect(wrapper.find('#auto-update-message').exists()).toBe(false);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.received
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.vm.show_auto_update_msg).toBe(true);
        expect(wrapper.find('#auto-update-message').exists()).toBe(true);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.removed_from_queue
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.vm.show_auto_update_msg).toBe(false);
        expect(wrapper.find('#auto-update-message').exists()).toBe(false);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.queued
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.vm.show_auto_update_msg).toBe(true);
        expect(wrapper.find('#auto-update-message').exists()).toBe(true);

        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.waiting_for_deferred
            }
        );
        wrapper.setProps({submission_with_results: submission_with_results});
        expect(wrapper.vm.show_auto_update_msg).toBe(false);
        expect(wrapper.find('#auto-update-message').exists()).toBe(false);
    });

    test('auto_update message - status === waiting_for_deferred && is_staff === true',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.waiting_for_deferred
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        user_roles.is_staff = true;
        globals.user_roles = user_roles;

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_globals.user_roles.is_staff).toBe(true);
        expect(wrapper.vm.show_auto_update_msg).toBe(true);
        expect(wrapper.find('#auto-update-message').exists()).toBe(true);
        expect(wrapper.find('#deferred-tests-message').text()).toContain('Core tests finished');
    });

    test('does_not_count_for_current_users -- does_not_count_for contains username',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                does_not_count_for: [user.username, "David"]
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.does_not_count_for_current_user).toBe(true);
    });

    test('does_not_count_for_current_users -- does_not_count_for does not contain username',
         async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                does_not_count_for: ["David"]
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.does_not_count_for_current_user).toBe(false);
    });

    test('is_group_member -- member_names does not contain username', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.being_graded
            }
        );
        user.username = "Moira";
        globals.current_user = user;
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.group.member_names.length).toEqual(3);
        expect(wrapper.vm.group.member_names[0]).not.toEqual(user.username);
        expect(wrapper.vm.group.member_names[1]).not.toEqual(user.username);
        expect(wrapper.vm.group.member_names[2]).not.toEqual(user.username);
        expect(wrapper.vm.is_group_member).toBe(false);
    });

    test('is_group_member -- member_names contains username', async () => {
        submission_with_results = data_ut.make_submission_with_results(
            group,
            {
                status: ag_cli.GradingStatus.being_graded
            }
        );
        get_submission_result_stub.resolves(submission_with_results.results);

        wrapper = make_wrapper(submission_with_results, course, group, false, globals);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.group.member_names[0]).toEqual(user.username);
        expect(wrapper.vm.is_group_member).toBe(true);
    });
});
