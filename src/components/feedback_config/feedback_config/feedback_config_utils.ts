import { BugsExposedFeedbackLevel, ValueFeedbackLevel } from 'ag-client-typescript';

export enum FeedbackConfigLabel {
    normal = "Normal",
    first_failure = "First Failure",
    ultimate_submission = "Final Graded",
    past_limit = "Past Limit",
    staff_viewer = "Student Lookup"
}

export interface MutationTestSuiteFeedbackPreset {
    show_setup_return_code: boolean;
    show_setup_stdout: boolean;
    show_setup_stderr: boolean;
    show_invalid_test_names: boolean;
    show_points: boolean;
    bugs_exposed_fdbk_level: BugsExposedFeedbackLevel;
    show_get_test_names_return_code: boolean;
    show_get_test_names_stdout: boolean;
    show_get_test_names_stderr: boolean;
    show_validity_check_stdout: boolean;
    show_validity_check_stderr: boolean;
    show_grade_buggy_impls_stdout: boolean;
    show_grade_buggy_impls_stderr: boolean;
}

export interface AGTestSuiteFeedbackPreset {
    show_individual_tests: boolean;
    show_setup_return_code: boolean;
    show_setup_timed_out: boolean;
    show_setup_stdout: boolean;
    show_setup_stderr: boolean;
}

export interface AGTestCommandFeedbackPreset {
    return_code_fdbk_level: ValueFeedbackLevel;
    stdout_fdbk_level: ValueFeedbackLevel;
    stderr_fdbk_level: ValueFeedbackLevel;
    show_points: boolean;
    show_actual_return_code: boolean;
    show_actual_stdout: boolean;
    show_actual_stderr: boolean;
    show_whether_timed_out: boolean;
}

export function hyphenate(str: string) {
    let hyphenated_str = str.toLowerCase().replace(' ', '-');
    return hyphenated_str;
}

export function transform_to_snake_case(config_name: string) {
    let snake_case_config_name = config_name.toLowerCase().replace(' ', '_');
    return snake_case_config_name;
}
