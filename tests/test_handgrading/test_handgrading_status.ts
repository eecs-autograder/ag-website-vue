import * as ag_cli from 'ag-client-typescript';

import { get_handgrading_status, HandgradingStatus } from '@/components/handgrading/handgrading_status';

import * as data_ut from '@/tests/data_utils';

let project: ag_cli.Project;

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);
});

test('get_handgrading_status', () => {
    let graded = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 1},
        {finished_grading: true, total_points: 4, total_points_possible: 5}
    );
    expect(get_handgrading_status(graded)).toEqual(HandgradingStatus.graded);

    let in_progress = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 1},
        {finished_grading: false, total_points: 3, total_points_possible: 5}
    );
    expect(get_handgrading_status(in_progress)).toEqual(HandgradingStatus.in_progress);

    let ungraded = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 1},
    );
    expect(get_handgrading_status(ungraded)).toEqual(HandgradingStatus.ungraded);

    let no_submission = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 0},
    );
    expect(get_handgrading_status(no_submission)).toEqual(HandgradingStatus.no_submission);
});
