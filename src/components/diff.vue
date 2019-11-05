<template>
  <div :class="{'fullscreen': d_fullscreen}">
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

    <div class="diff-body-wrapper" :style="{'max-height': diff_max_height}">
      <table class="diff-body" cellpadding="0" cellspacing="0">
        <tbody>
          <tr v-for="(left_cell, i) of d_left">
            <td :class="['line-num', line_num_highlighting[left_cell.prefix]]">
              {{left_cell.line_number}}
            </td>
            <td :class="[content_highlighting[left_cell.prefix], 'code-cell']">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                   Do NOT add whitespace to these <span> elements.-->
              <span class="prefix">{{left_cell.prefix !== null ? left_cell.prefix[0] : ' '}}</span>
              <span class="content">{{
                d_show_whitespace
                    ? replace_whitespace(left_cell.content) : left_cell.content}}</span>
            </td>

            <td :class="['line-num', line_num_highlighting[d_right[i].prefix]]">
              {{d_right[i].line_number}}
            </td>
            <td :class="[content_highlighting[d_right[i].prefix], 'code-cell']">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                   Do NOT add whitespace to these <span> elements.-->
              <span class="prefix">{{
                d_right[i].prefix !== null ? d_right[i].prefix[0] : ' '}}</span>
              <span class="content">{{
                d_show_whitespace ? replace_whitespace(d_right[i].content)
                                  : d_right[i].content}}</span>
            </td>
          </tr>
        </tbody>
      </table>
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
import { Component, Prop, Vue } from 'vue-property-decorator';

import Toggle from './toggle.vue';


interface DiffCell {
  line_number: number | null;
  prefix: string | null;
  content: string | null;
}

export class DiffPrefixError extends Error {}

@Component({
  components: { Toggle }
})
export default class Diff extends Vue {

  @Prop({default: [], type: Array})
  diff_contents!: string[];

  @Prop({default: "", type: String})
  left_header!: string;

  @Prop({default: "", type: String})
  right_header!: string;

  @Prop({default: '100%', type: String})
  diff_max_height!: string;

  d_left: DiffCell[] = [];
  d_right: DiffCell[] = [];

  d_show_whitespace: boolean = false;

  d_fullscreen = false;

  created() {
    let left_line_number = 1;
    let right_line_number = 1;
    for (let item of this.diff_contents) {
      let prefix = item.substring(0, 2);
      item = item.substring(2);
      if (prefix === "- ") {
        this.d_left.push({line_number: left_line_number, prefix: prefix, content: item});
        left_line_number += 1;
      }
      else if (prefix === "+ ") {
        this.d_right.push({line_number: right_line_number, prefix: prefix, content: item});
        right_line_number += 1;
      }
      else if (prefix === "  ") {
        this.pad_if_needed(this.d_left, this.d_right);

        this.d_left.push({line_number: left_line_number, prefix: prefix, content: item});
        this.d_right.push({line_number: right_line_number, prefix: prefix, content: item});

        left_line_number += 1;
        right_line_number += 1;
      }
      else {
        throw new DiffPrefixError(
          `Invalid prefix: "${prefix}". Prefixes must be one of: "- ", "+ ", "  "`);
      }
    }
    this.pad_if_needed(this.d_left, this.d_right);
  }

  pad_if_needed(left: DiffCell[], right: DiffCell[]) {
    if (left.length === right.length) {
      return;
    }
    let to_pad: DiffCell[];
    let bigger: DiffCell[];
    if (left.length > right.length) {
      bigger = left;
      to_pad = right;
    }
    else {
      bigger = right;
      to_pad = left;
    }
    while (to_pad.length < bigger.length) {
      to_pad.push({line_number: null, prefix: null, content: null});
    }
  }

  replace_whitespace(current: string | null): string | null {
    if (current === null) {
      return null;
    }
    current = current.split(' ').join('\u2219');
    current = current.split('\n').join('\u21b5\n');
    current = current.split('\r').join('\\r\r');
    return current;
  }

  line_num_highlighting = {
    '- ': 'negative-line-num',
    '+ ': 'positive-line-num',
    '  ': ''
  };

  content_highlighting = {
    '- ': 'negative',
    '+ ': 'positive',
    '  ': ''
  };

}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
}

.fullscreen {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

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
  padding: 10px 0;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 50%;

  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

.diff-body-wrapper {
  overflow-y: auto;
}

.diff-body {
  width: 100%;
}

.code-cell {
  display: flex;
}

.line-num, .prefix, .content {
  margin: 0;
  padding: 5px 6px;
  font-family: "Lucida Console", Consolas, "Courier New", Courier, monospace;
}

.line-num {
  width: 1%;
  min-width: 10px;
  text-align: center;

  user-select: none;
  color: lightslategray;
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

.toggle-container {
  background-color: $pebble-light;
  display: block;
  padding: 10px;
  text-align: center;
}

</style>
