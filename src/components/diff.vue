<template>
  <div v-if="d_loading" class="loading-container">
    <progress-bar v-if="progress !== null" :progress="progress"></progress-bar>
    <i v-else class="loading-horiz-centered loading-large fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else :class="{'fullscreen': d_fullscreen}">
    <div class="diff-headers">
      <div class="header">{{left_header}}</div>
      <div class="header right-header">
        {{right_header}}
        <div class="fullscreen-icon" @click="d_fullscreen = !d_fullscreen">
          <i v-if="!d_fullscreen" class="fas fa-expand"></i>
          <i v-else class="fas fa-compress"></i>
        </div>
      </div>
    </div>

    <div class="diff-body-wrapper" :style="{'max-height': d_fullscreen ? 'none' : diff_max_height}">
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
              <span class="content no-whitespace" v-show="!d_show_whitespace">{{
                left[i].content}}</span>
              <span class="content with-whitespace" v-show="d_show_whitespace">{{
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
              <span class="content no-whitespace" v-show="!d_show_whitespace">{{
                right[i].content}}</span>
              <span class="content with-whitespace" v-show="d_show_whitespace">{{
                right_with_whitespace[i].content}}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="show-more-button-container" v-if="d_num_lines_rendered < left.length">
        <button type="button"
                class="blue-button"
                ref="show_more_button"
                @click="render_more_lines">
          Show more
        </button>
      </div>
    </div>

    <div class="toggle-container">
      <toggle v-model="d_show_whitespace" active_background_color="slategray">
        <template slot="on">
          Show Whitespace
        </template>
        <template slot="off">
          Hide Whitespace
        </template>
      </toggle>
    </div>
  </div>
</template>

<script lang="ts">
import { CreateElement } from 'vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

import ProgressBar from './progress_bar.vue';
import Toggle from './toggle.vue';


interface DiffCellData {
  line_number: number | null;
  prefix: string;
  content: string;
}

export class DiffPrefixError extends Error {}

@Component({
  components: {
    ProgressBar,
    Toggle,
  }
})
export default class Diff extends Vue {

  @Prop({default: Promise.resolve([]), type: Promise})
  diff_contents!: Promise<string[]>;

  @Prop({default: "", type: String})
  left_header!: string;

  @Prop({default: "", type: String})
  right_header!: string;

  @Prop({default: '100%', type: String})
  diff_max_height!: string;

  // A number from 0 to 100 that will be displayed as
  // the progress in loading diff_contents.
  @Prop({default: null, type: Number})
  progress!: number | null;

  // IMPORTANT: We are intentionally making these member variables NON-REACTIVE
  // by not initializing them here. This is very important for performance.
  // Indexing into large reactive arrays in the template will significantly
  // increase render times.
  private left!: DiffCellData[];
  private right!: DiffCellData[];

  private get left_with_whitespace() {
    return this.left.map(cell_data => {
      return {
        line_number: cell_data.line_number,
        prefix: cell_data.prefix,
        content: this.replace_whitespace(cell_data.content)
      };
    });
  }

  private get right_with_whitespace() {
    return this.right.map(cell_data => {
      return {
        line_number: cell_data.line_number,
        prefix: cell_data.prefix,
        content: this.replace_whitespace(cell_data.content)
      };
    });
  }

  d_show_whitespace = false;
  d_fullscreen = false;

  d_loading = true;

  readonly num_lines_per_page = 1000;
  d_num_lines_rendered = this.num_lines_per_page;

  async created() {
    let left_line_number = 1;
    let right_line_number = 1;

    this.left = [];
    this.right = [];

    for (let item of await this.diff_contents) {
      let prefix = item.substring(0, 2);
      let content = item.substring(2);
      if (prefix === "- ") {
        this.left.push({line_number: left_line_number, prefix: prefix, content: content});
        left_line_number += 1;
      }
      else if (prefix === "  ") {
        this.pad_if_needed(this.left, this.right);

        this.left.push({line_number: left_line_number, prefix: prefix, content: content});
        this.right.push({line_number: right_line_number, prefix: prefix, content: content});

        left_line_number += 1;
        right_line_number += 1;
      }
      else if (prefix === "+ ") {
        this.right.push({line_number: right_line_number, prefix: prefix, content: content});
        right_line_number += 1;
      }
      else {  // Treat invalid prefixes as "+ "
        this.right.push({line_number: right_line_number, prefix: "+ ", content: item});
        right_line_number += 1;
      }
    }
    this.pad_if_needed(this.left, this.right);

    this.d_loading = false;
 }

  pad_if_needed(left: DiffCellData[], right: DiffCellData[]) {
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

  readonly line_num_highlighting = {
    '- ': 'negative-line-num',
    '+ ': 'positive-line-num',
    '  ': ''
  };

  readonly content_highlighting = {
    '- ': 'negative',
    '+ ': 'positive',
    '  ': ''
  };

  replace_whitespace(str: string): string {
    return str.replace(/[ \t\n\r]/g, (matched) => {
      return this.special_char_replacements[matched];
    });
  }

  readonly special_char_replacements: {[key: string]: string} = {
    ' ': '\u2219',
    '\t': '\u21e5\t',
    '\n': '\u21b5\n',
    '\r': '\\r\r',
  };

  private get num_lines_to_show() {
    return Math.min(this.d_num_lines_rendered, this.left.length);
  }

  private render_more_lines() {
    this.d_num_lines_rendered = Math.min(
      this.left.length,
      this.d_num_lines_rendered + this.num_lines_per_page
    );
  }

  private get line_num_width() {
    return `${this.num_lines_to_show.toString().length + 1}ch`;
  }
}
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
