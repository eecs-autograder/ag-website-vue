import { config, mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import AGCaseResult from '@/components/project_view/submission_detail/ag_case_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCaseResult tests - multiple Commands versus single command in ag_test_case', () => {
    let wrapper: Wrapper<AGCaseResult>;
    let submission: ag_cli.Submission;
    let user: ag_cli.User;
    let group: ag_cli.Group;
    let ag_test_case_result: ag_cli.AGTestCaseResultFeedback;

    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
    });

    test('Multi Command Body class applied when case contains multiple commands', async () => {
        ag_test_case_result = data_ut.make_ag_test_case_result_feedback(1);

        ag_test_case_result.ag_test_command_results = [
            data_ut.make_ag_test_command_result_feedback(1),
            data_ut.make_ag_test_command_result_feedback(1)
        ];

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission,
            }
        });

        expect(wrapper.findAll({ref: 'ag_test_command_panel'}).length).toEqual(2);
        expect(wrapper.find('#multi-command-body').exists()).toBe(true);
    });

    test('Multi Command Body class is not applied when case contains only one command',
         async () => {
        ag_test_case_result = data_ut.make_ag_test_case_result_feedback(1);

        ag_test_case_result.ag_test_command_results = [
            data_ut.make_ag_test_command_result_feedback(1)
        ];

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission,
            }
        });

        expect(wrapper.findAll({ref: 'ag_test_command_panel'}).length).toEqual(0);
        expect(wrapper.find('#multi-command-body').exists()).toBe(false);
    });
});

describe('AGCaseResult tests', () => {
    let wrapper: Wrapper<AGCaseResult>;
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

        let case_pk = 1;
        ag_test_case_result = data_ut.make_ag_test_case_result_feedback(case_pk);

        wrapper = mount(AGCaseResult, {
            propsData: {
                ag_test_case_result: ag_test_case_result,
                fdbk_category: ag_cli.FeedbackCategory.max,
                submission: submission,
            }
        });
    });

    test('command_result_correctness - return output_correctness', async () => {
        let command_pk = 1;
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );

        ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: null,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.all_correct
        );

        ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
            command_pk,
            {
                stdout_correct: false,
                stderr_correct: true
            }
        );

        expect(wrapper.vm.command_result_output_correctness(ag_test_command_result)).toEqual(
            CorrectnessLevel.some_correct
        );

        ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
        let ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
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
