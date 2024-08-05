import * as ag_cli from 'ag-client-typescript';

import GroupSummaryPanel from '@/components/project_view/handgrading/group_summary_panel.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { set_props } from '@/tests/utils';

let project: ag_cli.Project;

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);
});

test('Group member names displayed', () => {
    let summary = data_ut.make_group_summary(project.pk, 3);
    let wrapper = managed_mount(GroupSummaryPanel, {
        propsData: {
            group_summary: summary
        }
    });
    let member_names = wrapper.findAll('.member-name');
    expect(member_names.length).toBe(summary.member_names.length);

    expect(member_names.at(0).text()).toEqual(summary.member_names[0]);
    expect(member_names.at(1).text()).toEqual(summary.member_names[1]);
    expect(member_names.at(2).text()).toEqual(summary.member_names[2]);
});

test('Score displayed when status is graded', () => {
    let summary = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 1}, true,
        {finished_grading: true, total_points: 4, total_points_possible: 5}
    );
    let wrapper = managed_mount(GroupSummaryPanel, {
        propsData: {
            group_summary: summary
        }
    });

    expect(wrapper.find('.status').text()).toEqual('4/5');
});

test('Non-graded statuses show status text', async () => {
    let in_progress_summary = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 1}, true,
        {finished_grading: false, total_points: 3, total_points_possible: 5}
    );
    let wrapper = managed_mount(GroupSummaryPanel, {
        propsData: {
            group_summary: in_progress_summary
        }
    });
    expect(wrapper.find('.status').text()).toEqual('In Progress');

    let ungraded_summary = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 1}, true,
    );
    await set_props(wrapper, {group_summary: ungraded_summary});
    expect(wrapper.find('.status').text()).toEqual('Ungraded');

    let no_submission_summary = data_ut.make_group_summary(
        project.pk, 1, {num_submissions: 0}, true,
    );
    await set_props(wrapper, {group_summary: no_submission_summary});
    expect(wrapper.find('.status').text()).toEqual('No Submission');
});
