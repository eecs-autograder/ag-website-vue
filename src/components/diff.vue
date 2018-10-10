<template>
  <div>
    <div class="diff-headers">
      <div class="header"> {{left_header}} </div>
      <div class="header"> {{right_header}} </div>
    </div>

    <div id="diff-body-wrapper" :style="{'height': diff_height}">
      <table id="diff-body" cellpadding="0" cellspacing="0">
        <tbody>
          <tr v-for="(left_cell, i) of left">
            <td :class="['line-num', line_num_highlighting[left_cell.prefix]]">
              {{left_cell.line_number}}
            </td>
            <td :class="[content_highlighting[left_cell.prefix], 'code-cell']">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                   Do NOT add whitespace to these <span> elements.-->
              <span class="prefix">{{left_cell.prefix !== null ? left_cell.prefix[0] : ' '}}</span>
              <span class="content">{{
                show_whitespace_ ? replace_whitespace(left_cell.content)
                                   : left_cell.content}}</span>
            </td>

            <td :class="['line-num', line_num_highlighting[right[i].prefix], 'code-cell']">
              {{right[i].line_number}}
            </td>
            <td :class="[content_highlighting[right[i].prefix]]">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                   Do NOT add whitespace to these <span> elements.-->
              <span class="prefix">{{right[i].prefix !== null ? right[i].prefix[0] : ' '}}</span>
              <span class="content">{{
                show_whitespace_ ? replace_whitespace(right[i].content) : right[i].content}}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="toggle-container">
      <toggle v-model="show_whitespace_" :active_background_color="toggle_color">
        <template slot="on">
          <p>Show Whitespace</p>
        </template>
        <template slot="off">
          <p>Hide Whitespace</p>
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
  diff_height!: string;

  @Prop({default: false, type: Boolean})
  show_whitespace!: boolean;

  left: DiffCell[] = [];
  right: DiffCell[] = [];

  toggle_color = "slategray";

  show_whitespace_: boolean = false;

  created() {
    this.show_whitespace_ = this.show_whitespace;

    let left_line_number = 1;
    let right_line_number = 1;
    for (let item of this.diff_contents) {
      let prefix = item.substring(0, 2);
      item = item.substring(2);
      if (prefix === "- ") {
        this.left.push({line_number: left_line_number, prefix: prefix, content: item});
        left_line_number += 1;
      }
      else if (prefix === "+ ") {
        this.right.push({line_number: right_line_number, prefix: prefix, content: item});
        right_line_number += 1;
      }
      else if (prefix === "  ") {
        this.pad_if_needed(this.left, this.right);

        this.left.push({line_number: left_line_number, prefix: prefix, content: item});
        this.right.push({line_number: right_line_number, prefix: prefix, content: item});

        left_line_number += 1;
        right_line_number += 1;
      }
      else {
        throw new DiffPrefixError(
          `Invalid prefix: "${prefix}". Prefixes must be one of: "- ", "+ ", "  "`);
      }
    }
    this.pad_if_needed(this.left, this.right);
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

.diff-headers {
  width: 100%;
}

.header {
  display: inline-block;
  width: 50%;

  font-size: 20px;
  font-weight: 500;
  margin: 0;
  padding: 18px 0;

  text-align: center;
}

#diff-body-wrapper {
  overflow-y: scroll;
}

#diff-body {
  width: 100%;
}

.code-cell {
  width: 49%;
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
  padding: 22px 10px 20px 10px;
  text-align: center;
}

</style>
