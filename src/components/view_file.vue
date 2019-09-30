<template>
  <div id="view-file-component"
       :style="{height: view_file_height, max_height: view_file_max_height}">
    <div v-if="d_loading" class="loading-spinner">
      <div><i class="fa fa-spinner fa-pulse"></i></div>
    </div>
    <div v-else-if="d_file_contents.length > max_display_size">
      FIXME: file too big
    </div>
    <table v-else id="viewing-container" :class="{'saving': d_saving}">
      <template v-for="(line, index) of d_file_contents.split('\n')">
        <tr :class="{'commented-line': line_in_comment(index),
                     'hovered-comment-line': d_hovered_comment !== null
                                             && index >= d_hovered_comment.location.first_line
                                             && index <= d_hovered_comment.location.last_line,
                     'highlighted-region-line': d_first_highlighted_line !== null
                                                && index >= d_first_highlighted_line
                                                && index <= d_last_highlighted_line}"
            @mousedown="start_highlighting(index)"
            @mouseenter="grow_highlighted_region(index)"
            @mouseup="stop_highlighting($event, index)">
          <td class="line-number">{{index + 1}}</td>
          <td class="line-of-file-content"
              :style="{'user-select': (handgrading_enabled
                                       && !readonly_handgrading_results) ? 'none' : 'auto'}"
          >{{line === "" ? "\n" : line}}</td>
        </tr>
        <tr v-for="comment of d_handgrading_comments.get(index, [])">
          <td></td>
          <td>
            <div class="comment"
                 @mouseenter="d_hovered_comment = comment"
                 @mouseleave="d_hovered_comment = null">
              <div class="comment-line-range">
                {{comment.first_line !== comment.last_line
                    ? `Lines ${comment.first_line + 1} - ${comment.last_line + 1}`
                    :`Line ${comment.first_line + 1}`}}
              </div>
              <div class="comment-message">{{comment.message}}</div>
            </div>
          </td>
        </tr>
      </template>
    </table>

    <context-menu ref="handgrading_context_menu"
                  v-if="handgrading_enabled"
                  @is_open_changed="on_menu_is_open_changed">
      <template v-slot:context_menu_items>
        <context-menu-item v-for="annotation of handgrading_rubric.annotations"
                           :key="annotation.pk"
                           @click="apply_annotation(annotation)">
          <template slot="label">
            {{annotation.short_description}} ({{annotation.deduction}})
          </template>
        </context-menu-item>
        <div class="context-menu-divider"> </div>
        <context-menu-item @click="open_comment_modal">
          <template slot="label">
            Leave a comment
          </template>
        </context-menu-item>
      </template>
    </context-menu>

    <modal v-if="d_show_comment_modal"
           @close="d_show_comment_modal = false"
           ref="show_comment_modal"
           click_outside_to_close
           size="medium">
      <div class="modal">
        <div class="header">Comment</div>
        <textarea class="input" v-model="d_comment_text" rows="4" ref="comment_text"></textarea>
        <div class="button-footer">
          <button class="green-button" :disabled="d_saving" @click="create_comment">
            Comment
          </button>

          <button class="white-button" :disabled="d_saving" @click="d_show_comment_modal = false">
            Cancel
          </button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  Annotation,
  AppliedAnnotation,
  Comment,
  HandgradingResult,
  HandgradingRubric,
  Location,
  UserRoles,
} from "ag-client-typescript";

import { ArrayMap } from '@/array_map';
import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from "@/components/context_menu/context_menu_item.vue";
import Modal from '@/components/modal.vue';
import { Created } from '@/lifecycle';
import { toggle } from '@/utils';

@Component({
  components: {
    ContextMenu,
    ContextMenuItem,
    Modal,
  }
})
export default class ViewFile extends Vue implements Created {

  @Prop({default: "", type: String})
  filename!: string;

  @Prop({required: true, type: Promise})
  file_contents!: Promise<string>;

  @Prop({default: "", type: String})
  view_file_height!: string;

  @Prop({default: "", type: String})
  view_file_max_height!: string;

  d_filename: string = "";
  d_file_contents: string = "";
  d_loading = true;
  d_saving = false;

  // If null, the component will behave normally (no handgrading).
  // When this field is non-null, handgrading functionality will be made available.
  @Prop({default: null, type: HandgradingRubric})
  handgrading_rubric!: HandgradingRubric | null;

  // When handgrading_rubric is non-null, this field is required.
  @Prop({default: null, type: HandgradingResult})
  handgrading_result!: HandgradingResult | null;

  // When true, editing handgrading results will be disabled.
  @Prop({default: true, type: Boolean})
  readonly_handgrading_results!: boolean;

  // FIXME: Have parent pass in array of HandgradingComments, then we build
  // the arraymap? We need to make sure that when the parents delete something
  // we get updated without having to subscribe to anything.
  d_handgrading_comments = new ArrayMap<number, HandgradingComment[]>();
  d_hovered_comment: HandgradingComment | null = null;

  d_menu_is_open = false;
  d_show_comment_modal = false;
  // Since the context menu closes before the comment modal opens,
  // the first and last lines are set to null before we can use them
  // (can we fix that???). For now, we'll store the location here temporarily
  d_pending_comment_location: Location | null = null;
  d_comment_text = '';

  readonly max_display_size = 5000000;  // 5MB

  async created() {
    this.d_file_contents = await this.file_contents;
    this.d_filename = this.filename;

    this.populate_d_handgrading_comments();

    this.d_loading = false;
  }

  @Watch('handgrading_result', {deep: true})
  on_handgrading_result_change(new_comments: HandgradingComment[] | null,
                               old_comments: HandgradingComment[] | null) {
    this.populate_d_handgrading_comments();
  }

  @Watch('file_contents')
  async on_file_contents_change(new_content: string | Promise<string>, old_content: string) {
    this.d_loading = true;
    this.d_file_contents = await new_content;
    this.d_loading = false;
  }

  @Watch('filename')
  on_filename_change(new_file_name: string, old_file_name: string) {
    this.d_filename = new_file_name;
    // If the filename changed, then we know for sure that the file is different.
    // If just the contents changed, it's possible for two different files to have the
    // same contents.
    this.populate_d_handgrading_comments();
  }

  // Organize the comments provided as input into a map of (last line, comments).
  populate_d_handgrading_comments() {
    if (this.handgrading_result === null) {
      return;
    }

    this.d_handgrading_comments = new ArrayMap<number, HandgradingComment[]>();

    let annotations = this.handgrading_result.applied_annotations.filter(
      (item) => item.location.filename === this.filename);
    for (let annotation of annotations) {
      this.d_handgrading_comments.get(
        annotation.location.last_line, [], true
      ).push(new HandgradingComment(annotation));
    }

    let comments = this.handgrading_result.comments.filter(
      (item) => item.location !== null && item.location.filename === this.filename);
    for (let comment of comments) {
      let handgrading_comment = new HandgradingComment(comment);
      this.d_handgrading_comments.get(
        handgrading_comment.last_line, [], true
      ).push(handgrading_comment);
    }

    // Sort lists of comments ending on the same line by first line
    for (let [last_line, comment_list] of this.d_handgrading_comments) {
      comment_list.sort(
        (first, second) => first.first_line - second.first_line);
    }
  }

  // Returns true if line_num is contained in any provided handgrading comments.
  line_in_comment(line_num: number) {
    for (let [last_line, comment_list] of this.d_handgrading_comments) {
      let first_line = comment_list[0].first_line;
      if (line_num >= first_line && line_num <= last_line) {
        return true;
      }
    }
    return false;
  }

  get handgrading_enabled() {
    return this.handgrading_rubric !== null;
  }

  d_first_highlighted_line: number | null = null;
  d_last_highlighted_line: number | null = null;

  start_highlighting(line_index: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || this.d_menu_is_open
        || this.d_saving) {
      return;
    }
    this.d_first_highlighted_line = line_index;
    this.d_last_highlighted_line = line_index;
  }

  grow_highlighted_region(line_index: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || this.d_first_highlighted_line === null
        || this.d_last_highlighted_line === null
        || this.d_menu_is_open) {
      return;
    }

    if (line_index < this.d_first_highlighted_line) {
      this.d_first_highlighted_line = line_index;
    }
    if (line_index > this.d_last_highlighted_line) {
      this.d_last_highlighted_line = line_index;
    }
  }

  stop_highlighting(event: MouseEvent, line_index: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || this.d_first_highlighted_line === null
        || this.d_last_highlighted_line === null
        || this.d_menu_is_open) {
      return;
    }

    (<ContextMenu> this.$refs.handgrading_context_menu).show_context_menu(
      event.pageX, event.pageY);
  }

  open_comment_modal() {
    this.d_pending_comment_location = {
      filename: this.filename,
      first_line: this.d_first_highlighted_line!,
      last_line: this.d_last_highlighted_line!,
    };
    this.d_show_comment_modal = true;
    this.$nextTick(() => (<HTMLElement> this.$refs.comment_text).focus());
  }

  apply_annotation(annotation: Annotation) {
    return toggle(this, 'd_saving', () => {
      return AppliedAnnotation.create(this.handgrading_result!.pk, {
        annotation: annotation.pk,
        location: {
          first_line: this.d_first_highlighted_line!,
          last_line: this.d_last_highlighted_line!,
          filename: this.filename,
        }
      });
    });
  }

  create_comment() {
    return toggle(this, 'd_saving', async () => {
      await Comment.create(this.handgrading_result!.pk, {
        text: this.d_comment_text,
        location: this.d_pending_comment_location!
      });
      this.d_show_comment_modal = false;
      this.d_comment_text = '';
    });
  }

  on_menu_is_open_changed(is_open: boolean) {
    this.d_menu_is_open = is_open;
    if (!this.d_menu_is_open) {
      this.d_first_highlighted_line = null;
      this.d_last_highlighted_line = null;
    }
  }
}

// FIXME: use the hierarchy in handgrading.vue?
class HandgradingComment {
  private handgrading_data: AppliedAnnotation | Comment;

  constructor(handgrading_data: AppliedAnnotation | Comment) {
    this.handgrading_data = handgrading_data;
  }

  get first_line() {
    return this.location.first_line;
  }

  get last_line() {
    return this.location.last_line;
  }

  get filename() {
    return this.location.filename;
  }

  get message() {
    if (this.handgrading_data instanceof AppliedAnnotation) {
      let annotation = this.handgrading_data.annotation;
      return `${annotation.short_description} (${annotation.deduction})`;
    }
    return this.handgrading_data.text;
  }

  get location() {
    if (this.handgrading_data.location === null) {
      throw new Error('Location unexpectedly null');
    }
    return this.handgrading_data.location;
  }

  delete() {
    return this.handgrading_data.delete();
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

table {
  border-spacing: 0;
}

#view-file-component {
  overflow-y: auto;
}

#viewing-container {
  font-family: monospace;
  padding: 5px 0 0 0;
  width: 100%;
}

.saving:hover {
  cursor: wait;
}

.line-number {
  color: $baking-pan;
  font-size: 14px;
  padding: 2px 10px;
  text-align: center;
  user-select: none;
  vertical-align: top;
  width: 1%;
}

.line-of-file-content {
  color: black;
  font-size: 14px;
  margin: 0;
  padding: 1px 2px;
  white-space: pre-wrap;
  word-break: break-word;
  word-wrap: break-word;
}

.loading-spinner {
  color: mediumvioletred;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90%;
}

.comment {
  border: 1px solid $gray-blue-2;
  margin: 5px 0;
  margin-right: 1%;
  border-radius: 2px;
  max-width: 600px;

  font-family: "Helvetica Neue", Helvetica;
  font-size: 14px;

  .comment-line-range {
    font-style: italic;
    border-bottom: 1px solid $pebble-dark;
    padding-top: 5px;
    padding-bottom: 2px;
    padding-left: 5px;
    background-color: $pebble-light;
  }

  .comment-message {
    padding: 10px;
  }
}

$light-green: hsl(97, 42%, 79%);

.comment:hover {
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);

  .comment-line-range {
    background-color: lighten($light-green, 4%);
  }
}

.commented-line {
  background-color: $gray-blue-1;
}

.hovered-comment-line {
  background-color: $light-green;
}

.highlighted-region-line {
  background-color: $bubble-gum;
}

.modal {
  .header {
    font-weight: bold;
  }

  .input {
    width: 100%;
    margin-bottom: 5px;
  }

  .button-footer {
    .button {
      margin-right: 10px;
    }
  }
}

</style>
