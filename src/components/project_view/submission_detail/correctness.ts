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
