<template>
  <div v-if="d_loading" class="loading-wrapper loading-centered loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="rerun-submissions-component">
    <div id="grades-can-change-header" class="step-header">0. Download Grades So Far</div>
    <div id="grades-can-change-msg">
      <div class="msg-spacing">
        <i class="fas fa-exclamation-triangle"></i>
        When rerunning test cases,
        <span class="emphasize">some students' scores might change</span>
      </div>

      <div class="msg-spacing">
        Please download a spreadsheet of grades for
        <span class="emphasize">all submissions</span>
        from the <span class="emphasize">Grades & Files</span> tab before proceeding.
      </div>
    </div>

    <div class="step-header">1. Choose submissions</div>
    <div class="checkbox-input-container">
      <input
        id="rerun-all-submissions"
        type="checkbox"
        class="checkbox"
        v-model="d_rerun_all_submissions"/>
      <label for="rerun-all-submissions">Rerun All Submissions</label>
    </div>
    <div v-show="!d_rerun_all_submissions" class="choose-submissions-wrapper">
      <div class="form-field-wrapper group-lookup-wrapper">
        <div class="label">
          Choose a {{project.max_group_size > 1 ? 'group' : 'student'}}
        </div>
        <group-lookup
          :groups="d_groups"
          @update_group_selected="d_selected_groups.insert($event)">
        </group-lookup>
      </div>

      <submission-selector
        class="submission-selector-spacing"
        v-for="group of d_selected_groups.data"
        :key="group.pk"
        :group="group"
        @submissions_selected="select_submissions"
        @submissions_unselected="unselect_submissions"
        @remove_group="unselect_group">
      </submission-selector>
    </div>

    <div class="step-header">2. Choose test cases</div>
    <div class="checkbox-input-container">
      <input
        id="rerun-all-ag-test-cases"
        type="checkbox"
        class="checkbox"
        v-model="d_rerun_all_ag_test_cases"/>
      <label for="rerun-all-ag-test-cases">Rerun All Tests</label>
    </div>

    <div v-show="!d_rerun_all_ag_test_cases" class="choose-ag-test-suites-wrapper">
      <div class="label">
        Choose tests to rerun
        <tooltip placement="top" width="large">
          To rerun all tests in one suite, check the box next to the suite name,
          but leave all its tests unchecked.
        </tooltip>
      </div>
      <collapsible class="ag-test-suite-collapsible"
                   v-for="ag_test_suite of d_ag_test_suites">
        <template v-slot:header>
          <div class="unpadded-checkbox-container ag-test-suite-header">
            <input
              type="checkbox"
              class="checkbox"
              ref="ag_test_suite_checkbox"
              :checked="d_selected_test_cases_by_suite_pk.has(ag_test_suite.pk)"
              @change="toggle_ag_test_suite_selected(ag_test_suite)"
              :id="`ag-test-suite-${ag_test_suite.pk}`"/>
            <label :for="`ag-test-suite-${ag_test_suite.pk}`">
              {{ag_test_suite.name}}
            </label>
          </div>
        </template>
        <div class="unpadded-checkbox-container ag-test-case-checkbox-wrapper"
            v-for="ag_test_case of ag_test_suite.ag_test_cases">
          <input
            type="checkbox"
            class="checkbox"
            ref="ag_test_case_checkbox"
            :checked="ag_test_case_is_checked(ag_test_case)"
            @change="toggle_ag_test_case_selected(ag_test_case)"
            :id="`ag-test-case-${ag_test_case.pk}`"/>
          <label :for="`ag-test-case-${ag_test_case.pk}`">
            {{ag_test_case.name}}
          </label>
        </div>
      </collapsible>
    </div>

    <template v-if="d_mutation_test_suites.length !== 0" ref="choose_mutation_test_suites">
      <div class="step-header">3. Choose mutation testing suites</div>
      <div class="checkbox-input-container">
        <input
          id="rerun-all-mutation-test-suites"
          type="checkbox"
          class="checkbox"
          v-model="d_rerun_all_mutation_test_suites"/>
        <label for="rerun-all-mutation-test-suites">Rerun All Suites</label>
      </div>

      <div v-show="!d_rerun_all_mutation_test_suites">
        <div class="label">
          Choose suites to rerun
        </div>
        <div class="checkbox-input-container"
             v-for="mutation_test_suite of d_mutation_test_suites">
          <input
            type="checkbox"
            class="checkbox"
            ref="mutation_test_suite_checkbox"
            @change="toggle_mutation_test_suite_selected(mutation_test_suite)"
            :id="`mutation-test-suite-${mutation_test_suite.pk}`"/>
          <label :for="`mutation-test-suite-${mutation_test_suite.pk}`">
            {{mutation_test_suite.name}}
          </label>
        </div>
      </div>
    </template>

    <div class="step-header">4. Review and start rerun</div>
    <div class="summary-line">
      <span class="emphasize">{{num_submissions_to_rerun}}</span> submission(s)
    </div>
    <div class="summary-line">
      <span class="emphasize">{{num_tests_to_rerun}}</span> test case(s) from
      <span class="emphasize">{{num_ag_test_suites_to_rerun}}</span> suite(s)
    </div>
    <div class="summary-line" v-if="d_mutation_test_suites.length !== 0"
         ref="mutation_test_suite_summary">
      <span class="emphasize">{{num_mutation_test_suites_to_rerun}}</span> mutation test suite(s)
    </div>
    <APIErrors ref="api_errors"></APIErrors>
    <div class="button-footer">
      <button
        type="button"
        class="green-button"
        ref="start_rerun_button"
        @click="start_rerun"
        :disabled="d_starting_rerun">Rerun</button>
    </div>

    <div id="rerun-table">
      <table class="rerun-table">
        <thead>
          <tr>
            <th>Started At</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr ref="task_row" v-for="task of d_rerun_tasks">
            <td class="started-at-cell">{{format_datetime(task.created_at)}}</td>
            <td class="progress-cell">
              <template v-if="task.has_error">
                ERROR
                <tooltip placement="top" width="large">
                  An unexpected error occurred. Please contact <b>help@autograder.io</b>
                  and include the information <b>"Rerun task ID: {{task.pk}}"</b> in your email.
                </tooltip>
              </template>
              <template v-else>
                {{task.progress}}%
                <i v-if="task.progress !== 100"
                   @click="refresh_task(task)"
                   class="refresh-icon fas fa-sync-alt"></i>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { ArraySet, member_names_less, pk_less, pk_more } from '@/array_set';
import APIErrors from "@/components/api_errors.vue";
import Collapsible from '@/components/collapsible.vue';
import GroupLookup from '@/components/group_lookup.vue';
import Tooltip from '@/components/tooltip.vue';
import { BeforeDestroy, Created } from '@/lifecycle';
import { Poller } from '@/poller';
import { SafeMap } from '@/safe_map';
import { deep_copy, format_datetime, handle_api_errors_async, safe_assign, toggle } from '@/utils';

import {
  find_parent_suite,
  find_parent_suite_and_test_case,
  sort_by_ordering,
  update_changed_ag_test_case,
} from '../suite_observer_utils';

import SubmissionSelector from './submission_selector.vue';

interface GroupWithSubmissions {
  group: ag_cli.Group;
  submissions: ag_cli.Submission[];
}

@Component({
  components: {
    APIErrors,
    Collapsible,
    GroupLookup,
    SubmissionSelector,
    Tooltip,
  }
})
export default class RerunSubmissions extends Vue implements ag_cli.GroupObserver,
                                                             ag_cli.AGTestSuiteObserver,
                                                             ag_cli.AGTestCaseObserver,
                                                             ag_cli.MutationTestSuiteObserver,
                                                             Created,
                                                             BeforeDestroy {
  @Prop({required: true, type: ag_cli.Project})
  project!: ag_cli.Project;

  d_rerun_tasks: ag_cli.RerunSubmissionTask[] = [];

  d_rerun_all_submissions = false;
  task_poller: Poller | null = null;

  d_groups: ag_cli.Group[] = [];
  d_selected_groups = new ArraySet([], {less_func: member_names_less});
  d_selected_submissions = new ArraySet<ag_cli.Submission>([], {less_func: pk_less});

  d_rerun_all_ag_test_cases = true;
  d_ag_test_suites: ag_cli.AGTestSuite[] = [];
  d_selected_test_cases_by_suite_pk = new SafeMap<number, Set<number>>();

  d_rerun_all_mutation_test_suites = true;
  d_mutation_test_suites: ag_cli.MutationTestSuite[] = [];
  d_selected_mutation_test_suite_pks = new Set<number>();

  d_starting_rerun = false;
  d_loading = true;

  readonly format_datetime = format_datetime;

  async created() {
    await this.load_rerun_tasks();
    this.d_groups = await ag_cli.Group.get_all_from_project(this.project.pk);
    this.d_ag_test_suites = await ag_cli.AGTestSuite.get_all_from_project(this.project.pk);
    this.d_mutation_test_suites = await ag_cli.MutationTestSuite.get_all_from_project(
      this.project.pk);

    ag_cli.Group.subscribe(this);
    ag_cli.AGTestSuite.subscribe(this);
    ag_cli.AGTestCase.subscribe(this);
    ag_cli.MutationTestSuite.subscribe(this);

    this.task_poller = new Poller(() => this.load_rerun_tasks(), 30);
    // tslint:disable-next-line no-floating-promises
    this.task_poller.start_after_delay();

    this.d_loading = false;
  }

  beforeDestroy() {
    ag_cli.Group.unsubscribe(this);
    ag_cli.AGTestSuite.unsubscribe(this);
    ag_cli.AGTestCase.unsubscribe(this);
    ag_cli.MutationTestSuite.unsubscribe(this);

    if (this.task_poller !== null) {
      this.task_poller.stop();
    }
  }

  async load_rerun_tasks() {
    this.d_rerun_tasks = await ag_cli.RerunSubmissionTask.get_all_from_project(this.project.pk);
  }

  async refresh_task(task: ag_cli.RerunSubmissionTask) {
    let refreshed = await ag_cli.RerunSubmissionTask.get_by_pk(task.pk);
    safe_assign(task, refreshed);
  }

  @handle_api_errors_async(handle_start_rerun_error)
  start_rerun() {
    return toggle(this, 'd_starting_rerun', async () => {
        let rerun = await ag_cli.RerunSubmissionTask.create(this.project.pk, {
            rerun_all_submissions: this.d_rerun_all_submissions,
            submission_pks: this.selected_submission_pks,

            rerun_all_ag_test_suites: this.d_rerun_all_ag_test_cases,
            ag_test_suite_data: this.get_ag_test_suite_data_for_request(),

            rerun_all_student_test_suites: this.d_rerun_all_mutation_test_suites,
            student_suite_pks: [...this.d_selected_mutation_test_suite_pks.values()]
        });

        this.d_rerun_tasks.unshift(rerun);
    });
  }

  get_ag_test_suite_data_for_request() {
    let result: {[key: number]: number[]} = {};
    for (let [suite_pk, test_case_pks] of this.d_selected_test_cases_by_suite_pk) {
      result[suite_pk] = [...test_case_pks.values()];
    }
    return result;
  }

  get selected_submission_pks() {
    return this.d_selected_submissions.data.map(submission => submission.pk);
  }

  select_submissions(submissions: ag_cli.Submission[]) {
    for (let submission of submissions) {
      this.d_selected_submissions.insert(submission);
    }
  }

  unselect_submissions(submissions: ag_cli.Submission[]) {
    for (let submission of submissions) {
      this.d_selected_submissions.remove(submission);
    }
  }

  unselect_group(group: ag_cli.Group) {
    this.d_selected_groups.remove(group);
    this.d_selected_submissions = new ArraySet(
      this.d_selected_submissions.data.filter(submission => submission.group !== group.pk),
      {less_func: pk_less}
    );
  }

  toggle_ag_test_suite_selected(ag_test_suite: ag_cli.AGTestSuite) {
    let copy = new SafeMap(this.d_selected_test_cases_by_suite_pk);

    if (copy.has(ag_test_suite.pk)) {
      copy.delete(ag_test_suite.pk);
    }
    else {
      copy.set(ag_test_suite.pk, new Set());
    }

    this.d_selected_test_cases_by_suite_pk = copy;
  }

  toggle_ag_test_case_selected(ag_test_case: ag_cli.AGTestCase) {
    let copy = new SafeMap(this.d_selected_test_cases_by_suite_pk);

    let ag_test_case_pks = copy.get(
      ag_test_case.ag_test_suite, new Set(), true
    );
    if (ag_test_case_pks.has(ag_test_case.pk)) {
      ag_test_case_pks.delete(ag_test_case.pk);
    }
    else {
      ag_test_case_pks.add(ag_test_case.pk);
    }

    this.d_selected_test_cases_by_suite_pk = copy;
  }

  ag_test_case_is_checked(ag_test_case: ag_cli.AGTestCase) {
    let ag_test_case_pks = this.d_selected_test_cases_by_suite_pk.get(
      ag_test_case.ag_test_suite, new Set());
    return ag_test_case_pks.has(ag_test_case.pk);
  }

  toggle_mutation_test_suite_selected(mutation_test_suite: ag_cli.MutationTestSuite) {
    let copy = new Set(this.d_selected_mutation_test_suite_pks);

    if (copy.has(mutation_test_suite.pk)) {
      copy.delete(mutation_test_suite.pk);
    }
    else {
      copy.add(mutation_test_suite.pk);
    }

    this.d_selected_mutation_test_suite_pks = copy;
  }

  get num_submissions_to_rerun() {
    if (this.d_rerun_all_submissions) {
      return 'ALL';
    }

    return this.selected_submission_pks.length;
  }

  get num_tests_to_rerun() {
    if (this.d_rerun_all_ag_test_cases) {
      return this.d_ag_test_suites.reduce((accum, suite) => accum + suite.ag_test_cases.length, 0);
    }

    let count = 0;
    for (let [suite_pk, test_case_pks] of this.d_selected_test_cases_by_suite_pk) {
      if (test_case_pks.size !== 0) {
        count += test_case_pks.size;
      }
      else {
        count += this.d_ag_test_suites.find(item => item.pk === suite_pk)!.ag_test_cases.length;
      }
    }

    return count;
  }

  get num_ag_test_suites_to_rerun() {
    if (this.d_rerun_all_ag_test_cases) {
      return this.d_ag_test_suites.length;
    }
    return this.d_selected_test_cases_by_suite_pk.size;
  }

  get num_mutation_test_suites_to_rerun() {
    if (this.d_rerun_all_mutation_test_suites) {
      return this.d_mutation_test_suites.length;
    }

    return this.d_selected_mutation_test_suite_pks.size;
  }

  // --------------------------------------------------------------------------

  update_group_created(group: ag_cli.Group): void {
    if (group.project === this.project.pk) {
      this.d_groups.push(deep_copy(group, ag_cli.Group));
      this.sort_groups();
    }
  }

  update_group_changed(group: ag_cli.Group): void {
    if (group.project === this.project.pk) {
      let index = this.d_groups.findIndex(g => g.pk === group.pk);
      Vue.set(this.d_groups, index, deep_copy(group, ag_cli.Group));
      this.sort_groups();
    }
  }

  update_group_merged(new_group: ag_cli.Group, group1_pk: number, group2_pk: number): void {
    if (new_group.project !== this.project.pk) {
      // istanbul ignore next
      return;
    }
    this.d_groups.splice(this.d_groups.findIndex(group => group.pk === group1_pk), 1);
    this.d_groups.splice(this.d_groups.findIndex(group => group.pk === group2_pk), 1);
    this.d_groups.push(deep_copy(new_group, ag_cli.Group));

    this.sort_groups();
  }

  private sort_groups() {
    this.d_groups.sort(
      (first, second) => first.member_names[0].localeCompare(second.member_names[0]));
  }

  update_ag_test_suite_created(ag_test_suite: ag_cli.AGTestSuite): void {
    if (ag_test_suite.project === this.project.pk) {
      this.d_ag_test_suites.push(deep_copy(ag_test_suite, ag_cli.AGTestSuite));
    }
  }

  update_ag_test_suite_changed(ag_test_suite: ag_cli.AGTestSuite): void {
    if (ag_test_suite.project === this.project.pk) {
      let index = this.d_ag_test_suites.findIndex(suite => suite.pk === ag_test_suite.pk);
      Vue.set(this.d_ag_test_suites, index, deep_copy(ag_test_suite, ag_cli.AGTestSuite));
    }
  }

  update_ag_test_suite_deleted(ag_test_suite: ag_cli.AGTestSuite): void {
    if (ag_test_suite.project === this.project.pk) {
      let index = this.d_ag_test_suites.findIndex(suite => ag_test_suite.pk === suite.pk);
      this.d_ag_test_suites.splice(index, 1);

      this.d_selected_test_cases_by_suite_pk.delete(ag_test_suite.pk);
    }
  }

  update_ag_test_suites_order_changed(project_pk: number, ag_test_suite_order: number[]): void {
    if (this.project.pk === project_pk) {
      sort_by_ordering(this.d_ag_test_suites, ag_test_suite_order);
    }
  }

  update_ag_test_case_created(ag_test_case: ag_cli.AGTestCase): void {
    let parent_suite = find_parent_suite(ag_test_case, this.d_ag_test_suites);
    if (parent_suite !== null) {
      parent_suite.ag_test_cases.push(deep_copy(ag_test_case, ag_cli.AGTestCase));
    }
  }

  update_ag_test_case_changed(ag_test_case: ag_cli.AGTestCase): void {
    update_changed_ag_test_case(deep_copy(ag_test_case, ag_cli.AGTestCase), this.d_ag_test_suites);
  }

  update_ag_test_case_deleted(ag_test_case: ag_cli.AGTestCase): void {
    let parent_suite_index = this.d_ag_test_suites.findIndex(
      (ag_suite) => ag_suite.pk === ag_test_case.ag_test_suite
    );
    if (parent_suite_index === -1) {
      // Test case could belong to another project
      // istanbul ignore next
      return;
    }

    let parent_suite = this.d_ag_test_suites[parent_suite_index];
    let case_index = parent_suite!.ag_test_cases.findIndex(
      (test_case) => test_case.pk === ag_test_case.pk
    );

    parent_suite!.ag_test_cases.splice(case_index, 1);
  }

  update_ag_test_cases_order_changed(ag_test_suite_pk: number, ag_test_case_order: number[]): void {
    let suite = this.d_ag_test_suites.find(suite => suite.pk === ag_test_suite_pk);
    if (suite !== undefined) {
      sort_by_ordering(suite.ag_test_cases, ag_test_case_order);
    }
  }

  update_mutation_test_suite_created(mutation_test_suite: ag_cli.MutationTestSuite): void {
    if (mutation_test_suite.project === this.project.pk) {
      this.d_mutation_test_suites.push(mutation_test_suite);
    }
  }

  update_mutation_test_suite_changed(mutation_test_suite: ag_cli.MutationTestSuite): void {
    if (mutation_test_suite.project === this.project.pk) {
      let index = this.d_mutation_test_suites.findIndex(
        suite => suite.pk === mutation_test_suite.pk);
      Vue.set(
        this.d_mutation_test_suites,
        index,
        deep_copy(mutation_test_suite, ag_cli.MutationTestSuite)
      );
    }
  }

  update_mutation_test_suite_deleted(mutation_test_suite: ag_cli.MutationTestSuite): void {
    if (mutation_test_suite.project === this.project.pk) {
      let index = this.d_mutation_test_suites.findIndex(
        suite => mutation_test_suite.pk === suite.pk);
      this.d_mutation_test_suites.splice(index, 1);

      this.d_selected_mutation_test_suite_pks.delete(mutation_test_suite.pk);
    }
  }

  update_mutation_test_suites_order_changed(
    project_pk: number, mutation_test_suite_order: number[]
  ): void {
    if (project_pk === this.project.pk) {
      sort_by_ordering(this.d_mutation_test_suites, mutation_test_suite_order);
    }
  }
}

function handle_start_rerun_error(component: RerunSubmissions, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/section_header.scss';

#rerun-submissions-component {
  padding: .625rem;
}

#grades-can-change-header {
  margin-top: 0;
  margin-bottom: .25rem;
}

#grades-can-change-msg {
  margin-left: .5rem;
  max-width: 550px;

  .fa-exclamation-triangle {
    color: darken($light-yellow, 25%);
  }

  .msg-spacing {
    margin: .375rem 0;
  }
}

.emphasize {
  color: darken($ocean-blue, 5%);
  font-weight: bold;
}

.step-header {
  @include section-header($line-color: $navy-blue);

  font-size: 1.25rem;
  font-weight: bold;

  margin: 1rem 0 .75rem;
}

.group-lookup-wrapper, .choose-submissions-wrapper {
  max-width: 500px;
}

.submission-selector-spacing {
  margin-top: .5rem;
}

.choose-ag-test-suites-wrapper {
  max-width: 300px;
}

.ag-test-suite-collapsible {
  margin: .5rem 0;
}

.ag-test-suite-header {
  width: 100%;
  margin-left: .25rem;
  @include section-header(
    $with-left-divider: false, $line-spacing: .25rem, $line-color: $pebble-dark);
}

.ag-test-case-checkbox-wrapper {
  margin: .25rem 0;
  margin-left: 2.5rem;
}

.button-footer {
  margin-top: 1.5rem;
}

#rerun-table {
  margin-top: 1.5rem;
}

.rerun-table {
  text-align: left;
  width: 100%;
  max-width: 500px;
}

.progress-cell {
  margin-left: 1rem;
}

.refresh-icon {
  cursor: pointer;
}

</style>
