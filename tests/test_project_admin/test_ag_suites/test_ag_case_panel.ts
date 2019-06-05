import APIErrors from '@/components/api_errors.vue';
import AGCasePanel from '@/components/project_admin/ag_suites/ag_case_panel.vue';
import ValidatedInput from '@/components/validated_input.vue';
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
    let ag_case_green: AGTestCase;
    let ag_case_yellow: AGTestCase;
    let ag_command_green_1: AGTestCommand;
    let ag_command_green_2: AGTestCommand;
    let ag_command_green_3: AGTestCommand;
    let ag_command_yellow_1: AGTestCommand;
    let command_in_different_case: AGTestCommand;
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

        command_in_different_case = new AGTestCommand({
            pk: 1,
            name: "2012",
            ag_test_case: 2,
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

        ag_command_green_1 = new AGTestCommand({
            pk: 1,
            name: "Green Command 1",
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

        ag_command_green_2 = new AGTestCommand({
            pk: 2,
            name: "Green Command 2",
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

        ag_command_green_3 = new AGTestCommand({
            pk: 3,
            name: "Green Command 3",
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

        ag_command_yellow_1 = new AGTestCommand({
            pk: 1,
            name: "Yellow Command 1",
            ag_test_case: 2,
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

        ag_case_green = new AGTestCase({
            pk: 1,
            name: "Green Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_green_1, ag_command_green_2, ag_command_green_3]
        });

        ag_case_yellow = new AGTestCase({
            pk: 2,
            name: "Yellow Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_yellow_1]
        });

        wrapper = mount(AGCasePanel, {
            propsData: {
                test_case: ag_case_green,
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

    test('When a case with more than one command is clicked on, the case is emitted',
         async () => {
        wrapper.findAll('.test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_case[0][0]).toEqual(ag_case_green);
    });

    test('When a case with exactly one command is clicked on, the case ' +
              'and command are emitted',
         async () => {
        wrapper.setProps({test_case: ag_case_yellow});

        wrapper.findAll('.test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_case[0][0]).toEqual(ag_case_yellow);
        expect(wrapper.emitted().update_active_command[0][0]).toEqual(ag_command_yellow_1);
    });

    test('When a command is clicked on, an event is emitted', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        wrapper.findAll('.test-command').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_command[0][0]).toEqual(ag_command_green_1);
    });

    test('Add command - successful', async () => {
        let create_command_stub = sinon.stub(AGTestCommand, 'create');
        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_command_menu_item'}).trigger('click');
        await component.$nextTick();

        component.new_command_name = "New command name";
        component.new_command = "New command";

        wrapper.find('#add-command-form').trigger('submit.native');
        await component.$nextTick();

        expect(create_command_stub.calledOnce).toBe(true);
    });

    test('Add command - unsuccessful', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Ag test command with this Name and AG test case already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        let create_command_stub = sinon.stub(AGTestCommand, 'create').returns(
            Promise.reject(axios_response_instance)
        );
        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_command_menu_item'}).trigger('click');
        await component.$nextTick();

        component.new_command_name = "New command name";
        component.new_command = "New command";

        wrapper.find('#add-command-form').trigger('submit.native');
        await component.$nextTick();

        expect(create_command_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'new_command_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('is_active_case getter', async () => {
        let case_in_different_suite = new AGTestCase({
            pk: 4,
            name: "Casey's Corner: Changed",
            ag_test_suite: 2,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        expect(component.is_active_case).toBe(false);

        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        expect(component.is_active_case).toBe(true);

        wrapper.setProps({active_command: ag_command_green_2});
        await component.$nextTick();

        expect(component.is_active_case).toBe(true);

        wrapper.setProps({active_case: case_in_different_suite});
        await component.$nextTick();

        expect(component.is_active_case).toBe(false);
    });

    test('command_is_active_level', async () => {
        expect(component.command_is_active_level).toBe(false);

        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        expect(component.command_is_active_level).toBe(false);

        wrapper.setProps({active_command: ag_command_green_2});
        await component.$nextTick();

        expect(component.command_is_active_level).toBe(true);
    });

    test('delete all but 1 command from case - case becomes active', async () => {
        wrapper.setProps({active_case: ag_case_green});
        wrapper.setProps({active_command: ag_command_green_2});
        await component.$nextTick();

        expect(component.is_active_case).toBe(true);
        expect(component.test_case!.ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_2);
        await component.$nextTick();

        expect(wrapper.emitted().update_active_command[0][0]).toEqual(ag_command_green_3);
        expect(component.test_case!.ag_test_commands.length).toEqual(2);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_1);
        await component.$nextTick();

        expect(wrapper.emitted().update_active_command[1][0]).toEqual(ag_command_green_3);
        expect(component.test_case!.ag_test_commands.length).toEqual(1);

        expect(wrapper.findAll('.commands-container').length).toEqual(0);
    });

    test('delete last command in case (order-wise)', async () => {
        wrapper.setProps({active_case: ag_case_green});
        wrapper.setProps({active_command: ag_command_green_3});
        await component.$nextTick();

        expect(component.is_active_case).toBe(true);
        expect(component.test_case!.ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_3);
        await component.$nextTick();

        expect(wrapper.emitted().update_active_command[0][0]).toEqual(ag_command_green_2);
        expect(component.test_case!.ag_test_commands.length).toEqual(2);
    });

    test('delete command in the middle of the case (order-wise)', async () => {
        wrapper.setProps({active_case: ag_case_green});
        wrapper.setProps({active_command: ag_command_green_2});
        await component.$nextTick();

        expect(component.is_active_case).toBe(true);
        expect(component.test_case!.ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_2);
        await component.$nextTick();

        expect(wrapper.emitted().update_active_command[0][0]).toEqual(ag_command_green_3);
        expect(component.test_case!.ag_test_commands.length).toEqual(2);
    });

    test('delete first command in the case (order-wise)', async () => {
        wrapper.setProps({active_case: ag_case_green});
        wrapper.setProps({active_command: ag_command_green_1});
        await component.$nextTick();

        expect(component.is_active_case).toBe(true);
        expect(component.test_case!.ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_1);
        await component.$nextTick();

        expect(wrapper.emitted().update_active_command[0][0]).toEqual(ag_command_green_2);
        expect(component.test_case!.ag_test_commands.length).toEqual(2);
    });

    test('command gets deleted from a different case', async () => {
        expect(component.test_case!.ag_test_commands.length).toEqual(3);
        AGTestCommand.notify_ag_test_command_deleted(command_in_different_case);

        expect(component.test_case!.ag_test_commands.length).toEqual(3);
    });

    test('command in this case changed', async () => {
        let updated_ag_command_c = new AGTestCommand({
            pk: 3,
            name: "Command C",
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
        expect(component.test_case.ag_test_commands!.length).toEqual(3);
        expect(component.test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(component.test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(component.test_case.ag_test_commands[2].name).toEqual(ag_command_green_3.name);

        AGTestCommand.notify_ag_test_command_changed(updated_ag_command_c);
        await component.$nextTick();

        expect(component.test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(component.test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(component.test_case.ag_test_commands[2].name).toEqual(updated_ag_command_c.name);
    });

    test('command in a different case changed', async () => {
        let updated_command_in_different_case = new AGTestCommand({
            pk: 1,
            name: "2019",
            ag_test_case: 2,
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
        expect(component.test_case.ag_test_commands!.length).toEqual(3);
        expect(component.test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(component.test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(component.test_case.ag_test_commands[2].name).toEqual(ag_command_green_3.name);

        AGTestCommand.notify_ag_test_command_changed(updated_command_in_different_case);
        await component.$nextTick();

        expect(component.test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(component.test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(component.test_case.ag_test_commands[2].name).toEqual(ag_command_green_3.name);
    });

    test('command got created in this case', async () => {
        let ag_command_d = new AGTestCommand({
            pk: 4,
            name: "Command D",
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

        expect(component.test_case!.ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_created(ag_command_d);
        await component.$nextTick();

        expect(component.test_case!.ag_test_commands.length).toEqual(4);
    });

    test('command got created in a different case', async () => {
        let ag_command_e = new AGTestCommand({
            pk: 5,
            name: "Command E",
            ag_test_case: 2,
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

        expect(component.test_case!.ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_created(ag_command_e);
        await component.$nextTick();

        expect(component.test_case!.ag_test_commands.length).toEqual(3);
    });

    test('error - new command name is blank', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_command_menu_item'}).trigger('click');
        await component.$nextTick();

        let new_command_name_input = wrapper.find(
            {ref: 'new_command_name'}
        ).find('#input');
        let new_command_name_validator = <ValidatedInput> wrapper.find(
            {ref: 'new_command_name'}
        ).vm;

        expect(new_command_name_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_name_input.element).value = "Great";
        new_command_name_input.trigger('input');
        await component.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_name_input.element).value = " ";
        new_command_name_input.trigger('input');
        await component.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(false);
    });

    test('error - new command is blank', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_command_menu_item'}).trigger('click');
        await component.$nextTick();

        let new_command_input = wrapper.find({ref: 'new_command'}).find('#input');
        let new_command_validator = <ValidatedInput> wrapper.find({ref: 'new_command'}).vm;

        expect(new_command_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_input.element).value = "Splenda";
        new_command_input.trigger('input');
        await component.$nextTick();

        expect(new_command_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_input.element).value = " ";
        new_command_input.trigger('input');
        await component.$nextTick();

        expect(new_command_validator.is_valid).toBe(false);
    });
});
