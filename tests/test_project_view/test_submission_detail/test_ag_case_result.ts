import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import AGCaseResult from '@/components/project_view/submission_detail/ag_case_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

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
    let wrapper: Wrapper<AGCaseResult>;

    beforeEach(() => {
        wrapper = mount(AGCaseResult, {
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_correctness - return_code_correctness === not_available AND' +
         ' output_correctness === output_only',
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_correctness - return_code_correctness === output_only AND' +
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
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
    });

    test('command_result_correctness - return_code_correctness === output_only AND' +
         ' output_correctness === output_only',
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
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
    });

    test('command_result_correctness - return_code_correctness === output_only AND' +
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
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness === output_only AND' +
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
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_correctness - return_code_correctness === output_only AND' +
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
            CorrectnessLevel.output_only
        );
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_correctness - return_code_correctness === none_correct AND' +
         ' output_correctness === output_only',
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_correctness - return_code_correctness === all_correct AND' +
         ' output_correctness === output_only',
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
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
        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.command_result_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });
});

describe('command_result_return_code_correctness tests', () => {
    let wrapper: Wrapper<AGCaseResult>;

    beforeEach(() => {
        wrapper = mount(AGCaseResult, {
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
            CorrectnessLevel.output_only
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
    let wrapper: Wrapper<AGCaseResult>;

    beforeEach(() => {
        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission
            }
        });
    });

    test('command_result_output_correctness - output_not_available', async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('command_result_output_correctness - output_not_available && show_output_only -' +
         ' show_actual_stdout === true',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: null,
                stdout_points_possible: 0,
                stderr_points_possible: 0
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
    });

    test('command_result_output_correctness - output_not_available && show_output_only -' +
         ' show_actual_stderr === true',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: null,
                stdout_points_possible: 0,
                stderr_points_possible: 0
            }
        );
        ag_test_command_result.fdbk_settings.show_actual_stderr = true;

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.output_only
        );
    });

    test('command_result_output_correctness - output_correct - stdout_correct === true ' +
         'AND stderr_correct === true',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_output_correctness - output_correct - stdout_correct === null ' +
         'AND stderr_correct === true',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_output_correctness - output_correct - stdout_correct === true ' +
         'AND stderr_correct === null',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('command_result_output_correctness - some_output_correct - stdout_correct === true' +
         ' AND stderr_correct === false',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_output_correctness - some_output_correct - stderr_correct === false' +
         ' AND stderr-correct === true',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('command_result_output_correctness - none_correct - stdout_correct === false' +
         ' AND stderr_correct === false',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('command_result_output_correctness - none_correct - stdout_correct === false ' +
         'AND stderr_correct === null',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: null
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });


    test('command_result_output_correctness - none_correct - stdout_correct === null' +
         ' AND stderr_correct === false',
         async () => {
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: false
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });
});

describe('AGTestCaseResult tests concerning props', () => {
    let wrapper: Wrapper<AGCaseResult>;

    beforeEach(() => {
        wrapper = mount(AGCaseResult, {
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

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission,
            }
        });

        expect(wrapper.findAll({ref: 'ag_test_command_panel'}).length).toEqual(2);
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

        wrapper.setProps({ag_test_case_result: updated_ag_test_case_result});

        expect(wrapper.vm.command_result_correctness(
            wrapper.vm.ag_test_case_result.ag_test_command_results[0]
        )).toEqual(CorrectnessLevel.all_correct);
        expect(wrapper.vm.command_result_correctness(
            wrapper.vm.ag_test_case_result.ag_test_command_results[1]
        )).toEqual(CorrectnessLevel.some_correct);
    });
});
