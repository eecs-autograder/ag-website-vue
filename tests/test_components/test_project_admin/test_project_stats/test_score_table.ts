import * as ag_cli from "ag-client-typescript";

import ScoreTable from "@/components/project_admin/project_stats/score_table.vue";

import * as data_ut from "@/tests/data_utils";
import { managed_mount } from "@/tests/setup";

function make_entry(
  group: ag_cli.Group,
  ultimate_submission: ag_cli.FullUltimateSubmissionResult["ultimate_submission"],
): ag_cli.FullUltimateSubmissionResult {
  return {
    username: group.member_names[0],
    group: group,
    ultimate_submission: ultimate_submission,
  };
}

describe("ScoreTable tests", () => {
  test("Does not render a table when submission_results is null", () => {
    const wrapper = managed_mount(ScoreTable, {
      propsData: { submission_results: null },
    });
    expect(wrapper.find("table").exists()).toBe(false);
  });

  test("Does not render a table when submission_results is empty", () => {
    const wrapper = managed_mount(ScoreTable, {
      propsData: { submission_results: [] },
    });
    expect(wrapper.find("table").exists()).toBe(false);
  });

  test("Does not render a table when every ultimate submission is null", () => {
    const group1 = data_ut.make_group(1);
    const group2 = data_ut.make_group(1);
    const wrapper = managed_mount(ScoreTable, {
      propsData: {
        submission_results: [
          make_entry(group1, null),
          make_entry(group2, null),
        ],
      },
    });
    expect(wrapper.find("table").exists()).toBe(false);
  });

  test("Renders column headers from the first result with a non-null ultimate submission", () => {
    const group1 = data_ut.make_group(1);
    const group2 = data_ut.make_group(1);

    const suite = data_ut.make_ag_test_suite_result_feedback(1, {
      ag_test_suite_name: "Suite 1",
      total_points_possible: 10,
    });
    suite.ag_test_case_results = [
      data_ut.make_ag_test_case_result_feedback(1, {
        ag_test_case_name: "Test 1",
        total_points_possible: 6,
      }),
      data_ut.make_ag_test_case_result_feedback(2, {
        ag_test_case_name: "Test 2",
        total_points_possible: 4,
      }),
    ];
    const mutation_suite = data_ut.make_mutation_test_suite_result_feedback(1, {
      mutation_test_suite_name: "Mutation Suite 1",
      total_points_possible: 5,
    });

    const wrapper = managed_mount(ScoreTable, {
      propsData: {
        submission_results: [
          make_entry(group1, null),
          make_entry(
            group2,
            data_ut.make_submission_with_results(group2, undefined, {
              ag_test_suite_results: [suite],
              mutation_test_suite_results: [mutation_suite],
            }),
          ),
        ],
      },
    });

    const headers = wrapper.findAll("thead th");
    expect(headers.length).toEqual(7);
    expect(headers.at(0).text()).toEqual("Username");
    expect(headers.at(1).text()).toEqual("Group");
    expect(headers.at(2).text()).toEqual("Score");
    expect(headers.at(3).text()).toEqual("Suite 1 (10)");
    expect(headers.at(4).text()).toEqual("Test 1 (6)");
    expect(headers.at(5).text()).toEqual("Test 2 (4)");
    expect(headers.at(6).text()).toEqual("Mutation Suite 1 (5)");
  });

  test("Renders a row per submission result with scores for non-null ultimate submissions", () => {
    const group1 = data_ut.make_group(1);
    const group2 = data_ut.make_group(1);

    const suite = data_ut.make_ag_test_suite_result_feedback(1, {
      total_points: 8,
    });
    suite.ag_test_case_results = [
      data_ut.make_ag_test_case_result_feedback(1, { total_points: 5 }),
      data_ut.make_ag_test_case_result_feedback(2, { total_points: 3 }),
    ];
    const mutation_suite = data_ut.make_mutation_test_suite_result_feedback(1, {
      total_points: 2,
    });

    const wrapper = managed_mount(ScoreTable, {
      propsData: {
        submission_results: [
          make_entry(
            group1,
            data_ut.make_submission_with_results(group1, undefined, {
              total_points: 10,
              total_points_possible: 15,
              ag_test_suite_results: [suite],
              mutation_test_suite_results: [mutation_suite],
            }),
          ),
          make_entry(group2, null),
        ],
      },
    });

    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toEqual(2);

    const row1_cells = rows.at(0).findAll("th, td");
    expect(row1_cells.at(0).text()).toEqual(group1.member_names[0]);
    expect(row1_cells.at(1).text()).toEqual(group1.member_names.join(","));
    expect(row1_cells.at(2).text()).toEqual("10/15");
    expect(row1_cells.at(3).text()).toEqual("8");
    expect(row1_cells.at(4).text()).toEqual("5");
    expect(row1_cells.at(5).text()).toEqual("3");
    expect(row1_cells.at(6).text()).toEqual("2");

    const row2_cells = rows.at(1).findAll("th, td");
    expect(row2_cells.length).toEqual(2);
    expect(row2_cells.at(0).text()).toEqual(group2.member_names[0]);
    expect(row2_cells.at(1).text()).toEqual(group2.member_names.join(","));
  });

  test("Table has a caption and row headers for accessibility", () => {
    const group = data_ut.make_group(1);
    const wrapper = managed_mount(ScoreTable, {
      propsData: {
        submission_results: [
          make_entry(
            group,
            data_ut.make_submission_with_results(group, undefined, {}),
          ),
        ],
      },
    });

    expect(wrapper.find("table > caption").exists()).toBe(true);

    const row_header = wrapper.find("tbody tr th");
    expect(row_header.exists()).toBe(true);
    expect(row_header.attributes("scope")).toEqual("row");
    expect(row_header.text()).toEqual(group.member_names[0]);

    const column_headers = wrapper.findAll("thead th");
    for (let i = 0; i < column_headers.length; ++i) {
      expect(column_headers.at(i).attributes("scope")).toEqual("col");
    }
  });
});
