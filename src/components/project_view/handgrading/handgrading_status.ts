import { GroupWithHandgradingResultSummary } from 'ag-client-typescript';

export enum HandgradingStatus {
    no_valid_submission = "No Valid Submissions",
    ungraded = "Ungraded",
    in_progress = "In Progress",
    graded = "Graded",
}

export function get_handgrading_status(group_summary: GroupWithHandgradingResultSummary) {
    if (!group_summary.has_handgradeable_submission) {
      return HandgradingStatus.no_valid_submission;
    }

    let result = group_summary.handgrading_result;
    if (result === null) {
      return HandgradingStatus.ungraded;
    }
    if (!result.finished_grading) {
      return HandgradingStatus.in_progress;
    }
    return HandgradingStatus.graded;
}
