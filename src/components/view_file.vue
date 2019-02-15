<template>
  <div id="view-file-component" :style="{height: view_file_height}">
    <table id="viewing-container">
      <tr v-for="(line, index) of d_file_contents.split('\n')">
        <td class="line-number">{{index + 1}}</td>
        <td class="line-of-file-content">{{line === "" ? "\n" : line}}</td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class ViewFile extends Vue {

    @Prop({required: true, type: String})
    filename!: string;

    @Prop({required: true, type: String})
    file_contents!: string;

    @Prop({default: "", type: String})
    view_file_height!: string;

    @Watch('file_contents')
    on_file_contents_change(new_content: string, old_content: string) {
      this.d_file_contents = new_content;
    }

    d_filename: string = "";
    d_file_contents: string = "";

    created() {
      this.d_file_contents = this.file_contents;
      this.d_filename = this.filename;
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#view-file-component {
  overflow-y: scroll;
}

#viewing-container {
  font-family: monospace;
  padding: 5px 0 0 0;
  width: 100%;
}

.line-number {
  color: $baking-pan;
  font-size: 14px;
  padding: 2px 10px;
  text-align: center;
  user-select: none;
  vertical-align: top;
  width: 1%;
}

.line-of-file-content {
  color: black;
  font-size: 14px;
  margin: 0;
  padding: 1px 0;
  white-space: pre-wrap;
  word-break: break-word;
  word-wrap: break-word;
}

</style>
