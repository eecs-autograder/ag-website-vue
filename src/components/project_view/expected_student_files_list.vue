<template>
  <div class="expected-student-files-list">
    <button
      type="button"
      class="show-all unstyled-button"
      :aria-expanded="show"
      aria-controls="expected-files-to-submit-list"
      @click="show = !show"
    >
      What files should I submit?
    </button>
    <ul id="expected-files-to-submit-list" class="file-list" v-show="show">
      <li
        v-for="item of expected_student_files"
        :key="item.pk"
        class="file-list-item"
      >
        - <span class="filename">{{ item.pattern }}</span>
        <span
          class="num-matches"
          v-if="item.min_num_matches !== 1 || item.max_num_matches !== 1"
        >
          ({{ item.min_num_matches }}-{{ item.max_num_matches }} matches)
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { ExpectedStudentFile } from "ag-client-typescript";

defineProps<{
  expected_student_files: ExpectedStudentFile[];
}>();

const show = ref(false);
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";

* {
  box-sizing: border-box;
}

.expected-student-files-list {
  margin: 0.875rem 0;
}

.file-list {
  margin: 0.25rem 0;
  padding-inline-start: 1rem;
}

.file-list-item {
  font-size: 0.95em;
  display: block;
}

.filename {
  font-family: "Lucida Console", Consolas, "Courier New", Courier, monospace;
}

.num-matches {
  color: $normal-text-color-2;
}

.show-all {
  color: darken($ocean-blue, 10%);

  &:hover {
    color: darken($ocean-blue, 20%);
  }
}
</style>
