import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import BugsExposedHistogram from '@/components/project_admin/project_stats/bugs_exposed_histogram';
import DescriptiveStatsTable from '@/components/project_admin/project_stats/descriptive_stats_table.vue';
import PassFailCounts from '@/components/project_admin/project_stats/pass_fail_counts.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_shallow_mount } from '@/tests/setup';
import { find_all_components, set_props, wait_for_load } from '@/tests/utils';

test('Pass fail counts and bugs exposed', async () => {
    let project = data_ut.make_project(data_ut.make_course().pk);
    let groups = Array(3).fill(null).map(val => data_ut.make_group(project.pk));

    // Note that we're not specifying specific values for the AG tests themselves,
    // as all the needed information is present in the result data.

    let suite1 = data_ut.make_ag_test_suite(project.pk);
    let all_groups_passed = data_ut.make_ag_test_case(suite1.pk);
    all_groups_passed.ag_test_commands = [data_ut.make_ag_test_command(all_groups_passed.pk)];
    let some_groups_passed = data_ut.make_ag_test_case(suite1.pk);
    some_groups_passed.ag_test_commands = [data_ut.make_ag_test_command(some_groups_passed.pk)];
    suite1.ag_test_cases = [all_groups_passed, some_groups_passed];

    let suite2 = data_ut.make_ag_test_suite(project.pk);
    let no_groups_passed = data_ut.make_ag_test_case(suite2.pk);
    no_groups_passed.ag_test_commands = [data_ut.make_ag_test_command(no_groups_passed.pk)];
    // This test should have no passes, no fails
    let info_only_test = data_ut.make_ag_test_case(suite2.pk);
    info_only_test.ag_test_commands = [data_ut.make_ag_test_command(info_only_test.pk)];
    suite2.ag_test_cases = [no_groups_passed, info_only_test];

    let mutation_suite1 = data_ut.make_mutation_test_suite(project.pk);
    let mutation_suite2 = data_ut.make_mutation_test_suite(project.pk);

    let ultimate_submission_entries: ag_cli.FullUltimateSubmissionResult[] = [
        {
            username: groups[0].member_names[0],
            group: groups[0],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[0], undefined, {
                    ag_test_suite_results: [
                        make_ag_test_suite_result_tree(
                            suite1,
                            [
                                all_groups_passed,
                                all_groups_passed.ag_test_commands[0],
                                {
                                    return_code_correct: true,
                                    total_points: 1,
                                    total_points_possible: 1,
                                }
                            ],
                            [
                                some_groups_passed,
                                some_groups_passed.ag_test_commands[0],
                                {
                                    return_code_correct: true,
                                    stdout_correct: true,
                                    total_points: 2,
                                    total_points_possible: 2,
                                }
                            ]
                        ),
                        make_ag_test_suite_result_tree(
                            suite2,
                            [
                                no_groups_passed,
                                no_groups_passed.ag_test_commands[0],
                                {
                                    return_code_correct: false,
                                    total_points: 0,
                                    total_points_possible: 1,
                                }
                            ],
                            [
                                info_only_test,
                                info_only_test.ag_test_commands[0],
                                {
                                    actual_return_code: 0
                                }
                            ]
                        ),
                    ],
                    mutation_test_suite_results: [
                        data_ut.make_mutation_test_suite_result_feedback(
                            mutation_suite1.pk,
                            {
                                mutation_test_suite_name: mutation_suite1.name,
                                num_bugs_exposed: 3
                            }
                        ),
                        data_ut.make_mutation_test_suite_result_feedback(
                            mutation_suite2.pk, {
                                mutation_test_suite_name: mutation_suite2.name,
                                num_bugs_exposed: 2
                            }
                        )
                    ],
                }
            )
        },
        {
            username: groups[1].member_names[0],
            group: groups[1],
            ultimate_submission: data_ut.make_submission_with_results(
                groups[0], undefined, {
                    ag_test_suite_results: [
                        make_ag_test_suite_result_tree(
                            suite1,
                            [
                                all_groups_passed,
                                all_groups_passed.ag_test_commands[0],
                                {
                                    return_code_correct: true,
                                    total_points: 1,
                                    total_points_possible: 1,
                                }
                            ],
                            [
                                some_groups_passed,
                                some_groups_passed.ag_test_commands[0],
                                {
                                    return_code_correct: true,
                                    stdout_correct: false,
                                    total_points: 1,
                                    total_points_possible: 2,
                                }
                            ]
                        ),
                        make_ag_test_suite_result_tree(
                            suite2,
                            [
                                no_groups_passed,
                                no_groups_passed.ag_test_commands[0],
                                {
                                    return_code_correct: false,
                                    total_points: 0,
                                    total_points_possible: 1,
                                }
                            ],
                            [
                                info_only_test,
                                info_only_test.ag_test_commands[0],
                                {
                                    actual_return_code: 0
                                }
                            ]
                        ),
                    ],
                    mutation_test_suite_results: [
                        data_ut.make_mutation_test_suite_result_feedback(
                            mutation_suite1.pk,
                            {
                                mutation_test_suite_name: mutation_suite1.name,
                                num_bugs_exposed: 1
                            }
                        ),
                        data_ut.make_mutation_test_suite_result_feedback(
                            mutation_suite2.pk, {
                                mutation_test_suite_name: mutation_suite2.name,
                                num_bugs_exposed: 0
                            }
                        )
                    ],
                }
            )
        },
        {
            username: groups[2].member_names[0],
            group: groups[2],
            ultimate_submission: null,
        }
    ];

    sinon.stub(ag_cli.AGTestSuite, 'get_all_from_project').resolves([suite1, suite2]);
    sinon.stub(ag_cli.MutationTestSuite, 'get_all_from_project').resolves([
        mutation_suite1, mutation_suite2
    ]);

    let wrapper = managed_shallow_mount(PassFailCounts, {
        propsData: {
            project: project,
            ultimate_submission_entries: ultimate_submission_entries
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);

    let suite_rows = wrapper.findAll('.suite-row');
    expect(suite_rows.length).toEqual(2);
    expect(suite_rows.at(0).text()).toEqual(suite1.name);
    expect(suite_rows.at(1).text()).toEqual(suite2.name);

    let test_rows = wrapper.findAll('[data-testid=test_row]');
    expect(test_rows.length).toEqual(4);

    expect(test_rows.at(0).find('.test-name').text()).toEqual(all_groups_passed.name);
    expect(test_rows.at(0).find('.num-pass').text()).toEqual('2');
    expect(test_rows.at(0).find('.num-fail').text()).toEqual('');

    expect(test_rows.at(1).find('.test-name').text()).toEqual(some_groups_passed.name);
    expect(test_rows.at(1).find('.num-pass').text()).toEqual('1');
    expect(test_rows.at(1).find('.num-fail').text()).toEqual('1');

    expect(test_rows.at(2).find('.test-name').text()).toEqual(no_groups_passed.name);
    expect(test_rows.at(2).find('.num-pass').text()).toEqual('');
    expect(test_rows.at(2).find('.num-fail').text()).toEqual('2');

    expect(test_rows.at(3).find('.test-name').text()).toEqual(info_only_test.name);
    expect(test_rows.at(3).find('.num-pass').text()).toEqual('');
    expect(test_rows.at(3).find('.num-fail').text()).toEqual('');

    let mutation_suite_stats_tables = find_all_components(wrapper, DescriptiveStatsTable);
    expect(Array.from(mutation_suite_stats_tables.at(0).vm.values)).toEqual([
        3, 1,
    ]);

    expect(Array.from(mutation_suite_stats_tables.at(1).vm.values)).toEqual([
        2, 0
    ]);

    let bugs_exposed_histograms = find_all_components(wrapper, BugsExposedHistogram);
    expect(bugs_exposed_histograms.at(0).vm.mutation_test_suite).toEqual(mutation_suite1);
    expect(bugs_exposed_histograms.at(0).vm.ultimate_submission_entries).toEqual(
        ultimate_submission_entries
    );
    expect(bugs_exposed_histograms.at(1).vm.mutation_test_suite).toEqual(mutation_suite2);
    expect(bugs_exposed_histograms.at(1).vm.ultimate_submission_entries).toEqual(
        ultimate_submission_entries
    );
});

function make_ag_test_suite_result_tree(
    suite: ag_cli.AGTestSuite,
    ...test_cases: [
        ag_cli.AGTestCase, ag_cli.AGTestCommand, Partial<ag_cli.AGTestCommandResultFeedback>
    ][]
): ag_cli.AGTestSuiteResultFeedback {
    let suite_result = data_ut.make_ag_test_suite_result_feedback(suite.pk, {
        ag_test_suite_name: suite.name
    });
    for (let [test_case, cmd, cmd_result_args] of test_cases) {
        suite_result.ag_test_case_results.push(
            data_ut.make_ag_test_case_result_feedback(test_case.pk, {
                ag_test_case_name: test_case.name,
                ag_test_command_results: [
                    data_ut.make_ag_test_command_result_feedback(
                        cmd.pk,
                        cmd_result_args
                    )
                ]
            })
        );
    }
    return suite_result;
}

test('No tests or mutation suites', async () => {
    sinon.stub(ag_cli.AGTestSuite, 'get_all_from_project').resolves([]);
    sinon.stub(ag_cli.MutationTestSuite, 'get_all_from_project').resolves([]);

    let wrapper = managed_shallow_mount(PassFailCounts, {
        propsData: {
            project: data_ut.make_project(data_ut.make_course().pk),
            ultimate_submission_entries: []
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);

    let suite_rows = wrapper.findAll('.suite-row');
    expect(suite_rows.length).toEqual(0);

    let test_rows = wrapper.findAll('[data-testid=test_row]');
    expect(test_rows.length).toEqual(0);

    expect(find_all_components(wrapper, DescriptiveStatsTable).length).toEqual(0);
    expect(find_all_components(wrapper, BugsExposedHistogram).length).toEqual(0);
});

test('Data reload', async () => {
    let get_ag_test_suites_stub
        = sinon.stub(ag_cli.AGTestSuite, 'get_all_from_project').resolves([]);
    let get_mutation_test_suites_stub
        = sinon.stub(ag_cli.MutationTestSuite, 'get_all_from_project').resolves([]);

    let wrapper = managed_shallow_mount(PassFailCounts, {
        propsData: {
            project: data_ut.make_project(data_ut.make_course().pk),
            ultimate_submission_entries: []
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);

    expect(get_ag_test_suites_stub.callCount).toEqual(1);
    expect(get_mutation_test_suites_stub.callCount).toEqual(1);

    await set_props(wrapper, {ultimate_submission_entries: []});

    expect(get_ag_test_suites_stub.callCount).toEqual(2);
    expect(get_mutation_test_suites_stub.callCount).toEqual(2);
});
