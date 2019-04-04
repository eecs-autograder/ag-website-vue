<template>
  <div id="view-file-component" :style="{height: view_file_height}">
    <div v-if="d_loading" class="loading-spinner">
      <div><i class="fa fa-spinner fa-pulse"></i></div>
    </div>
    <table v-else
           id="viewing-container">
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

    @Prop({required: true, type: Promise})
    file_contents!: Promise<string>;

    @Prop({default: "", type: String})
    view_file_height!: string;

    @Watch('file_contents')
    async on_file_contents_change(new_content: string | Promise<string>, old_content: string) {
      this.d_loading = true;
      this.d_file_contents = await new_content;
      this.d_loading = false;
    }

    @Watch('filename')
    on_filename_change(new_file_name: string, old_file_name: string) {
      this.d_filename = new_file_name;
    }

    d_filename: string = "";
    d_file_contents: string = "";
    d_loading = true;

    async created() {
      this.d_file_contents = await this.file_contents;
      this.d_filename = this.filename;
      this.d_loading = false;
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

.loading-spinner {
  color: mediumvioletred;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90%;
}

</style>
