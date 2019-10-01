import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import AGSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

import * as data_ut from '@/tests/data_utils';

let group: ag_cli.Group;
let submission: ag_cli.Submission;
let user: ag_cli.User;
let ag_test_suite_result: ag_cli.AGTestSuiteResultFeedback;
let ag_test_case_result: ag_cli.AGTestCaseResultFeedback;
let ag_test_command_1_result: ag_cli.AGTestCommandResultFeedback;
let ag_test_command_2_result: ag_cli.AGTestCommandResultFeedback;
let ag_test_command_3_result: ag_cli.AGTestCommandResultFeedback;

beforeEach(() => {
    user = data_ut.make_user();
    group = data_ut.make_group(1, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
    ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(1);
    ag_test_case_result = data_ut.make_ag_test_case_result_feedback(1);
    ag_test_command_1_result = data_ut.make_ag_test_command_result_feedback(
        1,
        {
            stdout_points_possible: 1,
            stderr_points_possible: 1
        }
    );
    ag_test_command_2_result = data_ut.make_ag_test_command_result_feedback(
        2,
        {
            stdout_points_possible: 1,
            stderr_points_possible: 1
        }
    );
    ag_test_command_3_result = data_ut.make_ag_test_command_result_feedback(
        3,
        {
            stdout_points_possible: 1,
            stderr_points_possible: 1
        }
    );

    ag_test_case_result.ag_test_command_results = [
        ag_test_command_1_result,
        ag_test_command_2_result,
        ag_test_command_3_result
    ];

    ag_test_suite_result.ag_test_case_results = [
        ag_test_case_result
    ];
});

describe('case_result_correctness tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    beforeEach(() => {
        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
    });

    test('case_result_correctness - return_code_correctness === CorrectnessLevel.not_available',
         async () => {
        ag_test_command_1_result.fdbk_settings.show_actual_stdout = true;
        ag_test_command_1_result.stdout_points_possible = 0;
        ag_test_command_1_result.stderr_points_possible = 0;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBeNull();

        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBeNull();

        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBeNull();

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.output_only
        );
    });

    test('case_result_correctness - output_correctness === CorrectnessLevel.not_available',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBeNull();

        ag_test_command_2_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBeNull();

        ag_test_command_3_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBeNull();

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_correctness - total_points === 0 && total_points_possible !== 0',
         async () => {
        ag_test_case_result.total_points = 0;
        ag_test_case_result.total_points_possible = 10;

        ag_test_command_1_result.return_code_correct = false;
        ag_test_command_1_result.stdout_correct = true;
        ag_test_command_1_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = false;
        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(true);

        ag_test_command_3_result.return_code_correct = false;
        ag_test_command_3_result.stdout_correct = true;
        ag_test_command_3_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });


    test('case_result_correctness - return_code_correctness === all_correct && ' +
         'output_correctness === all_correct',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        ag_test_command_1_result.stdout_correct = true;
        ag_test_command_1_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = true;
        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(true);

        ag_test_command_3_result.return_code_correct = true;
        ag_test_command_3_result.stdout_correct = true;
        ag_test_command_3_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_correctness - return_code_correctness === all_correct && ' +
         'output_correctness === output_only',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        ag_test_command_1_result.fdbk_settings.show_actual_stderr = true;
        ag_test_command_1_result.stdout_points_possible = 0;
        ag_test_command_1_result.stderr_points_possible = 0;

        expect(ag_test_case_result.ag_test_command_results[0].stdout_points_possible).toEqual(0);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_points_possible).toEqual(0);
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBeNull();

        ag_test_command_2_result.return_code_correct = true;
        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(true);

        ag_test_command_3_result.return_code_correct = true;
        ag_test_command_3_result.stdout_correct = true;
        ag_test_command_3_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_correctness - return_code_correctness === none_correct && ' +
         'output_correctness === none_correct',
         async () => {
        ag_test_command_1_result.return_code_correct = false;
        ag_test_command_1_result.stdout_correct = false;
        ag_test_command_1_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(false);

        ag_test_command_2_result.return_code_correct = false;
        ag_test_command_2_result.stdout_correct = false;
        ag_test_command_2_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(false);

        ag_test_command_3_result.return_code_correct = false;
        ag_test_command_3_result.stdout_correct = false;
        ag_test_command_3_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(false);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_correctness - return_code_correctness === some_correct', async () => {

        ag_test_command_1_result.return_code_correct = false;
        ag_test_command_1_result.stdout_correct = true;
        ag_test_command_1_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = true;
        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(true);

        ag_test_command_3_result.return_code_correct = true;
        ag_test_command_3_result.stdout_correct = true;
        ag_test_command_3_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - output_correctness === some_correct', async () => {
        ag_test_command_1_result.return_code_correct = true;
        ag_test_command_1_result.stdout_correct = true;
        ag_test_command_1_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = true;
        ag_test_command_2_result.stdout_correct = false;
        ag_test_command_2_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(true);

        ag_test_command_3_result.return_code_correct = true;
        ag_test_command_3_result.stdout_correct = true;
        ag_test_command_3_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(false);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - return_code_correctness === all_correct && ' +
         'output_correctness === none_correct',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        ag_test_command_1_result.stdout_correct = false;
        ag_test_command_1_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(false);

        ag_test_command_2_result.return_code_correct = true;
        ag_test_command_2_result.stdout_correct = false;
        ag_test_command_2_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(false);

        ag_test_command_3_result.return_code_correct = true;
        ag_test_command_3_result.stdout_correct = false;
        ag_test_command_3_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(false);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - return_code_correctness === none_correct && ' +
         'output_correctness === all_correct',
         async () => {
        ag_test_command_1_result.return_code_correct = false;
        ag_test_command_1_result.stdout_correct = true;
        ag_test_command_1_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = false;
        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(true);

        ag_test_command_3_result.return_code_correct = false;
        ag_test_command_3_result.stdout_correct = true;
        ag_test_command_3_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_return_code_correctness - all commands have return_code_correct === null',
         async () => {
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBeNull();

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('case_result_return_code_correctness - all commands have return_code_correct === true',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(true);

        ag_test_command_3_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_return_code_correctness - all commands have ' +
         'return_code_correct === true || null',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);

        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBeNull();

        ag_test_command_3_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_return_code_correctness - all commands have return_code_correct === false',
         async () => {
        ag_test_command_1_result.return_code_correct = false;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(false);

        ag_test_command_2_result.return_code_correct = false;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(false);

        ag_test_command_3_result.return_code_correct = false;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(false);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_return_code_correctness - some commands have return_code_correct ' +
         '=== false but not all',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = false;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(false);

        ag_test_command_3_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(true);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct === null ' +
         'AND stderr_correct === null',
         async () => {
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBeNull();

        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBeNull();

        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBeNull();

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('case_result_output_correctness - every command has stdout_correct === null ' +
              'AND stderr_correct === null, and at least one command has ' +
              'stdout_points_possible === 0 AND stderr_points_possible === 0 ' +
              'AND show_actual_stdout === true or show_actual_stderr === true',
         async () => {
        ag_test_command_1_result.fdbk_settings.show_actual_stdout = true;
        ag_test_command_1_result.stdout_points_possible = 0;
        ag_test_command_1_result.stderr_points_possible = 0;
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stdout_points_possible).toEqual(0);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_points_possible).toEqual(0);
        expect(
            ag_test_case_result.ag_test_command_results[0].fdbk_settings.show_actual_stdout
        ).toBe(true);
        expect(
            ag_test_case_result.ag_test_command_results[0].fdbk_settings.show_actual_stderr
        ).toBe(false);

        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBeNull();

        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBeNull();

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.output_only
        );

        ag_test_command_1_result.fdbk_settings.show_actual_stdout = false;
        ag_test_command_1_result.fdbk_settings.show_actual_stderr = true;

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.output_only
        );
    });

    test('case_result_output_correctness - every command has stdout_correct === true ' +
         'AND stderr_correct === true',
         async () => {
        ag_test_command_1_result.stdout_correct = true;
        ag_test_command_1_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(true);

        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(true);

        ag_test_command_3_result.stdout_correct = true;
        ag_test_command_3_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(true);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct === true || null ' +
         'AND stderr_correct === true || null',
         async () => {
        ag_test_command_1_result.stdout_correct = null;
        ag_test_command_1_result.stderr_correct = null;
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBeNull();

        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = null;
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBeNull();

        ag_test_command_3_result.stdout_correct = null;
        ag_test_command_3_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(true);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = false ' +
         'AND stderr_correct = false',
         async () => {
        ag_test_command_1_result.stdout_correct = false;
        ag_test_command_1_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(false);

        ag_test_command_2_result.stdout_correct = false;
        ag_test_command_2_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(false);

        ag_test_command_3_result.stdout_correct = false;
        ag_test_command_3_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(false);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_output_correctness - some commands have stdout_correct = false ' +
         'AND stderr_correct = false but not all',
         async () => {
        ag_test_command_1_result.stdout_correct = false;
        ag_test_command_1_result.stderr_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[0].stderr_correct).toBe(true);

        ag_test_command_2_result.stdout_correct = true;
        ag_test_command_2_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[1].stdout_correct).toBe(true);
        expect(ag_test_case_result.ag_test_command_results[1].stderr_correct).toBe(false);

        ag_test_command_3_result.stdout_correct = false;
        ag_test_command_3_result.stderr_correct = false;
        expect(ag_test_case_result.ag_test_command_results[2].stdout_correct).toBe(false);
        expect(ag_test_case_result.ag_test_command_results[2].stderr_correct).toBe(false);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });
});

describe('setup_correctness_level tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    beforeEach(() => {
        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
    });

    test('setup_correctness_level - setup_return_code === 0', async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = 0;

        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).not.toBeNull();
        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).toEqual(0);
        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('setup_correctness_level - setup_return_code === null', async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = null;

        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('setup_correctness_level - setup_return_code !== 0 && setup_return_code !== null',
         async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = 1;

        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).not.toBeNull();
        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).not.toEqual(0);
        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.none_correct
        );
    });
});

describe('panel_is_active - setup_case tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    test('decide_whether_to_open_setup - setup_correctness_level === none_correct',
         async () => {
        ag_test_suite_result.setup_return_code = 1;

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.d_first_incorrect_setup).toEqual(wrapper.vm.d_ag_test_suite_result);
    });

    test('decide_whether_to_open_setup - setup_correctness_level === all_correct ' +
         'AND setup_timed_out === true',
         async () => {
        ag_test_suite_result.setup_return_code = 0;
        ag_test_suite_result.setup_timed_out = true;

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).toBe(0);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_timed_out).toBe(true);
        expect(wrapper.vm.d_first_incorrect_setup).toEqual(wrapper.vm.d_ag_test_suite_result);
    });

    test('decide_whether_to_open_setup - setup_correctness_level === all_correct ' +
         'AND setup_timed_out === false',
         async () => {
        ag_test_suite_result.setup_return_code = 0;
        ag_test_suite_result.setup_timed_out = false;

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).toBe(0);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_timed_out).toBe(false);
        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
    });

    test('decide_whether_to_open_setup - setup_correctness_level === all_correct ' +
         'AND setup_timed_out === null',
         async () => {
        ag_test_suite_result.setup_return_code = 0;

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).toBe(0);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
    });

    test('decide_whether_to_open_setup - setup_correctness_level === not_available', async () => {
        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.not_available);
        expect(wrapper.vm.d_ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.vm.d_ag_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
    });

    test('setup_panel_is_active - is_first_suite === true AND' +
         'd_first_incorrect_setup !== d_ag_test_suite_result',
         async () => {
        ag_test_suite_result.setup_return_code = 1;

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
            }
        });

        expect(wrapper.vm.is_first_suite).toBe(false);
        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.d_first_incorrect_setup).toEqual(wrapper.vm.d_ag_test_suite_result);
        expect(wrapper.vm.setup_panel_is_active).toBe(false);
    });


    test('setup_panel_is_active - is_first_suite === true AND' +
         'd_first_incorrect_setup === d_ag_test_suite_result',
         async () => {
        ag_test_suite_result.setup_return_code = 1;

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                is_first_suite: true
            }
        });

        expect(wrapper.vm.is_first_suite).toBe(true);
        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.d_first_incorrect_setup).toEqual(wrapper.vm.d_ag_test_suite_result);
        expect(wrapper.vm.setup_panel_is_active).toBe(true);
    });

    test('setup_panel_is_active - is_first_suite === true AND' +
         'd_first_incorrect_setup !== d_ag_test_suite_result',
         async () => {
        ag_test_suite_result.setup_return_code = 0;

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                is_first_suite: true
            }
        });

        expect(wrapper.vm.is_first_suite).toBe(true);
        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
        expect(wrapper.vm.setup_panel_is_active).toBe(false);
    });
});

describe('panel_is_active - case tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    let ag_test_case_red_result: ag_cli.AGTestCaseResultFeedback;
    let ag_test_command_red_1_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_red_2_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_red_3_result: ag_cli.AGTestCommandResultFeedback;

    let ag_test_case_green_result: ag_cli.AGTestCaseResultFeedback;
    let ag_test_command_green_1_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_green_2_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_green_3_result: ag_cli.AGTestCommandResultFeedback;

    beforeEach(() => {
        ag_test_case_red_result = data_ut.make_ag_test_case_result_feedback(1);
        ag_test_command_red_1_result = data_ut.make_ag_test_command_result_feedback(1);
        ag_test_command_red_2_result = data_ut.make_ag_test_command_result_feedback(2);
        ag_test_command_red_3_result = data_ut.make_ag_test_command_result_feedback(3);

        ag_test_case_green_result = data_ut.make_ag_test_case_result_feedback(2);
        ag_test_command_green_1_result = data_ut.make_ag_test_command_result_feedback(4);
        ag_test_command_green_2_result = data_ut.make_ag_test_command_result_feedback(5);
        ag_test_command_green_3_result = data_ut.make_ag_test_command_result_feedback(6);

        ag_test_case_red_result.ag_test_command_results = [
            ag_test_command_red_1_result,
            ag_test_command_red_2_result,
            ag_test_command_red_3_result
        ];

        ag_test_case_green_result.ag_test_command_results = [
          ag_test_command_green_1_result,
          ag_test_command_green_2_result,
          ag_test_command_green_3_result
        ];

        ag_test_suite_result.ag_test_case_results = [
            ag_test_case_red_result,
            ag_test_case_green_result
        ];
    });

    test('decide_whether_to_open_case - first_incorrect_setup !== null', async () => {
        ag_test_suite_result.setup_return_code = 1;

        for (let command of ag_test_case_red_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = false;
            command.stderr_correct = false;
        }

        for (let command of ag_test_case_green_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = false;
            command.stderr_correct = false;
        }

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.d_first_incorrect_setup).toEqual(wrapper.vm.d_ag_test_suite_result);
        expect(wrapper.vm.d_first_incorrect_case).toBeNull();
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        )).toBe(false);
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[1]
        )).toBe(false);
    });

    test('first_incorrect_setup === null && all cases have case_level_correctness ' +
         '=== none_correcct - d_first_incorrect_case applied to first incorrect case',
         async () => {
        for (let command of ag_test_case_red_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = false;
            command.stderr_correct = false;
        }

        for (let command of ag_test_case_green_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = false;
            command.stderr_correct = false;
        }

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
        expect(wrapper.vm.d_first_incorrect_case).toEqual(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        );
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        )).toBe(true);
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[1]
        )).toBe(false);
    });

    test('first_incorrect_setup === null && all cases have case_level_correctness ' +
         '=== all_correct - d_first_incorrect_case never set',
         async () => {
        for (let command of ag_test_case_red_result.ag_test_command_results) {
            command.return_code_correct = true;
            command.stdout_correct = true;
            command.stderr_correct = true;
        }

        for (let command of ag_test_case_green_result.ag_test_command_results) {
            command.return_code_correct = true;
            command.stdout_correct = true;
            command.stderr_correct = true;
        }

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
        expect(wrapper.vm.d_first_incorrect_case).toBeNull();
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        )).toBe(false);
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[1]
        )).toBe(false);
    });

    test('first_incorrect_setup === null && all cases have case_level_correctness ' +
         '=== some_correct - d_first_incorrect_case set to first incorrect case',
         async () => {
        for (let command of ag_test_case_red_result.ag_test_command_results) {
            command.return_code_correct = true;
            command.stdout_correct = true;
            command.stderr_correct = false;
        }

        for (let command of ag_test_case_green_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = true;
            command.stderr_correct = true;
        }

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
        expect(wrapper.vm.d_first_incorrect_case).toEqual(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        );
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        )).toBe(true);
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[1]
        )).toBe(false);
    });

    test('first_incorrect_setup === null && some cases have case_level_correctness ' +
         '=== all_correct - d_first_incorrect_case set to first incorrect case',
         async () => {
        for (let command of ag_test_case_red_result.ag_test_command_results) {
            command.return_code_correct = true;
            command.stdout_correct = true;
            command.stderr_correct = true;
        }

        for (let command of ag_test_case_green_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = true;
            command.stderr_correct = true;
        }

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.d_first_incorrect_setup).toBeNull();
        expect(wrapper.vm.d_first_incorrect_case).toEqual(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[1]
        );
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        )).toBe(false);
        expect(wrapper.vm.get_case_is_active(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[1]
        )).toBe(true);
    });
});

describe('panel_is_active - case tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    let ag_test_case_red_result: ag_cli.AGTestCaseResultFeedback;
    let ag_test_command_red_1_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_red_2_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_red_3_result: ag_cli.AGTestCommandResultFeedback;

    let ag_test_case_green_result: ag_cli.AGTestCaseResultFeedback;
    let ag_test_command_green_1_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_green_2_result: ag_cli.AGTestCommandResultFeedback;
    let ag_test_command_green_3_result: ag_cli.AGTestCommandResultFeedback;

    beforeEach(() => {
        ag_test_case_red_result = data_ut.make_ag_test_case_result_feedback(1);
        ag_test_command_red_1_result = data_ut.make_ag_test_command_result_feedback(1);
        ag_test_command_red_2_result = data_ut.make_ag_test_command_result_feedback(2);
        ag_test_command_red_3_result = data_ut.make_ag_test_command_result_feedback(3);

        ag_test_case_green_result = data_ut.make_ag_test_case_result_feedback(2);
        ag_test_command_green_1_result = data_ut.make_ag_test_command_result_feedback(4);
        ag_test_command_green_2_result = data_ut.make_ag_test_command_result_feedback(5);
        ag_test_command_green_3_result = data_ut.make_ag_test_command_result_feedback(6);

        ag_test_case_red_result.ag_test_command_results = [
            ag_test_command_red_1_result,
            ag_test_command_red_2_result,
            ag_test_command_red_3_result
        ];

        ag_test_case_green_result.ag_test_command_results = [
            ag_test_command_green_1_result,
            ag_test_command_green_2_result,
            ag_test_command_green_3_result
        ];

        ag_test_suite_result.ag_test_case_results = [
            ag_test_case_red_result,
            ag_test_case_green_result
        ];
    });

    test('submission Watcher', async () => {
        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.submission).toEqual(submission);

        let another_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: another_submission});

        expect(wrapper.vm.submission).toEqual(another_submission);
    });

    test('ag_test_suite_result Watcher', async () => {
        for (let command of ag_test_case_red_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = false;
            command.stderr_correct = false;
        }

        for (let command of ag_test_case_green_result.ag_test_command_results) {
            command.return_code_correct = false;
            command.stdout_correct = false;
            command.stderr_correct = false;
        }

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.d_ag_test_suite_result).toEqual(ag_test_suite_result);
        expect(wrapper.vm.d_first_incorrect_case).toEqual(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[0]
        );

        let updated_ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(
            1,
            {
                ag_test_suite_pk: ag_test_suite_result.pk
            }
        );

        let ag_test_case_blue_result = data_ut.make_ag_test_case_result_feedback(1);
        let ag_test_command_blue_1_result = data_ut.make_ag_test_command_result_feedback(1);
        let ag_test_command_blue_2_result = data_ut.make_ag_test_command_result_feedback(2);
        let ag_test_command_blue_3_result = data_ut.make_ag_test_command_result_feedback(3);

        let ag_test_case_purple_result = data_ut.make_ag_test_case_result_feedback(2);
        let ag_test_command_purple_1_result = data_ut.make_ag_test_command_result_feedback(4);
        let ag_test_command_purple_2_result = data_ut.make_ag_test_command_result_feedback(5);
        let ag_test_command_purple_3_result = data_ut.make_ag_test_command_result_feedback(6);

        ag_test_case_blue_result.ag_test_command_results = [
            ag_test_command_blue_1_result,
            ag_test_command_blue_2_result,
            ag_test_command_blue_3_result
        ];

        ag_test_case_purple_result.ag_test_command_results = [
            ag_test_command_purple_1_result,
            ag_test_command_purple_2_result,
            ag_test_command_purple_3_result
        ];

        updated_ag_test_suite_result.ag_test_case_results = [
            ag_test_case_red_result,
            ag_test_case_green_result
        ];

        for (let command of ag_test_case_red_result.ag_test_command_results) {
            command.return_code_correct = true;
            command.stdout_correct = true;
            command.stderr_correct = true;
        }

        for (let command of ag_test_case_green_result.ag_test_command_results) {
            command.return_code_correct = true;
            command.stdout_correct = true;
            command.stderr_correct = false;
        }

        wrapper.setProps({ag_test_suite_result: updated_ag_test_suite_result});

        expect(updated_ag_test_suite_result).not.toEqual(ag_test_suite_result);
        expect(wrapper.vm.d_ag_test_suite_result).toEqual(updated_ag_test_suite_result);
        expect(wrapper.vm.d_first_incorrect_case).toEqual(
            wrapper.vm.d_ag_test_suite_result!.ag_test_case_results[1]
        );
    });

    test('fdbk_category Watcher', async () => {
        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.max);

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.past_limit_submission});

        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.past_limit_submission);
    });
});
