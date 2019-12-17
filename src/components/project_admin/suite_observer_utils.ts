// Defines helper functions for keeping AGTestSuites (and their test cases and commands)
// and MutationTestSuites up to date.

import { Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { HasPK } from '@/array_set';

// NOTE: These functions all mutate their "ag_test_suites" argument.
// The caller of these functions is responsible for making any necessary copies.

export function update_changed_ag_test_case(
    to_update: ag_cli.AGTestCase, ag_test_suites: ag_cli.AGTestSuite[]
) {
    let parent_suite = find_parent_suite(to_update, ag_test_suites);
    if (parent_suite === null) {
        // Test case could belong to another project
        // istanbul ignore next
        return;
    }

    let case_index = parent_suite.ag_test_cases.findIndex(
      (test_case: ag_cli.AGTestCase) => test_case.pk === to_update.pk
    );
    Vue.set(
      parent_suite.ag_test_cases,
      case_index,
      to_update,
    );
}

export function add_created_ag_test_command(
    to_add: ag_cli.AGTestCommand,
    ag_test_suites: ag_cli.AGTestSuite[]
) {
    let found = find_parent_suite_and_test_case(to_add, ag_test_suites);
    if (found === null) {
        // Command could belong to another project
        // istanbul ignore next
        return;
    }

    let [parent_ag_test_suite, parent_ag_test_case] = found;
    parent_ag_test_case.ag_test_commands.push(to_add);
}

export function update_changed_ag_test_command(
    to_update: ag_cli.AGTestCommand, ag_test_suites: ag_cli.AGTestSuite[]
) {
    let found = find_parent_suite_and_test_case(to_update, ag_test_suites);
    if (found === null) {
        // Command could belong to another project
        // istanbul ignore next
        return;
    }

    let [parent_ag_test_suite, parent_ag_test_case] = found;
    let command_index = parent_ag_test_case.ag_test_commands.findIndex(
      (ag_command: ag_cli.AGTestCommand) => ag_command.pk === to_update.pk);

    Vue.set(
      parent_ag_test_case.ag_test_commands,
      command_index,
      to_update,
    );
}

// Sorts the items in to_sort using the ordering defined by ordering (a list of PKs)
export function sort_by_ordering(to_sort: HasPK[], ordering: number[]) {
    return to_sort.sort((first, second) => {
        return ordering.findIndex(pk => pk === first.pk)
               - ordering.findIndex(pk => pk === second.pk);
    });
}

export function find_parent_suite(
    ag_test_case: ag_cli.AGTestCase,
    ag_test_suites: ag_cli.AGTestSuite[]
): ag_cli.AGTestSuite | null {
    let parent = ag_test_suites.find(suite => suite.pk === ag_test_case.ag_test_suite);
    return parent === undefined ? null : parent;
}

// Searches for ag_test_command in ag_test_suites and returns the AGTestSuite
// and AGTestCase it belongs to.
export function find_parent_suite_and_test_case(
    ag_test_command: ag_cli.AGTestCommand,
    ag_test_suites: ag_cli.AGTestSuite[]
): [ag_cli.AGTestSuite, ag_cli.AGTestCase] | null {
    for (let suite of ag_test_suites) {
      let ag_test_case = suite.ag_test_cases.find(
        (test_case: ag_cli.AGTestCase) => test_case.pk === ag_test_command.ag_test_case);
      if (ag_test_case !== undefined) {
        return [suite, ag_test_case];
      }
    }

    return null;
  }

export function find_parent_suite_and_test_case_indices(
    ag_test_command: ag_cli.AGTestCommand,
    ag_test_suites: ag_cli.AGTestSuite[]
): {suite_index: number, case_index: number} | null {
    for (let suite_index = 0; suite_index < ag_test_suites.length; ++suite_index) {
        let case_index = ag_test_suites[suite_index].ag_test_cases.findIndex(
            (test_case) => test_case.pk === ag_test_command.ag_test_case
        );
        if (case_index !== -1) {
            return {suite_index: suite_index, case_index: case_index};
        }
    }
    return null;
}
