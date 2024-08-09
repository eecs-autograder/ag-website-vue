<template>
  <div v-html="markdown_rendered"></div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

import DOMPurify from 'dompurify';
// import { marked } from 'marked';
import showdown from 'showdown';
// const { marked } = require('marked');
// import * as marked from 'marked';

const converter = new showdown.Converter();

@Component({})
export default class DescriptionRenderer extends Vue {
  @Prop({required: true, type: String})
  text!: string;

  get markdown_rendered() : string {
    // marked.parse only returns a promise
    // if the async option is true:
    // https://github.com/markedjs/marked/discussions/3219
    return DOMPurify.sanitize(<string> converter.makeHtml(this.text));
  }

}
</script>

<style>

</style>
