import { config, mount, Wrapper } from '@vue/test-utils';

import {
    FeedbackCategory,
    GradingStatus,
    MutationTestSuiteResultFeedback,
    Submission
} from 'ag-client-typescript';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';
import MutationSuiteResults from '@/components/project_view/submission_detail/mutation_suite_results.vue';

import { make_mutation_test_suite_fdbk_config } from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationSuiteResults tests', () => {
    let wrapper: Wrapper<MutationSuiteResults>;
    let mutation_test_suite_results: MutationTestSuiteResultFeedback[];
    let submission: Submission;
    let suite_1_results: MutationTestSuiteResultFeedback;
    let suite_2_results: MutationTestSuiteResultFeedback;

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

        suite_1_results = {
            pk: 1,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: true,
            invalid_tests: [],
            num_bugs_exposed: 0,
            setup_command_name: "Compile",
            setup_return_code: 0,
            setup_timed_out: false,
            student_test_suite_name: "Suite 1",
            student_test_suite_pk: 1,
            student_tests: [],
            timed_out_tests: [],
            total_points: 20,
            total_points_possible: 50
        };

        suite_2_results = {
            pk: 2,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: false,
            invalid_tests: [],
            num_bugs_exposed: 0,
            setup_command_name: null,
            setup_return_code: 0,
            setup_timed_out: false,
            student_test_suite_name: "Suite 2",
            student_test_suite_pk: 1,
            student_tests: [],
            timed_out_tests: [],
            total_points: 20,
            total_points_possible: 50
        };

        mutation_test_suite_results = [suite_1_results, suite_2_results];

        wrapper = mount(MutationSuiteResults, {
            propsData: {
                mutation_test_suite_results: mutation_test_suite_results,
                submission: submission,
                fdbk_category: FeedbackCategory.past_limit_submission
            }
        });
    });

    test('Props', async () => {
        expect(wrapper.vm.mutation_suite_results).toEqual([suite_1_results, suite_2_results]);
        expect(wrapper.vm.submission).toEqual(submission);
        expect(wrapper.vm.fdbk_category).toEqual(FeedbackCategory.past_limit_submission);
    });

    test('get_mutation_test_validity_correctness_level - not_available', async () => {
        let mutation_test_suite_result_feedback = {
            pk: 5,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: false,
            invalid_tests: null,
            num_bugs_exposed: 0,
            setup_command_name: null,
            setup_return_code: 0,
            setup_timed_out: false,
            student_test_suite_name: "Suite 5",
            student_test_suite_pk: 1,
            student_tests: [],
            timed_out_tests: [],
            total_points: 20,
            total_points_possible: 50
        };

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.not_available);
    });

    test('get_mutation_test_validity_correctness_level - none_correct', async () => {
        let mutation_test_suite_result_feedback = {
            pk: 5,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: true,
            invalid_tests: [],
            num_bugs_exposed: 0,
            setup_command_name: null,
            setup_return_code: 1,
            setup_timed_out: false,
            student_test_suite_name: "Suite 5",
            student_test_suite_pk: 1,
            student_tests: [],
            timed_out_tests: [],
            total_points: 20,
            total_points_possible: 50
        };

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.none_correct);
    });

    test('get_mutation_test_validity_correctness_level - all_correct', async () => {
        let mutation_test_suite_result_feedback = {
            pk: 5,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: false,
            invalid_tests: [],
            num_bugs_exposed: 0,
            setup_command_name: null,
            setup_return_code: 0,
            setup_timed_out: false,
            student_test_suite_name: "Suite 5",
            student_test_suite_pk: 1,
            student_tests: [],
            timed_out_tests: [],
            total_points: 50,
            total_points_possible: 50
        };

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.all_correct);
    });

    test('get_mutation_test_validity_correctness_level - some_correct ' +
         '(total points === total points possible',
         async () => {
        let mutation_test_suite_result_feedback = {
            pk: 5,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: false,
            invalid_tests: ["an_invalid_test"],
            num_bugs_exposed: 0,
            setup_command_name: null,
            setup_return_code: 0,
            setup_timed_out: false,
            student_test_suite_name: "Suite 5",
            student_test_suite_pk: 1,
            student_tests: [],
            timed_out_tests: [],
            total_points: 50,
            total_points_possible: 50
        };

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.some_correct);
    });

    test('get_mutation_test_validity_correctness_level - none_correct', async () => {
        let mutation_test_suite_result_feedback = {
            pk: 5,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: false,
            invalid_tests: ["an_invalid_test"],
            num_bugs_exposed: 0,
            setup_command_name: null,
            setup_return_code: 0,
            setup_timed_out: false,
            student_test_suite_name: "Suite 5",
            student_test_suite_pk: 1,
            student_tests: ["an_invalid_test"],
            timed_out_tests: [],
            total_points: 45,
            total_points_possible: 50
        };

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback
        )).toEqual(CorrectnessLevel.none_correct);
    });

    test('get_mutation_test_validity_correctness_level - some_correct', async () => {
        let mutation_test_suite_result_feedback = {
            pk: 5,
            bugs_exposed: [],
            discarded_tests: [],
            fdbk_settings: make_mutation_test_suite_fdbk_config(),
            get_student_test_names_return_code: 1,
            get_student_test_names_timed_out: false,
            has_setup_command: false,
            invalid_tests: ["an_invalid_test"],
            num_bugs_exposed: 0,
            setup_command_name: null,
            setup_return_code: 0,
            setup_timed_out: false,
            student_test_suite_name: "Suite 5",
            student_test_suite_pk: 1,
            student_tests: ["an_invalid_test", "a_valid_test"],
            timed_out_tests: [],
            total_points: 45,
            total_points_possible: 50
        };

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.some_correct);
    });
});
