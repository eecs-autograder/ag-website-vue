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

export class FeedbackDescriptions {
    static normal = `
        The feedback students get before the deadline has passed on submissions
        within their daily limit.
    `;

    static first_failure = `
        When enabled, this will override the "Normal" feedback settings for
        the first failed test case of each suite in a students' submission.
    `;

    static ultimate_submission = `
        The feedback students get after the deadline has passed and grades have
        been published. Students will get this feedback ONLY on their
        most recent or best submission, depending on which policy was chosen.
    `;

    static past_limit = `
        The feedback students get on submissions that exceed their daily limit.
        Note that "Final Graded" feedback takes precedence over this when applicable.
    `;

    static staff_viewer = `
        The feedback staff get when viewing another user's submission.
        Once the deadline has passed and grades have been published, staff will
        be able to choose between this and "Final Graded" feedback when viewing
        another user's final graded submission.
    `;
}
