import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig, AGTestSuite,
    AGTestSuiteFeedbackConfig, BugsExposedFeedbackLevel,
    ExpectedOutputSource,
    ExpectedReturnCode, MutationTestSuite, MutationTestSuiteFeedbackConfig,
    StdinSource,
    ValueFeedbackLevel
} from 'ag-client-typescript';

let default_suite_feedback_config: AGTestSuiteFeedbackConfig = {
    show_individual_tests: false,
    show_setup_return_code: false,
    show_setup_stderr: false,
    show_setup_stdout: false,
    show_setup_timed_out: false,
    visible: false
};

export function create_ag_suite_feedback_config() {
    return JSON.parse(JSON.stringify(default_suite_feedback_config));
}

export function create_ag_suite(pk: number, suite_name: string, project: number): AGTestSuite {
    let new_suite = new AGTestSuite({
        pk: pk,
        name: suite_name,
        project: project,
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
        normal_fdbk_config: create_ag_suite_feedback_config(),
        past_limit_submission_fdbk_config: create_ag_suite_feedback_config(),
        staff_viewer_fdbk_config: create_ag_suite_feedback_config(),
        ultimate_submission_fdbk_config: create_ag_suite_feedback_config(),
        ag_test_cases: [],
        instructor_files_needed: [],
        student_files_needed: []
    });
    return new_suite;
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


let default_ag_case_feedback_config: AGTestCaseFeedbackConfig = {
    visible: false,
    show_individual_commands: false
};

export function create_ag_case_feedback_config() {
    return JSON.parse(JSON.stringify(default_ag_case_feedback_config));
}

export function create_ag_case(pk: number, case_name: string, ag_test_suite: number): AGTestCase {
    let new_case = new AGTestCase({
        pk: pk,
        name: case_name,
        ag_test_suite: ag_test_suite,
        normal_fdbk_config: create_ag_case_feedback_config(),
        ultimate_submission_fdbk_config: create_ag_case_feedback_config(),
        past_limit_submission_fdbk_config: create_ag_case_feedback_config(),
        staff_viewer_fdbk_config: create_ag_case_feedback_config(),
        last_modified: '',
        ag_test_commands: []
    });
    return new_case;
}

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
