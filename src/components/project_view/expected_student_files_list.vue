<template>
  <div class="expected-student-files-list">
    <div class="show-all" @click="d_show = !d_show">What files should I submit?</div>
    <ul class="file-list" v-if="d_show">
      <li v-for="item of expected_student_files" :key="item.pk" class="file-list-item">
        - <span class="filename">{{item.pattern}}</span>
        <span class="num-matches" v-if="item.min_num_matches !== 1 || item.max_num_matches !== 1">
          ({{item.min_num_matches}}-{{item.max_num_matches}} matches)
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { ExpectedStudentFile } from 'ag-client-typescript';

@Component
export default class ExpectedStudentFilesList extends Vue {
  @Prop({required: true, type: Array})
  expected_student_files!: ExpectedStudentFile[];

  d_show = false;
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
}


.expected-student-files-list {
  margin: .875rem 0;
}

.file-list {
  margin: .25rem 0;
  padding-inline-start: 1rem;
}

.file-list-item {
  font-size: .95em;
  display: block;
}

.filename {
  font-family: "Lucida Console", Consolas, "Courier New", Courier, monospace;
}

.num-matches {
  color: $stormy-gray-dark;
}

.show-all {
  cursor: pointer;
  color: $ocean-blue;

  &:hover {
    color: darken($ocean-blue, 10%);
  }
}

</style>
