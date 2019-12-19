// Defines helper functions for keeping AGTestSuites (and their test cases and commands)
// and MutationTestSuites up to date.

import { Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { HasPK } from '@/array_set';

// Note: This function mutates its "ag_test_suites" argument.
// The caller is responsible for making any necessary copies.
export function update_changed_ag_test_case(
    to_update: ag_cli.AGTestCase, ag_test_suites: ag_cli.AGTestSuite[]
) {
    let parent_suite = find_parent_suite(to_update, ag_test_suites);
    if (parent_suite === null) {
        // Test case could belong to another project
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
