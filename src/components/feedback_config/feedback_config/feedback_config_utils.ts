export enum FeedbackConfigLabel {
    normal = "Normal",
    first_failure = "First Failure",
    ultimate_submission = "Final Graded",
    past_limit = "Past Limit",
    staff_viewer = "Student Lookup"
}

export function hyphenated_config_name(config_name: string) {
    let hyph_config_name = config_name.toLowerCase().replace(' ', '-');
    return hyph_config_name;
}
