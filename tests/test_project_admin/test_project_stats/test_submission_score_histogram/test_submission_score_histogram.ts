import { WrapperArray } from '@vue/test-utils';

import { FullUltimateSubmissionResult } from 'ag-client-typescript';

import DescriptiveStatsTable from '@/components/project_admin/project_stats/descriptive_stats_table.vue';
import SubmissionScoreHistogram from '@/components/project_admin/project_stats/submission_score_histogram/submission_score_histogram.vue';
import SubmissionScoreHistogramChart from '@/components/project_admin/project_stats/submission_score_histogram/submission_score_histogram_chart';

import * as data_ut from '@/tests/data_utils';
import { managed_shallow_mount } from '@/tests/setup';
import { find_by_name } from '@/tests/utils';

test('All, individuals, and group percentages', () => {
    let project = data_ut.make_project(data_ut.make_course().pk);
    let students = Array(10).fill(null).map(val => data_ut.make_user());
    let groups = [
        data_ut.make_group(project.pk, 1, {members: [students[0]]}),
        data_ut.make_group(project.pk, 2, {members: [students[1], students[2]]}),
        data_ut.make_group(project.pk, 1, {members: [students[3]]}),
        data_ut.make_group(project.pk, 1, {members: [students[4]]}),
        data_ut.make_group(project.pk, 3, {members: [students[5], students[6], students[7]]}),
        data_ut.make_group(project.pk, 2, {members: [students[8], students[9]]}),
    ];

    let ultimate_submission_entries: FullUltimateSubmissionResult[] = [
        {
            username: students[0].username,
            group: groups[0],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[0], undefined, {total_points: 10, total_points_possible: 100})
        },
        {
            username: students[1].username,
            group: groups[1],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[1], undefined, {total_points: 20, total_points_possible: 100})
        },
        {
            username: students[2].username,
            group: groups[1],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[1], undefined, {total_points: 20, total_points_possible: 100})
        },
        {
            username: students[3].username,
            group: groups[2],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[2], undefined, {total_points: 30, total_points_possible: 100})
        },
        {
            username: students[4].username,
            group: groups[3],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[3], undefined, {total_points: 40, total_points_possible: 100})
        },
        {
            username: students[5].username,
            group: groups[4],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[4], undefined, {total_points: 50, total_points_possible: 100})
        },
        {
            username: students[6].username,
            group: groups[4],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[4], undefined, {total_points: 50, total_points_possible: 100})
        },
        {
            username: students[7].username,
            group: groups[4],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[4], undefined, {total_points: 50, total_points_possible: 100})
        },
        {
            username: students[8].username,
            group: groups[5],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[5], undefined, {total_points: 60, total_points_possible: 100})
        },
        {
            username: students[9].username,
            group: groups[5],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[5], undefined, {total_points: 60, total_points_possible: 100})
        },
    ];

    let expected_all_percentages = [10, 20, 20, 30, 40, 50, 50, 50, 60, 60];
    let expected_individuals_percentages = [10, 30, 40];
    let expected_groups_percentages = [20, 50, 60];

    let wrapper = managed_shallow_mount(SubmissionScoreHistogram, {
        propsData: {
            ultimate_submission_entries: ultimate_submission_entries
        }
    });

    let stats_tables
        = <WrapperArray<DescriptiveStatsTable>> wrapper.findAllComponents(DescriptiveStatsTable);
    expect(stats_tables.at(0).vm.values).toEqual(expected_all_percentages);
    expect(stats_tables.at(1).vm.values).toEqual(expected_individuals_percentages);
    expect(stats_tables.at(2).vm.values).toEqual(expected_groups_percentages);

    let submission_score_histogram_chart
        = find_by_name<SubmissionScoreHistogramChart>(wrapper, 'SubmissionScoreHistogramChart');
    expect(
        submission_score_histogram_chart.vm.all_percentages
    ).toEqual(expected_all_percentages);
    expect(
        submission_score_histogram_chart.vm.individual_percentages
    ).toEqual(expected_individuals_percentages);
    expect(
        submission_score_histogram_chart.vm.group_percentages
    ).toEqual(expected_groups_percentages);
});
