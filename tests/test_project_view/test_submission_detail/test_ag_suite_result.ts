import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import AGSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import ResultPanel from '@/components/project_view/submission_detail/result_panel.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_shallow_mount } from '@/tests/setup';

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

function set_command_result_correctness(command: ag_cli.AGTestCommandResultFeedback,
                                        return_code_correctness: boolean | null,
                                        stdout_correctness: boolean | null,
                                        stderr_correctness: boolean | null) {
    command.return_code_correct = return_code_correctness;
    command.stdout_correct = stdout_correctness;
    command.stderr_correct = stderr_correctness;
}

function check_all_case_correctness_levels(wrapper: Wrapper<AGSuiteResult>,
                                           case_result: ag_cli.AGTestCaseResultFeedback,
                                           return_code_correctness: CorrectnessLevel,
                                           output_correctness: CorrectnessLevel,
                                           overall_correctness: CorrectnessLevel) {
    expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
        return_code_correctness
    );
    expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(output_correctness);
    expect(wrapper.vm.case_result_correctness(case_result)).toEqual(overall_correctness);
}

function make_wrapper(is_first_suite: boolean) {
    let wrapper = managed_shallow_mount(AGSuiteResult, {
        propsData: {
            submission: submission,
            ag_test_suite_result: ag_test_suite_result,
            fdbk_category: ag_cli.FeedbackCategory.max,
            is_first_suite: is_first_suite
        }
    });

    return wrapper;
}

describe('case_result_correctness tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    beforeEach(() => {
        wrapper = make_wrapper(false);
    });

    test('return_code_correctness === not_available AND output_correctness === not_available',
         async () => {
        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.not_available);
    });

    test('return_code_correctness === not_available AND output_correctness === info_only',
         async () => {
        ag_test_case_result.ag_test_command_results[2].stdout_points_possible = 0;
        ag_test_case_result.ag_test_command_results[2].stderr_points_possible = 0;
        ag_test_case_result.ag_test_command_results[2].fdbk_settings.show_actual_stdout = true;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.info_only);
    });

    test('return_code_correctness === not_available AND output_correctness === none_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, false, false);
        set_command_result_correctness(ag_test_command_2_result, null, false, false);
        set_command_result_correctness(ag_test_command_3_result, null, false, false);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.none_correct);
    });

    test('return_code_correctness === not_available AND output_correctness === some_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, true, true);
        set_command_result_correctness(ag_test_command_2_result, null, false, false);
        set_command_result_correctness(ag_test_command_3_result, null, false, false);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === not_available AND output_correctness === all_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, true, true);
        set_command_result_correctness(ag_test_command_2_result, null, true, true);
        set_command_result_correctness(ag_test_command_3_result, null, true, true);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.all_correct);
    });

    test('return_code_correctness === info_only AND output_correctness === not_available',
         async () => {
        ag_test_command_1_result.actual_return_code = 5;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.info_only);
    });

    test('return_code_correctness === info_only AND output_correctness === info_only',
         async () => {
        ag_test_command_1_result.actual_return_code = 5;

        ag_test_command_3_result.stdout_points_possible = 0;
        ag_test_command_3_result.stderr_points_possible = 0;
        ag_test_command_3_result.fdbk_settings.show_actual_stderr = true;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.info_only);
    });

    test('return_code_correctness === info_only AND output_correctness === none_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, false, false);
        set_command_result_correctness(ag_test_command_2_result, null, false, false);
        set_command_result_correctness(ag_test_command_3_result, null, false, false);

        ag_test_command_2_result.actual_return_code = 5;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.none_correct);
    });

    test('return_code_correctness === info_only AND output_correctness === some_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, false, true);
        set_command_result_correctness(ag_test_command_2_result, null, true, true);
        set_command_result_correctness(ag_test_command_3_result, null, null, false);

        ag_test_command_2_result.actual_return_code = 5;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === info_only AND output_correctness === all_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, true, true);
        set_command_result_correctness(ag_test_command_2_result, null, null, true);
        set_command_result_correctness(ag_test_command_3_result, null, true, null);

        ag_test_command_3_result.actual_return_code = 5;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.all_correct);
    });

    test('return_code_correctness === none_correct AND output_correctness === not_available',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, null, null);
        set_command_result_correctness(ag_test_command_2_result, false, null, null);
        set_command_result_correctness(ag_test_command_3_result, false, null, null);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.none_correct);
    });

    test('return_code_correctness === none_correct AND output_correctness === info_only',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, null, null);
        set_command_result_correctness(ag_test_command_2_result, false, null, null);
        set_command_result_correctness(ag_test_command_3_result, false, null, null);

        ag_test_command_2_result.stdout_points_possible = 0;
        ag_test_command_2_result.stderr_points_possible = 0;
        ag_test_command_2_result.fdbk_settings.show_actual_stderr = true;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.none_correct);
    });

    test('return_code_correctness === none_correct AND output_correctness === none_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, false, null);
        set_command_result_correctness(ag_test_command_2_result, false, null, false);
        set_command_result_correctness(ag_test_command_3_result, false, false, false);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.none_correct);
    });

    test('return_code_correctness === none_correct AND output_correctness === some_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, false, null);
        set_command_result_correctness(ag_test_command_2_result, false, null, true);
        set_command_result_correctness(ag_test_command_3_result, false, false, false);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === none_correct AND output_correctness === all_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, true, true);
        set_command_result_correctness(ag_test_command_2_result, false, true, true);
        set_command_result_correctness(ag_test_command_3_result, false, true, true);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === some_correct AND output_correctness === not_available',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, null, null);
        set_command_result_correctness(ag_test_command_2_result, true, null, null);
        set_command_result_correctness(ag_test_command_3_result, true, null, null);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === some_correct AND output_correctness === info_only',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, null, null);
        set_command_result_correctness(ag_test_command_2_result, true, null, null);
        set_command_result_correctness(ag_test_command_3_result, true, null, null);

        ag_test_command_1_result.stdout_points_possible = 0;
        ag_test_command_1_result.stderr_points_possible = 0;
        ag_test_command_1_result.fdbk_settings.show_actual_stderr = true;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === some_correct AND output_correctness === none_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, false, false);
        set_command_result_correctness(ag_test_command_2_result, true, null, null);
        set_command_result_correctness(ag_test_command_3_result, true, null, false);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === some_correct AND output_correctness === some_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, null, null);
        set_command_result_correctness(ag_test_command_2_result, true, true, null);
        set_command_result_correctness(ag_test_command_3_result, true, null, false);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === some_correct AND output_correctness === all_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, false, true, null);
        set_command_result_correctness(ag_test_command_2_result, true, true, true);
        set_command_result_correctness(ag_test_command_3_result, true, null, true);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === all_correct AND output_correctness === not_available',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, true, null, null);
        set_command_result_correctness(ag_test_command_2_result, true, null, null);
        set_command_result_correctness(ag_test_command_3_result, true, null, null);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.not_available,
                                          CorrectnessLevel.all_correct);
    });

    test('return_code_correctness === all_correct AND output_correctness === info_only',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, true, null, null);
        set_command_result_correctness(ag_test_command_2_result, true, null, null);
        set_command_result_correctness(ag_test_command_3_result, true, null, null);

        ag_test_command_3_result.stdout_points_possible = 0;
        ag_test_command_3_result.stderr_points_possible = 0;
        ag_test_command_3_result.fdbk_settings.show_actual_stdout = true;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.info_only,
                                          CorrectnessLevel.all_correct);
    });

    test('return_code_correctness === all_correct AND output_correctness === none_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, true, false, false);
        set_command_result_correctness(ag_test_command_2_result, true, false, false);
        set_command_result_correctness(ag_test_command_3_result, true, false, false);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.none_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === all_correct AND output_correctness === some_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, true, true, false);
        set_command_result_correctness(ag_test_command_2_result, true, false, true);
        set_command_result_correctness(ag_test_command_3_result, true, true, true);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.some_correct);
    });

    test('return_code_correctness === all_correct AND output_correctness === all_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, true, true, true);
        set_command_result_correctness(ag_test_command_2_result, true, true, true);
        set_command_result_correctness(ag_test_command_3_result, true, true, true);

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.all_correct);
    });

    test('total_points === 0 && total_points_possible !== 0', async () => {
        set_command_result_correctness(ag_test_command_1_result, false, true, true);
        set_command_result_correctness(ag_test_command_2_result, false, true, true);
        set_command_result_correctness(ag_test_command_3_result, true, true, true);

        ag_test_case_result.total_points = 0;
        ag_test_case_result.total_points_possible = 10;

        check_all_case_correctness_levels(wrapper,
                                          ag_test_case_result,
                                          CorrectnessLevel.some_correct,
                                          CorrectnessLevel.all_correct,
                                          CorrectnessLevel.none_correct);
    });
});

describe('case_result_return_code_correctness tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    beforeEach(() => {
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBeNull();
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBeNull();

        wrapper = make_wrapper(false);
    });

    test('all commands have return_code_correct === null', async () => {
        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('all commands have return_code_correct === null -' +
         ' at least one command has show_actual_return_code === true',
         async () => {
        ag_test_case_result.ag_test_command_results[1].actual_return_code = 2;

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('all return_code_corrects null, one timed_out_false', async () => {
        ag_test_case_result.ag_test_command_results[1].timed_out = false;
        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('All return_code_corrects null, one timed_out true', async () => {
        ag_test_case_result.ag_test_command_results[1].timed_out = true;
        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('all commands have return_code_correct === true',
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

    test('at least one command has return_code_correct ' +
         '=== true, the rest have return_code_correct === null',
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

    test('at least one command has ' +
         'return_code_correct === true and at least one command has return_code_correct ' +
         '=== false',
         async () => {
        ag_test_command_1_result.return_code_correct = true;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(true);

        ag_test_command_2_result.return_code_correct = false;
        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBe(false);

        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBeNull();

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('all commands have return_code_correct ' +
         '=== false',
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

    test('at least one command has ' +
         'return_code_correct === false and no command has return_code_correct === true',
         async () => {
        ag_test_command_1_result.return_code_correct = false;
        expect(ag_test_case_result.ag_test_command_results[0].return_code_correct).toBe(false);

        expect(ag_test_case_result.ag_test_command_results[1].return_code_correct).toBeNull();

        ag_test_command_3_result.return_code_correct = false;
        expect(ag_test_case_result.ag_test_command_results[2].return_code_correct).toBe(false);

        expect(wrapper.vm.case_result_return_code_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    // Regression test for https://github.com/eecs-autograder/ag-website-vue/issues/376
    test('Single-command test, actual return code and correctness shown, all correct', async () => {
        let test_case = data_ut.make_ag_test_case(
            data_ut.make_ag_test_suite(group.project).pk
        );
        let test_result = data_ut.make_ag_test_case_result_feedback(test_case.pk);

        let return_code_correct_res = data_ut.make_ag_test_command_result_feedback(
            data_ut.make_ag_test_command(test_case.pk).pk,
            {
                actual_return_code: 0,
                return_code_correct: true,
                return_code_points: 1,
                return_code_points_possible: 1,
            }
        );

        test_result.ag_test_command_results = [return_code_correct_res];

        expect(wrapper.vm.case_result_return_code_correctness(test_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(test_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });
});

describe('case_result_output_correctness tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;

    beforeEach(() => {
        wrapper = make_wrapper(false);
    });

    test('case_result_output_correctness - not_available - every command has ' +
         'stdout_correct === null AND stderr_correct === null',
         async () => {
        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('case_result_output_correctness - info_only - every command has ' +
         'stdout_correct === null AND stderr_correct === null and at least one command has ' +
         'show_actual_stdout === true',
         async () => {
        ag_test_case_result.ag_test_command_results[1].fdbk_settings.show_actual_stdout = true;
        ag_test_case_result.ag_test_command_results[1].stdout_points_possible = 0;
        ag_test_case_result.ag_test_command_results[1].stderr_points_possible = 0;

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('case_result_output_correctness - info_only - every command has ' +
         'stdout_correct === null AND stderr_correct === null and at least one command has ' +
         'show_actual_stderr === true',
         async () => {
        ag_test_case_result.ag_test_command_results[2].fdbk_settings.show_actual_stderr = true;
        ag_test_case_result.ag_test_command_results[2].stdout_points_possible = 0;
        ag_test_case_result.ag_test_command_results[2].stderr_points_possible = 0;

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.info_only
        );
    });

    test('case_result_output_correctness - all_correct - every command has ' +
         'stdout_correct === true AND stderr_correct === true',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, true, true);
        set_command_result_correctness(ag_test_command_2_result, null, true, true);
        set_command_result_correctness(ag_test_command_3_result, null, true, true);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - all_correct - every command has ' +
         '(stdout_correct === true || stdout_correct === null) AND ' +
         '(stderr_correct === true || stderr_correct === null)',
         async () => {
        set_command_result_correctness(ag_test_command_2_result, null, true, null);
        set_command_result_correctness(ag_test_command_3_result, null, null, true);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - some_correct - at least one command has ' +
         'stdout_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, true, false);
        set_command_result_correctness(ag_test_command_2_result, null, false, false);
        set_command_result_correctness(ag_test_command_3_result, null, false, false);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_output_correctness - some_correct - at least one command has ' +
         'stderr_correct',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, false, false);
        set_command_result_correctness(ag_test_command_2_result, null, false, false);
        set_command_result_correctness(ag_test_command_3_result, null, false, true);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct === false ' +
         'AND stderr_correct === false',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, false, false);
        set_command_result_correctness(ag_test_command_2_result, null, false, false);
        set_command_result_correctness(ag_test_command_3_result, null, false, false);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_output_correctness - no command has stdout_correct === true ' +
         'or stderr_correct === true',
         async () => {
        set_command_result_correctness(ag_test_command_1_result, null, false, null);
        set_command_result_correctness(ag_test_command_3_result, null, null, false);

        expect(wrapper.vm.case_result_output_correctness(ag_test_case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });
});

function get_setup_result_panel(wrapper: Wrapper<AGSuiteResult>) {
    return <ResultPanel> wrapper.findComponent({ref: 'setup_result_panel'}).vm;
}

describe('setup_correctness_level tests', () => {
    test('setup_name null, not_available', () => {
        ag_test_suite_result.setup_name = null;
        ag_test_suite_result.setup_return_code = 0;

        let wrapper = make_wrapper(false);
        expect(wrapper.findComponent({ref: 'setup_result_panel'}).exists()).toBe(false);
    });

    test('setup_name not null, return code and time out null, info_only', () => {
        ag_test_suite_result.setup_name = 'Setup!';
        ag_test_suite_result.setup_return_code = null;
        ag_test_suite_result.setup_timed_out = null;

        let wrapper = make_wrapper(false);
        expect(get_setup_result_panel(wrapper).correctness_level).toEqual(
            CorrectnessLevel.info_only);
    });

    test('setup_name not null, return code 0, all_correct', () => {
        ag_test_suite_result.setup_name = 'Setup!';
        ag_test_suite_result.setup_return_code = 0;

        let wrapper = make_wrapper(false);
        expect(get_setup_result_panel(wrapper).correctness_level).toEqual(
            CorrectnessLevel.all_correct);
    });

    test('setup_name not null, return code nonzero, none_correct', () => {
        ag_test_suite_result.setup_name = 'Setup!';
        ag_test_suite_result.setup_return_code = 2;

        let wrapper = make_wrapper(false);
        expect(get_setup_result_panel(wrapper).correctness_level).toEqual(
            CorrectnessLevel.none_correct);
    });

    test('setup_name not null, setup timed out, none_correct', () => {
        ag_test_suite_result.setup_name = 'Setup!';
        ag_test_suite_result.setup_return_code = null;
        ag_test_suite_result.setup_timed_out = true;

        let wrapper = make_wrapper(false);
        expect(get_setup_result_panel(wrapper).correctness_level).toEqual(
            CorrectnessLevel.none_correct);
    });
});

describe('Setup panel open initially tests', () => {
    test('Not first suite, not open initially', () => {
        ag_test_suite_result.setup_name = 'Setup';
        ag_test_suite_result.setup_return_code = 1;
        let wrapper = make_wrapper(false);
        expect(get_setup_result_panel(wrapper).open_initially).toBe(false);
    });

    test('Is first suite, setup is correct, not open initially', () => {
        ag_test_suite_result.setup_name = 'Setup';
        ag_test_suite_result.setup_return_code = 0;
        let wrapper = make_wrapper(true);
        expect(get_setup_result_panel(wrapper).open_initially).toBe(false);
    });

    test('Is first suite, setup is info only, not open initially', () => {
        ag_test_suite_result.setup_name = 'Setup';
        ag_test_suite_result.setup_return_code = null;
        ag_test_suite_result.setup_timed_out = null;
        let wrapper = make_wrapper(true);
        expect(get_setup_result_panel(wrapper).open_initially).toBe(false);
    });

    test('Is first suite, setup is incorrect, is open initially', () => {
        ag_test_suite_result.setup_name = 'Setup';
        ag_test_suite_result.setup_return_code = 3;
        ag_test_suite_result.setup_timed_out = false;
        let wrapper = make_wrapper(true);
        expect(get_setup_result_panel(wrapper).open_initially).toBe(true);
    });

    test('Is first suite, setup timed out, is open initially', () => {
        ag_test_suite_result.setup_name = 'Setup';
        ag_test_suite_result.setup_return_code = null;
        ag_test_suite_result.setup_timed_out = true;
        let wrapper = make_wrapper(true);
        expect(get_setup_result_panel(wrapper).open_initially).toBe(true);
    });
});

describe('First failed test case result panel open initially tests', () => {
    function get_test_result_panel(wrapper: Wrapper<AGSuiteResult>, index: number) {
        return <ResultPanel> wrapper.findAllComponents({ref: 'test_result_panel'}).at(index).vm;
    }

    let case_1: ag_cli.AGTestCaseResultFeedback;
    let case_1_command_1: ag_cli.AGTestCommandResultFeedback;
    let case_1_command_2: ag_cli.AGTestCommandResultFeedback;
    let case_1_command_3: ag_cli.AGTestCommandResultFeedback;

    let case_2: ag_cli.AGTestCaseResultFeedback;
    let case_2_command_1: ag_cli.AGTestCommandResultFeedback;
    let case_2_command_2: ag_cli.AGTestCommandResultFeedback;
    let case_2_command_3: ag_cli.AGTestCommandResultFeedback;

    beforeEach(() => {
        case_1 = data_ut.make_ag_test_case_result_feedback(1);
        case_1_command_1 = data_ut.make_ag_test_command_result_feedback(1);
        case_1_command_2 = data_ut.make_ag_test_command_result_feedback(2);
        case_1_command_3 = data_ut.make_ag_test_command_result_feedback(3);

        case_2 = data_ut.make_ag_test_case_result_feedback(2);
        case_2_command_1 = data_ut.make_ag_test_command_result_feedback(4);
        case_2_command_2 = data_ut.make_ag_test_command_result_feedback(5);
        case_2_command_3 = data_ut.make_ag_test_command_result_feedback(6);

        case_1.ag_test_command_results = [
            case_1_command_1,
            case_1_command_2,
            case_1_command_3
        ];

        case_2.ag_test_command_results = [
            case_2_command_1,
            case_2_command_2,
            case_2_command_3
        ];

        ag_test_suite_result.ag_test_case_results = [
            case_1,
            case_2
        ];
    });

    test('Setup is first failure, no tests open initially', async () => {
        ag_test_suite_result.setup_name = 'Setup';
        ag_test_suite_result.setup_return_code = 1;

        for (let command of case_1.ag_test_command_results) {
            set_command_result_correctness(command, false, false, false);
        }

        for (let command of case_2.ag_test_command_results) {
            set_command_result_correctness(command, false, false, false);
        }

        let wrapper = make_wrapper(true);

        let first = get_test_result_panel(wrapper, 0);
        expect(first.open_initially).toBe(false);

        let second = get_test_result_panel(wrapper, 1);
        expect(second.open_initially).toBe(false);
    });

    test('First some_correct test open initially', async () => {
        for (let command of case_1.ag_test_command_results) {
            set_command_result_correctness(command, true, true, true);
        }

        for (let command of case_2.ag_test_command_results) {
            set_command_result_correctness(command, false, true, true);
        }

        let wrapper = make_wrapper(true);


        let first = get_test_result_panel(wrapper, 0);
        expect(first.open_initially).toBe(false);

        let second = get_test_result_panel(wrapper, 1);
        expect(second.open_initially).toBe(true);
    });

    test('First none_correct test open initially', async () => {
        for (let command of case_1.ag_test_command_results) {
            set_command_result_correctness(command, true, true, true);
        }

        for (let command of case_2.ag_test_command_results) {
            set_command_result_correctness(command, false, false, false);
        }

        let wrapper = make_wrapper(true);


        let first = get_test_result_panel(wrapper, 0);
        expect(first.open_initially).toBe(false);

        let second = get_test_result_panel(wrapper, 1);
        expect(second.open_initially).toBe(true);
    });

    test('All tests all_correct, none open initially', async () => {
        for (let command of case_1.ag_test_command_results) {
            set_command_result_correctness(command, true, true, true);
        }

        for (let command of case_2.ag_test_command_results) {
            set_command_result_correctness(command, true, true, true);
        }

        let wrapper = make_wrapper(true);

        let first = get_test_result_panel(wrapper, 0);
        expect(first.open_initially).toBe(false);

        let second = get_test_result_panel(wrapper, 1);
        expect(second.open_initially).toBe(false);
    });

    test('All tests none_correct, first one open initially', async () => {
        for (let command of case_1.ag_test_command_results) {
            set_command_result_correctness(command, false, false, false);
        }

        for (let command of case_2.ag_test_command_results) {
            set_command_result_correctness(command, false, false, false);
        }

        let wrapper = make_wrapper(true);

        let first = get_test_result_panel(wrapper, 0);
        expect(first.open_initially).toBe(true);

        let second = get_test_result_panel(wrapper, 1);
        expect(second.open_initially).toBe(false);
    });
});
