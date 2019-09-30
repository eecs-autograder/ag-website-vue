<template>
  <!-- <div v-if="d_loading" class="loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div> -->
  <div id="handgrading-container">
    <div class="sidebar-container">
      <div class="sidebar-menu">
        <div class="sidebar-header" :class="{'sidebar-header-closed': d_group_sidebar_collapsed}">
          <span class="collapse-sidebar-button"
                @click="d_group_sidebar_collapsed = !d_group_sidebar_collapsed">
            <i class="fas fa-bars"></i>
          </span>
          <template v-if="!d_group_sidebar_collapsed">
            <span class="header-text">{{project.max_group_size === 1 ? 'Students' : 'Groups'}}
              <!-- <template v-if="!d_loading_result_summaries">
                ({{d_group_summaries.length}})
              </template> -->
            </span>
          </template>

          <!-- <div class="checkbox-input-container">
            <input id="include-staff"
                   type="checkbox"
                   class="checkbox">
            <label for="include-staff">Include Staff</label>
          </div>
          <label class="text-label" for="select-status">Status</label>
          <br>

          <select id="select-status" class="select">
            <option value="All">
              All
            </option>
            <option :value="HandgradingStatus.graded">
              {{HandgradingStatus.graded}}
            </option>
            <option :value="HandgradingStatus.in_progress">
              {{HandgradingStatus.in_progress}}
            </option>
            <option :value="HandgradingStatus.ungraded">
              {{HandgradingStatus.ungraded}}
            </option>
            <option :value="HandgradingStatus.no_submission">
              {{HandgradingStatus.no_submission}}
            </option>
          </select> -->
        </div>
        <div class="sidebar-content" v-if="!d_group_sidebar_collapsed">
          <template v-for="(group_summary, index) of d_group_summaries">
            <div class="divider" v-if="index !== 0"></div>
            <group-summary-panel :key="group_summary.pk"
                                 :group_summary="group_summary"
                                 @click="select_for_grading(group_summary)"
                                 class="sidebar-item"
                                 :class="{
                                   'active': d_currently_grading !== null
                                             && d_currently_grading.pk === group_summary.pk,
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
        <handgrading v-if="d_currently_grading !== null"
                     :readonly_handgrading_results="false"
                     :group="d_currently_grading"></handgrading>
      </div>
    </div>

    <!-- <div class="footer">
      <input type="text" v-model="d_search_text" class="input" placeholder="Search by username"/>
      <div id="adjust-points">
        Adjust Points
      </div>
      <div id="next-prev-buttons">
        Prev Skip Finish
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { SafeMap } from '@/safe_map';
import { assert_not_null } from '@/utils';

import GroupSummaryPanel from './group_summary_panel.vue';
import { HandgradingStatus } from './handgrading_status';
import Handgrading from './handgrading.vue';

@Component({
  components: {
    GroupSummaryPanel,
    Handgrading,
  }
})
export default class HandgradingContainer extends Vue implements ag_cli.HandgradingResultObserver {
  @Prop({required: true, type: ag_cli.Project})
  project!: ag_cli.Project;

  @Prop({required: true, type: ag_cli.HandgradingRubric})
  handgrading_rubric!: ag_cli.HandgradingRubric;

  d_currently_grading: ag_cli.Group | null = null;

  d_group_summaries: ag_cli.GroupWithHandgradingResultSummary[] = [];
  d_loading_result_summaries = true;

  d_group_sidebar_collapsed = false;
  d_grading_sidebar_collapsed = false;

  d_filters_collapsed = true;
  readonly filters_collapsed_height = '50px';
  readonly filters_open_height = '150px';

  get filters_height() {
    return this.d_filters_collapsed ? this.filters_collapsed_height : this.filters_open_height;
  }

  d_search_text = '';

  readonly HandgradingStatus = HandgradingStatus;

  // d_loading = true;

  async created() {
    await this.load_result_summaries();
    ag_cli.HandgradingResult.subscribe(this);
  }

  destroyed() {
    ag_cli.HandgradingResult.unsubscribe(this);
  }

  async load_result_summaries() {
    // HACK because the urls aren't proxying right in dev stack
    let page_num = 1;
    let page_size = 1;

    let page: ag_cli.HandgradingResultPage;
    do {
      page = await ag_cli.HandgradingResult.get_all_summaries_from_project(
        this.project.pk, {page_size: page_size, page_num: page_num});
      this.d_group_summaries.push(...page.results);
      page_num += 1;
    } while (page.next !== null);

    this.d_loading_result_summaries = false;
  }

  // ---------------------------------------------------

  async select_for_grading(group: ag_cli.GroupWithHandgradingResultSummary) {
    if (group.num_submissions !== 0) {
      this.d_currently_grading = new ag_cli.Group(group);
    }
  }

  update_handgrading_result_created(handgrading_result: ag_cli.HandgradingResult): void {
    this.update_summary(handgrading_result);
  }

  update_handgrading_result_changed(handgrading_result: ag_cli.HandgradingResult): void {
    this.update_summary(handgrading_result);
  }

  update_summary(handgrading_result: ag_cli.HandgradingResult) {
    let to_update = this.d_group_summaries.find(
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
$sidebar-footer-height: 42px;

$active-color: $light-blue;

@include collapsible_sidebar(
  $sidebar-width: $sidebar-width,
  $sidebar-header-height: 40px,
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
      padding: 5px 8px;
      display: flex;
      align-items: center;
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
      padding: 5px;
    }
  }
}

.collapse-sidebar-button:hover {
  color: $stormy-gray-dark;
  cursor: pointer;
}

.header-text {
  font-size: 18px;
  margin: 0 8px;
}

.divider {
  border-top: 1px solid $border-color;
}

</style>
