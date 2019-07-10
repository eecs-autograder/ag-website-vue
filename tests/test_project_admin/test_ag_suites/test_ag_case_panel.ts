import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig, AGTestSuite, AGTestSuiteFeedbackConfig,
    ExpectedOutputSource,
    ExpectedReturnCode,
    HttpError,
    StdinSource,
    ValueFeedbackLevel,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGCasePanel from '@/components/project_admin/ag_suites/ag_case_panel.vue';
import ValidatedInput from '@/components/validated_input.vue';

import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCasePanel tests', () => {
    let wrapper: Wrapper<AGCasePanel>;
    let component: AGCasePanel;
    let ag_suite_colors: AGTestSuite;
    let ag_case_green: AGTestCase;
    let ag_case_yellow: AGTestCase;
    let ag_command_green_1: AGTestCommand;
    let ag_command_green_2: AGTestCommand;
    let ag_command_green_3: AGTestCommand;
    let ag_command_yellow_1: AGTestCommand;
    let command_in_different_case: AGTestCommand;
    let default_suite_feedback_config: AGTestSuiteFeedbackConfig;
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

        default_suite_feedback_config = {
            show_individual_tests: false,
            show_setup_return_code: false,
            show_setup_stderr: false,
            show_setup_stdout: false,
            show_setup_timed_out: false,
            visible: false
        };

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

        ag_suite_colors = new AGTestSuite({
            pk: 1,
            name: "Suite 1",
            project: 10,
            last_modified: "",
            read_only_instructor_files: true,
            setup_suite_cmd: "",
            setup_suite_cmd_name: "",
            sandbox_docker_image: {
            pk: 1,
            name: "Sandy",
            tag: "",
            display_name: "Hi everyone"
            },
            allow_network_access: false,
            deferred: true,
            normal_fdbk_config: default_suite_feedback_config,
            past_limit_submission_fdbk_config: default_suite_feedback_config,
            staff_viewer_fdbk_config: default_suite_feedback_config,
            ultimate_submission_fdbk_config: default_suite_feedback_config,
            ag_test_cases: [ag_case_green, ag_case_yellow],
            instructor_files_needed: [],
            student_files_needed: []
        });

        wrapper = mount(AGCasePanel, {
            propsData: {
                ag_test_case: ag_case_green,
                ag_test_suite: ag_suite_colors,
                active_ag_test_case: null,
                active_ag_test_command: null
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

    test('Case (closed and child command not active) is clicked on',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(
            ag_case_green
        );
        expect(component.commands_are_visible).toBe(true);
    });

    test('Case (closed and child command is active) is clicked on',
         async () => {
        wrapper.setProps({active_ag_test_command: ag_command_green_2});
        await component.$nextTick();

        expect(component.command_in_case_is_active).toBe(true);
        expect(component.active_ag_test_command).toEqual(ag_command_green_2);
        expect(component.commands_are_visible).toBe(true);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(component.command_in_case_is_active).toBe(true);
        expect(component.commands_are_visible).toBe(false);
        expect(component.active_ag_test_command).toEqual(ag_command_green_2);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(component.command_in_case_is_active).toBe(true);
        expect(component.commands_are_visible).toBe(true);
        expect(component.active_ag_test_command).toEqual(ag_command_green_2);
    });

    test('Case (open and child command not active) is clicked on',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);

        expect(component.commands_are_visible).toBe(true);

        wrapper.setProps({active_ag_test_command: ag_command_green_1});
        await component.$nextTick();

        expect(component.command_in_case_is_active).toBe(true);

        wrapper.setProps({active_ag_test_command: ag_command_yellow_1});
        await component.$nextTick();

        expect(component.commands_are_visible).toBe(true);
        expect(component.command_in_case_is_active).toBe(false);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[1][0]).toEqual(ag_case_green);

        expect(component.commands_are_visible).toBe(true);
    });

    test('Case (open and child command is active) is clicked on',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(
            ag_case_green
        );

        wrapper.setProps({active_ag_test_command: ag_command_green_1});
        await component.$nextTick();

        expect(component.commands_are_visible).toBe(true);
        expect(component.command_in_case_is_active).toBe(true);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(component.commands_are_visible).toBe(false);
        expect(component.command_in_case_is_active).toBe(true);
    });

    test('Command in case becomes active',
         async () => {
        wrapper.setProps({active_ag_test_command: ag_command_green_2});
        await component.$nextTick();

        expect(component.commands_are_visible).toBe(true);
        expect(component.command_in_case_is_active).toBe(true);
    });

    test('When a case that is active is clicked on again, it closes', async () => {
        expect(component.is_open).toBe(false);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(component.is_open).toBe(true);
        expect(component.commands_are_visible).toBe(true);
        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);

        wrapper.setProps({active_ag_test_command: ag_command_green_1});
        await component.$nextTick();

        expect(component.command_in_case_is_active).toBe(true);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(component.command_in_case_is_active).toBe(true);
        expect(component.commands_are_visible).toBe(false);
        expect(component.is_open).toBe(false);
    });

    test('When a command is clicked on, an event is emitted',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);
        expect(component.commands_are_visible).toBe(true);

        wrapper.findAll('.ag-test-command').at(1).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[1][0]).toEqual(ag_command_green_2);
    });

    test('Add command - successful', async () => {
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.findAll({ref: 'add_ag_test_command_menu_item'}).at(0).trigger('click');
        await component.$nextTick();

        component.d_new_command_name = "New command name";
        component.d_new_command = "New command";

        wrapper.find('#add-ag-test-command-form').trigger('submit');
        await component.$nextTick();

        expect(create_command_stub.calledOnce).toBe(true);
    });

    test('Add command - unsuccessful', async () => {
        let create_command_stub = sinon.stub(AGTestCommand, 'create').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test command with this Name and AG test case already exists."}
                )
            )
        );
        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await component.$nextTick();

        component.d_new_command_name = "New command name";
        component.d_new_command = "New command";

        wrapper.find('#add-ag-test-command-form').trigger('submit');
        await component.$nextTick();

        expect(create_command_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'new_command_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Delete case - successful', async () => {
        let delete_case_stub = sinon.stub(component.ag_test_case, 'delete');
        wrapper.setProps({active_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'delete_ag_test_case_menu_item'}).trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_case_stub.calledOnce).toBe(true);
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
        expect(component.ag_test_case.ag_test_commands!.length).toEqual(3);
        expect(component.ag_test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(component.ag_test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(component.ag_test_case.ag_test_commands[2].name).toEqual(ag_command_green_3.name);

        AGTestCommand.notify_ag_test_command_changed(updated_command_in_different_case);
        await component.$nextTick();

        expect(component.ag_test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(component.ag_test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(component.ag_test_case.ag_test_commands[2].name).toEqual(ag_command_green_3.name);
    });

    test('d_new_command_name binding', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await component.$nextTick();

        let new_ag_test_command_name_input = wrapper.find({ref: 'new_ag_test_command_name'});
        set_validated_input_text(new_ag_test_command_name_input, 'Sunny');

        expect(component.d_new_command_name).toEqual("Sunny");
        expect(validated_input_is_valid(new_ag_test_command_name_input)).toEqual(true);

        component.d_new_command_name = "Cloudy";
        expect(get_validated_input_text(new_ag_test_command_name_input)).toEqual("Cloudy");
    });

    test('error - new command name is blank', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await component.$nextTick();

        let new_command_name_input = wrapper.find(
            {ref: 'new_ag_test_command_name'}
        ).find('#input');
        let new_command_name_validator = <ValidatedInput> wrapper.find(
            {ref: 'new_ag_test_command_name'}
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

    test('d_new_command binding', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await component.$nextTick();

        let new_ag_test_command_input = wrapper.find({ref: 'new_ag_test_command'});
        set_validated_input_text(new_ag_test_command_input, 'Moo');

        expect(component.d_new_command).toEqual("Moo");
        expect(validated_input_is_valid(new_ag_test_command_input)).toEqual(true);

        component.d_new_command = "Baa";
        expect(get_validated_input_text(new_ag_test_command_input)).toEqual("Baa");
    });

    test('error - new command is blank', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await component.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await component.$nextTick();

        let new_command_input = wrapper.find({ref: 'new_ag_test_command'}).find('#input');
        let new_command_validator = <ValidatedInput> wrapper.find({ref: 'new_ag_test_command'}).vm;

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

    test('Watcher for test_case', async () => {
        expect(component.ag_test_case).toEqual(ag_case_green);

        wrapper.setProps({ag_test_case: ag_case_yellow});
        await component.$nextTick();

        expect(component.ag_test_case).toEqual(ag_case_yellow);
    });

    test('Watcher for test_suite', async () => {
        let another_suite = new AGTestSuite({
            pk: 2,
            name: "Another Suite",
            project: 10,
            last_modified: "",
            read_only_instructor_files: true,
            setup_suite_cmd: "",
            setup_suite_cmd_name: "",
            sandbox_docker_image: {
                pk: 1,
                name: "Sandy",
                tag: "",
                display_name: "Hi everyone"
            },
            allow_network_access: false,
            deferred: true,
            normal_fdbk_config: default_suite_feedback_config,
            past_limit_submission_fdbk_config: default_suite_feedback_config,
            staff_viewer_fdbk_config: default_suite_feedback_config,
            ultimate_submission_fdbk_config: default_suite_feedback_config,
            ag_test_cases: [],
            instructor_files_needed: [],
            student_files_needed: []
        });
        expect(component.ag_test_suite).toEqual(ag_suite_colors);

        wrapper.setProps({ag_test_suite: another_suite});
        await component.$nextTick();

        expect(component.ag_test_suite).toEqual(another_suite);
    });
});
