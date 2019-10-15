import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';
import MutationSuiteResults from '@/components/project_view/submission_detail/mutation_suite_results.vue';

import * as data_ut from '@/tests/data_utils';

const NONE_CORRECT = CorrectnessLevel.none_correct;
const ALL_CORRECT = CorrectnessLevel.all_correct;
const SOME_CORRECT = CorrectnessLevel.some_correct;
const NOT_AVAILABLE = CorrectnessLevel.not_available;
const INFO_ONLY = CorrectnessLevel.info_only;

let group: ag_cli.Group;
let mutation_test_suite_results: ag_cli.MutationTestSuiteResultFeedback[];
let submission: ag_cli.Submission;
let user: ag_cli.User;
let mutation_suite_1_result: ag_cli.MutationTestSuiteResultFeedback;

let setup_return_code_correctness:
    (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;
let student_tests_correctness:
    (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;
let points_for_bugs_exposed_correctness:
    (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;
let mutation_suite_correctness:
    (suite_result: ag_cli.MutationTestSuiteResultFeedback) => CorrectnessLevel;

function set_return_code_correctness(suite_result: ag_cli.MutationTestSuiteResultFeedback,
                                     level: CorrectnessLevel) {
    if (level === NOT_AVAILABLE) {
        suite_result.has_setup_command = false;
    }
    else {
        suite_result.has_setup_command = true;

        if (level === ALL_CORRECT) {
            suite_result.setup_return_code = 0;
        }
        else {
            suite_result.setup_return_code = 1;
        }
    }
}

function set_student_tests_correctness(suite_result: ag_cli.MutationTestSuiteResultFeedback,
                                       level: CorrectnessLevel) {
    if (level === NOT_AVAILABLE) {
        suite_result.invalid_tests = null;
    }
    else {
        if (level === ALL_CORRECT) {
            suite_result.invalid_tests = [];
            suite_result.student_tests = ['first_test'];
        }
        else if (level === SOME_CORRECT) {
            suite_result.invalid_tests = ['first_test'];
            suite_result.student_tests = ['first_test', 'second_test'];
        }
        else {
            suite_result.invalid_tests = ['first_test', 'second_test'];
            suite_result.student_tests = ['first_test', 'second_test'];
        }
    }
}

function set_points_correctness(suite_result: ag_cli.MutationTestSuiteResultFeedback,
                                level: CorrectnessLevel) {
    if (level === NOT_AVAILABLE) {
        suite_result.num_bugs_exposed = null;
    }
    else {
        if (level === NONE_CORRECT) {
            suite_result.num_bugs_exposed = 0;
            suite_result.total_points = 0;
            suite_result.total_points_possible = 5;
        }
        else if (level === SOME_CORRECT) {
            suite_result.num_bugs_exposed = 2;
            suite_result.total_points = 3;
            suite_result.total_points_possible = 5;
        }
        else if (level === ALL_CORRECT) {
            suite_result.num_bugs_exposed = 2;
            suite_result.total_points = 5;
            suite_result.total_points_possible = 5;
        }
    }
}

describe('setup_return_code_correctness tests', () => {
    let wrapper: Wrapper<MutationSuiteResults>;

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
    });

    test('setup_return_code_correctness - has_setup_command === true && setup_return_code === 0',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(mutation_suite_1_result.has_setup_command).toBe(true);
        expect(mutation_suite_1_result.setup_return_code).toEqual(0);
        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
    });

    test('setup_return_code_correctness - has_setup_command === true && setup_return_code !== 0',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(mutation_suite_1_result.has_setup_command).toBe(true);
        expect(mutation_suite_1_result.setup_return_code).not.toEqual(0);
        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness - has_setup_command === false',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(mutation_suite_1_result.has_setup_command).toBe(false);
        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
    });
});

describe('student_tests_correctness tests', () => {
    let wrapper: Wrapper<MutationSuiteResults>;

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

        student_tests_correctness = wrapper.vm.student_tests_correctness;
    });

    test('student_tests_correctness - invalid_tests === null',
         () => {
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(mutation_suite_1_result.invalid_tests).toBeNull();
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
    });

    test('student_tests_correctness - invalid_tests !== null ' +
         '&& invalid_tests.length === 0',
         () => {
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(mutation_suite_1_result.invalid_tests!.length).toEqual(0);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
    });

    test('student_tests_correctness - invalid_tests !== null ' +
         '&& invalid_tests.length === student_tests.length',
         () => {
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(mutation_suite_1_result.invalid_tests).not.toBeNull();
        expect(mutation_suite_1_result.invalid_tests!.length).toEqual(
            mutation_suite_1_result.student_tests.length
        );
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('student_tests_correctness - invalid_tests !== null ' +
         '&& invalid_tests.length > 0 && invalid_tests.length !== student_tests.length',
         () => {
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(mutation_suite_1_result.invalid_tests).not.toBeNull();
        expect(mutation_suite_1_result.invalid_tests!.length).not.toEqual(
            mutation_suite_1_result.student_tests.length
        );
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });
});

describe('points_for_bugs_exposed_correctness tests', () => {
    let wrapper: Wrapper<MutationSuiteResults>;

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

        points_for_bugs_exposed_correctness = wrapper.vm.points_for_bugs_exposed_correctness;
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed === null', () => {
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(mutation_suite_1_result.num_bugs_exposed).toBeNull();
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points_possible !== 0 ' +
         '&& type of total_points and total_points_possible is string',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 0;
        mutation_suite_1_result.total_points = '0';
        mutation_suite_1_result.total_points_possible = '5';

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(0);
        expect(mutation_suite_1_result.total_points).toEqual('0');
        expect(mutation_suite_1_result.total_points_possible).toEqual('5');
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points === total_points_possible ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& type of total_points and total_points_possible is string',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 0;
        mutation_suite_1_result.total_points = '0';
        mutation_suite_1_result.total_points_possible = '0';

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(0);
        expect(mutation_suite_1_result.total_points).toEqual('0');
        expect(mutation_suite_1_result.total_points_possible).toEqual('0');
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
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
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
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
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points_possible !== 0 ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(0);
        expect(mutation_suite_1_result.total_points).toEqual(0);
        expect(mutation_suite_1_result.total_points_possible).toEqual(5);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points === 0 && total_points === total_points_possible ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        mutation_suite_1_result.num_bugs_exposed = 0;
        mutation_suite_1_result.total_points = 0;
        mutation_suite_1_result.total_points_possible = 0;

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(0);
        expect(mutation_suite_1_result.total_points).toEqual(0);
        expect(mutation_suite_1_result.total_points_possible).toEqual(0);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points !== 0 && total_points === total_points_possible ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual(5);
        expect(mutation_suite_1_result.total_points_possible).toEqual(5);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
    });

    test('points_for_bugs_exposed_correctness - num_bugs_exposed !== null' +
         '&& total_points !== 0 && total_points !== total_points_possible ' +
         '&& type of total_points and total_points_possible is number',
         () => {
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(mutation_suite_1_result.num_bugs_exposed).toEqual(2);
        expect(mutation_suite_1_result.total_points).toEqual(3);
        expect(mutation_suite_1_result.total_points_possible).toEqual(5);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });
});


describe('mutation_suite_correctness tests', () => {
    let wrapper: Wrapper<MutationSuiteResults>;

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

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(INFO_ONLY);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });


    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(INFO_ONLY);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NOT_AVAILABLE ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(INFO_ONLY);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(INFO_ONLY);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === ALL_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NOT_AVAILABLE ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NOT_AVAILABLE);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === NONE_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === SOME_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, SOME_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    // return code is incorrect, invalid_tests.length === 0, points info is hidden
    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === NOT_AVAILABLE',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, NOT_AVAILABLE);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NOT_AVAILABLE);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === NONE_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, NONE_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === SOME_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, SOME_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });

    test('setup_return_code_correctness === NONE_CORRECT ' +
         '&& student_tests_correctness === ALL_CORRECT ' +
         '&& points_correctness === ALL_CORRECT',
         () => {
        set_return_code_correctness(mutation_suite_1_result, NONE_CORRECT);
        set_student_tests_correctness(mutation_suite_1_result, ALL_CORRECT);
        set_points_correctness(mutation_suite_1_result, ALL_CORRECT);

        expect(setup_return_code_correctness(mutation_suite_1_result)).toEqual(NONE_CORRECT);
        expect(student_tests_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(points_for_bugs_exposed_correctness(mutation_suite_1_result)).toEqual(ALL_CORRECT);
        expect(mutation_suite_correctness(mutation_suite_1_result)).toEqual(SOME_CORRECT);
    });
});

describe('MutationSuiteResults tests', () => {
    let wrapper: Wrapper<MutationSuiteResults>;
    let mutation_suite_2_result: ag_cli.MutationTestSuiteResultFeedback;

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
