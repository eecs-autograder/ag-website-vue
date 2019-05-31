import AGCasePanel from '@/components/project_admin/ag_suites/ag_case_panel.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { AxiosError } from 'axios';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    ExpectedOutputSource,
    ExpectedReturnCode,
    get_sandbox_docker_images,
    StdinSource,
    ValueFeedbackLevel
} from 'ag-client-typescript';

import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCasePanel tests', () => {
    let wrapper: Wrapper<AGCasePanel>;
    let component: AGCasePanel;
    let ag_case: AGTestCase;
    let ag_command: AGTestCommand;
    let default_case_feedback_config: AGTestCaseFeedbackConfig;
    let default_command_feedback_config: AGTestCommandFeedbackConfig;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        default_case_feedback_config = {
            visible: false,
            show_individual_commands: false
        };

        default_command_feedback_config = {
            visible: false,
            return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            show_points: false,
            show_actual_return_code: false,
            show_actual_stdout: false,
            show_actual_stderr: false,
            show_whether_timed_out: false
        };

        ag_case = new AGTestCase({
            pk: 1,
            name: "Case 1",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        ag_command = new AGTestCommand({
            pk: 1,
            name: "Command 1",
            ag_test_case: 1,
            last_modified: "",
            cmd: "Say please and thank you",
            stdin_source: StdinSource.none,
            stdin_text: "",
            stdin_instructor_file: null,
            expected_return_code: ExpectedReturnCode.none,
            expected_stdout_source: ExpectedOutputSource.none,
            expected_stdout_text: "",
            expected_stdout_instructor_file: null,
            expected_stderr_source: ExpectedOutputSource.none,
            expected_stderr_text: "",
            expected_stderr_instructor_file: null,
            ignore_case: false,
            ignore_whitespace: false,
            ignore_whitespace_changes: false,
            ignore_blank_lines: false,
            points_for_correct_return_code: 1,
            points_for_correct_stdout: 1,
            points_for_correct_stderr: 1,
            deduction_for_wrong_return_code: 1,
            deduction_for_wrong_stdout: 1,
            deduction_for_wrong_stderr: 1,
            normal_fdbk_config: default_command_feedback_config,
            first_failed_test_normal_fdbk_config: default_command_feedback_config,
            ultimate_submission_fdbk_config: default_command_feedback_config,
            past_limit_submission_fdbk_config: default_command_feedback_config,
            staff_viewer_fdbk_config: default_command_feedback_config,
            time_limit: 1,
            stack_size_limit: 1,
            virtual_memory_limit: 1,
            process_spawn_limit: 1
        });

        wrapper = mount(AGCasePanel, {
            propsData: {
                test_case: ag_case,
                last_case: false,
                active_case: null,
                active_command: null
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('When a case is clicked on, an event is emitted', async () => {
        expect(true).toBe(true);
    });

    test.skip('When a command is clicked on, an event is emitted', async () => {
    });

    test.skip('Add command - successful', async () => {
    });

    test.skip('Add command - unsuccessful', async () => {
    });

    test.skip('is_active_case getter', async () => {
    });

    test.skip('command_is_active_level', async () => {
    });

    test.skip('command gets deleted from this case', async () => {
    });

    // Need all cases
    test.skip('command gets deleted from a different case', async () => {
    });

    test.skip('command in this case changed', async () => {
    });

    test.skip('command in a different case changed', async () => {
    });

    test.skip('command got created in this case', async () => {
    });

    test.skip('command got created in a different case', async () => {
    });

    test.skip('error - new command name is blank', async () => {
    });

    test.skip('error - new command is blank', async () => {


    });
});
