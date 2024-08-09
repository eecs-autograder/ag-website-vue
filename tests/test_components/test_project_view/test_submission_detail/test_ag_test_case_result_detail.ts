import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import AGTestCaseResultDetail from '@/components/project_view/submission_detail/ag_test_case_result_detail.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';

import * as data_ut from '@/tests/data_utils';

let group: ag_cli.Group;
let project: ag_cli.Project;
let submission: ag_cli.Submission;
let user: ag_cli.User;
let ag_test_case_result: ag_cli.AGTestCaseResultFeedback;

beforeEach(() => {
    user = data_ut.make_user();
    project = data_ut.make_project(1);
    group = data_ut.make_group(project.pk, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
    ag_test_case_result = data_ut.make_ag_test_case_result_feedback(1);
});

describe('command_result_correctness tests', () => {
    let wrapper: Wrapper<AGTestCaseResultDetail>;

    beforeEach(() => {
        wrapper = mount(AGTestCaseResultDetail, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission,
            }
        });
    });

    test('command_result_correctness - return_code_correctness === not_available AND' +
         ' output_correctness === not_available',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: null,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_correctness - return_code_correctness === not_available AND' +
         ' output_correctness === info_only',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: null,
                stderr_correct: null
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_stderr = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('command_result_correctness - return_code_correctness === not_available AND' +
         ' output_correctness === none_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: false,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness === not_available AND' +
         ' output_correctness === some_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: true,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness === not_available AND' +
         ' output_correctness === all_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_correctness - return_code_correctness === info_only AND' +
         ' output_correctness === not_available',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: null,
                stderr_correct: null
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('command_result_correctness - return_code_correctness === info_only AND' +
         ' output_correctness === info_only',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: null,
                stderr_correct: null
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('command_result_correctness - return_code_correctness === info_only AND' +
         ' output_correctness === none_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - total_points < 0', async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;
        ag_test_command_result.total_points = -1;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - total_points === 0 && total_points_possible !== 0',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;
        ag_test_command_result.total_points = 0;
        ag_test_command_result.total_points_possible = 5;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness === info_only AND' +
         ' output_correctness === some_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: false,
                stderr_correct: true
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness === info_only AND' +
         ' output_correctness === all_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_correctness - return_code_correctness === none_correct AND' +
         ' output_correctness === not_available',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: null,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness === none_correct AND' +
         ' output_correctness === info_only',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: null,
                stderr_correct: null
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness === none_correct AND' +
         ' output_correctness === none_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness === none_correct AND' +
         ' output_correctness === some_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness === none_correct AND' +
         ' output_correctness === all_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness === all_correct AND' +
         ' output_correctness === not_available',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: null,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_correctness - return_code_correctness === all_correct AND' +
         ' output_correctness === info_only',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: null,
                stderr_correct: null
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_correctness - return_code_correctness === all_correct AND' +
         ' output_correctness === none_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness === all_correct AND' +
         ' output_correctness === some_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness === all_correct AND' +
         ' output_correctness === all_correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stderr_correct
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });
});

describe('command_result_return_code_correctness tests', () => {
    let wrapper: Wrapper<AGTestCaseResultDetail>;

    beforeEach(() => {
        wrapper = mount(AGTestCaseResultDetail, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission
            }
        });
    });

    test('command_result_return_code_correctness - return_code_correct === null', async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_return_code_correctness - return_code_correct === null ' +
         '&& show_actual_return_code === true',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: null
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_return_code = true;

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('command_result_return_code_correctness - return_code_correct is true', async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_return_code_correctness - return_code_correct is false', async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });
});

describe('command_result_output_correctness tests', () => {
    let wrapper: Wrapper<AGTestCaseResultDetail>;

    beforeEach(() => {
        wrapper = mount(AGTestCaseResultDetail, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission
            }
        });
    });

    test('command_result_output_correctness - output is not available', async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.not_available);
    });

    test('command_result_output_correctness - output is correct', async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: null,
                stdout_points_possible: 0,
                stderr_points_possible: 0
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.all_correct);
    });

    test('command_result_output_correctness - output is not correct',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(
            ag_test_command_result.stdout_correct
        )).toEqual(CorrectnessLevel.none_correct);
    });
});

describe('AGTestCaseResult tests concerning props', () => {
    let wrapper: Wrapper<AGTestCaseResultDetail>;

    beforeEach(() => {
        wrapper = mount(AGTestCaseResultDetail, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission,
            }
        });
    });

    test('ag_test_case_result prop changes reflected in html', async () => {
        ag_test_case_result = data_ut.make_ag_test_case_result_feedback(
            1,
            {
                ag_test_command_results: [
                    data_ut.make_ag_test_command_result_feedback(1),
                    data_ut.make_ag_test_command_result_feedback(1)
                ]
            }
        );

        wrapper = mount(AGTestCaseResultDetail, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission,
            }
        });

        expect(wrapper.findAllComponents({ref: 'ag_test_command_panel'}).length).toEqual(2);
        expect(wrapper.vm.command_result_correctness(
            wrapper.vm.ag_test_case_result.ag_test_command_results[0]
        )).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.command_result_correctness(
            wrapper.vm.ag_test_case_result.ag_test_command_results[1]
        )).toEqual(CorrectnessLevel.not_available);

        let updated_ag_test_case_result = data_ut.make_ag_test_case_result_feedback(
            ag_test_case_result.ag_test_case_pk,
            {
                ag_test_command_results: [
                    data_ut.make_ag_test_command_result_feedback(
                        1,
                        {
                            return_code_correct: true,
                            stdout_correct: true,
                            stderr_correct: true
                        }
                    ),
                    data_ut.make_ag_test_command_result_feedback(
                        2,
                        {
                            return_code_correct: false,
                            stdout_correct: false,
                            stderr_correct: true
                        }
                    )
                ],
                total_points: 1000
            }
        );

        await wrapper.setProps({ag_test_case_result: updated_ag_test_case_result});

        expect(wrapper.vm.command_result_correctness(
            wrapper.vm.ag_test_case_result.ag_test_command_results[0]
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(
            wrapper.vm.ag_test_case_result.ag_test_command_results[1]
        )).toEqual(CorrectnessLevel.some_correct);
    });
});

describe('Test Case Descriptions', () => {
    test('Staff description shown to staff', () => {
        fail();
    });

    test('Staff description not shown to student', () => {
        fail();
    });

    test('Student description visible', () => {
        fail();
    });

    test('Student description hidden', () => {
        fail();
    });
});
