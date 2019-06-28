import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase, AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    ExpectedOutputSource,
    ExpectedReturnCode,
    InstructorFile,
    Project,
    StdinSource,
    UltimateSubmissionPolicy,
    ValueFeedbackLevel
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCommandSettings tests', () => {
    let wrapper: Wrapper<AGCommandSettings>;
    let component: AGCommandSettings;
    let ag_test_case: AGTestCase;
    let ag_test_command: AGTestCommand;
    let another_command: AGTestCommand;
    let case_with_two_commands: AGTestCase;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let project: Project;
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

        default_case_feedback_config = {
            visible: false,
            show_individual_commands: false
        };

        ag_test_command = new AGTestCommand({
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

        another_command = new AGTestCommand({
            pk: 2,
            name: "Command 2",
            ag_test_case: 1,
            last_modified: "",
            cmd: "Say sorry",
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

        ag_test_case = new AGTestCase({
            pk: 1,
            name: "Case A",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_test_command]
        });

        case_with_two_commands = new AGTestCase({
            pk: 1,
            name: "Case A",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_test_command, another_command]
        });

        instructor_file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "antarctica.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_2 = new InstructorFile({
            pk: 2,
            project: 10,
            name: "africa.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_3 = new InstructorFile({
            pk: 3,
            project: 10,
            name: "asia.cpp",
            size: 2,
            last_modified: "now"
        });

        project = new Project({
            pk: 10,
            name: "Detroit Zoo",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false,
            expected_student_files: [],
            instructor_files: [instructor_file_1, instructor_file_2, instructor_file_3]
        });

        wrapper = mount(AGCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
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

    test('error - command name is blank (case has more than one command)', async () => {
        let another_case = new AGTestCase({
            pk: 1,
            name: "Another Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_test_command, another_command]
        });

        wrapper.setProps({ag_test_case: another_case});
        await component.$nextTick();

        let name_input = wrapper.find({ref: "command_name"}).find('#input');
        let name_validator = <ValidatedInput> wrapper.find({ref: "command_name"}).vm;

        expect(name_validator.is_valid).toBe(true);

        (<HTMLInputElement> name_input.element).value = " ";
        name_input.trigger('input');
        await component.$nextTick();

        expect(name_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - cmd is blank', async () => {
        let cmd_input = wrapper.find({ref: "cmd"}).find('#textarea');
        let cmd_validator = <ValidatedInput> wrapper.find({ref: "cmd"}).vm;

        expect(cmd_validator.is_valid).toBe(true);

        (<HTMLInputElement> cmd_input.element).value = " ";
        cmd_input.trigger('input');
        await component.$nextTick();

        expect(cmd_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - stdin_text is blank', async () => {
        let stdin_text_input = wrapper.find({ref: "cmd"}).find('#textarea');
        let stdin_text_validator = <ValidatedInput> wrapper.find({ref: "cmd"}).vm;

        component.d_ag_test_command!.stdin_source = StdinSource.text;
        (<HTMLInputElement> stdin_text_input.element).value = "Lamp";
        stdin_text_input.trigger('input');
        await component.$nextTick();

        expect(stdin_text_validator.is_valid).toBe(true);

        (<HTMLInputElement> stdin_text_input.element).value = " ";
        stdin_text_input.trigger('input');
        await component.$nextTick();

        expect(stdin_text_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - points_for_correct_return_code is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        let correct_return_code_points_input = wrapper.find(
            {ref: "points_for_correct_return_code"}
        ).find('#input');
        let correct_return_code_points_validator = <ValidatedInput> wrapper.find(
            {ref: "points_for_correct_return_code"}
        ).vm;

        expect(correct_return_code_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> correct_return_code_points_input.element).value = " ";
        correct_return_code_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_return_code_points_validator.is_valid).toBe(false);

        (<HTMLInputElement> correct_return_code_points_input.element).value = "Glasses";
        correct_return_code_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_return_code_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - points_for_correct_return_code must be >= 0', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        let correct_return_code_points_input = wrapper.find(
            {ref: "points_for_correct_return_code"}
        ).find('#input');
        let correct_return_code_points_validator = <ValidatedInput> wrapper.find(
            {ref: "points_for_correct_return_code"}
        ).vm;

        expect(correct_return_code_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> correct_return_code_points_input.element).value = "-2";
        correct_return_code_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_return_code_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - deduction_for_wrong_return_code is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        let wrong_return_code_points_input = wrapper.find(
            {ref: "deduction_for_wrong_return_code"}
        ).find('#input');
        let wrong_return_code_points_validator = <ValidatedInput> wrapper.find(
            {ref: "deduction_for_wrong_return_code"}
        ).vm;

        expect(wrong_return_code_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> wrong_return_code_points_input.element).value = " ";
        wrong_return_code_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_return_code_points_validator.is_valid).toBe(false);

        (<HTMLInputElement> wrong_return_code_points_input.element).value = "Glasses";
        wrong_return_code_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_return_code_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - deduction_for_wrong_return_code must be >= 0', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        let wrong_return_code_points_input = wrapper.find(
            {ref: "deduction_for_wrong_return_code"}
        ).find('#input');
        let wrong_return_code_points_validator = <ValidatedInput> wrapper.find(
            {ref: "deduction_for_wrong_return_code"}
        ).vm;

        expect(wrong_return_code_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> wrong_return_code_points_input.element).value = "-1";
        wrong_return_code_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_return_code_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - expected_stdout_text is blank', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;

        let expected_stdout_text_input = wrapper.find(
            {ref: "expected_stdout_text"}
        ).find('#textarea');
        let expected_stdout_text_validator = <ValidatedInput> wrapper.find(
            {ref: "expected_stdout_text"}
        ).vm;

        (<HTMLInputElement> expected_stdout_text_input.element).value = "Rain";
        expected_stdout_text_input.trigger('input');
        await component.$nextTick();

        expect(expected_stdout_text_validator.is_valid).toBe(true);

        (<HTMLInputElement> expected_stdout_text_input.element).value = " ";
        expected_stdout_text_input.trigger('input');
        await component.$nextTick();

        expect(expected_stdout_text_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - points_for_correct_stdout is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stdout_text = "Hi there";

        let correct_stdout_points_input = wrapper.find(
            {ref: "points_for_correct_stdout"}
        ).find('#input');
        let correct_stdout_points_validator = <ValidatedInput> wrapper.find(
            {ref: "points_for_correct_stdout"}
        ).vm;

        expect(correct_stdout_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> correct_stdout_points_input.element).value = " ";
        correct_stdout_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_stdout_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> correct_stdout_points_input.element).value = "Scooby Doo";
        correct_stdout_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_stdout_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - points_for_correct_stdout must be >= 0', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stdout_text = "Hi there";

        let correct_stdout_points_input = wrapper.find(
            {ref: "points_for_correct_stdout"}
        ).find('#input');
        let correct_stdout_points_validator = <ValidatedInput> wrapper.find(
            {ref: "points_for_correct_stdout"}
        ).vm;

        expect(correct_stdout_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> correct_stdout_points_input.element).value = "-1";
        correct_stdout_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_stdout_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - deduction_for_wrong_stdout is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stdout_text = "Hi there";

        let wrong_stdout_points_input = wrapper.find(
            {ref: "deduction_for_wrong_stdout"}
        ).find('#input');
        let wrong_stdout_points_validator = <ValidatedInput> wrapper.find(
            {ref: "deduction_for_wrong_stdout"}
        ).vm;

        expect(wrong_stdout_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> wrong_stdout_points_input.element).value = " ";
        wrong_stdout_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_stdout_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> wrong_stdout_points_input.element).value = "Mystery Machine";
        wrong_stdout_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_stdout_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - deduction_for_wrong_stdout must be >= 0', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stdout_text = "Hi there";

        let wrong_stdout_points_input = wrapper.find(
            {ref: "deduction_for_wrong_stdout"}
        ).find('#input');
        let wrong_stdout_points_validator = <ValidatedInput> wrapper.find(
            {ref: "deduction_for_wrong_stdout"}
        ).vm;

        expect(wrong_stdout_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> wrong_stdout_points_input.element).value = "-1";
        wrong_stdout_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_stdout_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - expected_stderr_text is blank', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        let expected_stderr_text_input = wrapper.find(
            {ref: "expected_stderr_text"}
        ).find('#textarea');
        let expected_stderr_text_validator = <ValidatedInput> wrapper.find(
            {ref: "expected_stderr_text"}
        ).vm;

        (<HTMLInputElement> expected_stderr_text_input.element).value = "Snow";
        expected_stderr_text_input.trigger('input');
        await component.$nextTick();

        expect(expected_stderr_text_validator.is_valid).toBe(true);

        (<HTMLInputElement> expected_stderr_text_input.element).value = " ";
        expected_stderr_text_input.trigger('input');
        await component.$nextTick();

        expect(expected_stderr_text_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - points_for_correct_stderr is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        let correct_stderr_points_input = wrapper.find(
            {ref: "points_for_correct_stderr"}
        ).find('#input');
        let correct_stderr_points_validator = <ValidatedInput> wrapper.find(
            {ref: "points_for_correct_stderr"}
        ).vm;

        expect(correct_stderr_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> correct_stderr_points_input.element).value = " ";
        correct_stderr_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_stderr_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> correct_stderr_points_input.element).value = "Scooby Doo";
        correct_stderr_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_stderr_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - points_for_correct_stderr must be >= 0', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        let correct_stderr_points_input = wrapper.find(
            {ref: "points_for_correct_stderr"}
        ).find('#input');
        let correct_stderr_points_validator = <ValidatedInput> wrapper.find(
            {ref: "points_for_correct_stderr"}
        ).vm;

        expect(correct_stderr_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> correct_stderr_points_input.element).value = "-1";
        correct_stderr_points_input.trigger('input');
        await component.$nextTick();

        expect(correct_stderr_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - deduction_for_wrong_stderr is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        let wrong_stderr_points_input = wrapper.find(
            {ref: "deduction_for_wrong_stderr"}
        ).find('#input');
        let wrong_stderr_points_validator = <ValidatedInput> wrapper.find(
            {ref: "deduction_for_wrong_stderr"}
        ).vm;

        expect(wrong_stderr_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> wrong_stderr_points_input.element).value = " ";
        wrong_stderr_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_stderr_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> wrong_stderr_points_input.element).value = "Scooby Doo";
        wrong_stderr_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_stderr_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - deduction_for_wrong_stderr must be >= 0', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        let wrong_stderr_points_input = wrapper.find(
            {ref: "deduction_for_wrong_stderr"}
        ).find('#input');
        let wrong_stderr_points_validator = <ValidatedInput> wrapper.find(
            {ref: "deduction_for_wrong_stderr"}
        ).vm;

        expect(wrong_stderr_points_validator.is_valid).toBe(true);

        (<HTMLInputElement> wrong_stderr_points_input.element).value = "-1";
        wrong_stderr_points_input.trigger('input');
        await component.$nextTick();

        expect(wrong_stderr_points_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - time_limit is blank or not an integer', async () => {
        let time_limit_input = wrapper.find({ref: 'time_limit'}).find('#input');
        let time_limit_validator = <ValidatedInput> wrapper.find({ref: 'time_limit'}).vm;

        expect(time_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> time_limit_input.element).value = " ";
        time_limit_input.trigger('input');
        await component.$nextTick();

        expect(time_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> time_limit_input.element).value = "cupcake";
        time_limit_input.trigger('input');
        await component.$nextTick();

        expect(time_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - time_limit must be >= 1', async () => {
        let time_limit_input = wrapper.find({ref: 'time_limit'}).find('#input');
        let time_limit_validator = <ValidatedInput> wrapper.find({ref: 'time_limit'}).vm;

        expect(time_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> time_limit_input.element).value = "0";
        time_limit_input.trigger('input');
        await component.$nextTick();

        expect(time_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> time_limit_input.element).value = "1";
        time_limit_input.trigger('input');
        await component.$nextTick();

        expect(time_limit_validator.is_valid).toBe(true);
    });

    test('error - virtual_memory_limit is blank or not an integer', async () => {
        let virtual_memory_limit_input = wrapper.find(
            {ref: 'virtual_memory_limit'}
        ).find('#input');
        let virtual_memory_limit_validator = <ValidatedInput> wrapper.find(
            {ref: 'virtual_memory_limit'}
        ).vm;

        expect(virtual_memory_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> virtual_memory_limit_input.element).value = " ";
        virtual_memory_limit_input.trigger('input');
        await component.$nextTick();

        expect(virtual_memory_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> virtual_memory_limit_input.element).value = "cheesecake";
        virtual_memory_limit_input.trigger('input');
        await component.$nextTick();

        expect(virtual_memory_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - virtual_memory_limit must be >= 1', async () => {
        let virtual_memory_limit_input = wrapper.find(
            {ref: 'virtual_memory_limit'}
        ).find('#input');
        let virtual_memory_limit_validator = <ValidatedInput> wrapper.find(
            {ref: 'virtual_memory_limit'}
        ).vm;

        expect(virtual_memory_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> virtual_memory_limit_input.element).value = "0";
        virtual_memory_limit_input.trigger('input');
        await component.$nextTick();

        expect(virtual_memory_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> virtual_memory_limit_input.element).value = "1";
        virtual_memory_limit_input.trigger('input');
        await component.$nextTick();

        expect(virtual_memory_limit_validator.is_valid).toBe(true);
    });

    test('error - stack_size_limit is blank or not an integer', async () => {
        let stack_size_limit_input = wrapper.find(
            {ref: 'stack_size_limit'}
        ).find('#input');
        let stack_size_limit_validator = <ValidatedInput> wrapper.find(
            {ref: 'stack_size_limit'}
        ).vm;

        expect(stack_size_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> stack_size_limit_input.element).value = " ";
        stack_size_limit_input.trigger('input');
        await component.$nextTick();

        expect(stack_size_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> stack_size_limit_input.element).value = "pudding";
        stack_size_limit_input.trigger('input');
        await component.$nextTick();

        expect(stack_size_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - stack_size_limit must be >= 1', async () => {
        let stack_size_limit_input = wrapper.find(
            {ref: 'stack_size_limit'}
        ).find('#input');
        let stack_size_limit_validator = <ValidatedInput> wrapper.find(
            {ref: 'stack_size_limit'}
        ).vm;

        expect(stack_size_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> stack_size_limit_input.element).value = "0";
        stack_size_limit_input.trigger('input');
        await component.$nextTick();

        expect(stack_size_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> stack_size_limit_input.element).value = "1";
        stack_size_limit_input.trigger('input');
        await component.$nextTick();

        expect(stack_size_limit_validator.is_valid).toBe(true);
    });

    test('error - process_spawn_limit is blank or not an integer', async () => {
        let process_spawn_limit_input = wrapper.find(
            {ref: 'process_spawn_limit'}
        ).find('#input');
        let process_spawn_limit_validator = <ValidatedInput> wrapper.find(
            {ref: 'process_spawn_limit'}
        ).vm;

        expect(process_spawn_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> process_spawn_limit_input.element).value = " ";
        process_spawn_limit_input.trigger('input');
        await component.$nextTick();

        expect(process_spawn_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> process_spawn_limit_input.element).value = "jello";
        process_spawn_limit_input.trigger('input');
        await component.$nextTick();

        expect(process_spawn_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('error - process_spawn_limit must be >= 0', async () => {
        let process_spawn_limit_input = wrapper.find(
            {ref: 'process_spawn_limit'}
        ).find('#input');
        let process_spawn_limit_validator = <ValidatedInput> wrapper.find(
            {ref: 'process_spawn_limit'}
        ).vm;

        expect(process_spawn_limit_validator.is_valid).toBe(true);

        (<HTMLInputElement> process_spawn_limit_input.element).value = "-1";
        process_spawn_limit_input.trigger('input');
        await component.$nextTick();

        expect(process_spawn_limit_validator.is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        (<HTMLInputElement> process_spawn_limit_input.element).value = "0";
        process_spawn_limit_input.trigger('input');
        await component.$nextTick();

        expect(process_spawn_limit_validator.is_valid).toBe(true);
    });

    test('Save command settings - successful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_command!, 'save');

        wrapper.find('#ag-test-command-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('Save command settings - unsuccessful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_command!, 'save');
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
        save_stub.returns(Promise.reject(axios_response_instance));
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        wrapper.find('#ag-test-command-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Delete command', async () => {
        wrapper.setProps({ag_test_case: case_with_two_commands});

        let delete_command_stub = sinon.stub(component.d_ag_test_command!, 'delete');

        wrapper.setData({current_tab_index: 2});
        await component.$nextTick();

        wrapper.find('.delete-ag-test-command-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_command_stub.calledOnce).toBe(true);
    });

    test('Delete case with exactly one command', async () => {
        let delete_case_stub = sinon.stub(component.d_ag_test_case!, 'delete');

        wrapper.setData({current_tab_index: 2});
        await component.$nextTick();

        wrapper.find('.delete-ag-test-command-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_case_stub.calledOnce).toBe(true);
    });

    test('Parent component changes the value supplied to the test_command prop', async () => {
        expect(component.d_ag_test_command!.pk).toEqual(ag_test_command.pk);
        expect(component.current_tab_index).toEqual(0);

        wrapper.setProps({'ag_test_command': another_command});
        await component.$nextTick();

        expect(component.d_ag_test_command!.pk).toEqual(another_command.pk);
        expect(component.current_tab_index).toEqual(0);

        wrapper.setData({current_tab_index: 2});
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(2);

        wrapper.setProps({'ag_test_command': ag_test_command});
        await component.$nextTick();

        expect(component.d_ag_test_command!.pk).toEqual(ag_test_command.pk);
        expect(component.current_tab_index).toEqual(0);
    });

    test('Parent component changes the value supplied to the test_case prop', async () => {
        expect(component.d_ag_test_case!.pk).toEqual(ag_test_case.pk);
        expect(component.current_tab_index).toEqual(0);

        wrapper.setProps({'ag_test_case': case_with_two_commands});
        await component.$nextTick();

        expect(component.d_ag_test_case!.pk).toEqual(case_with_two_commands.pk);
        expect(component.current_tab_index).toEqual(0);

        wrapper.setData({current_tab_index: 2});
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(2);

        wrapper.setProps({'ag_test_case': ag_test_case});
        await component.$nextTick();

        expect(component.d_ag_test_command!.pk).toEqual(ag_test_command.pk);
        expect(component.current_tab_index).toEqual(0);
    });
});
