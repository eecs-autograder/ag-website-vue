<template>
  <div>
    <div class="diff-headers">
      <div class="header"> {{left_header}} </div>
      <div class="header"> {{right_header}} </div>
    </div>

    <div class="diff-body-wrapper" :style="diff_height">
      <table class="diff-body" cellpadding="0" cellspacing="0">
        <tbody>
          <tr class="row" v-for="(left_cell, i) of left">
            <td :class="['column', 'line-num', line_num_highlighting[left_cell.prefix]]">
              {{left_cell.line_number}}
            </td>
            <td :class="['column', content_highlighting[left_cell.prefix]]">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                   Do NOT add whitespace to these <span> elements.-->
              <span class="prefix">{{left_cell.prefix}}</span>
              <span class="content">{{
                show_whitespace ? replace_whitespace(left_cell.content) : left_cell.content}}</span>
            </td>

            <td :class="['column', 'line-num', line_num_highlighting[right[i].prefix]]">
              {{right[i].line_number}}
            </td>
            <td :class="['column', content_highlighting[right[i].prefix]]">
              <!-- IMPORTANT: "prefix" and "content" have "white-space: pre"
                   Do NOT add whitespace to these <span> elements.-->
              <span class="prefix">{{right[i].prefix}}</span>
              <span class="content">{{
                show_whitespace ? replace_whitespace(right[i].content) : right[i].content}}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="toggle-container">
      <toggle v-model="show_whitespace" :incoming_active_background_color="toggle_color">
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
  content: string | null
}

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

  @Prop({default: () => ({ 'height': '100%' }), type: Object})
  diff_height!: object;

  left: DiffCell[] = [];
  right: DiffCell[] = [];

  show_whitespace = false;

  toggle_color = {
    "backgroundColor": "slategray"
  };

  created() {
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
  display: flex;
}

.header {
  flex: 1;

  font-size: 20px;
  font-weight: 500;
  margin: 0;
  padding: 18px 10px 18px 10px;
  text-align: center;
}

.diff-body-wrapper {
  overflow-y: scroll;
}

.diff-body {
  width: 100%;
}

.line-num, .prefix, .content {
  margin: 0;
  padding: 5px 6px;
  font-family: "Courier New", Courier, monospace;
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
  white-space: pre;
  word-break: break-word;
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
  background-color: $lightest-gray;
  display: block;
  padding: 22px 10px 20px 10px;
  text-align: center;
}

</style>
