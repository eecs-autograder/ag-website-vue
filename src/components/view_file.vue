<template>
  <div id="viewing-container">
    <div id="scrollable-container" :style="[{height: view_file_height}]">
      <div class="line-numbers-container">
        <div v-for="(line, index) of file_contents.split('\n')" class="line-number">
          {{index + 1}}
        </div>
      </div>
      <div class="file-content-container">
        <pre v-for="(line) of file_contents.split('\n')"
             class="line-of-file-content">{{line === "" ? "\n" : line}}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class ViewFile extends Vue {

    @Prop({required: true, type: String})
    incoming_filename!: string;

    @Prop({required: true, type: String})
    incoming_file_contents!: string;

    @Prop({default: "", type: String})
    view_file_height!: string;

    @Watch('incoming_file_contents')
    on_file_content_change(new_content: string, old_content: string) {
      this.file_contents = new_content;
    }

    filename: string = "";
    file_contents: string = "";
    height_specifications = {};

    created() {
      this.file_contents = this.incoming_file_contents;
      this.filename = this.incoming_filename;
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#viewing-container {
  border-radius: 0 0 3px 3px;
  font-family: monospace;
  padding: 5px 0 0 0;
  width: 100%;
}

#scrollable-container {
  margin: 0;
  overflow: scroll;
  padding: 0;
  position: relative;
  width: 100%;
}

.line-numbers-container {
  position: absolute;
  vertical-align: top;
  user-select: none;
  width: 51px;
}

.line-number {
  color: $baking-pan;
  font-size: 13px;
  padding: 1px 0 1px 0;
  text-align: center;
  height: 16px;
  border-bottom: 1px solid transparent;
  vertical-align: top;
}

.file-content-container {
  color: black;
  display: inline-block;
  margin-left: 51px;
  position: relative;
  vertical-align: top;
}

.line-of-file-content {
  font-size: 13px;
  height: 16px;
  margin: 0;
  padding: 1px 10px 1px 0;
  white-space: pre-wrap;
  border-bottom: 1px solid transparent;
}

.line-of-file-content:last-child {
  padding-bottom: 5px;
}

</style>
