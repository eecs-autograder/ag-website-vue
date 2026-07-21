<template>
  <div class="view-file-component"
       :style="{height: view_file_height, max_height: view_file_max_height}">
    <div v-if="d_loading" class="loading-container">
      <progress-bar v-if="progress !== null" :progress="progress"></progress-bar>
      <i
        v-else
        class="loading-horiz-centered loading-large fa fa-spinner fa-pulse"
        aria-label="loading"
        role="img"
      />
    </div>
    <div v-else-if="file_is_large && !d_show_anyway" class="large-file-message">
      <div class="text">This file is very large ({{d_file_contents.length}} bytes)</div>
      <button type="button" class="orange-button" @click="d_show_anyway = true">
        Click here to display its contents
      </button>
    </div>
    <template v-else>
      <div class="viewing-container"
            :class="{'hljs': is_code_file,
                      'code-dark': is_code_file && is_code_theme_dark}"
            @mouseenter="d_is_file_hovered = true"
            @mouseleave="d_is_file_hovered = false"
      >
        <div class="copy-file-button" :class="{'opacity-1': d_is_file_hovered}">
          <button type="button"
                  class="copy-button-clickable"
                  :class="{'code-copy-button': is_code_file}"
                  @click="copy_file_to_clipboard"
                  aria-label="Copy file contents"
          >
            <i :class="{'far fa-copy': !d_is_file_copying,
                        'fas fa-check': d_is_file_copying}"
            ></i>
          </button>
        </div>
        <table :class="{'saving': d_saving}">
          <template v-for="(line_num, index) of num_lines_to_show">
            <tr :key="`line-${line_num}`"
                :class="{'commented-line': line_in_comment(index),
                          'hovered-comment-line': d_hovered_comment !== null
                                                  && index >= d_hovered_comment.location.first_line
                                                  && index <= d_hovered_comment.location.last_line,
                          'highlighted-region-line': d_first_highlighted_line !== null
                                                    && index >= d_first_highlighted_line
                                                    && index <= d_last_highlighted_line}"
                @mousedown="start_mouse_highlighting(index)"
                @mouseenter="grow_highlighted_region(index)"
                @mouseup="open_annotation_context_menu({x: $event.clientX, y: $event.clientY})"
                tabindex="0"
                @focus="on_line_focus(index)"
                @keydown.enter.prevent="keyboard_open_annotation_context_menu($event, index)"
                @keydown.shift.down.prevent="extend_selection('down', index)"
                @keydown.shift.up.prevent="extend_selection('up', index)"
                @keydown.esc.prevent="cancel_selection()"
                :aria-keyshortcuts="line_shortcuts"
                ref="code_lines"
                data-testid="code_line">
              <td class="line-number" :class="{'line-number-code': is_code_file}">{{line_num}}</td>
              <td class="line-of-file-content"
                  :class="{'line-of-file-content-code': is_code_file}"
                  :style="{'user-select': (handgrading_enabled
                                            && !readonly_handgrading_results) ? 'none' : 'auto'}"
              >
                <span v-if="is_code_file"
                      v-html="split_code_content[index]"
                ></span>
                <span v-else>{{ split_content[index] === "" ? "\n" : split_content[index] }}</span>
                <span v-if="handgrading_enabled && !readonly_handgrading_results"
                      class="line-hint"
                      aria-hidden="true">
                  <template v-if="is_selecting">
                    <kbd>Esc</kbd> cancel
                    <span class="line-hint-sep">·</span>
                  </template>
                  <kbd>Enter</kbd> add feedback
                  <span class="line-hint-sep">·</span>
                  <kbd>Shift</kbd>+<kbd>↑↓</kbd> select lines
                </span>
              </td>
            </tr>
            <tr v-for="comment of handgrading_comments.get(index, [])"
                :key="comment.vue_key">
              <td></td>
              <td>
                <div class="comment"
                      :tabindex="comment_is_deletable(comment) ? undefined : 0"
                      @mouseenter="d_hovered_comment = comment"
                      @mouseleave="d_hovered_comment = null"
                      @focusin="d_hovered_comment = comment"
                      @focusout="d_hovered_comment = null">
                  <div class="comment-header">
                    <div class="comment-line-range">
                      {{comment.location.first_line !== comment.location.last_line
                        ? `Lines ${comment.location.first_line + 1} `
                          + `- ${comment.location.last_line + 1}`
                        :`Line ${comment.location.first_line + 1}`}}
                    </div>
                    <button
                      class="delete unstyled-button"
                      v-if="comment_is_deletable(comment)"
                      @click="delete_handgrading_comment(comment)"
                      aria-label="Delete comment/annotation"
                    >
                      <i class="fas fa-times"></i>
                    </button>
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
        <div class="sr-only" role="status" aria-live="polite">
          {{d_selection_announcement}}
        </div>
      </div>

      <div class="show-more-button-container" v-if="d_num_lines_rendered < split_content.length">
        <button type="button"
                class="blue-button"
                @click="render_more_lines"
                ref="show_more_button">
          Show more
        </button>
      </div>
    </template>

    <context-menu ref="handgrading_context_menu"
                  v-if="handgrading_enabled"
                  :is_open="d_context_menu_is_open"
                  :coordinates="d_context_menu_coordinates"
                  @close="cancel_commenting()">
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
        <div class="modal-header">Comment</div>
        <textarea class="input" v-model="d_comment_text" rows="4" ref="comment_text"></textarea>
        <div class="modal-button-footer">
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  Annotation,
  AppliedAnnotation,
  Comment,
  HandgradingResult,
} from "ag-client-typescript";
import hljs from 'highlight.js'; // "hljs" class in HTML element styles it with imported theme

import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from "@/components/context_menu/context_menu_item.vue";
import Modal from '@/components/modal.vue';
import ProgressBar from '@/components/progress_bar.vue';
import { handle_global_errors_async } from '@/error_handling';
import { Created } from '@/lifecycle';
import { SafeMap } from '@/safe_map';
import { chain, toggle } from '@/utils';

import {
  handgrading_comment_factory,
  HandgradingComment,
} from '../project_view/handgrading/handgrading_comment';

import { CODE_THEME_STORE } from './code_theme_store';
import { nextTick } from 'process';

@Component({
  components: {
    ContextMenu,
    ContextMenuItem,
    Modal,
    ProgressBar,
  }
})
export default class ViewFile extends Vue implements Created {

  @Prop({default: "", type: String})
  filename!: string;

  @Prop({required: true, type: Promise})
  file_contents!: Promise<string>;

  // A number from 0 to 100 that will be displayed as
  // the progress in loading file_contents.
  @Prop({default: null, type: Number})
  progress!: number | null;

  // If the file is larger than this number, the user will be prompted before
  // it's displayed.
  @Prop({default: Math.pow(10, 6), type: Number})
  display_size_threshold!: number;

  @Prop({default: "", type: String})
  view_file_height!: string;

  @Prop({default: "", type: String})
  view_file_max_height!: string;

  d_filename: string = "";
  d_file_contents: string = "";
  d_loading = true;
  d_saving = false;
  d_show_anyway = false;

  readonly num_lines_per_page = 1000;
  d_num_lines_rendered = this.num_lines_per_page;

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

  // When true, file contents have syntax-highlighting
  @Prop({default: false, type: Boolean})
  is_code_file!: boolean;

  // Tracking file copying
  d_is_file_hovered = false;
  d_is_file_copying = false;

  d_hovered_comment: HandgradingComment | null = null;

  d_context_menu_is_open = false;
  d_context_menu_coordinates = {x: 0, y: 0};
  d_show_comment_modal = false;
  d_comment_text = '';

  d_is_highlighting = false;
  d_first_highlighted_line: number | null = null;
  d_last_highlighted_line: number | null = null;

  // True only while the mouse button is held during a drag-select. Mouse
  // hover (mouseenter) grows the region only when this is set, so it doesn't
  // interfere with a keyboard selection when the cursor moves or the page
  // scrolls under a stationary cursor.
  d_is_mouse_dragging = false;

  // Anchor (where a keyboard selection began) and head (the line that moves
  // with Shift+Arrow). The highlighted region spans between them. These stay
  // null during mouse selection, which is how on_line_focus tells the two
  // apart.
  d_highlight_anchor_line: number | null = null;
  d_highlight_head_line: number | null = null;

  d_selection_announcement = '';

  @handle_global_errors_async
  async created() {
    this.d_handgrading_result = this.handgrading_result;
    this.d_file_contents = await this.file_contents;
    this.d_filename = this.filename;

    this.d_loading = false;
  }

  @Watch('file_contents')
  async on_file_contents_change(new_content: Promise<string>, old_content: string) {
    return this.set_new_file_contents(new_content);
  }

  @handle_global_errors_async
  private set_new_file_contents(new_content: Promise<string>) {
    return toggle(this, 'd_loading', async () => {
      this.d_show_anyway = false;
      this.d_file_contents = await new_content;
    });
  }

  @Watch('filename')
  on_filename_change(new_file_name: string, old_file_name: string) {
    this.d_filename = new_file_name;
  }

  private get is_code_theme_dark() {
    return CODE_THEME_STORE.current_code_theme === 'dark';
  }

  get file_is_large() {
    return this.d_file_contents.length > this.display_size_threshold;
  }

  // IMPORTANT: We want this to be a computed property. Indexing into
  // a large reactive array in the template will significantly increase
  // render times.
  private get split_content() {
    return this.d_file_contents.split('\n');
  }

  // Makes each line of code have independent styling by padding newlines in
  // the midle of spans.
  private separate_span_tags_with_newlines(code_html_str: string): string {
    // Adapted from: https://stackoverflow.com/questions/64280814
    //  /how-can-i-correctly-highlight-a-line-by-line-code-using-highlight-js-react
    const open_spans: string[] = [];

    const padded_code = code_html_str.replace(/(<span [^>]+>)|(<\/span>)|(\n)/g, match => {
      if (match === "\n") {
        return "</span>".repeat(open_spans.length) + "\n" + open_spans.join("");
      }

      if (match === "</span>") {
        open_spans.pop();
      }
      else {
        open_spans.push(match);
      }

      return match;
    });

    return padded_code;
  }

  // Returns HTML for highlighted contents of code file, split by newlines.
  private get split_code_content() {
    const highlighted_code = hljs.highlightAuto(this.d_file_contents).value;
    const padded_highlighted_code = this.separate_span_tags_with_newlines(highlighted_code);
    return padded_highlighted_code.split('\n');
  }

  @handle_global_errors_async
  private async copy_file_to_clipboard() {
    await navigator.clipboard.writeText(this.d_file_contents);
    this.d_is_file_copying = true;

    // Wait to set icon back
    setTimeout(
      () => {
        this.d_is_file_copying = false;
      },
      3000
    );
  }

  private get num_lines_to_show() {
    return Math.min(this.d_num_lines_rendered, this.split_content.length);
  }

  private render_more_lines() {
    this.d_num_lines_rendered = Math.min(
      this.split_content.length,
      this.d_num_lines_rendered + this.num_lines_per_page
    );
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

  comment_is_deletable(comment: HandgradingComment): boolean {
    return !this.readonly_handgrading_results
           && (this.enable_custom_comments || !comment.is_custom);
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

  start_keyboard_highlighting(line_index: number) {
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

  start_mouse_highlighting(line_index: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || this.d_is_mouse_dragging
        || this.d_context_menu_is_open
        || this.d_saving) {
      return;
    }

    this.reset_keyboard_selection();
    this.d_is_mouse_dragging = true;
    this.d_is_highlighting = true;
    this.d_first_highlighted_line = line_index;
    this.d_last_highlighted_line = line_index;
  }

  grow_highlighted_region(line_index: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || !this.d_is_mouse_dragging) {
      return;
    }

    if (line_index < this.d_first_highlighted_line!) {
      this.d_first_highlighted_line = line_index;
    }
    if (line_index > this.d_last_highlighted_line!) {
      this.d_last_highlighted_line = line_index;
    }
  }

  open_annotation_context_menu(menu_coordinates: {x: number, y: number}) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || !this.d_is_highlighting) {
      return;
    }

    this.d_is_highlighting = false;
    this.d_is_mouse_dragging = false;
    this.d_context_menu_coordinates = menu_coordinates;
    this.d_context_menu_is_open = true;
  }

  cancel_selection() {
    if (this.d_first_highlighted_line === null) {
      return;
    }
    this.reset_keyboard_selection();
    this.d_selection_announcement = 'Selection cancelled';
  }

  keyboard_open_annotation_context_menu(event: KeyboardEvent, line_number: number) {
    const element = <HTMLElement> event.target;
    const bounding_rect = element.getBoundingClientRect();

    this.start_keyboard_highlighting(line_number);
    this.open_annotation_context_menu({
      x: bounding_rect.x,
      y: bounding_rect.y,
    });
  }

  get is_selecting() {
    return this.d_highlight_anchor_line !== null;
  }

  get line_shortcuts() {
    if (!this.handgrading_enabled || this.readonly_handgrading_results) {
      return undefined;
    }
    return 'Enter Shift+ArrowUp Shift+ArrowDown Escape';
  }

  extend_selection(direction: 'up' | 'down', from_line: number) {
    if (this.readonly_handgrading_results
        || !this.handgrading_enabled
        || this.d_context_menu_is_open
        || this.d_saving) {
      return;
    }

    let anchor = this.d_highlight_anchor_line ?? from_line;
    let head = this.d_highlight_head_line ?? from_line;
    let new_head = head + (direction === 'down' ? 1 : -1);
    if (new_head < 0 || new_head >= this.num_lines_to_show) {
      return;
    }

    this.d_highlight_anchor_line = anchor;
    this.d_highlight_head_line = new_head;
    this.d_is_highlighting = true;
    this.d_first_highlighted_line = Math.min(anchor, new_head);
    this.d_last_highlighted_line = Math.max(anchor, new_head);

    this.d_selection_announcement =
      `Selecting lines ${this.d_first_highlighted_line + 1} `
      + `to ${this.d_last_highlighted_line + 1}`;

    this.focus_line(new_head);
  }

  // Collapse an in-progress keyboard selection when focus lands on a line
  // that isn't the current head (e.g. the grader tabbed away).
  on_line_focus(line_index: number) {
    if (this.d_highlight_anchor_line !== null
        && line_index !== this.d_highlight_head_line) {
      this.reset_keyboard_selection();
    }
  }

  reset_keyboard_selection() {
    this.d_highlight_anchor_line = null;
    this.d_highlight_head_line = null;
    this.d_is_highlighting = false;
    this.d_is_mouse_dragging = false;
    this.d_first_highlighted_line = null;
    this.d_last_highlighted_line = null;
    this.d_selection_announcement = '';
  }

  open_comment_modal() {
    this.d_context_menu_is_open = false;
    this.d_show_comment_modal = true;
    this.$nextTick(() => (<HTMLElement> this.$refs.comment_text).focus());
  }

  @handle_global_errors_async
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

  @handle_global_errors_async
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

  @handle_global_errors_async
  async delete_handgrading_comment(handgrading_comment: HandgradingComment) {
    if (!this.d_saving) {
      await toggle(this, 'd_saving', async () => {
        await handgrading_comment.delete();
        this.d_hovered_comment = null;
      });
    }
  }

  finish_commenting() {
    // IMPORTANT: If you change anything about this method,
    // double check whether cancel_commenting needs the same changes.
    // cancel_commenting is currently an alias for this method.
    const first_line_highlighted = this.d_first_highlighted_line;
    this.d_context_menu_is_open = false;
    this.d_first_highlighted_line = null;
    this.d_last_highlighted_line = null;
    this.d_highlight_anchor_line = null;
    this.d_highlight_head_line = null;
    this.d_selection_announcement = '';
    nextTick(() => {
      if (first_line_highlighted !== null) {
        this.focus_line(first_line_highlighted);
      }
    });
  }

  cancel_commenting() {
    this.finish_commenting();
  }

  focus_line(line_index: number) {
    const lines = <HTMLElement[]> this.$refs.code_lines;
    lines?.[line_index]?.focus();
  }
}


</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

table {
  border-spacing: 0;
}

.view-file-component {
  overflow-y: auto;
}

.viewing-container {
  font-family: monospace;
  padding: .25rem 0;
  width: 100%;
  position: relative;
}

.large-file-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: .875rem;

  white-space: normal;

  .text {
    font-size: 1.25rem;
  }

  .button {
    margin-top: .5rem;
  }
}

.saving:hover {
  cursor: wait;
}

.line-number {
  color: $normal-text-color-3;
  font-size: .875rem;
  padding: .125rem .625rem;
  text-align: center;
  user-select: none;
  vertical-align: top;
  width: 1%;
}

.line-number.line-number-code {
  color: inherit;
}

.line-of-file-content {
  color: black;
  font-size: .875rem;
  margin: 0;
  padding: .125rem;
  white-space: pre-wrap;
  word-break: break-word;
  word-wrap: break-word;
}

.line-of-file-content.line-of-file-content-code {
  color: inherit;
}

.show-more-button-container {
  display: flex;
  padding: .375rem;

  white-space: normal;
}

// Do NOT use loading-centered here
.loading-container {
  overflow: hidden;
}

$light-green: hsl(97, 42%, 79%);

.comment {
  border: 1px solid $gray-blue-2;
  margin: .25rem 0;
  margin-right: 1%;
  border-radius: 2px;
  max-width: 600px;

  font-family: "Helvetica Neue", Helvetica;
  font-size: .875rem;

  &:focus-visible {
    outline: 2px solid $ocean-blue;
    outline-offset: 2px;
  }

  .comment-header {
    display: flex;

    border-bottom: 1px solid $pebble-dark;
    padding: .25rem .25rem .125rem;
    background-color: $pebble-light;

    .comment-line-range {
      font-style: italic;
    }

    .delete {
      margin-left: auto;
      padding: .125rem;
      margin-top: -.125rem;
    }
  }

  .comment-message {
    padding: .875rem;
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

tr:focus-visible {
  outline: 2px solid $ocean-blue;
  outline-offset: -2px;
}

.line-of-file-content {
  position: relative;
}

.line-hint {
  display: none;
  position: absolute;
  right: .5rem;
  top: 50%;
  transform: translateY(-50%);

  font-family: "Helvetica Neue", Helvetica;
  font-size: .75rem;
  color: $normal-text-color-2;

  padding: .0625rem .375rem;
  border: 1px solid $pebble-dark;
  border-radius: 3px;
  background-color: $white-gray;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;

  kbd {
    font-family: "Helvetica Neue", Helvetica;
    font-size: .6875rem;
    padding: 0 .1875rem;
    border: 1px solid $pebble-dark;
    border-radius: 2px;
    background-color: white;
  }

  .line-hint-sep {
    margin: 0 .125rem;
    color: $stormy-gray-light;
  }
}

tr:focus-visible .line-hint {
  display: inline-block;
}

.modal {
  .input {
    width: 100%;
  }
}

.code-dark {
  // Invert highlighted lines' text when dark theme
  // to avoid color clashes
  .commented-line td,
  .highlighted-region-line td {
    filter: invert(1);
  }

  // The line hint carries its own theme-independent colors, so undo the
  // parent td's invert to keep it looking the same on highlighted lines.
  .commented-line .line-hint,
  .highlighted-region-line .line-hint {
    filter: invert(1);
  }
}

.copy-file-button {
  right: 0;
  top: 0;
  position: absolute;
  opacity: 0;
  transition: opacity 0.2s;

  &:focus-within {
    opacity: 1;
  }

  &.opacity-1 {
    opacity: 1;
  }

  .copy-button-clickable {
    background-color: $pebble-dark;
    border: 0.0625rem solid black;
    border-radius: 0.375rem;
    position: relative;
    line-height: 1;
    vertical-align: middle;
    padding: 0.5rem;
    margin: 0.5rem;
    cursor: pointer;

    &.code-copy-button {
      background-color: $white-gray;
    }
  }

}

</style>
