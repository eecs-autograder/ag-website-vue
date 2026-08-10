<template>
  <div
    class="view-file-component"
    :style="{ height: view_file_height, maxHeight: view_file_max_height }"
    role="region"
    aria-label="File viewer"
  >
    <div v-if="state.d_loading" class="loading-container">
      <progress-bar
        v-if="progress !== null"
        :progress="progress"
      ></progress-bar>
      <i
        v-else
        class="loading-horiz-centered loading-large fa fa-spinner fa-pulse"
        aria-label="Loading"
        role="img"
      />
    </div>
    <div
      v-else-if="file_is_large && !state.d_show_anyway"
      class="large-file-message"
    >
      <div class="text">
        This file is very large ({{ state.d_file_contents.length }} bytes)
      </div>
      <button
        type="button"
        class="orange-button"
        @click="state.d_show_anyway = true"
      >
        Click here to display its contents
      </button>
    </div>
    <template v-else>
      <div
        class="viewing-container"
        :class="{
          hljs: is_code_file,
          'code-dark': is_code_file && is_code_theme_dark,
        }"
        @mouseenter="state.d_is_file_hovered = true"
        @mouseleave="state.d_is_file_hovered = false"
      >
        <div
          class="copy-file-button"
          :class="{ 'opacity-1': state.d_is_file_hovered }"
        >
          <button
            type="button"
            class="copy-button-clickable"
            :class="{ 'code-copy-button': is_code_file }"
            @click="copy_file_to_clipboard"
            aria-label="Copy file contents"
          >
            <i
              :class="{
                'far fa-copy': !state.d_is_file_copying,
                'fas fa-check': state.d_is_file_copying,
              }"
            ></i>
          </button>
        </div>
        <table :class="{ saving: state.d_saving }">
          <!-- For some reason, adding a key to this loop makes the loop
               not render any children. Since we don't have anything
               to gain from Vue's re-rendering optimization, we
               won't set a key here. -->
          <!-- eslint-disable vue/require-v-for-key -->
          <template v-for="(line_num, index) of num_lines_to_show">
            <!-- eslint-enable -->
            <tr
              :class="{
                'commented-line': line_in_comment(index),
                'hovered-comment-line':
                  state.d_hovered_comment !== null &&
                  index >= state.d_hovered_comment.location.first_line &&
                  index <= state.d_hovered_comment.location.last_line,
                'highlighted-region-line':
                  selector !== null &&
                  index >= selector.range.first &&
                  index <= selector.range.last,
              }"
              @mousedown="start_mouse_selection(index)"
              @mouseenter="update_mouse_selection(index)"
              @mouseup="commit_mouse_selection($event)"
              tabindex="0"
              @keydown.shift.down.prevent="
                start_or_expand_keyboard_selection('down', index)
              "
              @keydown.shift.up.prevent="
                start_or_expand_keyboard_selection('up', index)
              "
              @keydown.enter.prevent="commit_keyboard_selection(index)"
              @keydown.esc.prevent="cancel_commenting()"
              @keydown.tab.exact="cancel_commenting()"
              @keydown.shift.tab="cancel_commenting()"
              :aria-keyshortcuts="line_shortcuts"
              ref="code_lines"
              data-testid="code_line"
            >
              <td
                class="line-number"
                :class="{ 'line-number-code': is_code_file }"
              >
                {{ line_num }}
              </td>
              <td
                class="line-of-file-content"
                :class="{ 'line-of-file-content-code': is_code_file }"
                :style="{
                  'user-select': can_edit_handgrading ? 'none' : 'auto',
                }"
              >
                <span
                  v-if="is_code_file"
                  class="line-content-text"
                  v-html="split_code_content[index]"
                ></span>
                <span v-else class="line-content-text">{{
                  split_content[index] === "" ? "\n" : split_content[index]
                }}</span>
                <span
                  v-if="can_edit_handgrading"
                  class="line-hint"
                  aria-hidden="true"
                >
                  <template v-if="selector !== null">
                    <kbd>Esc</kbd> cancel
                    <span class="line-hint-sep">·</span>
                  </template>
                  <kbd>Enter</kbd> add feedback
                  <span class="line-hint-sep">·</span>
                  <kbd>Shift</kbd>+<kbd>↑↓</kbd> select lines
                </span>
              </td>
            </tr>
            <tr
              v-for="comment of handgrading_comments.get(index, [])"
              :key="comment.vue_key"
            >
              <td></td>
              <td>
                <div
                  class="comment"
                  :tabindex="comment_is_deletable(comment) ? undefined : 0"
                  @mouseenter="state.d_hovered_comment = comment"
                  @mouseleave="state.d_hovered_comment = null"
                  @focusin="state.d_hovered_comment = comment"
                  @focusout="state.d_hovered_comment = null"
                >
                  <div class="comment-header">
                    <div class="comment-line-range">
                      {{
                        comment.location.first_line !==
                        comment.location.last_line
                          ? `Lines ${comment.location.first_line + 1} ` +
                            `- ${comment.location.last_line + 1}`
                          : `Line ${comment.location.first_line + 1}`
                      }}
                    </div>
                    <button
                      class="delete unstyled-button"
                      v-if="comment_is_deletable(comment)"
                      @click="delete_handgrading_comment(comment)"
                      aria-label="Delete comment/annotation"
                    >
                      <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div class="comment-message">
                    {{ comment.short_description }}
                    <template v-if="comment.deduction !== 0"
                      >({{ comment.deduction
                      }}<template v-if="comment.max_deduction !== null"
                        >/{{ comment.max_deduction }} max</template
                      >)
                    </template>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </table>
        <div class="sr-only" role="status" aria-live="polite">
          {{ state.d_selection_announcement }}
        </div>
      </div>

      <div
        class="show-more-button-container"
        v-if="state.d_num_lines_rendered < split_content.length"
      >
        <button
          type="button"
          class="blue-button"
          @click="render_more_lines"
          ref="show_more_button"
        >
          Show more
        </button>
      </div>
    </template>

    <context-menu
      ref="handgrading_context_menu"
      v-if="handgrading_enabled"
      :is_open="state.d_context_menu_is_open"
      :coordinates="state.d_context_menu_coordinates"
      @close="cancel_commenting()"
    >
      <context-menu-item
        v-for="annotation of d_handgrading_result.handgrading_rubric
          .annotations"
        :key="annotation.pk"
        @click="apply_annotation(annotation)"
      >
        {{ annotation.short_description }} ({{ annotation.deduction }})
      </context-menu-item>
      <div class="context-menu-divider"></div>
      <context-menu-item
        @click="open_comment_modal"
        v-if="enable_custom_comments"
      >
        Leave a comment
      </context-menu-item>
    </context-menu>

    <modal
      v-if="state.d_show_comment_modal"
      @close="state.d_show_comment_modal = false"
      ref="show_comment_modal"
      click_outside_to_close
      size="medium"
    >
      <div class="modal">
        <div class="modal-header">Comment</div>
        <textarea
          class="input"
          v-model="state.d_comment_text"
          rows="4"
          ref="comment_text"
        ></textarea>
        <div class="modal-button-footer">
          <button
            class="green-button"
            :disabled="state.d_saving"
            @click="create_comment"
          >
            Comment
          </button>

          <button
            class="white-button"
            :disabled="state.d_saving"
            @click="state.d_show_comment_modal = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import {
  Annotation,
  AppliedAnnotation,
  Comment,
  HandgradingResult,
} from "ag-client-typescript";

import ContextMenu from "@/components/context_menu/context_menu.vue";
import ContextMenuItem from "@/components/context_menu/context_menu_item.vue";
import Modal from "@/components/modal.vue";
import ProgressBar from "@/components/progress_bar.vue";
import { new_handle_global_errors_async } from "@/error_handling";
import { SafeMap } from "@/safe_map";
import { assert_not_null, chain, toggle } from "@/utils";

import {
  handgrading_comment_factory,
  HandgradingComment,
} from "../project_view/handgrading/handgrading_comment";

import { CODE_THEME_STORE } from "./code_theme_store";
import { nextTick } from "process";
import { LineSelector, useLineSelector } from "./line_selector";
import { computed, onMounted, reactive, readonly, ref, watch } from "vue";
import hljs from "highlight.js";

type PropTypes = {
  file_contents: Promise<string>;
  filename?: string;
  progress?: number | null;
  display_size_threshold?: number;
  view_file_height?: string;
  view_file_max_height?: string;
  handgrading_result?: HandgradingResult;
  enable_custom_comments?: boolean;
  readonly_handgrading_results?: boolean;
  is_code_file?: boolean;
};
const props = withDefaults(defineProps<PropTypes>(), {
  filename: "",
  progress: null,
  display_size_threshold: Math.pow(10, 6),
  view_file_height: "",
  view_file_max_height: "",
  enable_custom_comments: false,
  readonly_handgrading_results: true,
  is_code_file: false,
});

const num_lines_per_page = 1000;

let selector = ref<LineSelector | null>(null);

// Apparently we need to alias props.handgrading_result for deep reactivity on
// its members.
// We can possibly simplify this once we're fully migrated to Vue 3.
const d_handgrading_result = ref<HandgradingResult | null>(null);

const state = reactive({
  d_file_contents: "",
  d_loading: false,
  d_saving: false,
  d_show_anyway: false,

  d_num_lines_rendered: num_lines_per_page,

  // Tracking file copying
  d_is_file_hovered: false,
  d_is_file_copying: false,

  d_hovered_comment: null as HandgradingComment | null,

  d_context_menu_is_open: false,
  d_context_menu_coordinates: { x: 0, y: 0 },
  d_show_comment_modal: false,
  d_comment_text: "",

  d_selection_announcement: "",
});

watch(
  () => props.handgrading_result,
  (handgrading_result) => {
    if (handgrading_result !== undefined) {
      d_handgrading_result.value = handgrading_result;
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => props.file_contents,
  new_handle_global_errors_async((new_content: Promise<string>) => {
    return toggle(state, "d_loading", async () => {
      state.d_show_anyway = false;
      state.d_file_contents = await new_content;
    });
  }),
  { immediate: true },
);

const is_code_theme_dark = computed(() => {
  return CODE_THEME_STORE.current_code_theme === "dark";
});

const file_is_large = computed(() => {
  return state.d_file_contents.length > props.display_size_threshold;
});

// IMPORTANT: We want this to be a computed property. Indexing into
// a large reactive array in the template will significantly increase
// render times.
const split_content = computed(() => {
  return state.d_file_contents.split("\n");
});

// Makes each line of code have independent styling by padding newlines in
// the midle of spans.
function separate_span_tags_with_newlines(code_html_str: string): string {
  // Adapted from: https://stackoverflow.com/questions/64280814
  //  /how-can-i-correctly-highlight-a-line-by-line-code-using-highlight-js-react
  const open_spans: string[] = [];

  const padded_code = code_html_str.replace(
    /(<span [^>]+>)|(<\/span>)|(\n)/g,
    (match) => {
      if (match === "\n") {
        return "</span>".repeat(open_spans.length) + "\n" + open_spans.join("");
      }

      if (match === "</span>") {
        open_spans.pop();
      } else {
        open_spans.push(match);
      }

      return match;
    },
  );

  return padded_code;
}

// Returns HTML for highlighted contents of code file, split by newlines.
const split_code_content = computed(() => {
  const highlighted_code = hljs.highlightAuto(state.d_file_contents).value;
  const padded_highlighted_code =
    separate_span_tags_with_newlines(highlighted_code);
  return padded_highlighted_code.split("\n");
});

const copy_file_to_clipboard = new_handle_global_errors_async(async () => {
  await navigator.clipboard.writeText(state.d_file_contents);
  state.d_is_file_copying = true;

  // Wait to set icon back
  setTimeout(() => {
    state.d_is_file_copying = false;
  }, 3000);
});

const num_lines_to_show = computed(() => {
  return Math.min(state.d_num_lines_rendered, split_content.value.length);
});

function render_more_lines() {
  state.d_num_lines_rendered = Math.min(
    split_content.value.length,
    state.d_num_lines_rendered + num_lines_per_page,
  );
}

const handgrading_enabled = computed(() => {
  return props.handgrading_result !== undefined;
});

const can_edit_handgrading = computed(() => {
  return handgrading_enabled.value && !props.readonly_handgrading_results;
});

const handgrading_comments = computed<SafeMap<number, HandgradingComment[]>>(
  () => {
    if (d_handgrading_result.value === null) {
      return new SafeMap();
    }

    let result = new SafeMap<number, HandgradingComment[]>();

    let annotations = d_handgrading_result.value.applied_annotations.filter(
      (item) => item.location.filename === props.filename,
    );

    let comments = d_handgrading_result.value.comments.filter(
      (item) =>
        item.location !== null && item.location.filename === props.filename,
    );

    for (let item of chain<AppliedAnnotation | Comment>(
      annotations,
      comments,
    )) {
      let handgrading_comment = handgrading_comment_factory(item);
      result
        .get(handgrading_comment.location.last_line, [], true)
        .push(handgrading_comment);
    }

    // Sort lists of comments ending on the same line by first line
    for (let [last_line, comment_list] of result) {
      comment_list.sort(
        (first, second) =>
          first.location.first_line - second.location.first_line,
      );
    }

    return result;
  },
);

function comment_is_deletable(comment: HandgradingComment): boolean {
  return (
    can_edit_handgrading.value &&
    (props.enable_custom_comments || !comment.is_custom)
  );
}

const delete_handgrading_comment = new_handle_global_errors_async(
  async (handgrading_comment: HandgradingComment) => {
    if (!state.d_saving) {
      await toggle(state, "d_saving", async () => {
        await handgrading_comment.delete();
        state.d_hovered_comment = null;
      });
    }
  },
);

// Returns true if line_num is contained in any provided handgrading comments.
function line_in_comment(line_num: number) {
  for (let [last_line, comment_list] of handgrading_comments.value) {
    let first_line = comment_list[0].location.first_line;
    if (line_num >= first_line && line_num <= last_line) {
      return true;
    }
  }
  return false;
}

function start_mouse_selection(clicked_line_index: number) {
  if (
    // IMPORTANT: CHANGE THESE CHECKS TOGETHER
    // Note: Don't refactor this and similar checks unless
    // you have a very good reason.
    !can_edit_handgrading.value ||
    // Don't interrupt existing mouse selection
    selector.value?.controls === "mouse" ||
    state.d_context_menu_is_open ||
    state.d_saving
  ) {
    return;
  }

  selector.value = useLineSelector(clicked_line_index, "mouse");
}

function update_mouse_selection(hovered_line_index: number) {
  if (
    // IMPORTANT: CHANGE THESE CHECKS TOGETHER
    // Note: Don't refactor this and similar checks unless
    // you have a very good reason.
    !can_edit_handgrading.value ||
    // Don't interrupt keyboard selection
    selector.value?.controls === "keyboard" ||
    state.d_context_menu_is_open ||
    state.d_saving
  ) {
    return;
  }

  selector.value?.update_selection(hovered_line_index);
}

function commit_mouse_selection(mouseup_event: MouseEvent) {
  if (
    // IMPORTANT: CHANGE THESE CHECKS TOGETHER
    // Note: Don't refactor this and similar checks unless
    // you have a very good reason.
    !can_edit_handgrading.value ||
    // It's possible to cancel a mouse selection with esc before
    // committing it.
    // If that happens, this method should do nothing.
    selector.value === null ||
    // Don't interrupt keyboard selection
    selector.value.controls === "keyboard" ||
    state.d_context_menu_is_open ||
    state.d_saving
  ) {
    return;
  }

  open_annotation_context_menu({
    x: mouseup_event.clientX,
    y: mouseup_event.clientY,
  });
}

// There is overlap between how cancellation is triggered for keyboard and mouse.
// See cancel_commenting for a method that handles all possibilities.

function start_or_expand_keyboard_selection(
  direction: "up" | "down",
  from_line_index: number,
) {
  if (
    // IMPORTANT: CHANGE THESE CHECKS TOGETHER
    // Note: Don't refactor this and similar checks unless
    // you have a very good reason.
    !can_edit_handgrading.value ||
    // Don't interrupt mouse selection
    selector.value?.controls === "mouse" ||
    state.d_context_menu_is_open ||
    state.d_saving
  ) {
    return;
  }

  if (selector.value === null) {
    selector.value = useLineSelector(from_line_index, "keyboard");
  }

  let new_line: number;
  switch (direction) {
    case "down":
      if (selector.value.range.first < selector.value.anchor_index) {
        new_line = selector.value.range.first + 1;
      } else {
        new_line = selector.value.range.last + 1;
      }
      break;
    case "up":
      if (selector.value.range.last > selector.value.anchor_index) {
        new_line = selector.value.range.last - 1;
      } else {
        new_line = selector.value.range.first - 1;
      }
      break;
  }

  if (new_line < 0 || new_line >= num_lines_to_show.value) {
    return;
  }
  selector.value.update_selection(new_line);

  state.d_selection_announcement =
    `Selecting lines ${selector.value.range.first + 1} ` +
    `to ${selector.value.range.last + 1}`;

  // Note: we can keep focus on the original anchor because that
  // will make it visually apparent to the user what the anchor is
  // and simplify the cancel and post-commit behaviors.
}

function commit_keyboard_selection(line_index: number) {
  if (
    // IMPORTANT: CHANGE THESE CHECKS TOGETHER
    // Note: Don't refactor this and similar checks unless
    // you have a very good reason.
    !can_edit_handgrading.value ||
    // Don't interrupt mouse selection
    selector.value?.controls === "mouse" ||
    state.d_context_menu_is_open ||
    state.d_saving
  ) {
    return;
  }

  // If there isn't a current selection, start one on the current line,
  // then immediately commit it.
  if (selector.value === null) {
    selector.value = useLineSelector(line_index, "keyboard");
  }

  const last_line_elt = get_line_element_at(selector.value.range.last);
  const bounding_rect = last_line_elt.getBoundingClientRect();

  open_annotation_context_menu({
    x: bounding_rect.x,
    y: bounding_rect.y,
  });
}

function open_annotation_context_menu(menu_coordinates: {
  x: number;
  y: number;
}) {
  state.d_context_menu_coordinates = menu_coordinates;
  state.d_context_menu_is_open = true;
}

const line_shortcuts = computed(() => {
  if (!can_edit_handgrading.value) {
    return undefined;
  }
  return "Enter Shift+ArrowUp Shift+ArrowDown Escape";
});

const apply_annotation = new_handle_global_errors_async(
  async (annotation: Annotation) => {
    assert_not_null(props.filename);
    return toggle(state, "d_saving", async () => {
      assert_not_null(selector.value);
      await AppliedAnnotation.create(d_handgrading_result.value!.pk, {
        annotation: annotation.pk,
        location: {
          first_line: selector.value.range.first,
          last_line: selector.value.range.last,
          filename: props.filename,
        },
      });
      finish_commenting();
    });
  },
);

const comment_text = ref<HTMLElement>();

function open_comment_modal() {
  state.d_context_menu_is_open = false;
  state.d_show_comment_modal = true;
  nextTick(() => comment_text.value?.focus());
}

const create_comment = new_handle_global_errors_async(() => {
  return toggle(state, "d_saving", async () => {
    assert_not_null(selector.value);
    assert_not_null(props.filename);
    await Comment.create(d_handgrading_result.value!.pk, {
      text: state.d_comment_text,
      location: {
        first_line: selector.value.range.first,
        last_line: selector.value.range.last,
        filename: props.filename,
      },
    });
    finish_commenting();
    state.d_show_comment_modal = false;
    state.d_comment_text = "";
  });
});

function finish_commenting() {
  // IMPORTANT: If you change anything about this method,
  // double check whether cancel_commenting needs the same changes.
  // cancel_commenting is currently an alias for this method.
  state.d_context_menu_is_open = false;
  state.d_selection_announcement = "";

  assert_not_null(selector.value);
  const last_index = selector.value.range.last;

  nextTick(() => {
    focus_line(last_index);
    selector.value = null;
  });
}

function cancel_commenting() {
  if (selector.value === null) {
    return;
  }

  const anchor_index = selector.value.anchor_index;

  if (state.d_context_menu_is_open) {
    state.d_context_menu_is_open = false;
    nextTick(() => {
      focus_line(anchor_index);
    });
  } else {
    focus_line(anchor_index);
  }

  if (selector.value?.controls === "keyboard") {
    state.d_selection_announcement = "Selection cancelled";
  }

  selector.value = null;
}

function focus_line(line_index: number) {
  get_line_element_at(line_index)?.focus();
}

const code_lines = ref<HTMLElement[]>([]);

function get_line_element_at(line_index: number) {
  return code_lines.value[line_index];
}

defineExpose({
  state,
  d_handgrading_result,
  d_selector: selector.value,
  is_loading: () => state.d_loading,
  get_props: () => props,
});
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";
@import "@/styles/forms.scss";
@import "@/styles/loading.scss";
@import "@/styles/modal.scss";

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
  padding: 0.25rem 0;
  width: 100%;
  position: relative;
}

.large-file-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.875rem;

  white-space: normal;

  .text {
    font-size: 1.25rem;
  }

  .button {
    margin-top: 0.5rem;
  }
}

.saving:hover {
  cursor: wait;
}

.line-number {
  color: $normal-text-color-3;
  font-size: 0.875rem;
  padding: 0.125rem 0.625rem;
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
  font-size: 0.875rem;
  margin: 0;
  padding: 0.125rem;
  white-space: pre-wrap;
  word-break: break-word;
  word-wrap: break-word;
}

.line-of-file-content.line-of-file-content-code {
  color: inherit;
}

.show-more-button-container {
  display: flex;
  padding: 0.375rem;

  white-space: normal;
}

// Do NOT use loading-centered here
.loading-container {
  overflow: hidden;
}

$light-green: hsl(97, 42%, 79%);

.comment {
  border: 1px solid $gray-blue-2;
  margin: 0.25rem 0;
  margin-right: 1%;
  border-radius: 2px;
  max-width: 600px;

  font-family: "Helvetica Neue", Helvetica;
  font-size: 0.875rem;

  .comment-header {
    display: flex;

    border-bottom: 1px solid $pebble-dark;
    padding: 0.25rem 0.25rem 0.125rem;
    background-color: $pebble-light;

    .comment-line-range {
      font-style: italic;
    }

    .delete {
      margin-left: auto;
      padding: 0.125rem;
      margin-top: -0.125rem;
    }
  }

  .comment-message {
    padding: 0.875rem;
  }

  &:hover {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);

    .comment-header {
      background-color: lighten($light-green, 4%);
    }
  }
}

// Line-highlight backgrounds are contrast-tuned: syntax tokens render on top of
// these rows, so each must keep >= 4.5:1 (WCAG AA) against every token color.
// See hljs_a11y_theme.scss for token colors.
$commented-line-bg: hsl(212, 80%, 91%);
$hovered-comment-line-bg: hsl(97, 55%, 84%);
$highlighted-region-bg: hsl(5, 85%, 92.5%);
$commented-line-bg-dark: hsl(212, 50%, 28.5%);
$hovered-comment-line-bg-dark: hsl(97, 45%, 20.5%);
$highlighted-region-bg-dark: hsl(5, 60%, 30.5%);

.commented-line {
  background-color: $commented-line-bg;
}

.hovered-comment-line {
  background-color: $hovered-comment-line-bg;
}

.highlighted-region-line {
  background-color: $highlighted-region-bg;
}

.line-of-file-content {
  position: relative;
}

.line-hint {
  z-index: 1;
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  // Note: I tried positioning it above the line (-100%),
  // but I couldn't figure out how to prevent it from being covered
  // by the file panel header when on the first line.
  transform: translateY(100%);

  font-family: "Helvetica Neue", Helvetica;
  font-size: 0.75rem;
  color: $normal-text-color-2;

  padding: 0.0625rem 0.375rem;
  border: 1px solid $pebble-dark;
  border-radius: 3px;
  background-color: $white-gray;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;

  kbd {
    font-family: "Helvetica Neue", Helvetica;
    font-size: 0.6875rem;
    padding: 0 0.1875rem;
    border: 1px solid $pebble-dark;
    border-radius: 2px;
    background-color: white;
  }

  .line-hint-sep {
    margin: 0 0.125rem;
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
  .commented-line {
    background-color: $commented-line-bg-dark;
  }

  .hovered-comment-line {
    background-color: $hovered-comment-line-bg-dark;
  }

  .highlighted-region-line {
    background-color: $highlighted-region-bg-dark;
  }

  // The comment box inherits the dark theme's light text color, so its header
  // needs a dark background to stay readable (the message body sits on the
  // dark code background already).
  .comment-header {
    background-color: hsl(210, 12%, 24%);
  }

  .comment:hover .comment-header {
    background-color: hsl(97, 25%, 24%);
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
