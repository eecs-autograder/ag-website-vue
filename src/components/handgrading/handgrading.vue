<template>
  <div v-if="d_loading" class="loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="handgrading">
    <div class="files">
      hai <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
      <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
      hee
      <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
      <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
      yup
    </div>
    <div class="grading-sidebar">
      <div class="grading-sidebar-header">
        Score: <span class="score">
          {{d_handgrading_result.total_points}}/{{d_handgrading_result.total_points_possible}}
        </span>
      </div>

      <div class="grading-sidebar-content">
        <div class="collapsible-section-header"
              @click="d_criteria_collapsed = !d_criteria_collapsed">
          <i class="fas" :class="d_criteria_collapsed ? 'fa-caret-right' : 'fa-caret-down'"></i>
          Checkboxes
        </div>

        <div class="sidebar-section" v-show="!d_criteria_collapsed">
          <template v-for="(result, index) of d_handgrading_result.criterion_results">
            <div class="divider" v-if="index !== 0"></div>

            <div class="criterion-hover rubric-item"
                 :class="{'loading-cursor': d_saving}"
                 :key="result.pk"
                 @click="toggle_criterion(result)">
              <div class="row">
                <div class="criterion-checkbox">
                  <i v-if="result.selected" class="fa fa-check" aria-hidden="true"></i>
                </div>
                <div class="short-description">
                  {{result.criterion.short_description}}
                </div>
                <div class="points">
                  {{result.criterion.points}}
                </div>
              </div>
              <div class="long-description">
                {{result.criterion.long_description}}
              </div>
            </div>
          </template>
        </div>

        <div class="collapsible-section-header"
             @click="d_annotations_collapsed = !d_annotations_collapsed">
          <i class="fas" :class="d_annotations_collapsed ? 'fa-caret-right' : 'fa-caret-down'"></i>
          Annotations
        </div>

        <div class="sidebar-section" v-if="!d_annotations_collapsed">
          <template
            v-for="(annotation, index) of d_handgrading_result.handgrading_rubric.annotations"
          >
            <div class="divider" v-if="index !== 0"></div>

            <div class="rubric-item" :key="annotation.pk">
              <div class="row">
                <div class="short-description">
                  {{annotation.short_description}}
                </div>
                <div class="points">
                  {{annotation.deduction}}
                </div>
              </div>
              <div class="long-description">
                {{annotation.long_description}}
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="grading-sidebar-footer">

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { HandgradingResult, CriterionResult, Group } from 'ag-client-typescript';

import { toggle } from '@/utils';

@Component({})
export default class Handgrading extends Vue {
  @Prop({required: true, type: Group})
  group!: Group;

  d_handgrading_result: HandgradingResult | null = null;

  d_loading = true;
  d_saving = false;

  d_criteria_collapsed = false;
  d_comments_collapsed = false;
  d_annotations_collapsed = true;
  d_applied_annotations_collapsed = false;

  async created() {
    this.d_handgrading_result = await HandgradingResult.get_or_create(this.group.pk);
    this.d_loading = false;
  }

  @Watch('group')
  async on_group_changed(new_group: Group, old_group: Group) {
    this.d_handgrading_result = await HandgradingResult.get_or_create(this.group.pk);
  }

  toggle_criterion(result: CriterionResult) {
    if (this.d_saving) {
      return;
    }
    return toggle(this, 'd_saving', async () => {
      result.selected = !result.selected;

      if (result.selected) {
        this.d_handgrading_result!.total_points += result.criterion.points;
      }
      else {
        this.d_handgrading_result!.total_points -= result.criterion.points;
      }

      return result.save();
    });
  }

  save_adjust_points() {
    return toggle(this, 'd_saving', () => {
      return this.d_handgrading_result!.save();
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/global.scss';
@import '@/styles/section_header.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#handgrading {
  display: flex;
}

.files {
  flex-grow: 1;
}

.grading-sidebar {
  width: 275px;
  $header-height: 30px;
  background-color: lighten($pebble-dark, 10%);

  // Don't pad the top, or it will mess up the sticky caclulations.
  padding: 0 5px;

  .grading-sidebar-header {
    position: sticky;
    top: 0;
    height: $header-height;

    padding: 6px 0;

    font-size: 18px;
    text-align: center;

    .score {
      font-weight: bold;
    }
  }

  .grading-sidebar-content {
    position: sticky;
    top: $header-height;
    max-height: calc(100vh - #{$header-height});
    overflow: auto;

    font-size: 14px;

    .collapsible-section-header {
      font-size: 16px;
      font-weight: bold;
      margin: 4px;
      @include section-header($with-left-divider: false);

      &:hover {
        cursor: pointer;
      }

      .fa-caret-right, .fa-caret-down {
        margin-right: 2px;
      }
    }

    .sidebar-section {
      border: 1px solid $pebble-dark;
    }
  }
}

.criterion-hover:not(.loading-cursor):hover {
  cursor: pointer;
  background-color: $light-blue;
}

.loading-cursor:hover {
  cursor: wait;
}

.criterion-checkbox {
  width: 15px;
  min-width: 15px;
  height: 15px;
  min-height: 15px;
  background-color: $pebble-light;
  border: 1px solid $gray-blue-2;
}

.rubric-item {
  background-color: white;
  padding: 8px;

  .row {
    display: flex;
  }

  .short-description {
    padding: 0 8px;
  }

  .points {
    margin-left: auto;
  }

  .long-description {
    font-size: 13px;
    padding: 3px 5px 0;
    color: darken($stormy-gray-dark, 15%);
  }
}

.divider {
  border-top: 1px solid $gray-blue-1;
}

</style>
