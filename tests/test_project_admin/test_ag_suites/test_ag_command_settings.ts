import { Vue } from 'vue-property-decorator';

import { config, mount, RefSelector, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    ExpectedOutputSource,
    ExpectedReturnCode,
    HttpError,
    InstructorFile,
    Project,
    StdinSource,
    UltimateSubmissionPolicy,
    ValueFeedbackLevel,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { checkbox_is_checked, get_validated_input_text, set_validated_input_text, validated_input_is_valid } from '@/tests/utils';

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

        return do_invalid_text_input_test(wrapper, {ref: "command_name"}, ' ', '.save-button');
    });

    test('error - cmd is blank', async () => {
        return do_invalid_text_input_test(wrapper, {ref: "cmd"}, ' ', '.save-button');
    });

    test('error - points_for_correct_return_code is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: "points_for_correct_return_code"}, '.save-button');
    });

    test('error - points_for_correct_return_code must be >= 0', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_return_code'}, '-2', '.save-button');
    });

    test('error - deduction_for_wrong_return_code is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_return_code'}, '.save-button');
    });

    test('error - deduction_for_wrong_return_code must be >= 0', async () => {
        component.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await component.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_return_code'}, '-1', '.save-button');
    });

    test('error - points_for_correct_stdout must be >= 0', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stdout_text = "Hi there";

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_stdout'}, '-1', '.save-button');
    });

    test('error - deduction_for_wrong_stdout is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stdout_text = "Hi there";

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_stdout'}, '.save-button');
    });

    test('error - deduction_for_wrong_stdout must be >= 0', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stdout_text = "Hi there";

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_stdout'}, '-1', '.save-button');
    });

    test('error - points_for_correct_stderr is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'points_for_correct_stderr'}, '.save-button');
    });

    test('error - points_for_correct_stderr must be >= 0', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_stderr'}, '-1', '.save-button');
    });

    test('error - deduction_for_wrong_stderr is blank or not an integer', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_stderr'}, '.save-button');
    });

    test('error - deduction_for_wrong_stderr must be >= 0', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_text = "Hi there";
        await component.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_stderr'}, '-1', '.save-button');
    });

    test('Diff options appear when expected_stdout_source !== none ' +
         'OR expected_stderr_source !== none',
         async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.instructor_file;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.none;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.instructor_file;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.instructor_file;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.instructor_file;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.none;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.none;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.none;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.instructor_file;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.none;
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.none;

        expect(wrapper.findAll('.diff-options').length).toEqual(0);
    });

    test('ignore_case binding', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.instructor_file;

        let ignore_case = wrapper.find('#ignore-case');

        ignore_case.setChecked(true);
        expect(component.d_ag_test_command!.ignore_case).toBe(true);
        expect(checkbox_is_checked(ignore_case)).toEqual(true);

        ignore_case.setChecked(false);
        expect(component.d_ag_test_command!.ignore_case).toBe(false);
        expect(checkbox_is_checked(ignore_case)).toEqual(false);

        ignore_case.setChecked(true);
        expect(component.d_ag_test_command!.ignore_case).toBe(true);
        expect(checkbox_is_checked(ignore_case)).toEqual(true);

        component.d_ag_test_command!.ignore_case = false;
        expect(checkbox_is_checked(ignore_case)).toBe(false);

        component.d_ag_test_command!.ignore_case = true;
        expect(checkbox_is_checked(ignore_case)).toBe(true);
    });

    test('ignore_whitespace binding', async () => {
        component.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        let ignore_whitespace = wrapper.find('#ignore-whitespace');

        ignore_whitespace.setChecked(true);
        expect(component.d_ag_test_command!.ignore_whitespace).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(true);

        ignore_whitespace.setChecked(false);
        expect(component.d_ag_test_command!.ignore_whitespace).toBe(false);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(false);

        ignore_whitespace.setChecked(true);
        expect(component.d_ag_test_command!.ignore_whitespace).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(true);

        component.d_ag_test_command!.ignore_whitespace = false;
        expect(checkbox_is_checked(ignore_whitespace)).toBe(false);

        component.d_ag_test_command!.ignore_whitespace = true;
        expect(checkbox_is_checked(ignore_whitespace)).toBe(true);
    });

    test('ignore_whitespace_changes binding', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;

        let ignore_whitespace_changes = wrapper.find('#ignore-whitespace-changes');

        ignore_whitespace_changes.setChecked(true);
        expect(component.d_ag_test_command!.ignore_whitespace_changes).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(true);

        ignore_whitespace_changes.setChecked(false);
        expect(component.d_ag_test_command!.ignore_whitespace_changes).toBe(false);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(false);

        ignore_whitespace_changes.setChecked(true);
        expect(component.d_ag_test_command!.ignore_whitespace_changes).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(true);

        component.d_ag_test_command!.ignore_whitespace_changes = false;
        expect(checkbox_is_checked(ignore_whitespace_changes)).toBe(false);

        component.d_ag_test_command!.ignore_whitespace_changes = true;
        expect(checkbox_is_checked(ignore_whitespace_changes)).toBe(true);
    });

    test('ignore_blank_lines binding', async () => {
        component.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.instructor_file;
        let ignore_blank_lines = wrapper.find('#ignore-blank-lines');

        ignore_blank_lines.setChecked(true);
        expect(component.d_ag_test_command!.ignore_blank_lines).toBe(true);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(true);

        ignore_blank_lines.setChecked(false);
        expect(component.d_ag_test_command!.ignore_blank_lines).toBe(false);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(false);

        ignore_blank_lines.setChecked(true);
        expect(component.d_ag_test_command!.ignore_blank_lines).toBe(true);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(true);

        component.d_ag_test_command!.ignore_blank_lines = false;
        expect(checkbox_is_checked(ignore_blank_lines)).toBe(false);

        component.d_ag_test_command!.ignore_blank_lines = true;
        expect(checkbox_is_checked(ignore_blank_lines)).toBe(true);
    });

    test('error - time_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(wrapper, {ref: 'time_limit'}, '.save-button');
    });

    test('error - time_limit must be >= 1', async () => {
        return do_invalid_text_input_test(wrapper, {ref: 'time_limit'}, '0', '.save-button');
    });

    test('error - virtual_memory_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'virtual_memory_limit'}, '.save-button');
    });

    test('error - virtual_memory_limit must be >= 1', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'virtual_memory_limit'}, '0', '.save-button');
    });

    test('error - stack_size_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'stack_size_limit'}, '.save-button');
    });

    test('error - stack_size_limit must be >= 1', async () => {
        return do_invalid_text_input_test(wrapper, {ref: 'stack_size_limit'}, '0', '.save-button');
    });

    test('error - process_spawn_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'process_spawn_limit'}, '.save-button');
    });

    test('error - process_spawn_limit must be >= 0', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'process_spawn_limit'}, '-1', '.save-button');
    });

    test('Save command settings - successful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_command!, 'save');
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        wrapper.find('#ag-test-command-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('Save command settings - unsuccessful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_command!, 'save');
        save_stub.returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test command with this Name and AG test case already exists."}
                )
            )
        );
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

async function do_invalid_text_input_test(component_wrapper: Wrapper<Vue>,
                                          input_selector: string | RefSelector,
                                          invalid_text: string,
                                          save_button_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    expect(validated_input_is_valid(input_wrapper)).toEqual(true);
    // tslint:disable-next-line
    expect(component_wrapper.find(<any> save_button_selector).is('[disabled]')).toBe(false);

    set_validated_input_text(input_wrapper, invalid_text);
    await component_wrapper.vm.$nextTick();

    expect(validated_input_is_valid(input_wrapper)).toEqual(false);
    // tslint:disable-next-line
    let save_button_wrapper = component_wrapper.find(<any> save_button_selector);
    expect(save_button_wrapper.is('[disabled]')).toBe(true);
}

async function do_input_blank_or_not_integer_test(component_wrapper: Wrapper<Vue>,
                                                  input_selector: string | RefSelector,
                                                  save_button_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    let original_text = get_validated_input_text(input_wrapper);

    await do_invalid_text_input_test(component_wrapper, input_selector, ' ', save_button_selector);
    set_validated_input_text(input_wrapper, original_text);
    return do_invalid_text_input_test(
        component_wrapper, input_selector, 'not num', save_button_selector);
}
