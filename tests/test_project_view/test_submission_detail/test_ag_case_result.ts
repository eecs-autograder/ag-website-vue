import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCaseResultFeedback,
    FeedbackCategory,
    GradingStatus,
    Submission
} from 'ag-client-typescript';

import AGCaseResult from '@/components/project_view/submission_detail/ag_case_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

import {
    make_ag_test_case_result_feedback,
    make_ag_test_command_result_feedback
} from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCaseResult tests - ', () => {
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
    });

    test('Multi Command Body class applied when case contains multiple commands', async () => {
        ag_test_case_result = make_ag_test_case_result_feedback(1);

        let ag_test_command_1_result = make_ag_test_command_result_feedback(1);
        let ag_test_command_2_result = make_ag_test_command_result_feedback(2);

        ag_test_case_result.ag_test_command_results = [
            ag_test_command_1_result,
            ag_test_command_2_result
        ];

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: FeedbackCategory.max,
                submission: submission,
            }
        });

        expect(wrapper.find('#multi-command-body').exists()).toBe(true);
    });

    test('Multi Command Body class is not applied when case contains only one command',
         async () => {
        ag_test_case_result = make_ag_test_case_result_feedback(1);

        let ag_test_command_1_result = make_ag_test_command_result_feedback(1);

        ag_test_case_result.ag_test_command_results = [
            ag_test_command_1_result
        ];

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: FeedbackCategory.max,
                submission: submission,
            }
        });

        expect(wrapper.find('#multi-command-body').exists()).toBe(false);
    });
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

        let case_pk = 1;
        ag_test_case_result = make_ag_test_case_result_feedback(case_pk);

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: FeedbackCategory.max,
                submission: submission,
            }
        });
    });

    test('command_result_correctness - return output_correctness', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: null,
                stdout_correct: true,
                stderr_correct: false
            }
        );

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
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: false,
                stdout_correct: null,
                stderr_correct: null
            }
        );

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
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );

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
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );

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
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: false
            }
        );

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
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );

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
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );

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

    test('command_result_return_code_correctness - return_code_correct === null', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: null
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_return_code_correctness - return_code_correct is true', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: true
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_return_code_correctness - return_code_correct is false', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                return_code_correct: false
            }
        );

        expect(wrapper.vm.command_result_return_code_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_output_correctness - output_not_available', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_output_correctness - output_correct', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );

        ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: null,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );

        ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: true,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_output_correctness - some_output_correct', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: false,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );

        ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: true,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_output_correctness - none_correct', async () => {
        let command_pk = 1;
        let ag_test_command_result = make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });
});
