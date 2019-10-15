import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';
import MutationSuiteResults from '@/components/project_view/submission_detail/mutation_suite_results.vue';

import * as data_ut from '@/tests/data_utils';

let wrapper: Wrapper<MutationSuiteResults>;
let group: ag_cli.Group;
let mutation_test_suite_results: ag_cli.MutationTestSuiteResultFeedback[];
let submission: ag_cli.Submission;
let user: ag_cli.User;
let mutation_suite_1_result: ag_cli.MutationTestSuiteResultFeedback;
let mutation_suite_2_result: ag_cli.MutationTestSuiteResultFeedback;

describe('setup_return_code_correctness tests', () => {
    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
        mutation_suite_1_result = data_ut.make_mutation_test_suite_result_feedback(1);
        mutation_test_suite_results = [];

        wrapper = mount(MutationSuiteResults, {
            propsData: {
                mutation_test_suite_results: mutation_test_suite_results,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.past_limit_submission
            }
        });
    });

    test('setup_return_code_correctness - has_setup_command === true && setup_return_code === 0',
         () => {
        mutation_suite_1_result.has_setup_command = true;
        mutation_suite_1_result.setup_return_code = 0;

        expect(wrapper.vm.setup_return_code_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('setup_return_code_correctness - has_setup_command === true && setup_return_code !== 0',
         () => {
        mutation_suite_1_result.has_setup_command = true;
        mutation_suite_1_result.setup_return_code = 1;

        expect(wrapper.vm.setup_return_code_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('setup_return_code_correctness - has_setup_command === false',
         () => {
        mutation_suite_1_result.has_setup_command = false;

        expect(wrapper.vm.setup_return_code_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });
});

describe('student_tests_correctness tests', () => {
    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
        mutation_suite_1_result = data_ut.make_mutation_test_suite_result_feedback(1);
        mutation_test_suite_results = [];

        wrapper = mount(MutationSuiteResults, {
            propsData: {
                mutation_test_suite_results: mutation_test_suite_results,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.past_limit_submission
            }
        });
    });

    test('student_tests_correctness - invalid_tests === null',
         () => {
        mutation_suite_1_result.invalid_tests = null;

        expect(wrapper.vm.student_tests_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('student_tests_correctness - invalid_tests !== null ' +
         '&& invalid_tests.length === 0',
         () => {
        mutation_suite_1_result.invalid_tests = [];

        expect(mutation_suite_1_result.invalid_tests.length).toEqual(0);
        expect(wrapper.vm.student_tests_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('student_tests_correctness - invalid_tests !== null ' +
         '&& invalid_tests.length === student_tests.length',
         () => {
        mutation_suite_1_result.invalid_tests = ['first_test', 'second_test'];
        mutation_suite_1_result.student_tests = ['first_test', 'second_test'];

        expect(mutation_suite_1_result.invalid_tests.length).toEqual(2);
        expect(mutation_suite_1_result.student_tests.length).toEqual(2);
        expect(wrapper.vm.student_tests_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('student_tests_correctness - invalid_tests !== null ' +
         '&& invalid_tests.length > 0 && invalid_tests.length !== student_tests.length',
         () => {
        mutation_suite_1_result.invalid_tests = ['first_test'];
        mutation_suite_1_result.student_tests = ['first_test', 'second_test'];

        expect(mutation_suite_1_result.invalid_tests.length).toEqual(1);
        expect(mutation_suite_1_result.student_tests.length).toEqual(2);
        expect(wrapper.vm.student_tests_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });
});

describe('points_for_bugs_exposed_correctness tests', () => {
    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
        mutation_suite_1_result = data_ut.make_mutation_test_suite_result_feedback(1);
        mutation_test_suite_results = [];

        wrapper = mount(MutationSuiteResults, {
            propsData: {
                mutation_test_suite_results: mutation_test_suite_results,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.past_limit_submission
            }
        });
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed === null', () => {
        expect(mutation_suite_1_result.num_bugs_exposed).toBeNull();
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points_possible !== 0 ' +
         '&& type of total_points and total_points_possible is string',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = '0';
        mutation_suite_1_result.total_points_possible = '5';

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual('0');
        expect(mutation_suite_1_result.total_points_possible).toEqual('5');
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points === total_points_possible ' +
         '&& student_tests_correctness === all_correct ' +
         '&& type of total_points and total_points_possible is string',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = '0';
        mutation_suite_1_result.total_points_possible = '0';

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual('0');
        expect(mutation_suite_1_result.total_points_possible).toEqual('0');
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points !== 0 && total_points === total_points_possible ' +
         '&& type of total_points and total_points_possible is string',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = '5';
        mutation_suite_1_result.total_points_possible = '5';

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual('5');
        expect(mutation_suite_1_result.total_points_possible).toEqual('5');
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    // is it even possible to have points (catch bugs) if all of your tests are invalid?
    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points !== 0 && total_points !== total_points_possible ' +
         '&& type of total_points and total_points_possible is string',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = '3';
        mutation_suite_1_result.total_points_possible = '5';

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual('3');
        expect(mutation_suite_1_result.total_points_possible).toEqual('5');
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points_possible !== 0 ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = 0;
        mutation_suite_1_result.total_points_possible = 5;

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual(0);
        expect(mutation_suite_1_result.total_points_possible).toEqual(5);
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points === total_points_possible ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = 0;
        mutation_suite_1_result.total_points_possible = 0;

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual(0);
        expect(mutation_suite_1_result.total_points_possible).toEqual(0);
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points !== 0 && total_points === total_points_possible ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = 5;
        mutation_suite_1_result.total_points_possible = 5;
        mutation_suite_1_result.invalid_tests = [];
        mutation_suite_1_result.student_tests = ['first_test'];

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual(5);
        expect(mutation_suite_1_result.total_points_possible).toEqual(5);
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points !== 0 && total_points !== total_points_possible ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 2;
        mutation_suite_1_result.total_points = 2;
        mutation_suite_1_result.total_points_possible = 5;

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual(2);
        expect(mutation_suite_1_result.total_points_possible).toEqual(5);
        expect(wrapper.vm.points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });
});


describe('mutation_suite_correctness tests', () => {
    const none_correct = CorrectnessLevel.none_correct;
    const all_correct = CorrectnessLevel.all_correct;
    const some_correct = CorrectnessLevel.some_correct;
    const not_available = CorrectnessLevel.not_available;
    const info_only = CorrectnessLevel.info_only;

    let setup_return_code_correctness:
        (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;
    let student_tests_correctness:
        (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;
    let points_for_bugs_exposed_correctness:
        (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;
    let mutation_suite_correctness:
        (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;

    function set_return_code_correctness(
        mutation_suite_result: ag_cli.MutationTestSuiteResultFeedback,
        level: CorrectnessLevel) {

        if (level === not_available) {
            mutation_suite_result.has_setup_command = false;
        }
        else {
            mutation_suite_result.has_setup_command = true;

            if (level === all_correct) {
                mutation_suite_result.setup_return_code = 0;
            }
            else {
                mutation_suite_result.setup_return_code = 1;
            }
        }
    }

    function set_student_tests_correctness(
        mutation_suite_result: ag_cli.MutationTestSuiteResultFeedback,
        level: CorrectnessLevel) {

        if (level === not_available) {
            mutation_suite_result.invalid_tests = null;
        }
        else {
            if (level === all_correct) {
                mutation_suite_result.invalid_tests = [];
                mutation_suite_result.student_tests = ['first_test'];
            }
            else if (level === some_correct) {
                mutation_suite_result.invalid_tests = ['first_test'];
                mutation_suite_result.student_tests = ['first_test', 'second_test'];
            }
            else {
                mutation_suite_result.invalid_tests = ['first_test', 'second_test'];
                mutation_suite_result.student_tests = ['first_test', 'second_test'];
            }
        }
    }

    function set_points_correctness(mutation_suite_result: ag_cli.MutationTestSuiteResultFeedback,
                                    level: CorrectnessLevel) {
        if (level === not_available) {
            mutation_suite_result.num_bugs_exposed = null;
        }
        else {
            mutation_suite_result.num_bugs_exposed = 2;

            if (level === none_correct) {
                mutation_suite_result.total_points = 0;
                mutation_suite_result.total_points_possible = 5;
            }
            else if (level === some_correct) {
                mutation_suite_result.total_points = 3;
                mutation_suite_result.total_points_possible = 5;
            }
            else if (level === all_correct) {
                mutation_suite_result.total_points = 5;
                mutation_suite_result.total_points_possible = 5;
            }
        }
    }

    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
        mutation_suite_1_result = data_ut.make_mutation_test_suite_result_feedback(1);
        mutation_test_suite_results = [];

        wrapper = mount(MutationSuiteResults, {
            propsData: {
                mutation_test_suite_results: mutation_test_suite_results,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.past_limit_submission
            }
        });

        setup_return_code_correctness = wrapper.vm.setup_return_code_correctness;
        student_tests_correctness = wrapper.vm.student_tests_correctness;
        points_for_bugs_exposed_correctness = wrapper.vm.points_for_bugs_exposed_correctness;
        mutation_suite_correctness = wrapper.vm.mutation_suite_correctness;
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(info_only);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });


    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(info_only);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === not_available ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, not_available);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(all_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(info_only);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(info_only);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === all_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, all_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(all_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === not_available ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, not_available);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === none_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, none_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === some_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, some_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    // return code is incorrect, invalid_tests.length === 0, points info is hidden
    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === not_available',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, not_available);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(not_available);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === none_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, none_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(none_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === some_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, some_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(some_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });

    test('setup_return_code_correctness === none_correct ' +
         '&& student_tests_correctness === all_correct ' +
         '&& points_correctness === all_correct',
         () => {
        set_return_code_correctness(mutation_suite_1_result, none_correct);
        set_student_tests_correctness(mutation_suite_1_result, all_correct);
        set_points_correctness(mutation_suite_1_result, all_correct);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(none_correct);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(all_correct);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(some_correct);
    });
});

describe('MutationSuiteResults tests', () => {

    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
        mutation_suite_1_result = data_ut.make_mutation_test_suite_result_feedback(1);
        mutation_suite_2_result = data_ut.make_mutation_test_suite_result_feedback(2);

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

    test('mutation_test_suite_results prop receives a different value', async () => {
        let updated_mutation_test_suite_results = [
            data_ut.make_mutation_test_suite_result_feedback(1),
            data_ut.make_mutation_test_suite_result_feedback(2),
            data_ut.make_mutation_test_suite_result_feedback(3)
        ];

        expect(wrapper.findAll({ref: 'mutation_test_suite_detail_panel'}).length).toEqual(2);

        wrapper.setProps({mutation_test_suite_results: updated_mutation_test_suite_results});
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll({ref: 'mutation_test_suite_detail_panel'}).length).toEqual(3);
    });
});
