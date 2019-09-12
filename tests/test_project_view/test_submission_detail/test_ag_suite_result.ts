import { config, mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import AGSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuiteResult tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;
    let submission: ag_cli.Submission;
    let ag_test_suite_result: ag_cli.AGTestSuiteResultFeedback;

    beforeEach(() => {

        submission = new ag_cli.Submission({
            pk: 5,
            group: 7,
            timestamp: "",
            submitter: 'batman',
            submitted_filenames: ['spam', 'egg'],
            discarded_files: ['very', 'nope'],
            missing_files: {'oops': 1, '*.cpp': 3},
            status: ag_cli.GradingStatus.being_graded,
            count_towards_daily_limit: false,
            is_past_daily_limit: false,
            is_bonus_submission: true,
            count_towards_total_limit: true,
            does_not_count_for: ['robin'],
            position_in_queue: 3,
            last_modified: ""
        });

        let suite_pk = 1;
        ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(suite_pk);

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

        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('setup_correctness_level - setup_return_code === null', async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = null;

        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('setup_correctness_level - setup_return_code !== 0 && setup_return_code !== null',
         async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = 1;

        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    ////////////////////////////////////////////////////////////////

    test('case_result_correctness - return_code_correctness ' +
         '=== CorrectnessLevel.not_available',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_correctness - output_correctness ' +
         '=== CorrectnessLevel.not_available',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test.skip('case_result_correctness - total_points === 0 && total_points_possible === 0',
         async () => {
        fail("Is this one even necessary?");
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(1);
        let command_2_result = data_ut.make_ag_test_command_result_feedback(2);
        let command_3_result = data_ut.make_ag_test_command_result_feedback(3);

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test.skip('case_result_correctness - total_points === 0 && total_points_possible !== 0',
         async () => {
        fail("is this one either?");
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(1);
        let command_2_result = data_ut.make_ag_test_command_result_feedback(2);
        let command_3_result = data_ut.make_ag_test_command_result_feedback(3);

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_correctness - return_code_correctness === all_correct && ' +
         'output_correctness === all_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_correctness - return_code_correctness === none_correct && ' +
         'output_correctness === none_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_correctness - return_code_correctness === some_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - output_correctness === some_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - return_code_correctness === all_correct && ' +
         'output_correctness === none_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - return_code_correctness === none_correct && ' +
         'output_correctness === all_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    ////////////////////////////////////////////////////////////////

    test('case_result_return_code_correctness - all commands have ' +
         'return_code_correct === null',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(1);
        let command_2_result = data_ut.make_ag_test_command_result_feedback(2);
        let command_3_result = data_ut.make_ag_test_command_result_feedback(3);

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(null);
        expect(command_2_result.return_code_correct).toEqual(null);
        expect(command_3_result.return_code_correct).toEqual(null);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('case_result_return_code_correctness - all commands have ' +
         'return_code_correct = true',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(true);
        expect(command_2_result.return_code_correct).toEqual(true);
        expect(command_3_result.return_code_correct).toEqual(true);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_return_code_correctness - all commands have ' +
         'return_code_correct = true or return_code_correct = null',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: null
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(true);
        expect(command_2_result.return_code_correct).toEqual(null);
        expect(command_3_result.return_code_correct).toEqual(true);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_return_code_correctness - all commands have return_code_correct ' +
         '= false',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(false);
        expect(command_2_result.return_code_correct).toEqual(false);
        expect(command_3_result.return_code_correct).toEqual(false);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_return_code_correctness - some commands have return_code_correct ' +
         '= false but not all',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(true);
        expect(command_2_result.return_code_correct).toEqual(false);
        expect(command_3_result.return_code_correct).toEqual(true);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    ////////////////////////////////////////////////////////////////

    test('case_result_output_correctness - every command has stdout_correct = null ' +
         'AND stderr_correct = null',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = true ' +
         'AND stderr_correct = true',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = true || false ' +
         'AND stderr_correct = true || false',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: true,
                stderr_correct: null
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: null,
                stderr_correct: true
            }
        );

        let command_4_result = data_ut.make_ag_test_command_result_feedback(
            4,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result,
            command_4_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = false ' +
         'AND stderr_correct = false',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_output_correctness - some commands have stdout_correct = false ' +
         'AND stderr_correct = false but not all',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: true,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    ////////////////////////////////////////////////////////////////

    test('decide_whether_to_open_setup - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND setup_level_correctness === none_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_return_code = 1;

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.decide_whether_to_open_setup(CorrectnessLevel.none_correct)).toBe(true);
    });

    test('decide_whether_to_open_setup - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND setup_timed_out === true',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_timed_out = true;

        expect(wrapper.vm.decide_whether_to_open_setup(CorrectnessLevel.some_correct)).toBe(true);

        expect(wrapper.vm.first_incorrect_setup).toEqual(wrapper.vm.ag_test_suite_result);
        expect(wrapper.vm.first_incorrect_case).toBeNull();
    });

    test('decide_whether_to_open_setup - first_incorrect_setup !== null', async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_timed_out = true;

        expect(wrapper.vm.decide_whether_to_open_setup(CorrectnessLevel.some_correct)).toBe(true);

        expect(wrapper.vm.first_incorrect_setup).toEqual(wrapper.vm.ag_test_suite_result);
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        expect(wrapper.vm.decide_whether_to_open_setup(CorrectnessLevel.some_correct)).toBe(true);
    });

    test('decide_whether_to_open_setup - first_incorrect_case !== null', async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_timed_out = true;

        let case_1_result = data_ut.make_ag_test_case_result_feedback(1);

        expect(wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.some_correct,
            case_1_result
        )).toBe(true);

        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toEqual(case_1_result);

        expect(wrapper.vm.decide_whether_to_open_setup(CorrectnessLevel.some_correct)).toBe(false);

        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toEqual(case_1_result);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = all_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.all_correct;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(false);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = not_available',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.not_available;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(false);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = some_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.some_correct;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(true);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = none_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.none_correct;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(true);
    });

    test('decide_whether_to_open_case - first_incorrect_case !== null',
         async () => {
        let case_1_result = data_ut.make_ag_test_case_result_feedback(1);

        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.none_correct,
            case_1_result
        );

        expect(wrapper.vm.first_incorrect_case).not.toBeNull();

        let case_2_result = data_ut.make_ag_test_case_result_feedback(2);

        expect(wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.none_correct,
            case_2_result
        )).toBe(false);
    });

    test('decide_whether_to_open_case - first_incorrect_setup !== null',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_return_code = 1;

        wrapper.vm.decide_whether_to_open_setup(
            CorrectnessLevel.none_correct
        );

        expect(wrapper.vm.first_incorrect_setup).not.toBeNull();

        let case_1_result = data_ut.make_ag_test_case_result_feedback(1);

        expect(wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.none_correct,
            case_1_result
        )).toBe(false);
    });
});
