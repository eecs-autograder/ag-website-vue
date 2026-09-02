<template>
  <div v-html="markdown_rendered" class="description-markdown"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import DOMPurify from "dompurify";
import showdown from "showdown";

const converter = new showdown.Converter();

const props = defineProps<{
  text: string;
}>();

const markdown_rendered = computed(() =>
  DOMPurify.sanitize(converter.makeHtml(props.text)),
);
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

.description-markdown {
  margin: 0.25rem 0;
  padding: 0.625rem 0.75rem;
  border: 1px solid $sky-blue;

  :first-child {
    // Override any margin/padding in the first and last elements in the markdown.
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  :last-child {
    // Override any margin/padding in the first and last elements in the markdown.
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>
