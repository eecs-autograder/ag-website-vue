<template>
  <div id="viewing-container">
    <div id="scrollable-container">
      <div class="line-numbers-container">
        <div v-for="(line, index) of file_content.split('\n')" class="line-number">
          {{index + 1}}
        </div>
      </div>
      <div class="file-content-container">
        <pre v-for="(line) of file_content.split('\n')" class="line-of-file-content">{{line}}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class ViewFile extends Vue {

    @Prop({required: true, type: String})
    incoming_filename!: string;

    @Prop({required: true, type: String})
    incoming_file_content!: string;

    filename: string = "";
    file_content: string = "";

    created() {
      this.file_content = this.incoming_file_content;
      this.filename = this.incoming_filename;
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  #viewing-container {
    border-top: 1px solid $light-brown-gray;
    border-bottom: 1px solid $light-brown-gray;
    border-left: 1px solid $light-brown-gray;
    border-right: 1px solid $light-brown-gray;
    border-radius: 0 0 3px 3px;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    padding: 5px 0 0 0;
    width: 100%;
  }

  #scrollable-container {
    margin: 0;
    min-height: 455px;
    max-height: 545px;
    overflow: scroll;
    padding: 0;
    position: relative;
    width: 100%;
  }

  .line-numbers-container {
    position: absolute;
    vertical-align: top;
    width: 51px;
  }

  .line-number {
    color: $light-brown-gray;
    font-size: 13px;
    padding: 1px 0 1px 0;
    text-align: center;
    z-index: 10;
  }

  .file-content-container {
    color: black;
    display: inline-block;
    left: 51px;
    position: relative;
    vertical-align: top;
  }

  .line-of-file-content {
    font-size: 13px;
    margin: 0;
    padding: 1px 10px 1px 0;
  }

  .line-of-file-content:last-child {
    padding-bottom: 5px;
  }

</style>
