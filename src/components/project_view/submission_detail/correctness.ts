import { AGTestCaseResultFeedback } from 'ag-client-typescript';

// The fields are initialized with hyphenated strings for easier interpolation in CSS class names.
export enum CorrectnessLevel {
    not_available = "not-available",
    none_correct = 'none-correct',
    some_correct = 'some-correct',
    all_correct = 'all-correct',
    info_only = 'info-only'
}

export function setup_return_code_correctness(setup_return_code: number | null,
                                              setup_timed_out: boolean | null) {
    if (setup_timed_out !== null && setup_timed_out) {
        return CorrectnessLevel.none_correct;
    }
    if (setup_return_code !== null) {
        if (setup_return_code === 0) {
            return CorrectnessLevel.all_correct;
        }
        return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.not_available;
}

export function ag_test_case_result_correctness(
    case_result: AGTestCaseResultFeedback
): CorrectnessLevel {
    let return_code_correctness = ag_test_case_result_return_code_correctness(case_result);
    let output_correctness = ag_test_case_result_output_correctness(case_result);

    if (case_result.total_points === 0 && case_result.total_points_possible !== 0) {
        return CorrectnessLevel.none_correct;
    }

    let correctnesses = [return_code_correctness, output_correctness];

    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.not_available);
    if (correctnesses.length === 0) {
        return CorrectnessLevel.not_available;
    }

    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.info_only);
    if (correctnesses.length === 0) {
        return CorrectnessLevel.info_only;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.all_correct)) {
        return CorrectnessLevel.all_correct;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.none_correct)) {
        return CorrectnessLevel.none_correct;
    }

    return CorrectnessLevel.some_correct;
}

export function ag_test_case_result_return_code_correctness(case_result: AGTestCaseResultFeedback) {
    let without_not_available = case_result.ag_test_command_results.filter(
        (cmd_result) => cmd_result.return_code_correct !== null
                        || cmd_result.timed_out!
                        || cmd_result.actual_return_code !== null);
    if (without_not_available.length === 0) {
        return CorrectnessLevel.not_available;
    }

    let all_show_return_code_only = without_not_available.every(
        (cmd_result) => cmd_result.return_code_correct === null
                        && (cmd_result.actual_return_code !== null || cmd_result.timed_out!));

    if (all_show_return_code_only) {
        return CorrectnessLevel.info_only;
    }

    let all_correct = case_result.ag_test_command_results.every(
        (cmd_result) => cmd_result.return_code_correct === null || cmd_result.return_code_correct);
    if (all_correct) {
        return CorrectnessLevel.all_correct;
    }

    let none_correct = !case_result.ag_test_command_results.some(
        (cmd_result) => cmd_result.return_code_correct !== null && cmd_result.return_code_correct);
    if (none_correct) {
        return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.some_correct;
}

export function ag_test_case_result_output_correctness(case_result: AGTestCaseResultFeedback) {
    let not_available = case_result.ag_test_command_results.every(
        (cmd_result) => cmd_result.stdout_correct === null
                        && cmd_result.stderr_correct === null
    );

    let some_show_info_only = case_result.ag_test_command_results.some(
        (cmd_result) => (cmd_result.stdout_points_possible === 0
                        && cmd_result.stderr_points_possible === 0)
                        && (cmd_result.fdbk_settings.show_actual_stdout
                        || cmd_result.fdbk_settings.show_actual_stderr)
    );

    if (not_available) {
        if (some_show_info_only) {
            return CorrectnessLevel.info_only;
        }
        return CorrectnessLevel.not_available;
    }

    let all_correct = case_result.ag_test_command_results.every(
        (cmd_result) => (cmd_result.stdout_correct === null || cmd_result.stdout_correct) &&
                        (cmd_result.stderr_correct === null || cmd_result.stderr_correct));
    if (all_correct) {
        return CorrectnessLevel.all_correct;
    }

    let none_correct = !case_result.ag_test_command_results.some(
        (cmd_result) => cmd_result.stdout_correct !== null && cmd_result.stdout_correct
                        || cmd_result.stderr_correct !== null && cmd_result.stderr_correct);
    if (none_correct) {
        return CorrectnessLevel.none_correct;
    }
    return CorrectnessLevel.some_correct;
  }
