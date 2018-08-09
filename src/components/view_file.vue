<template>
  <div id="viewing-container">
    <div id="scrollable-container">
      <div class="line-numbers-container">
        <div v-for="(line, index) of file_content.split('\n')" class="line-number"> {{index + 1}} </div>
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
  export default class viewFile extends Vue {

    @Prop({default: "my_filename", type: String})
    incoming_file_name: String;

    @Prop({default:"coffeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee\neeeeeeeeeeeeeeeeeeeeeeeeeeeeeee\neeeeeeeeeeeeeeeeeeeee\nee", type: String})
    incoming_file_content: String;

    filename: String;
    file_content: String;

    created() {
      this.file_content = this.incoming_file_content;
      this.filename = this.incoming_file_name;
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  #viewing-container {
    border-radius: 0px 0px 3px 3px;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    width: 100%;
    padding: 5px 0px 0px 0px;
    border-left: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
    border-right: 1px solid lightgray;
  }

  #scrollable-container {
    width: 100%;
    padding: 0px;
    margin: 0px;
    overflow: scroll;
    min-height: 455px;
    max-height: 545px;
    position: relative;
  }

  .line-numbers-container {
    position: absolute;
    width: 51px;
    vertical-align: top;
  }

  .line-number {
    text-align: center;
    z-index: 10;
    padding: 1px 0px 0px 0px;
    font-size: 13px;
    color: rgba(27, 31, 35, 0.35);
  }

  .file-content-container {
    display: inline-block;
    position: relative;
    left: 51px;
    vertical-align: top;
  }

  .line-of-file-content {
    margin: 0px;
    padding: 0px 10px 1px 0px;
  }

  .line-of-file-content:last-child {
    padding-bottom: 5px;
  }

</style>
