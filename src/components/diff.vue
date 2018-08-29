<template>
  <div class="diff-container">

    <div class="parent-of-all-divs">

      <div class="diff-headers">
        <div class="one-row">
          <p class="left-header"> {{left_header}} </p>
          <p class="right-header"> {{right_header}} </p>
        </div>
      </div>

      <div class="restricted-scroll" :style="actual_diff_height">
        <div class="diff-outputs">
            <div class="one-row" v-for="(line, i) of left">
                <p class="left-numbers"> {{i}} </p>
                <p class="left-output-section"> {{(show_whitespace ? left_with_visible_whitespace[i] : left[i]).substr(2)}} </p>
                <p class="right-numbers"> {{i}} </p>
                <p class="right-output-section"> {{(show_whitespace ? right_with_visible_whitespace[i] : right[i]).substr(2)}} </p>
            </div>
        </div>
      </div>

      <div class="toggle-container">
        <toggle v-model="show_whitespace" :incoming_active_background_color="toggle_color">
          <template slot="on">
            <p> Show Whitespace</p>
          </template>
          <template slot="off">
            <p> Hide Whitespace</p>
          </template>
        </toggle>
      </div>

    </div>

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import Toggle from './toggle.vue';

  @Component({
    components: { Toggle }
  })

  export default class Diff extends Vue {

    @Prop({default: ["hi", "bye"], type: Array})
    diff_contents!: string[];

    @Prop({default: "left header", type: String})
    left_header!: string;

    @Prop({default: "right header", type: String})
    right_header!: string;

    @Prop({default: () => ({ 'height': '100%' }), type: Object})
    diff_height!: object;


    left: string[] = [];
    right: string[] = [];

    left_with_visible_whitespace: string[] = [];
    right_with_visible_whitespace: string[] = [];

    show_whitespace = false;

    toggle_color = {
      "backgroundColor": "slategray"
    };

    actual_diff_height = {};

    diff_results: string[] = [];
    diff_left_header = "";
    diff_right_header = "";

    created() {
      this.diff_results = this.diff_contents;
      this.diff_left_header = this.left_header;
      this.diff_right_header = this.right_header;
      this.actual_diff_height = this.diff_height;

      for (let item of this.diff_results) {
        let prefix = item.substring(0, 2);
        if (prefix === "- ") {
          this.left.push(item);
          this.left_with_visible_whitespace.push(this.replace_whitespace(item));
        }
        else if (prefix === "+ ") {
          this.right.push(item);
          this.right_with_visible_whitespace.push(this.replace_whitespace(item));
        }
        else if (prefix === "  ") {
          this.pad_if_needed(this.left, this.right);
          this.pad_if_needed(this.left_with_visible_whitespace, this.right_with_visible_whitespace);
          this.left.push(item);
          this.left_with_visible_whitespace.push(this.replace_whitespace(item));
          this.right.push(item);
          this.right_with_visible_whitespace.push(this.replace_whitespace(item));
        }
      }
      this.pad_if_needed(this.left, this.right);
      this.pad_if_needed(this.left_with_visible_whitespace, this.right_with_visible_whitespace);
    }

    pad_if_needed(left: string[], right: string[]) {
      if (left.length === right.length) {
        return;
      }
      let to_pad: string[] = null;
      let bigger: string[] = null;
      if (left.length > right.length) {
        bigger = left;
        to_pad = right;
      }
      else {
        bigger = right;
        to_pad = left;
      }
      while (to_pad.length < bigger.length) {
        to_pad.push('');
      }
    }

    replace_whitespace(current: string): string {
      current = current.split(' ').join('\u2219');
      current = current.split('\n').join('\u21b5\n');
      current = current.split('\r').join('\\r\r');
      return current;
    }

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .diff-container {
    font-family: "Helvetica Neue", Helvetica, sans-serif;
  }

  .negative {
    background-color: hsl(-355, 96%, 83%);
  }

  .left-output, .right-output {
    border-bottom: 1px solid $diff-lines;
    min-width: 150px;
    word-break: break-word;
  }

  .positive {
    background-color: hsl(208, 80%, 90%);
  }

  .negative-line-num {
    background-color: hsl(0, 100%, 95%);
  }

  .positive-line-num {
    background-color: hsl(120, 100%, 95%);
  }

  .parent-of-all-divs {
    width: 100%;
  }

  .one-row {
    display: table-row;
    width: 100%;
  }

  .diff-headers {
    display: table;
    width: 100%;
  }

  .diff-outputs {
    overflow-y: scroll;
    display: table;
    width: 100%;
    word-break: break-word;
    word-wrap: break-word;
  }

  .left-header, .right-header {
    color: darkslategray;
    display: table-cell;
    font-size: 17px;
    font-weight: 500;
    margin: 0;
    padding: 18px 10px 18px 10px;
    text-align: center;
    width: 50%;
  }

  .left-numbers, .right-numbers {
    color: slategray;
    display: table-cell;
    margin: 0;
    padding: 5px;
    text-align: right;
    vertical-align: top;
    width: 3%;
    word-break: break-word;
    word-wrap: break-word;
  }

  .left-output-section, .right-output-section {
    color: slategrey;
    display: table-cell;
    margin: 0;
    padding: 5px 10px 5px 10px;
    width: 47%;
  }

  ::-webkit-scrollbar {
    background: transparent;
    width: 0px;
  }

  .restricted-scroll {
    overflow-y: scroll;
  }

  .toggle-container {
    background-color: $lightest-gray;
    display: block;
    padding: 22px 10px 20px 10px;
    text-align: center;
  }

</style>
