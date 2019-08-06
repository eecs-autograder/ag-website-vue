import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    BugsExposedFeedbackLevel,
    ExpectedOutputSource,
    ExpectedReturnCode,
    HttpError,
    MutationTestSuite,
    MutationTestSuiteFeedbackConfig,
    StdinSource, ValueFeedbackLevel
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import MutationCommands from '@/components/project_admin/mutation_suites/mutation_commands.vue';

import {
    checkbox_is_checked,
    set_validated_input_text
} from '@/tests/utils';

let default_ag_command_feedback_config: AGTestCommandFeedbackConfig = {
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

export function create_ag_command_feedback_config() {
    return JSON.parse(JSON.stringify(default_ag_command_feedback_config));
}

export function create_ag_command(pk: number, command_name: string,
                                  ag_test_case: number): AGTestCommand {
    let new_command = new AGTestCommand({
        pk: pk,
        name: command_name,
        ag_test_case: ag_test_case,
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
        normal_fdbk_config: create_ag_command_feedback_config(),
        first_failed_test_normal_fdbk_config: create_ag_command_feedback_config(),
        ultimate_submission_fdbk_config: create_ag_command_feedback_config(),
        past_limit_submission_fdbk_config: create_ag_command_feedback_config(),
        staff_viewer_fdbk_config: create_ag_command_feedback_config(),
        time_limit: 1,
        stack_size_limit: 1,
        virtual_memory_limit: 1,
        process_spawn_limit: 1
    });
    return new_command;
}

let default_mutation_suite_feedback_config: MutationTestSuiteFeedbackConfig = {
    visible: false,
    show_setup_return_code: false,
    show_setup_stdout: false,
    show_setup_stderr: false,
    show_invalid_test_names: false,
    show_points: false,
    bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.exposed_bug_names,
    show_get_test_names_return_code: false,
    show_get_test_names_stdout: false,
    show_get_test_names_stderr: false,
    show_validity_check_stdout: false,
    show_validity_check_stderr: false,
    show_grade_buggy_impls_stdout: false,
    show_grade_buggy_impls_stderr: false
};

export function create_mutation_suite_feedback_config() {
    return JSON.parse(JSON.stringify(default_mutation_suite_feedback_config));
}

export function create_mutation_suite(pk: number, suite_name: string,
                                      project: number): MutationTestSuite {
    let new_suite = new MutationTestSuite({
        pk: pk,
        name: suite_name,
        project: project,
        last_modified: "Today",
        read_only_instructor_files: true,
        buggy_impl_names: [],
        use_setup_command: false,
        setup_command: create_ag_command(1, 'Command 1', 1),
        get_student_test_names_command: create_ag_command(2, "Command 2", 2),
        max_num_student_tests: 3,
        student_test_validity_check_command: create_ag_command(3, "Command 3", 3),
        grade_buggy_impl_command: create_ag_command(4, "Command 4", 4),
        points_per_exposed_bug: "1",
        max_points: 3,
        deferred: false,
        sandbox_docker_image: {
            pk: 1,
            name: "Sandy",
            tag: "",
            display_name: "Hi everyone"
        },
        allow_network_access: false,
        normal_fdbk_config: create_mutation_suite_feedback_config(),
        ultimate_submission_fdbk_config: create_mutation_suite_feedback_config(),
        past_limit_submission_fdbk_config: create_mutation_suite_feedback_config(),
        staff_viewer_fdbk_config: create_mutation_suite_feedback_config(),
        instructor_files_needed: [],
        student_files_needed: [],
    });
    return new_suite;
}

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationCommands tests', () => {
    let wrapper: Wrapper<MutationCommands>;
    let component: MutationCommands;
    let mutation_test_suite: MutationTestSuite;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        mutation_test_suite = create_mutation_suite(1, "Mutation Suite 1", 1);

        wrapper = mount(MutationCommands, {
            propsData: {
                mutation_test_suite: mutation_test_suite
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

    test('use_setup_command binding', async () => {
        let checkbox = wrapper.find('#use-setup-command');

        checkbox.setChecked(true);
        expect(component.d_mutation_test_suite!.use_setup_command).toEqual(true);
        expect(wrapper.findAll('#setup-command').length).toEqual(1);

        checkbox.setChecked(false);
        expect(component.d_mutation_test_suite!.use_setup_command).toEqual(false);
        expect(wrapper.findAll('#setup-command').length).toEqual(0);

        checkbox.setChecked(true);
        expect(component.d_mutation_test_suite!.use_setup_command).toEqual(true);
        expect(wrapper.findAll('#setup-command').length).toEqual(1);

        component.d_mutation_test_suite!.use_setup_command = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);
        expect(wrapper.findAll('#setup-command').length).toEqual(0);

        component.d_mutation_test_suite!.use_setup_command = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
        expect(wrapper.findAll('#setup-command').length).toEqual(1);
    });

    test('save_command_settings - successful', async () => {
        let save_stub = sinon.stub(component.d_mutation_test_suite!, 'save');

        expect(component.command_settings_forms_are_valid).toBe(true);

        wrapper.find('.save-button').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('save_command_settings - unsuccessful', async () => {
        let save_stub = sinon.stub(component.d_mutation_test_suite!, 'save').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Encountered an error."}
                )
            )
        );

        expect(component.command_settings_forms_are_valid).toBe(true);

        wrapper.find('.save-button').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('command_settings_forms_are_valid - d_get_student_test_names_command_is_valid ' +
         'is false',
         async () => {
        expect(component.d_get_student_test_names_command_is_valid).toBe(true);
        expect(component.d_grade_buggy_impl_command_is_valid).toBe(true);
        expect(component.d_setup_command_is_valid).toBe(true);
        expect(component.d_student_test_validity_check_is_valid).toBe(true);

        let get_student_test_names_command = wrapper.find(
            {ref: 'get_student_test_names_command'}
        );

        set_validated_input_text(get_student_test_names_command.find('#cmd'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(get_student_test_names_command.find('#cmd'), "Hi");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(get_student_test_names_command.find('#time-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(get_student_test_names_command.find('#time-limit'), "2");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(get_student_test_names_command.find('#stack-size-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(get_student_test_names_command.find('#stack-size-limit'), "10");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(
            get_student_test_names_command.find('#virtual-memory-limit'), " "
        );
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(
            get_student_test_names_command.find('#virtual-memory-limit'), "10"
        );
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(get_student_test_names_command.find('#process-spawn-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(
            get_student_test_names_command.find('#process-spawn-limit'), "10"
        );
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
    });

    test('command_settings_forms_are_valid - d_grade_buggy_impl_command_is_valid is false',
         async () => {
        expect(component.d_get_student_test_names_command_is_valid).toBe(true);
        expect(component.d_grade_buggy_impl_command_is_valid).toBe(true);
        expect(component.d_setup_command_is_valid).toBe(true);
        expect(component.d_student_test_validity_check_is_valid).toBe(true);

        let grade_buggy_impl_command = wrapper.find(
            {ref: 'grade_buggy_impl_command'}
        );

        set_validated_input_text(grade_buggy_impl_command.find('#cmd'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(grade_buggy_impl_command.find('#cmd'), "Hi");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(grade_buggy_impl_command.find('#time-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(grade_buggy_impl_command.find('#time-limit'), "2");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(grade_buggy_impl_command.find('#stack-size-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(grade_buggy_impl_command.find('#stack-size-limit'), "10");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(grade_buggy_impl_command.find('#virtual-memory-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(grade_buggy_impl_command.find('#virtual-memory-limit'), "10");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(grade_buggy_impl_command.find('#process-spawn-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(grade_buggy_impl_command.find('#process-spawn-limit'), "10");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
    });

    test('command_settings_forms_are_valid - d_setup_command_is_valid is false',
         async () => {
        expect(component.d_get_student_test_names_command_is_valid).toBe(true);
        expect(component.d_grade_buggy_impl_command_is_valid).toBe(true);
        expect(component.d_setup_command_is_valid).toBe(true);
        expect(component.d_student_test_validity_check_is_valid).toBe(true);

        wrapper.find('#use-setup-command').setChecked(true);

        let setup_command = wrapper.find(
            {ref: 'setup_command'}
        );

        set_validated_input_text(setup_command.find('#cmd'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(setup_command.find('#cmd'), "Hi");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(setup_command.find('#time-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(setup_command.find('#time-limit'), "2");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(setup_command.find('#stack-size-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(setup_command.find('#stack-size-limit'), "10");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(setup_command.find('#virtual-memory-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(setup_command.find('#virtual-memory-limit'), "10");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(setup_command.find('#process-spawn-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(setup_command.find('#process-spawn-limit'), "10");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
    });

    test('command_settings_forms_are_valid - d_student_test_validity_check_is_valid ' +
         'is false',
         async () => {
        expect(component.d_get_student_test_names_command_is_valid).toBe(true);
        expect(component.d_grade_buggy_impl_command_is_valid).toBe(true);
        expect(component.d_setup_command_is_valid).toBe(true);
        expect(component.d_student_test_validity_check_is_valid).toBe(true);

        let student_test_validity_check_command = wrapper.find(
            {ref: 'student_test_validity_check_command'}
        );

        set_validated_input_text(student_test_validity_check_command.find('#cmd'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(student_test_validity_check_command.find('#cmd'), "Hi");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(student_test_validity_check_command.find('#time-limit'), " ");
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(student_test_validity_check_command.find('#time-limit'), "2");
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(
            student_test_validity_check_command.find('#stack-size-limit'), " "
        );
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(
            student_test_validity_check_command.find('#stack-size-limit'), "10"
        );
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(
            student_test_validity_check_command.find('#virtual-memory-limit'), " "
        );
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(
            student_test_validity_check_command.find('#virtual-memory-limit'), "10"
        );
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        set_validated_input_text(
            student_test_validity_check_command.find('#process-spawn-limit'), " "
        );
        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(
            student_test_validity_check_command.find('#process-spawn-limit'), "10"
        );
        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
    });

    test('command_settings_forms_are_valid - true', async () => {
        wrapper.find('#use-setup-command').setChecked(true);

        component.d_setup_command_is_valid = true;
        component.d_get_student_test_names_command_is_valid = true;
        component.d_grade_buggy_impl_command_is_valid = true;
        component.d_student_test_validity_check_is_valid = true;

        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
    });

    test('command_settings_forms_are_valid - true', async () => {
        wrapper.find('#use-setup-command').setChecked(true);

        component.d_setup_command_is_valid = false;
        component.d_get_student_test_names_command_is_valid = true;
        component.d_grade_buggy_impl_command_is_valid = true;
        component.d_student_test_validity_check_is_valid = true;

        expect(component.command_settings_forms_are_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('command_settings_forms_are_valid - true', async () => {
        component.d_setup_command_is_valid = true;
        component.d_get_student_test_names_command_is_valid = true;
        component.d_grade_buggy_impl_command_is_valid = true;
        component.d_student_test_validity_check_is_valid = true;

        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
    });

    test('command_settings_forms_are_valid - false', async () => {
        component.d_setup_command_is_valid = false;
        component.d_get_student_test_names_command_is_valid = true;
        component.d_grade_buggy_impl_command_is_valid = true;
        component.d_student_test_validity_check_is_valid = true;

        expect(component.command_settings_forms_are_valid).toBe(true);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
    });

    test('mutation_test_suite Watcher', async () => {
        let another_mutation_test_suite = create_mutation_suite(
            33, "Suite 33", 1
        );

        expect(component.d_mutation_test_suite).toEqual(mutation_test_suite);

        wrapper.setProps({mutation_test_suite: another_mutation_test_suite});
        await component.$nextTick();

        expect(component.d_mutation_test_suite).toEqual(another_mutation_test_suite);
    });
});
