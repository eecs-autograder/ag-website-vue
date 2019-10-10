<template>
  <div id="handgrading">
    <div class="files">
      <file-panel v-for="filename of d_handgrading_result.submitted_filenames"
                  :key="filename"
                  :handgrading_result="d_handgrading_result"
                  :filename="filename"
                  :enable_custom_comments="
                    d_globals.user_roles.is_staff
                    || d_handgrading_result.handgrading_rubric.handgraders_can_leave_comments"
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

      <div class="grading-sidebar-content"
           :class="{'readonly-mode': readonly_handgrading_results}">
        <div id="adjust-points-container" v-if="can_adjust_points">
          <label class="text-label" for="adjust-points">Adjust Points</label>
          <validated-input @input_validity_changed="d_adjust_points_is_valid = $event"
                           ref="adjust_points"
                           :validators="[is_not_empty, is_integer]"
                           :from_string_fn="string_to_num"
                           v-model="d_handgrading_result.points_adjustment">
            <template v-slot:suffix>
              <button type="button"
                      id="save-adjust-points"
                      class="green-button"
                      :disabled="saving || !d_adjust_points_is_valid"
                      @click="save_handgrading_result">Save</button>
              </template>
          </validated-input>
        </div>

        <!-- Checkboxes -->
        <div class="collapsible-section-header"
             @click="d_criteria_collapsed = !d_criteria_collapsed">
          <i class="fas" :class="d_criteria_collapsed ? 'fa-caret-right' : 'fa-caret-down'"></i>
          Checkboxes
        </div>
        <div class="sidebar-section"
             v-show="!d_criteria_collapsed && d_handgrading_result.criterion_results.length !== 0">
          <template v-for="(result, index) of d_handgrading_result.criterion_results">
            <div class="divider" v-if="index !== 0"></div>

            <div class="criterion"
                 :class="{
                   'loading-cursor': saving,
                   'criterion-hover': !readonly_handgrading_results
                 }"
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
          <div class="new-comment" v-if="can_leave_comments">
            <textarea class="input" v-model="d_new_comment_text"></textarea>
            <button type="button" class="blue-button" @click="add_comment">Comment</button>
          </div>

          <div class="sidebar-section"
               v-show="d_handgrading_result.comments.length !== 0
                       || d_handgrading_result.applied_annotations.length !== 0">
            <!-- General comments -->
            <template v-for="(comment, index) of general_comments">
              <div class="divider" v-if="index !== 0"></div>

              <div class="comment"
                    :class="{'loading-cursor': saving}"
                    :key="comment.pk">
                <div class="row">
                  <div class="short-description">{{comment.text}}</div>
                  <i v-if="!readonly_handgrading_results"
                     @click="delete_comment(comment)"
                     class="close fas fa-times"></i>
                </div>
              </div>
            </template>

            <!-- inline comments/annotations -->
            <template v-for="(handgrading_comment, index) of handgrading_comments">
              <div class="divider" v-if="index !== 0 || general_comments.length !== 0"></div>

              <div class="comment"
                    :class="{'loading-cursor': saving}"
                    :key="handgrading_comment.pk">
                <div class="row">
                  <div class="short-description">
                    {{handgrading_comment.short_description}}
                    <span class="deduction"
                      v-if="handgrading_comment.deduction !== 0"
                    >({{handgrading_comment.deduction}})</span>
                  </div>
                  <i v-if="!readonly_handgrading_results"
                     @click="delete_comment(handgrading_comment)"
                     class="close fas fa-times"></i>
                </div>

                <div class="long-description" v-if="handgrading_comment.long_description !== ''">
                  {{handgrading_comment.long_description}}
                </div>

                <div class="location">
                  {{
                    handgrading_comment.location.filename
                  }}:{{
                    handgrading_comment.location.first_line + 1
                  }}<template
                      v-if="handgrading_comment.location.first_line
                            !== handgrading_comment.location.last_line"
                    > - {{handgrading_comment.location.last_line + 1}}</template>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Annotations -->
        <template v-if="!readonly_handgrading_results">
          <div class="collapsible-section-header"
              @click="d_annotations_collapsed = !d_annotations_collapsed">
            <i class="fas"
               :class="d_annotations_collapsed ? 'fa-caret-right' : 'fa-caret-down'"></i>
            Annotations
          </div>
          <div class="sidebar-section" v-if="!d_annotations_collapsed">
            <template
              v-for="(annotation, index) of d_handgrading_result.handgrading_rubric.annotations"
            >
              <div class="divider" v-if="index !== 0"></div>

              <div class="annotation" :key="annotation.pk">
                <div class="row">
                  <div class="short-description">
                    {{annotation.short_description}}
                  </div>
                  <div class="points">{{annotation.deduction}}</div>
                </div>
                <div class="long-description" v-if="annotation.long_description !== ''">
                  {{annotation.long_description}}
                </div>
                <div class="max-deduction" v-if="annotation.max_deduction !== null">
                  {{annotation.max_deduction}} max total deduction
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>

      <div class="grading-sidebar-footer" v-if="!readonly_handgrading_results">
        <button type="button"
                id="prev-button"
                @click="$emit('prev_group')"
                class="footer-button footer-item"
                :disabled="saving || is_first">
          <i class="fas fa-chevron-left"></i>
          Prev
        </button>
        <div
          class="checkbox-input-container footer-item"
          @click="d_handgrading_result.finished_grading = !d_handgrading_result.finished_grading;
                  save_handgrading_result()"
        >
          <input type="checkbox"
                 class="checkbox"
                 id="finished-grading"
                 :disabled="saving"
                 @change="save_handgrading_result"
                 v-model="d_handgrading_result.finished_grading"/>
          <label for="finished-grading">Done</label>
        </div>
        <button type="button"
                id="next-button"
                @click="$emit('next_group')"
                class="footer-button footer-item"
                :class="{'green': d_handgrading_result.finished_grading}"
                :disabled="saving || is_last">
          {{d_handgrading_result.finished_grading ? 'Next' : 'Skip'}}
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  Annotation,
  AppliedAnnotation,
  AppliedAnnotationObserver,
  Comment,
  CommentData,
  CommentObserver,
  CriterionResult,
  CriterionResultObserver,
  HandgradingResult,
  Location,
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { assert_not_null, deep_copy, toggle } from '@/utils';
import {
  is_integer,
  is_not_empty,
  string_to_num,
} from '@/validators';

import FilePanel from './file_panel.vue';
import { handgrading_comment_factory, HandgradingComment } from './handgrading_comment';

class ProcessingSemaphore {
  private count = 0;

  get processing() {
    return this.count !== 0;
  }

  async process<T>(body: () => Promise<T>) {
    try {
      this.count += 1;
      return await body();
    }
    finally {
      this.count -= 1;
    }
  }
}

@Component({
  components: {
    FilePanel,
    ValidatedInput,
  }
})
export default class Handgrading extends Vue implements AppliedAnnotationObserver,
                                                        CommentObserver {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: HandgradingResult})
  handgrading_result!: HandgradingResult;

  // When true, editing handgrading results will be disabled.
  @Prop({required: true, type: Boolean})
  readonly_handgrading_results!: boolean;

  // When true, the "prev" buttion will be disabled.
  @Prop({default: false, type: Boolean})
  is_first!: boolean;

  // When true, the "skip/next" buttion will be disabled.
  @Prop({default: false, type: Boolean})
  is_last!: boolean;

  d_handgrading_result: HandgradingResult | null = null;

  get saving() {
    return this.d_saving.processing;
  }
  d_saving = new ProcessingSemaphore();

  d_criteria_collapsed = false;
  d_comments_collapsed = false;
  d_annotations_collapsed = true;

  d_new_comment_text = '';

  d_adjust_points_is_valid = true;

  readonly string_to_num = string_to_num;
  readonly is_integer = is_integer;
  readonly is_not_empty = is_not_empty;

  created() {
    this.d_handgrading_result = deep_copy(this.handgrading_result, HandgradingResult);
    AppliedAnnotation.subscribe(this);
    Comment.subscribe(this);
  }

  destroy() {
    AppliedAnnotation.unsubscribe(this);
    Comment.unsubscribe(this);
  }

  @Watch('handgrading_result')
  on_handgrading_result_changed(
      new_result: HandgradingResult, old_result: HandgradingResult) {
    this.d_handgrading_result = deep_copy(new_result, HandgradingResult);
  }

  toggle_criterion(criterion_result: CriterionResult) {
    if (this.saving || this.readonly_handgrading_results) {
      return;
    }
    return this.d_saving.process(async () => {
      criterion_result.selected = !criterion_result.selected;
      await criterion_result.save();
      let adjustment = criterion_result.criterion.points;
      if (!criterion_result.selected) {
        adjustment *= -1;
      }
      return this.update_score(adjustment);
    });
  }

  add_comment() {
    return this.d_saving.process(async () => {
      let comment = await Comment.create(
        this.d_handgrading_result!.pk, {text: this.d_new_comment_text});
      this.d_handgrading_result!.comments.push(comment);
      this.d_new_comment_text = '';
    });
  }

  // Returns a list of AppliedAnnotations and Comments that have a location,
  // sorted by filename first, then by first line of the location.
  get handgrading_comments() {
    let comments = this.d_handgrading_result!.comments.filter(
      comment => comment.location !== null
    ).map(handgrading_comment_factory);

    let applied_annotations = this.d_handgrading_result!.applied_annotations.map(
      handgrading_comment_factory
    );

    return comments.concat(applied_annotations).sort((first, second) => first.compare(second));
  }

  get general_comments() {
    return this.d_handgrading_result!.comments.filter(comment => comment.location === null);
  }

  get can_leave_comments() {
    return !this.readonly_handgrading_results
           && (this.d_globals.user_roles.is_staff
               || this.d_handgrading_result!.handgrading_rubric.handgraders_can_leave_comments);
  }

  save_handgrading_result() {
    return this.d_saving.process(() => {
      return this.d_handgrading_result!.save();
    });
  }

  get can_adjust_points() {
    return !this.readonly_handgrading_results
           && (this.d_globals.user_roles.is_staff
               || this.d_handgrading_result!.handgrading_rubric.handgraders_can_adjust_points);
  }

  delete_comment(comment: Comment | HandgradingComment) {
    if (this.saving) {
      return;
    }
    return this.d_saving.process(() => {
      return comment.delete();
    });
  }

  update_applied_annotation_created(applied_annotation: AppliedAnnotation): void {
    if (applied_annotation.handgrading_result === this.d_handgrading_result!.pk) {
      this.d_handgrading_result!.applied_annotations.push(applied_annotation);
      // tslint:disable-next-line no-floating-promises
      this.update_score(applied_annotation.annotation.deduction);
    }
  }

  update_applied_annotation_deleted(applied_annotation: AppliedAnnotation): void {
    if (applied_annotation.handgrading_result === this.d_handgrading_result!.pk) {
      this.d_handgrading_result!.applied_annotations.splice(
        this.d_handgrading_result!.applied_annotations.findIndex(
          item => item.pk === applied_annotation.pk
        ),
        1
      );
      // tslint:disable-next-line no-floating-promises
      this.update_score(-applied_annotation.annotation.deduction);
    }
  }

  update_comment_created(comment: Comment): void {
    if (comment.handgrading_result === this.d_handgrading_result!.pk
        && comment.location !== null) {
      this.d_handgrading_result!.comments.push(comment);
    }
  }

  update_comment_deleted(comment: Comment): void {
    if (comment.handgrading_result === this.d_handgrading_result!.pk) {
      this.d_handgrading_result!.comments.splice(
        this.d_handgrading_result!.comments.findIndex(
          item => item.pk === comment.pk
        ),
        1
      );
    }
  }

  update_comment_changed(comment: Comment): void {
  }

  // If d_handgrading_result.finished_grading is false,
  // adds adjustment points to d_handgrading_result.total_points.
  // Otherwise, also d_handgrading_result
  update_score(adjustment: number) {
    return this.d_saving.process(async () => {
      // If this is marked as finished grading, we want observers to be
      // notified if the score changed (so we refresh).
      if (this.d_handgrading_result!.finished_grading) {
        await this.d_handgrading_result!.refresh();
      }
      else {
        this.d_handgrading_result!.total_points += adjustment;
      }
    });
  }
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

  min-width: $sidebar-width;
  max-width: $sidebar-width;
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
    overflow: auto;

    &:not(.readonly-mode) {
      height: calc(100vh - #{$header-height} - #{$footer-height});
      margin-bottom: $footer-height;
    }

    &.readonly-mode {
      height: calc(100vh - #{$header-height});
      margin-bottom: 5px;
    }

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
      &:hover:not([disabled]) {
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
      background-color: lighten($green, 20%);
      &:hover:not([disabled]) {
        background-color: lighten($green, 15%);
      }
    }
  }
}

#adjust-points-container {
  padding: 4px;
}

#save-adjust-points {
  padding: 4px 6px;
  margin-left: 4px;
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

.criterion, .annotation, .comment {
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

.criterion, .annotation {
  .points {
    margin-left: auto;
    color: $navy-blue;
  }

  .long-description {
    padding: 3px 5px 0;
  }
}

.annotation {
  .max-deduction {
    padding-top: 3px;
    font-size: 13px;
    font-weight: bold;
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
    margin-top: 3px;
    font-weight: bold;
    font-size: 13px;
  }

  .deduction {
    padding-left: 3px;
    color: darken($ocean-blue, 0%);
    font-weight: bold;
  }

  .long-description {
    margin-top: 3px;
  }

  .close {
    margin-left: auto;
    padding: 1px;

    &:hover {
      color: $stormy-gray-dark;
    }
  }
}

.divider {
  border-top: 1px solid $gray-blue-1;
}

</style>
