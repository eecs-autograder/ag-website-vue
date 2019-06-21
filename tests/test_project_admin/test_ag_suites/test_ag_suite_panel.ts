import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    ExpectedOutputSource,
    ExpectedReturnCode,
    get_sandbox_docker_images,
    StdinSource,
    ValueFeedbackLevel
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGSuitePanel from '@/components/project_admin/ag_suites/ag_suite_panel.vue';
import ValidatedInput from '@/components/validated_input.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuitePanel tests', () => {
    let wrapper: Wrapper<AGSuitePanel>;
    let component: AGSuitePanel;
    let ag_suite: AGTestSuite;
    let ag_case_a: AGTestCase;
    let ag_case_b: AGTestCase;
    let ag_case_c: AGTestCase;
    let ag_command: AGTestCommand;
    let case_from_different_suite: AGTestCase;
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

        ag_case_a = new AGTestCase({
            pk: 1,
            name: "Case A",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        ag_case_b = new AGTestCase({
            pk: 2,
            name: "Case B",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        ag_case_c = new AGTestCase({
            pk: 3,
            name: "Case C",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        case_from_different_suite = new AGTestCase({
            pk: 4,
            name: "Casey's Corner",
            ag_test_suite: 2,
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

        ag_suite = new AGTestSuite({
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
            ag_test_cases: [ag_case_a, ag_case_b, ag_case_c],
            instructor_files_needed: [],
            student_files_needed: []
        });

        wrapper = mount(AGSuitePanel, {
            propsData: {
                test_suite: ag_suite,
                active_suite: null,
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

    test('When a suite is clicked on, an event is emitted', async () => {
        wrapper.findAll('.test-suite').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted('update_active_suite').length).toEqual(1);
    });

    test('Clicking on the suite-menu when the suite is not active prompts an event ' +
         'to be emitted',
         async () => {
        expect(component.active_suite).toBeNull();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted('update_active_suite').length).toEqual(1);
    });

    test('Add case (and first command of the same name) - successful', async () => {
        let new_case = new AGTestCase({
            pk: 4,
            name: "New Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        expect(component.new_case_name).toEqual("");
        expect(component.new_commands[0]).toEqual({name: "", cmd: ""});

        component.new_case_name = "Case 2";
        component.new_commands[0].cmd = "Sit down";

        wrapper.find({ref: 'create_case_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_case_stub.calledOnce).toBe(true);
        expect(create_case_stub.firstCall.args[1].name).toEqual("Case 2");
        expect(create_command_stub.calledOnce).toBe(true);
        expect(create_command_stub.firstCall.args[1].name).toEqual("Case 2");
    });

    test('Add case with two commands (first command has same name as case) - successful',
         async () => {
        let new_case = new AGTestCase({
            pk: 4,
            name: "New Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        expect(component.new_case_name).toEqual("");
        expect(component.new_commands[0]).toEqual({name: "", cmd: ""});

        component.new_case_name = "Casey";

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        component.new_commands[0].cmd = "apples";
        component.new_commands[1].name = "BANANAS";
        component.new_commands[1].cmd = "bananas";

        wrapper.find({ref: 'create_case_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_case_stub.calledOnce).toBe(true);
        expect(create_case_stub.firstCall.args[1].name).toEqual("Casey");
        expect(create_command_stub.calledTwice).toBe(true);
        expect(create_command_stub.firstCall.args[1].name).toEqual("Casey");
        expect(create_command_stub.firstCall.args[1].cmd).toEqual("apples");
        expect(create_command_stub.secondCall.args[1].name).toEqual("BANANAS");
        expect(create_command_stub.secondCall.args[1].cmd).toEqual("bananas");
    });

    test('Add case with two commands (first command has a different name than the case) ' +
         '- successful',
         async () => {
        let new_case = new AGTestCase({
            pk: 4,
            name: "New Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        expect(component.new_case_name).toEqual("");
        expect(component.new_commands[0]).toEqual({name: "", cmd: ""});

        component.new_case_name = "Casey";

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        component.new_commands[0].name = "APPLES";
        component.new_commands[0].cmd = "apples";
        component.new_commands[1].name = "BANANAS";
        component.new_commands[1].cmd = "bananas";

        wrapper.find({ref: 'create_case_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_case_stub.calledOnce).toBe(true);
        expect(create_case_stub.firstCall.args[1].name).toEqual("Casey");
        expect(create_command_stub.calledTwice).toBe(true);
        expect(create_command_stub.firstCall.args[1].name).toEqual("APPLES");
        expect(create_command_stub.firstCall.args[1].cmd).toEqual("apples");
        expect(create_command_stub.secondCall.args[1].name).toEqual("BANANAS");
        expect(create_command_stub.secondCall.args[1].cmd).toEqual("bananas");
    });

    test('Attempt to add case with duplicate command name present (1st and 2nd', async () => {
        let new_case = new AGTestCase({
            pk: 4,
            name: "New Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        expect(component.new_case_name).toEqual("");
        expect(component.new_commands[0]).toEqual({name: "", cmd: ""});

        component.new_case_name = "Casey";

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        component.new_commands[0].name = "APPLES";
        component.new_commands[0].cmd = "apples";
        component.new_commands[1].name = "APPLES";
        component.new_commands[1].cmd = "bananas";
        wrapper.find({ref: 'create_case_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_case_stub.callCount).toEqual(0);
        expect(create_command_stub.callCount).toEqual(0);
    });

    test('Attempt to add case with duplicate command name present (1st and 3rd', async () => {
        let new_case = new AGTestCase({
            pk: 4,
            name: "New Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        expect(component.new_case_name).toEqual("");
        expect(component.new_commands[0]).toEqual({name: "", cmd: ""});

        component.new_case_name = "Casey";

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();
        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        component.new_commands[0].name = "APPLES";
        component.new_commands[0].cmd = "apples";
        component.new_commands[1].name = "BANANAS";
        component.new_commands[1].cmd = "bananas";
        component.new_commands[2].name = "APPLES";
        component.new_commands[2].cmd = "cherries";

        wrapper.find({ref: 'create_case_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_case_stub.callCount).toEqual(0);
        expect(create_command_stub.callCount).toEqual(0);
    });

    test('Attempt to add case with duplicate command name present (2nd and 3rd', async () => {
        let new_case = new AGTestCase({
            pk: 4,
            name: "New Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();
        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        expect(component.new_case_name).toEqual("");
        expect(component.new_commands[0]).toEqual({name: "", cmd: ""});

        component.new_case_name = "Casey";

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        component.new_commands[0].name = "APPLES";
        component.new_commands[0].cmd = "apples";
        component.new_commands[1].name = "BANANAS";
        component.new_commands[1].cmd = "bananas";
        component.new_commands[2].name = "BANANAS";
        component.new_commands[2].cmd = "cherries";

        wrapper.find({ref: 'create_case_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_case_stub.callCount).toEqual(0);
        expect(create_command_stub.callCount).toEqual(0);
    });

    test('Add case (and first command) - unsuccessful', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Ag test case with this Name and AG test suite already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(
            Promise.reject(axios_response_instance)
        );
        sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        component.new_case_name = "Case A";
        component.new_commands[0].cmd = "stand up";

        wrapper.find({ref: 'create_case_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_case_stub.callCount).toEqual(1);

        let api_errors = <APIErrors> wrapper.find({ref: 'new_case_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Remove command from create_case_modal', async () => {
        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        expect(component.new_case_name).toEqual("");
        expect(component.new_commands[0]).toEqual({name: "", cmd: ""});

        component.new_case_name = "Casey";
        expect(wrapper.findAll('.remove-command-button').length).toEqual(0);

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();
        expect(wrapper.findAll('.remove-command-button').length).toEqual(2);

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.remove-command-button').length).toEqual(3);

        wrapper.findAll('.remove-command-button').at(0).trigger('click');
        expect(wrapper.findAll('.remove-command-button').length).toEqual(2);

        wrapper.findAll('.remove-command-button').at(1).trigger('click');
        expect(wrapper.findAll('.remove-command-button').length).toEqual(0);
    });

    test('is_active_suite getter', async () => {
        let another_suite = new AGTestSuite({
            pk: 2,
            name: "Suite 2",
            project: 10,
            last_modified: "",
            read_only_instructor_files: true,
            setup_suite_cmd: "",
            setup_suite_cmd_name: "",
            sandbox_docker_image: {
                pk: 2,
                name: "Spongebob",
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

        expect(component.is_active_suite).toBe(false);

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        expect(component.is_active_suite).toBe(true);

        wrapper.setProps({active_suite: another_suite});
        await component.$nextTick();

        expect(component.is_active_suite).toBe(false);
    });

    test('case_or_command_is_active_level getter', async () => {
        let another_suite = new AGTestSuite({
            pk: 2,
            name: "Suite 2",
            project: 10,
            last_modified: "",
            read_only_instructor_files: true,
            setup_suite_cmd: "",
            setup_suite_cmd_name: "",
            sandbox_docker_image: {
                pk: 2,
                name: "Spongebob",
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

        expect(component.is_active_suite).toBe(false);

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        expect(component.case_or_command_is_active_level).toBe(false);

        wrapper.setProps({active_case: ag_case_a});
        await component.$nextTick();

        expect(component.case_or_command_is_active_level).toBe(true);

        wrapper.setProps({active_suite: another_suite});
        await component.$nextTick();

        expect(component.case_or_command_is_active_level).toBe(false);
    });

    test('error - new case name is blank', async () => {
        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');

        let new_case_name_input = wrapper.find({ref: 'new_case_name'}).find('#input');
        let new_case_name_validator = <ValidatedInput> wrapper.find({ref: 'new_case_name'}).vm;

        expect(new_case_name_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_case_name_input.element).value = "Paradise";
        new_case_name_input.trigger('input');
        await component.$nextTick();

        expect(new_case_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_case_name_input.element).value = " ";
        new_case_name_input.trigger('input');
        await component.$nextTick();

        expect(new_case_name_validator.is_valid).toBe(false);
        expect(wrapper.find('.modal-create-button').is(
            '[disabled]'
        )).toBe(true);
    });

    test('error - new command name is blank', async () => {
        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-command-button').trigger('click');
        await component.$nextTick();

        let new_command_name_input = wrapper.findAll(
            {ref: 'command_name'}
        ).at(0).find('#input');
        let new_command_name_validator = <ValidatedInput> wrapper.findAll(
            {ref: 'command_name'}
        ).at(0).vm;

        expect(new_command_name_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_name_input.element).value = "Great";
        new_command_name_input.trigger('input');
        await component.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_name_input.element).value = " ";
        new_command_name_input.trigger('input');
        await component.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(false);

        expect(wrapper.find('.modal-create-button').is(
            '[disabled]'
        )).toBe(true);
    });

    test('error - new command is blank', async () => {
        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('#suite-menu').trigger('click');

        let new_command_input = wrapper.find({ref: 'command'}).find('#input');
        let new_command_validator = <ValidatedInput> wrapper.find({ref: 'command'}).vm;

        expect(new_command_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_input.element).value = "Splendid";
        new_command_input.trigger('input');
        await component.$nextTick();

        expect(new_command_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_input.element).value = " ";
        new_command_input.trigger('input');
        await component.$nextTick();

        expect(new_command_validator.is_valid).toBe(false);
        expect(wrapper.find('.modal-create-button').is(
            '[disabled]'
        )).toBe(true);
    });

    test('Watcher for test_suite', async () => {
        let another_suite = new AGTestSuite({
            pk: 2,
            name: "Suite 2",
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
        expect(component.test_suite).toEqual(ag_suite);

        wrapper.setProps({test_suite: another_suite});
        await component.$nextTick();

        expect(component.test_suite).toEqual(another_suite);
    });

    test('duplicate_command_name getter', async () => {
        component.new_commands = [
            {name: "Anna", cmd: "Kendrick"}
        ];
        expect(component.duplicate_command_name).toEqual("");

        component.new_commands = [
            {name: "Anna", cmd: "Kendrick"},
            {name: "Rebel", cmd: "Wilson"}
        ]; // different names
        expect(component.duplicate_command_name).toEqual("");

        component.new_commands = [
            {name: "Anna", cmd: "Kendrick"},
            {name: "Anna", cmd: "Camp"}
        ]; // same name
        expect(component.duplicate_command_name).toEqual("Anna");

        component.new_commands = [
            {name: "Adam", cmd: "DeVine"},
            {name: "Adam", cmd: "Levine"},
            {name: "Brittany", cmd: "Snow"}
        ];  // 1 and 2 same name
        expect(component.duplicate_command_name).toEqual("Adam");

        component.new_commands = [
            {name: "Ester", cmd: "Dean"},
            {name: "Anna", cmd: "Camp"},
            {name: "Anna", cmd: "Kendrick"}
        ];  // 2 and 3 same name
        expect(component.duplicate_command_name).toEqual("Anna");

        component.new_commands = [
            {name: "Adam", cmd: "DeVine"},
            {name: "Brittany", cmd: "Snow"},
            {name: "Adam", cmd: "Levine"}
        ];  // 1 and 3 same name
        expect(component.duplicate_command_name).toEqual("Adam");

        component.new_commands = [
            {name: "Ester", cmd: "Dean"},
            {name: "Anna", cmd: "Camp"},
            {name: "Rebel", cmd: "Wilson"}
        ];  // all have different names
        expect(component.duplicate_command_name).toEqual("");
    });
});
