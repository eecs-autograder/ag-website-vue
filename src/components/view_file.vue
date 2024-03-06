<template>
  <div class="view-file-component"
        :style="{height: view_file_height, max_height: view_file_max_height}">
    <div v-if="d_loading" class="loading-container">
      <progress-bar v-if="progress !== null" :progress="progress"></progress-bar>
      <i v-else class="loading-horiz-centered loading-large fa fa-spinner fa-pulse"></i>
    </div>
    <div v-else-if="file_is_large && !d_show_anyway" class="large-file-message">
      <div class="text">This file is very large ({{d_file_contents.length}} bytes)</div>
      <button type="button" class="orange-button" @click="d_show_anyway = true">
        Click here to display its contents
      </button>
    </div>
    <template v-else>
      <div class="viewing-container"
            :class="{'hljs': is_code_file}"
            @mouseenter="d_is_file_hovered = true"
            @mouseleave="d_is_file_hovered = false"
      >
        <div class="copy-file-button" :class="{'opacity-1': d_is_file_hovered}">
          <button type="button"
                  class="copy-button-clickable"
                  :class="{'code-dark': is_code_file}"
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
              </td>
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
                        ? `Lines ${comment.location.first_line + 1} `
                          + `- ${comment.location.last_line + 1}`
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
import hljs from 'highlight.js'; // "hljs" class in HTML element styles it with imported theme
import 'highlight.js/styles/github.min.css';

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
} from './project_view/handgrading/handgrading_comment';

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

    if (line_index < this.d_first_highlighted_line!) {
      this.d_first_highlighted_line = line_index;
    }
    if (line_index > this.d_last_highlighted_line!) {
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
  position: relative;
}

.viewing-container {
  font-family: monospace;
  padding: .25rem 0;
  width: 100%;
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
  color: $baking-pan;
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

      &:hover {
        color: $stormy-gray-dark;
      }
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

.modal {
  .input {
    width: 100%;
  }
}

.copy-file-button {
  right: 0;
  top: 0;
  position: absolute;
  opacity: 0;
  transition: opacity 0.2s;

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

    &.code-light {
        background-color: $pebble-light;
    }

    &.code-dark {
      background-color: $white-gray;
    }
  }
  
}

</style>
