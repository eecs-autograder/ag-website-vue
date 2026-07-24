<template>
  <div v-if="state.loading" class="loading-container">
    <progress-bar v-if="progress !== null" :progress="progress"></progress-bar>
    <i v-else
      class="loading-horiz-centered loading-large fa fa-spinner fa-pulse"
      role="img" aria-label="Loading"
    ></i>
  </div>
  <div v-else :class="{'fullscreen': state.fullscreen}">
    <div class="diff-headers">
      <div class="header">{{left_header}}</div>
      <div class="header right-header">
        {{right_header}}
        <div class="fullscreen-icon" @click="state.fullscreen = !state.fullscreen">
          <i v-if="!state.fullscreen" class="fas fa-expand"></i>
          <i v-else class="fas fa-compress"></i>
        </div>
      </div>
    </div>

    <div class="diff-body-wrapper" :style="{'max-height': state.fullscreen ? 'none' : diff_max_height}">
      <table class="diff-body" cellpadding="0" cellspacing="0">
        <tbody>
          <tr v-for="(n, i) in num_lines_to_show">
            <td :class="['line-num', line_num_highlighting[left[i].prefix]]"
                :style="{width: line_num_width}">
              {{left[i].line_number}}
            </td>
            <td :class="[content_highlighting[left[i].prefix], 'code-cell']">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                   Do NOT add whitespace to these elements.-->
              <span class="prefix">{{left[i].prefix}}</span>
              <span class="content no-whitespace" v-show="!state.show_whitespace">{{
                left[i].content}}</span>
              <span class="content with-whitespace" v-show="state.show_whitespace">{{
                left_with_whitespace[i].content}}</span>
            </td>

            <td :class="['line-num', line_num_highlighting[right[i].prefix]]"
                :style="{width: line_num_width}">
              {{right[i].line_number}}
            </td>
            <td :class="[content_highlighting[right[i].prefix], 'code-cell']">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                    Do NOT add whitespace to these <span> elements.-->
              <span class="prefix">{{right[i].prefix}}</span>
              <span class="content no-whitespace" v-show="!state.show_whitespace">{{
                right[i].content}}</span>
              <span class="content with-whitespace" v-show="state.show_whitespace">{{
                right_with_whitespace[i].content}}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="show-more-button-container" v-if="state.num_lines_rendered < left.length">
        <button type="button"
                class="blue-button"
                data-testid="show_more_button"
                @click="render_more_lines">
          Show more
        </button>
      </div>
    </div>

    <div class="toggle-container">
      <div class="checkbox-input-container">
        <label class="checkbox-label">
          <input
            data-testid="show_whitespace"
            type="checkbox"
            class="checkbox"
            v-model="state.show_whitespace"
          />
          Show whitespace
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import ProgressBar from './progress_bar.vue'
import Toggle from './toggle.vue'

interface DiffCellData {
  line_number: number | null;
  prefix: string;
  content: string;
}

// Props
type PropTypes = {
  diff_contents?: Promise<string[]>
  left_header?: string
  right_header?: string
  diff_max_height?: string
  progress?: number | null
}

const props = withDefaults(defineProps<PropTypes>(), {
  diff_contents: () => Promise.resolve([]),
  left_header: "",
  right_header: "",
  diff_max_height: '100%',
  progress: null
})

// Reactive state object
const state = reactive({
  show_whitespace: false,
  fullscreen: false,
  loading: true,
  num_lines_rendered: 1000 // num_lines_per_page
})

// Non-reactive arrays for performance (as in original)
let left: DiffCellData[] = []
let right: DiffCellData[] = []

// Constants
const num_lines_per_page = 1000

const line_num_highlighting = {
  '- ': 'negative-line-num',
  '+ ': 'positive-line-num',
  '  ': ''
}

const content_highlighting = {
  '- ': 'negative',
  '+ ': 'positive',
  '  ': ''
}

const special_char_replacements: {[key: string]: string} = {
  ' ': '\u2219',
  '\t': '\u21e5\t',
  '\n': '\u21b5\n',
  '\r': '\\r\r',
  '\b': '\\b',  // backspace
  '\f': '\\f',  // form-feed
  '\v': '\\v',  // vertical tab
  '\0': '\\0',  // null character
}

// Computed properties
const left_with_whitespace = computed(() => {
  return left.map(cell_data => {
    return {
      line_number: cell_data.line_number,
      prefix: cell_data.prefix,
      content: replace_whitespace(cell_data.content)
    };
  });
})

const right_with_whitespace = computed(() => {
  return right.map(cell_data => {
    return {
      line_number: cell_data.line_number,
      prefix: cell_data.prefix,
      content: replace_whitespace(cell_data.content)
    };
  });
})

const whitespace_regex = computed(() => {
  // Some browsers might not yet support \p (unicode property escapes)
  try {
    // Match whitespace sequences and the "Other" unicode property category
    // https://unicode.org/reports/tr18/#General_Category_Property
    return new RegExp('[ \t\n\r\b\f\v\0]|\\p{C}', 'gu');
  }
  catch (e) {
    // It's unclear how/maybe impossible to mock a constructor call, so we
    // don't have a unit test for this fallback behavior currently.
    // istanbul ignore next
    return new RegExp('[ \t\n\r\b\f\v\0]', 'g');
  }
})

const num_lines_to_show = computed(() => {
  return Math.min(state.num_lines_rendered, left.length);
})

const line_num_width = computed(() => {
  return `${num_lines_to_show.value.toString().length + 1}ch`;
})

// Methods
const pad_if_needed = (left: DiffCellData[], right: DiffCellData[]) => {
  if (left.length === right.length) {
    return;
  }
  let to_pad: DiffCellData[];
  let bigger: DiffCellData[];
  if (left.length > right.length) {
    bigger = left;
    to_pad = right;
  }
  else {
    bigger = right;
    to_pad = left;
  }
  while (to_pad.length < bigger.length) {
    to_pad.push({line_number: null, prefix: ' ', content: ''});
  }
}

const replace_whitespace = (str: string): string => {
  return str.replace(whitespace_regex.value, (matched) => {
    if (matched in special_char_replacements) {
      return special_char_replacements[matched];
    }

    // Replace "Other" unicode characters with their escape sequences
    let unpadded_char_code = matched.charCodeAt(0).toString(16);
    let num_leading_zeros = Math.max(0, 4 - unpadded_char_code.length);
    return `\\u${('0'.repeat(num_leading_zeros) + unpadded_char_code)}`;
  });
}

const render_more_lines = () => {
  state.num_lines_rendered = Math.min(
    left.length,
    state.num_lines_rendered + num_lines_per_page
  );
}

// Initialize component (equivalent to created lifecycle)
const initialize = async () => {
  let left_line_number = 1;
  let right_line_number = 1;

  left = [];
  right = [];

  for (let item of await props.diff_contents) {
    let prefix = item.substring(0, 2);
    let content = item.substring(2);
    if (prefix === "- ") {
      left.push({line_number: left_line_number, prefix: prefix, content: content});
      left_line_number += 1;
    }
    else if (prefix === "  ") {
      pad_if_needed(left, right);

      left.push({line_number: left_line_number, prefix: prefix, content: content});
      right.push({line_number: right_line_number, prefix: prefix, content: content});

      left_line_number += 1;
      right_line_number += 1;
    }
    else if (prefix === "+ ") {
      right.push({line_number: right_line_number, prefix: prefix, content: content});
      right_line_number += 1;
    }
    else {  // Treat invalid prefixes as "+ "
      right.push({line_number: right_line_number, prefix: "+ ", content: item});
      right_line_number += 1;
    }
  }
  pad_if_needed(left, right);

  state.loading = false;
}

// Call initialization
initialize()

// Expose state for external access (tests, parent components)
defineExpose({
  state
})
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/loading.scss';

* {
  box-sizing: border-box;
}

.fullscreen {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  flex-direction: column;

  background-color: white;
  z-index: 10;
}

.fullscreen-icon {
  position: absolute;
  right: 8px;

  &:hover {
    color: $stormy-gray-dark;
  }
}

.right-header {
  position: relative;
}

.diff-headers {
  display: flex;
  width: 100%;
  background-color: $pebble-light;
  padding: .625rem 0;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 50%;

  font-size: 1.25rem;
  margin: 0;
}

.diff-body-wrapper {
  overflow-y: auto;
}

.diff-body {
  width: 100%;
  table-layout: fixed;
}


.line-num, .prefix, .content {
  margin: 0;
  padding: .25rem .375rem;
  font-family: "Lucida Console", Consolas, "Courier New", Courier, monospace;

  // So that toggling whitespace doesn't make everything jump.
  line-height: 1;
}

.line-num {
  // Note: we compute the width of this element dynamically.

  text-align: right;

  user-select: none;
  color: lightslategray;
}

.code-cell {
  display: flex;
}

.prefix {
  white-space: pre;
  user-select: none;
}

.content {
  white-space: pre-wrap;
  word-break: break-word;
  word-wrap: break-word;
}

$negative-color: hsl(0, 100%, 95%);
$positive-color: hsl(120, 100%, 95%);

.negative {
  background-color: $negative-color;
}

.positive {
  background-color: $positive-color;
}

.negative-line-num {
  background-color: darken($negative-color, 5%);
}

.positive-line-num {
  background-color: darken($positive-color, 5%);
}

.show-more-button-container {
  display: flex;
  justify-content: center;
  padding: .375rem;
}

.toggle-container {
  background-color: $pebble-light;
  display: block;
  padding: .625rem;
  text-align: center;
}

</style>
