import { GroupWithHandgradingResultSummary } from 'ag-client-typescript';

export enum HandgradingStatus {
    no_handgradable_submission = "No Submission",
    ungraded = "Ungraded",
    in_progress = "In Progress",
    graded = "Graded",
}

export function get_handgrading_status(group_summary: GroupWithHandgradingResultSummary) {
    if (!group_summary.has_handgradable_submission) {
      return HandgradingStatus.no_handgradable_submission;
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
