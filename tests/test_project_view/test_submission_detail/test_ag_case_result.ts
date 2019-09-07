import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCaseResultFeedback,
    ExpectedReturnCode,
    FeedbackCategory,
    GradingStatus,
    Submission
} from 'ag-client-typescript';

import AGCaseResult from '@/components/project_view/submission_detail/ag_case_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

import {
    make_ag_test_case_feedback_config,
    make_ag_test_command_fdbk_config
} from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCaseResult tests', () => {
    let wrapper: Wrapper<AGCaseResult>;
    let submission: Submission;
    let ag_test_case_result: AGTestCaseResultFeedback;

    beforeEach(() => {
        submission = new Submission({
            pk: 5,
            group: 7,
            timestamp: "",
            submitter: 'batman',
            submitted_filenames: ['spam', 'egg'],
            discarded_files: ['very', 'nope'],
            missing_files: {'oops': 1, '*.cpp': 3},
            status: GradingStatus.being_graded,
            count_towards_daily_limit: false,
            is_past_daily_limit: false,
            is_bonus_submission: true,
            count_towards_total_limit: true,
            does_not_count_for: ['robin'],
            position_in_queue: 3,
            last_modified: ""
        });

        ag_test_case_result = {
            pk: 1,
            ag_test_case_name: "Case Name",
            ag_test_case_pk: 1,
            ag_test_command_results: [],
            fdbk_settings: make_ag_test_case_feedback_config(),
            total_points: 19,
            total_points_possible: 20
        };

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: FeedbackCategory.max,
                submission: submission,
            }
        });
    });

    test('Props', async () => {
        expect(wrapper.vm.ag_test_case_result).toEqual(ag_test_case_result);
        expect(wrapper.vm.fdbk_category).toEqual(FeedbackCategory.max);
        expect(wrapper.vm.submission).toEqual(submission);
    });

    test.skip('toggle_d_is_open', async () => {
    });

    test('command_result_correctness - return output_correctness', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: null,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: true,
            stdout_points: 2,
            stdout_points_possible: 2,
            stderr_correct: false,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return return_code_correctness', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: false,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: null,
            stdout_points: 2,
            stdout_points_possible: 2,
            stderr_correct: null,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness = all_correct' +
         ' && output_correctness = all_correct',
         async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: true,
            stdout_points: 2,
            stdout_points_possible: 2,
            stderr_correct: true,
            stderr_points: 2,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_correctness - return_code_correctness = none_correct' +
         ' && output_correctness = none_correct',
         async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: false,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: false,
            stdout_points: 0,
            stdout_points_possible: 2,
            stderr_correct: false,
            stderr_points: 0,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - output_correctness = some_correct', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: false,
            stdout_points: 0,
            stdout_points_possible: 2,
            stderr_correct: true,
            stderr_points: 2,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness = all_correct' +
         '&& output_correctness = none_correct',
         async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: false,
            stdout_points: 0,
            stdout_points_possible: 2,
            stderr_correct: false,
            stderr_points: 0,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness = none_correct' +
         '&& output_correctness = all_correct',
         async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: false,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: true,
            stdout_points: 2,
            stdout_points_possible: 2,
            stderr_correct: true,
            stderr_points: 2,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return not_available', async () => {
        fail("I don't think it's possible to get to this return statement?");
    });

    test('command_result_return_code_correctness - return_code_correct === null', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: null,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: null,
            stdout_points: 1,
            stdout_points_possible: 2,
            stderr_correct: null,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_return_code_correctness - return_code_correct is true', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: null,
            stdout_points: 1,
            stdout_points_possible: 2,
            stderr_correct: null,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_return_code_correctness - return_code_correct is false', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: false,
            expected_return_code: ExpectedReturnCode.nonzero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: null,
            stdout_points: 1,
            stdout_points_possible: 2,
            stderr_correct: null,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_output_correctness - output_not_available', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: null,
            stdout_points: 1,
            stdout_points_possible: 2,
            stderr_correct: null,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_output_correctness - output_correct', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: true,
            stdout_points: 1,
            stdout_points_possible: 2,
            stderr_correct: true,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );

        ag_test_command_result.stdout_correct = null;

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );

        ag_test_command_result.stderr_correct = null;
        ag_test_command_result.stdout_correct = true;

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_output_correctness - some_output_correct', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: false,
            stdout_points: 1,
            stdout_points_possible: 2,
            stderr_correct: true,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );

        ag_test_command_result.stdout_correct = true;
        ag_test_command_result.stderr_correct = false;

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_output_correctness - none_correct', async () => {
        let ag_test_command_result = {
            pk: 1,
            ag_test_command_pk: 1,
            ag_test_command_name: "Command Name",
            fdbk_settings: make_ag_test_command_fdbk_config(),
            timed_out: false,
            return_code_correct: true,
            expected_return_code: ExpectedReturnCode.zero,
            actual_return_code: 0,
            return_code_points: 2,
            return_code_points_possible: 2,
            stdout_correct: false,
            stdout_points: 1,
            stdout_points_possible: 2,
            stderr_correct: false,
            stderr_points: 1,
            stderr_points_possible: 2,
            total_points: 15,
            total_points_possible: 20
        };

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });
});
