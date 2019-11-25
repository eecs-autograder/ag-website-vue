<template>
  <div id="handgrading-container">
    <div class="sidebar-container">
      <div class="sidebar-menu">
        <div class="sidebar-header" :class="{'sidebar-header-closed': d_group_sidebar_collapsed}">
          <div class="collapse-sidebar-button"
                @click="d_group_sidebar_collapsed = !d_group_sidebar_collapsed">
            <i class="fas fa-bars"></i>
          </div>
          <template v-if="!d_group_sidebar_collapsed">
            <div class="header-text">
              {{project.max_group_size === 1 ? 'Students' : 'Groups'}}
            </div>
            <div class="progress dropdown" v-if="!d_loading_result_summaries">
              <div ref="progress_text">
                {{num_finished}}/{{total_num_to_grade}}
                ({{staff_filtered_groups.length}} total)
                <i class="fas fa-caret-down"></i>
              </div>

              <div id="filter-menu" class="menu">
                <div class="checkbox-input-container">
                  <input v-model="d_include_staff"
                          id="include-staff"
                          type="checkbox"
                          class="checkbox">
                  <label for="include-staff">Include Staff</label>
                </div>

                <div id="select-status">
                  <div class="header">Status</div>
                  <div class="radio-container">
                    <input type="radio" name="status"
                            id="all"
                            class="radio"
                            v-model="d_status_filter"
                            :value="null">
                    <label class="label" for="all">All</label>
                  </div>
                  <div class="radio-container">
                    <input type="radio" name="status"
                            id="graded"
                            class="radio"
                            v-model="d_status_filter"
                            :value="HandgradingStatus.graded">
                    <label class="label"
                            for="graded">{{HandgradingStatus.graded}}</label>
                  </div>
                  <div class="radio-container">
                    <input type="radio" name="status"
                            id="in-progress"
                            class="radio"
                            v-model="d_status_filter"
                            :value="HandgradingStatus.in_progress">
                    <label class="label"
                            for="in-progress">{{HandgradingStatus.in_progress}}</label>
                  </div>
                  <div class="radio-container">
                    <input type="radio" name="status"
                            id="ungraded"
                            class="radio"
                            v-model="d_status_filter"
                            :value="HandgradingStatus.ungraded">
                    <label class="label"
                            for="ungraded">{{HandgradingStatus.ungraded}}</label>
                  </div>
                  <div class="radio-container">
                    <input type="radio" name="status"
                            id="no-submission"
                            class="radio"
                            v-model="d_status_filter"
                            :value="HandgradingStatus.no_submission">
                    <label class="label"
                            for="no-submission">{{HandgradingStatus.no_submission}}</label>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="sidebar-content" v-if="!d_group_sidebar_collapsed">
          <template v-for="(group_summary, index) of username_filtered_groups">
            <div class="divider" v-if="index !== 0"></div>
            <group-summary-panel :key="group_summary.pk"
                                 :group_summary="group_summary"
                                 @click="select_for_grading(group_summary)"
                                 class="sidebar-item"
                                 :class="{
                                   'active': d_currently_grading !== null
                                             && d_currently_grading.group === group_summary.pk,
                                   'disabled': group_summary.num_submissions === 0
                                 }">
            </group-summary-panel>
          </template>

          <i v-if="d_loading_result_summaries" class="loading fa fa-spinner fa-pulse"></i>
        </div>
        <div class="sidebar-footer" v-if="!d_group_sidebar_collapsed">
          <input type="text"
                 v-model="d_search_text"
                 class="input" placeholder="Search by username"/>
        </div>
      </div>

      <div class="body" :class="{'body-closed': d_group_sidebar_collapsed}">
        <handgrading v-if="d_currently_grading !== null && !d_loading_result"
                     :readonly_handgrading_results="false"
                     :is_first="previous === null"
                     :is_last="next === null"
                     :handgrading_result="d_currently_grading"
                     @prev_group="select_for_grading(previous)"
                     @next_group="select_for_grading(next)"></handgrading>
        <div v-else-if="d_loading_result" class="loading-large">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import { SafeMap } from '@/safe_map';
import { assert_not_null, toggle } from '@/utils';

import GroupSummaryPanel from './group_summary_panel.vue';
import Handgrading from './handgrading.vue';
import { get_handgrading_status, HandgradingStatus } from './handgrading_status';

@Component({
  components: {
    GroupSummaryPanel,
    Handgrading,
  }
})
export default class HandgradingContainer extends Vue implements ag_cli.HandgradingResultObserver {
  @Prop({required: true, type: ag_cli.Course})
  course!: ag_cli.Course;

  @Prop({required: true, type: ag_cli.Project})
  project!: ag_cli.Project;

  @Prop({required: true, type: ag_cli.HandgradingRubric})
  handgrading_rubric!: ag_cli.HandgradingRubric;

  d_currently_grading: ag_cli.HandgradingResult | null = null;

  d_result_summaries: ag_cli.GroupWithHandgradingResultSummary[] = [];
  d_loading_result_summaries = true;

  d_group_sidebar_collapsed = false;
  d_grading_sidebar_collapsed = false;

  d_filters_collapsed = true;

  d_search_text = '';
  d_status_filter: HandgradingStatus | null = null;
  d_include_staff = false;

  d_staff: Set<string> = new Set<string>();

  readonly HandgradingStatus = HandgradingStatus;

  d_loading_result = false;

  async created() {
    this.d_staff =  new Set((await this.course.get_staff()).map(user => user.username));
    await this.load_result_summaries();
    ag_cli.HandgradingResult.subscribe(this);
  }

  beforeDestroy() {
    ag_cli.HandgradingResult.unsubscribe(this);
  }

  async load_result_summaries() {
    // Because the page urls aren't correct in the dev stack,
    // we'll just keep track of the current page number.
    let page_num = 1;
    let page_size = 500;

    let page: ag_cli.HandgradingResultPage;
    do {
      page = await ag_cli.HandgradingResult.get_all_summaries_from_project(
        this.project.pk, {page_size: page_size, page_num: page_num});
      this.d_result_summaries.push(...page.results);
      page_num += 1;
    } while (page.next !== null);

    this.d_loading_result_summaries = false;
  }

  get staff_filtered_groups() {
    if (this.d_include_staff) {
      return this.d_result_summaries;
    }

    return this.d_result_summaries.filter(group => !this.d_staff.has(group.member_names[0]));
  }

  get status_filtered_groups() {
    if (this.d_status_filter ===  null) {
      return this.staff_filtered_groups;
    }

    return this.staff_filtered_groups.filter(
      group => get_handgrading_status(group) === this.d_status_filter);
  }

  get username_filtered_groups() {
    let search = this.d_search_text.trim();
    if (search === '') {
      return this.status_filtered_groups;
    }
    return this.status_filtered_groups.filter(
      group => group.member_names.some(username => username.includes(search)));
  }

  get num_finished(): number {
    return this.staff_filtered_groups.filter(
      group => get_handgrading_status(group) === HandgradingStatus.graded
    ).length;
  }

  get total_num_to_grade() {
    return this.staff_filtered_groups.filter(
      group => get_handgrading_status(group) !== HandgradingStatus.no_submission
    ).length;
  }

  async select_for_grading(group: ag_cli.GroupWithHandgradingResultSummary) {
    if (group.num_submissions !== 0) {
      await toggle(this, 'd_loading_result', async () => {
        this.d_currently_grading = await ag_cli.HandgradingResult.get_or_create(group.pk);
      });
    }
  }

  get previous() {
    let index = this.index_of_currently_grading - 1;
    while (index >= 0) {
      if (this.staff_filtered_groups[index].num_submissions !== 0) {
        return this.staff_filtered_groups[index];
      }
      index -= 1;
    }
    return null;
  }

  get next() {
    let index = this.index_of_currently_grading + 1;
    while (index < this.staff_filtered_groups.length) {
      if (this.staff_filtered_groups[index].num_submissions !== 0) {
        return this.staff_filtered_groups[index];
      }
      index += 1;
    }
    return null;
  }

  private get index_of_currently_grading() {
    assert_not_null(this.d_currently_grading);
    return this.staff_filtered_groups.findIndex(
      group => group.pk === this.d_currently_grading!.group);
  }

  update_handgrading_result_created(handgrading_result: ag_cli.HandgradingResult): void {
    this.update_summary(handgrading_result);
  }

  update_handgrading_result_changed(handgrading_result: ag_cli.HandgradingResult): void {
    this.update_summary(handgrading_result);
  }

  update_summary(handgrading_result: ag_cli.HandgradingResult) {
    let to_update = this.d_result_summaries.find(
      summary => summary.pk === handgrading_result.group);

    if (assert_not_null(to_update)) {
      to_update.handgrading_result = {
        finished_grading: handgrading_result.finished_grading,
        total_points: handgrading_result.total_points,
        total_points_possible: handgrading_result.total_points_possible,
      };
    }
  }

  update_handgrading_result_deleted(handgrading_result: ag_cli.HandgradingResult): void {
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/collapsible_sidebar.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/static_dropdown.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.loading {
  padding: 10px;
  width: 100%;
  text-align: center;
}

$sidebar-width: 275px;
$border-color: $gray-blue-1;
$sidebar-footer-height: 2.625rem;

$active-color: $light-blue;

@include collapsible_sidebar(
  $sidebar-width: $sidebar-width,
  $sidebar-header-height: 2.5rem,
  $border-color: $border-color,
  $background-color: white,
  $hover-color: lighten($active-color, 5%),
  $active-color: $active-color,
  $sidebar-footer-height: $sidebar-footer-height,
  $stretch: true,
);

.sidebar-container {
  .sidebar-menu {
    .sidebar-header {
      padding: .25rem .5rem;
      display: flex;
      align-items: center;

      // Create a new stacking context
      z-index: inherit;

      .collapse-sidebar-button:hover {
        color: $stormy-gray-dark;
        cursor: pointer;
      }

      .header-text {
        font-size: 1.125rem;
        margin: 0 .5rem;
      }

      .progress {
        margin-left: auto;
        font-size: .875rem;
        color: $navy-blue;
      }
    }

    .sidebar-header-closed {
      border-bottom: 1px solid $border-color;
    }

    border-top: none;
    border-left: none;
    border-bottom: none;

    .sidebar-footer {
      position: fixed;
      bottom: 0;

      height: $sidebar-footer-height;
      width: $sidebar-width;
      background-color: $white-gray;
      padding: .375rem;
    }
  }
}

#filter-menu {
  color: black;
}

#select-status {
  padding-left: .25rem;

  .header {
    font-size: 1rem;
    font-weight: bold;
  }
}

.divider {
  border-top: 1px solid $border-color;
}

.dropdown {
  @include static-dropdown($open-on-hover: true);
}

</style>
