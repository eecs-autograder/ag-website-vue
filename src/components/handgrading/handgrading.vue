<template>
  <div v-if="d_loading" class="loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="handgrading">
    <div class="files">
      <file-panel v-for="filename of d_handgrading_result.submitted_filenames"
                  :key="filename"
                  :handgrading_result="d_handgrading_result"
                  :filename="filename"
                  :readonly_handgrading_results="readonly_handgrading_results">
      </file-panel>
    </div>
    <div class="grading-sidebar">
      <div class="grading-sidebar-header">
        Score: <span class="score">
          {{Math.max(
            0, d_handgrading_result.total_points)}}/{{d_handgrading_result.total_points_possible}}
        </span>
      </div>

      <!-- Checkboxes -->
      <div class="grading-sidebar-content">
        <div class="collapsible-section-header"
              @click="d_criteria_collapsed = !d_criteria_collapsed">
          <i class="fas" :class="d_criteria_collapsed ? 'fa-caret-right' : 'fa-caret-down'"></i>
          Checkboxes
        </div>
        <div class="sidebar-section" v-show="!d_criteria_collapsed">
          <template v-for="(result, index) of d_handgrading_result.criterion_results">
            <div class="divider" v-if="index !== 0"></div>

            <div class="criterion-hover criterion"
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
              <div class="long-description" v-if="result.criterion.long_description !== ''">
                {{result.criterion.long_description}}
              </div>
            </div>
          </template>
        </div>

        <!-- Comments (and applied annotations) -->
        <div class="collapsible-section-header"
             @click="d_comments_collapsed = !d_comments_collapsed">
          <i class="fas" :class="d_comments_collapsed ? 'fa-caret-right' : 'fa-caret-down'"></i>
          Comments
        </div>
        <div v-show="!d_comments_collapsed">
          <div class="new-comment">
            <textarea class="input" v-model="d_new_comment_text"></textarea>
            <button type="button" class="blue-button" @click="add_comment">Comment</button>
          </div>
          <template v-for="(comment, index) of general_comments">
            <div class="divider" v-if="index !== 0"></div>

            <div class="comment" :key="comment.pk">
              <div class="row">
                <div class="short-description">{{comment.text}}</div>
                <i class="close fas fa-times"></i>
              </div>
            </div>
          </template>

          <!-- inline comments/annotations -->
        </div>

        <!-- Annotations -->
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

            <div class="criterion" :key="annotation.pk">
              <div class="row">
                <div class="short-description">
                  {{annotation.short_description}}
                </div>
                <div class="points">
                  {{annotation.deduction}}
                  <template v-if="annotation.max_deduction !== null">
                    (max {{annotation.max_deduction}})
                  </template>
                </div>
              </div>
              <div class="long-description" v-if="annotation.long_description !== ''">
                {{annotation.long_description}}
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="grading-sidebar-footer">
        <button type="button"
                id="prev-button"
                @click="$emit('next_group')"
                class="footer-button footer-item"
                :disabled="d_saving">
          <i class="fas fa-chevron-left"></i>
          Prev
        </button>
        <div
          class="checkbox-input-container footer-item"
          @click="d_handgrading_result.finished_grading = !d_handgrading_result.finished_grading;
                  save_adjust_points()"
        >
          <input type="checkbox"
                 class="checkbox"
                 id="finished-grading"
                 :disabled="d_saving"
                 @change="save_adjust_points"
                 v-model="d_handgrading_result.finished_grading"/>
          <label for="finished-grading">Done</label>
        </div>
        <button type="button"
                id="next-button"
                @click="$emit('prev_group')"
                class="footer-button footer-item"
                :class="{'green': d_handgrading_result.finished_grading}"
                :disabled="d_saving">
          {{d_handgrading_result.finished_grading ? 'Next' : 'Skip'}}
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  Annotation,
  AppliedAnnotation,
  Comment,
  CommentData,
  CriterionResult,
  Group,
  HandgradingResult,
  Location,
} from 'ag-client-typescript';

import FilePanel from './file_panel.vue';
import { assert_not_null, toggle } from '@/utils';

@Component({
  components: {
    FilePanel,
  }
})
export default class Handgrading extends Vue {
  @Prop({required: true, type: Group})
  group!: Group;

  // When true, editing handgrading results will be disabled.
  @Prop({required: true, type: Boolean})
  readonly_handgrading_results!: boolean;

  d_handgrading_result: HandgradingResult | null = null;

  d_loading = true;
  d_saving = false;

  d_criteria_collapsed = false;
  d_comments_collapsed = false;
  d_annotations_collapsed = true;

  d_new_comment_text = '';

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

      await result.save();

      // If this is marked as finished grading, we want observers to be
      // notified if the score changed (so we refresh).
      // Otherwise, we can just update the score in place.
      if (this.d_handgrading_result!.finished_grading) {
        await this.d_handgrading_result!.refresh();
      }
      else if (result.selected) {
        this.d_handgrading_result!.total_points += result.criterion.points;
      }
      else {
        this.d_handgrading_result!.total_points -= result.criterion.points;
      }
    });
  }

  add_comment() {
    return toggle(this, 'd_saving', async () => {
      let comment = await Comment.create(
        this.d_handgrading_result!.pk, {text: this.d_new_comment_text});
      this.d_handgrading_result!.comments.push(comment);
      this.d_new_comment_text = '';
    });
  }

  // Returns a list of AppliedAnnotations and Comments that have a location,
  // sorted by filename first, then by first line of the location.
  get inline_scoring_items() {
    let comments: InlineScoringItem[] = this.d_handgrading_result!.comments.filter(
      comment => comment.location !== null
    ).map(comment => new CommentWrapper(comment));

    let applied_annotations = this.d_handgrading_result!.applied_annotations.map(
      applied_annotation => new AppliedAnnotationWrapper(applied_annotation)
    );

    return comments.concat(applied_annotations).sort((first, second) => first.compare(second));
  }

  get general_comments() {
    return this.d_handgrading_result!.comments.filter(comment => comment.location === null);
  }

  save_adjust_points() {
    return toggle(this, 'd_saving', () => {
      return this.d_handgrading_result!.save();
    });
  }
}

// A common interface for AppliedAnnotations and Comments.
interface InlineScoringItem {
  readonly location: Location;

  readonly short_description: string;
  readonly long_description: string

  readonly deduction: number;
  readonly vue_key: string;

  compare(other: InlineScoringItem): number;
}

class AppliedAnnotationWrapper extends AppliedAnnotation implements InlineScoringItem {
  compare(other: InlineScoringItem) {
    return location_compare(this.location, other.location);
  }

  get short_description() {
    return this.annotation.short_description;
  }

  get long_description() {
    return this.annotation.long_description;
  }

  get deduction() {
    return this.annotation.deduction;
  }

  get vue_key(): string {
    return `ann${this.pk}`;
  }
}

class CommentWrapper implements InlineScoringItem {
  comment: Comment;

  constructor(comment: Comment) {
    this.comment = comment;
    assert_not_null(this.comment.location);
  }

  get short_description() {
    return this.comment.text;
  }

  get long_description() {
    return '';
  }

  get deduction() {
    return 0;
  }

  get location() {
    return this.comment.location!;
  }

  compare(other: InlineScoringItem) {
    return location_compare(this.location!, other.location);
  }

  get vue_key(): string {
    return `comm${this.comment.pk}`;
  }
}

function location_compare(first: Location, second: Location): number {
  if (first.filename === second.filename) {
    return first.first_line - second.first_line;
  }
  return first.filename.localeCompare(second.filename);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
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
  $sidebar-width: 275px;
  $header-height: 30px;
  $footer-height: 28px;

  width: $sidebar-width;
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
    height: calc(100vh - #{$header-height} - #{$footer-height});
    overflow: auto;
    margin-bottom: $footer-height;

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

  .grading-sidebar-footer {
    position: fixed;
    bottom: 0;
    right: 0;
    width: $sidebar-width;
    height: $footer-height;
    border: 1px solid lighten($pebble-dark, 10%);
    border-bottom: none;
    border-right: none;

    display: flex;

    .footer-item {
      &:hover {
        background-color: $pebble-light;
      }
    }

    .checkbox-input-container {
      padding: 5px 15px;
      display: flex;
      justify-content: center;

      background-color: white;

      border: 1px solid lighten($pebble-dark, 10%);
      border-top: none;
      border-bottom: none;
    }

    .footer-button {
      flex-grow: 1;
      padding: 3px 6px;
      background-color: white;

      border: none;

      height: $footer-height;
      font-size: 16px;
    }

    .green {
      background-color: lighten($green, 10%);
      &:hover {
        background-color: lighten($green, 5%);
      }
      // color: white;
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

  margin-right: 8px;
}

.criterion, .comment {
  background-color: white;
  padding: 8px;

  .row {
    display: flex;
  }

  .short-description {
    padding-right: 8px;
  }

  .long-description {
    font-size: 13px;
    color: darken($stormy-gray-dark, 15%);
  }
}

.criterion {
  .points {
    margin-left: auto;
  }

  .long-description {
    padding: 3px 5px 0;
    // color: darken($stormy-gray-dark, 15%);
  }
}

.new-comment {
  margin-bottom: 5px;

  .input {
    width: 100%;
    font-size: 14px;
  }

  .blue-button {
    padding: 5px 8px;
  }
}

// Can be used for comments proper and applied annotations
.comment {
  .location {

  }

  .short-description {

  }

  .long-description {
  }

  .close {
    margin-left: auto;
    // padding: 2px;

    &:hover {
      color: $stormy-gray-dark;
    }
  }
}

.divider {
  border-top: 1px solid $gray-blue-1;
}

</style>
