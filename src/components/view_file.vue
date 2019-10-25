<template>
  <div id="view-file-component"
       :style="{height: view_file_height, max_height: view_file_max_height}">
    <div v-if="d_loading" class="loading-spinner">
      <div><i class="fa fa-spinner fa-pulse"></i></div>
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
            @mouseup="stop_highlighting($event, index)"
            ref="code_line">
          <td class="line-number">{{index + 1}}</td>
          <td class="line-of-file-content"
              :style="{'user-select': (handgrading_enabled
                                       && !readonly_handgrading_results) ? 'none' : 'auto'}"
          >{{line === "" ? "\n" : line}}</td>
        </tr>
        <tr v-for="comment of handgrading_comments.get(index, [])">
          <td></td>
          <td>
            <div class="comment"
                 @mouseenter="d_hovered_comment = comment"
                 @mouseleave="d_hovered_comment = null">
              <div class="comment-header">
                <div class="comment-line-range">
                  {{comment.location.first_line !== comment.location.last_line
                    ? `Lines ${comment.location.first_line + 1} - ${comment.location.last_line + 1}`
                    :`Line ${comment.location.first_line + 1}`}}
                </div>
                <i v-if="!readonly_handgrading_results
                         && (enable_custom_comments || !comment.is_custom)"
                   @click="delete_handgrading_comment(comment)"
                   class="delete fas fa-times"></i>
              </div>
              <div class="comment-message">
                {{comment.short_description}}
                <template
                  v-if="comment.deduction !== 0"
                >({{comment.deduction}}<template v-if="comment.max_deduction !== null"
                >/{{comment.max_deduction}} max</template>)
                </template>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </table>

    <context-menu ref="handgrading_context_menu"
                  v-if="handgrading_enabled"
                  :is_open="d_context_menu_is_open"
                  :coordinates="d_context_menu_coordinates"
                  @close="d_context_menu_is_open = false">
      <context-menu-item v-for="annotation of handgrading_result.handgrading_rubric.annotations"
                          :key="annotation.pk"
                          @click="apply_annotation(annotation)">
        {{annotation.short_description}} ({{annotation.deduction}})
      </context-menu-item>
      <div class="context-menu-divider"> </div>
      <context-menu-item @click="open_comment_modal" v-if="enable_custom_comments">
        Leave a comment
      </context-menu-item>
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
import { SafeMap } from '@/safe_map';
import { chain, toggle } from '@/utils';

import {
  handgrading_comment_factory,
  HandgradingComment,
} from './handgrading/handgrading_comment';

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
  @Prop({default: null, type: HandgradingResult})
  handgrading_result!: HandgradingResult | null;
  // Aliasing handgrading result for reactivity on members of handgrading_result
  d_handgrading_result: HandgradingResult | null = null;

  @Prop({default: false, type: Boolean})
  enable_custom_comments!: boolean;

  // When true, editing handgrading results will be disabled.
  @Prop({default: true, type: Boolean})
  readonly_handgrading_results!: boolean;

  d_hovered_comment: HandgradingComment | null = null;

  d_context_menu_is_open = false;
  d_context_menu_coordinates = {x: 0, y: 0};
  d_show_comment_modal = false;
  d_comment_text = '';

  d_is_highlighting = false;
  d_first_highlighted_line: number | null = null;
  d_last_highlighted_line: number | null = null;

  async created() {
    this.d_handgrading_result = this.handgrading_result;
    this.d_file_contents = await this.file_contents;
    this.d_filename = this.filename;

    this.d_loading = false;
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
  }

  get handgrading_enabled() {
    return this.handgrading_result !== null;
  }

  get handgrading_comments(): SafeMap<number, HandgradingComment[]> {
    if (this.d_handgrading_result === null) {
      return new SafeMap();
    }

    let result =  new SafeMap<number, HandgradingComment[]>();

    let annotations = this.d_handgrading_result.applied_annotations.filter(
      (item) => item.location.filename === this.filename);

    let comments = this.d_handgrading_result.comments.filter(
      (item) => item.location !== null && item.location.filename === this.filename);

    for (let item of chain<AppliedAnnotation | Comment>(annotations, comments)) {
      let handgrading_comment = handgrading_comment_factory(item);
      result.get(
        handgrading_comment.location.last_line, [], true
      ).push(handgrading_comment);
    }

    // Sort lists of comments ending on the same line by first line
    for (let [last_line, comment_list] of result) {
      comment_list.sort(
        (first, second) => first.location.first_line - second.location.first_line);
    }

    return result;
  }

  // Returns true if line_num is contained in any provided handgrading comments.
  line_in_comment(line_num: number) {
    for (let [last_line, comment_list] of this.handgrading_comments) {
      let first_line = comment_list[0].location.first_line;
      if (line_num >= first_line && line_num <= last_line) {
        return true;
      }
    }
    return false;
  }

  start_highlighting(line_index: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || this.d_is_highlighting
        || this.d_context_menu_is_open
        || this.d_saving) {
      return;
    }

    this.d_is_highlighting = true;
    this.d_first_highlighted_line = line_index;
    this.d_last_highlighted_line = line_index;
  }

  grow_highlighted_region(line_index: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || !this.d_is_highlighting) {
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
        || !this.d_is_highlighting) {
      return;
    }

    this.d_is_highlighting = false;
    this.d_context_menu_coordinates = {x: event.pageX, y: event.pageY};
    this.d_context_menu_is_open = true;
  }

  open_comment_modal() {
    this.d_show_comment_modal = true;
    this.$nextTick(() => (<HTMLElement> this.$refs.comment_text).focus());
  }

  apply_annotation(annotation: Annotation) {
    return toggle(this, 'd_saving', async () => {
      await AppliedAnnotation.create(this.d_handgrading_result!.pk, {
        annotation: annotation.pk,
        location: {
          first_line: this.d_first_highlighted_line!,
          last_line: this.d_last_highlighted_line!,
          filename: this.filename,
        }
      });
      this.finish_commenting();
    });
  }

  create_comment() {
    return toggle(this, 'd_saving', async () => {
      await Comment.create(this.d_handgrading_result!.pk, {
        text: this.d_comment_text,
        location: {
          first_line: this.d_first_highlighted_line!,
          last_line: this.d_last_highlighted_line!,
          filename: this.filename,
        }
      });
      this.finish_commenting();
      this.d_show_comment_modal = false;
      this.d_comment_text = '';
    });
  }

  async delete_handgrading_comment(handgrading_comment: HandgradingComment) {
    if (!this.d_saving) {
      await toggle(this, 'd_saving', async () => {
        await handgrading_comment.delete();
        this.d_hovered_comment = null;
      });
    }
  }

  finish_commenting() {
    this.d_context_menu_is_open = false;
    this.d_first_highlighted_line = null;
    this.d_last_highlighted_line = null;
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

$light-green: hsl(97, 42%, 79%);

.comment {
  border: 1px solid $gray-blue-2;
  margin: 5px 0;
  margin-right: 1%;
  border-radius: 2px;
  max-width: 600px;

  font-family: "Helvetica Neue", Helvetica;
  font-size: 14px;

  .comment-header {
    display: flex;

    border-bottom: 1px solid $pebble-dark;
    padding: 5px 5px 2px;
    padding-top: 5px;
    padding-bottom: 2px;
    padding-left: 5px;
    background-color: $pebble-light;

    .comment-line-range {
      font-style: italic;
    }

    .delete {
      margin-left: auto;
      // padding: 1px;

      &:hover {
        color: $stormy-gray-dark;
      }
    }
  }

  .comment-message {
    padding: 10px;
  }

  &:hover {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);

    .comment-header {
      background-color: lighten($light-green, 4%);
    }
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
