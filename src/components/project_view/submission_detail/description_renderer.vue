<template>
  <div v-html="markdown_rendered" class="description-markdown"></div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

import DOMPurify from 'dompurify';
import showdown from 'showdown';

const converter = new showdown.Converter();

@Component({})
export default class DescriptionRenderer extends Vue {
  @Prop({required: true, type: String})
  text!: string;

  get markdown_rendered() : string {
    return DOMPurify.sanitize(<string> converter.makeHtml(this.text));
  }

}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.description-markdown {
  margin: .25rem 0;
  padding: .625rem .75rem;
  border: 1px solid $sky-blue;

  :first-child {
    // Override any margin/padding in the first and last elements in the markdown.
    margin-top: 0!important;
    padding-top: 0!important;
  }

  :last-child {
    // Override any margin/padding in the first and last elements in the markdown.
    margin-bottom: 0!important;
    padding-bottom: 0!important;
  }
}
</style>
