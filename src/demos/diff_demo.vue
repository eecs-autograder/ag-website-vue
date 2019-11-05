<template>
  <div>
    <h3>This one should have vertical scrolling</h3>
    <div class="diff_wrapper">
      <diff diff_max_height="150px"
          :diff_contents="balanced_diff"
          left_header="Expected Output"
          right_header="Student Output"></diff>
    </div>

    <h3>This one should have wrapped text</h3>
    <div class="diff_wrapper">
      <diff :diff_contents="wide_diff"
            left_header="Expected Output"
            right_header="Student Output"></diff>
    </div>

    <h3>This one should have wrapped text</h3>
    <div class="diff_wrapper">
      <diff :diff_contents="diff_no_right"
            left_header="Expected Output"
            right_header="Student Output"></diff>
    </div>

    <h3>Empty Array</h3>
    <div class="diff_wrapper">
      <diff :diff_contents="diff_empty"
            left_header="Expected Output"
            right_header="Student Output"></diff>
    </div>

  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Diff from '@/components/diff.vue';

@Component({
  components: {Diff}
})
export default class DiffDemo extends Vue {

  balanced_diff = [
    '  one\r\n',
    '  two\n',
    '- left one\n',
    '- left two\n',
    '- left three\n',
    '  three\n',
    '+ right one\n',
    '+ right two\n',
    '  four\n',
    '  five\n'
  ];

  wide_diff = [
    "  ./euchre.exe pack.in noshuffle 1 Alice Simple Bob Simple Cathy Simple Drew Simple\n",
    "- Hand 0\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "+ Hand 0\n",
  ];

  diff_no_right = [
    "-  ./euchre.exe pack.in noshuffle 1 Alice Simple Bob Simple Cathy Simple Drew Simple\n",
    "- Hand 0\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Jack of Diamonds turned up\n",
    "- Hand 0\n",
  ];

  diff_empty = [];
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.diff_wrapper {
  height: auto;
}

</style>
