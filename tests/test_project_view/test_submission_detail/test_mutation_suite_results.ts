import { config, mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';
import MutationSuiteResults from '@/components/project_view/submission_detail/mutation_suite_results.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationSuiteResults tests', () => {
    let wrapper: Wrapper<MutationSuiteResults>;
    let group: ag_cli.Group;
    let mutation_test_suite_results: ag_cli.MutationTestSuiteResultFeedback[];
    let submission: ag_cli.Submission;
    let user: ag_cli.User;

    let mutation_suite_1_result: ag_cli.MutationTestSuiteResultFeedback;
    let mutation_suite_2_result: ag_cli.MutationTestSuiteResultFeedback;

    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
        mutation_suite_1_result = data_ut.make_mutation_test_suite_result_feedback(1);
        mutation_suite_2_result = data_ut.make_mutation_test_suite_result_feedback(1);

        mutation_test_suite_results = [
            mutation_suite_1_result,
            mutation_suite_2_result
        ];

        wrapper = mount(MutationSuiteResults, {
            propsData: {
                mutation_test_suite_results: mutation_test_suite_results,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.past_limit_submission
            }
        });
    });

    test('Props', async () => {
        expect(wrapper.vm.mutation_test_suite_results).toEqual(
            [
                mutation_suite_1_result,
                mutation_suite_2_result
            ]
        );
        expect(wrapper.vm.submission).toEqual(submission);
        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.past_limit_submission);
        expect(wrapper.vm.mutation_test_suite_results.length).toEqual(2);
        expect(wrapper.findAll({ref: 'mutation_test_suite_detail_panel'}).length).toEqual(2);
    });

    test('get_mutation_test_validity_correctness_level - invalid_tests === null', async () => {
        let mutation_test_suite_result_feedback = data_ut.make_mutation_test_suite_result_feedback(
          1,
          {
              invalid_tests: null
          }
        );

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.not_available);
    });

    test('get_mutation_test_validity_correctness_level - has_setup_command === true ' +
         '&& setup_return_code !== 0',
         async () => {
        let mutation_test_suite_result_feedback = data_ut.make_mutation_test_suite_result_feedback(
            1,
            {
                invalid_tests: [],
                has_setup_command: true,
                setup_return_code: 1
            }
        );

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.none_correct);
    });

    test('get_mutation_test_validity_correctness_level - total_points === ' +
         'total_points_possible && invalid_tests.length === 0',
         async () => {
        let mutation_test_suite_result_feedback = data_ut.make_mutation_test_suite_result_feedback(
                1,
                {
                    invalid_tests: [],
                    total_points: 50,
                    total_points_possible: 50
                }
        );

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.all_correct);
    });

    test('get_mutation_test_validity_correctness_level - total_points === ' +
         'total_points_possible && invalid_tests.length !== 0',
         async () => {
        let mutation_test_suite_result_feedback = data_ut.make_mutation_test_suite_result_feedback(
            1,
            {
                invalid_tests: ["an_invalid_test"],
                total_points: 50,
                total_points_possible: 50
            }
        );

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.some_correct);
    });

    test('get_mutation_test_validity_correctness_level - invalid_tests.length ' +
         '=== student_tests.length',
         async () => {
        let mutation_test_suite_result_feedback = data_ut.make_mutation_test_suite_result_feedback(
            1,
            {
                student_tests: ["a_test"],
                invalid_tests: ["a_test"],
                total_points: 45,
                total_points_possible: 50
            }
        );

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback
        )).toEqual(CorrectnessLevel.none_correct);
    });

    test('get_mutation_test_validity_correctness_level - invalid_tests.length' +
         ' !== student_tests.length',
         async () => {
        let mutation_test_suite_result_feedback = data_ut.make_mutation_test_suite_result_feedback(
          1,
          {
              student_tests: ["an_invalid_test", "a_valid_test"],
              invalid_tests: ["an_invalid_test"],
              total_points: 45,
              total_points_possible: 50
          }
        );

        expect(wrapper.vm.get_mutation_test_validity_correctness_level(
            mutation_test_suite_result_feedback)
        ).toEqual(CorrectnessLevel.some_correct);
    });
});
