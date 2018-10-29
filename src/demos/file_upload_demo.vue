<template>
  <div id="file-upload-demo">
    <p> This File Upload Instance uses default values for its props. </p>
    <FileUpload
      ref="file_upload_1"
      @submit_click="print_message($event)">
    </FileUpload>

    <div class="spacer"> </div>

    <p> This File Upload Instance uses custom values for its props. </p>
    <FileUpload
      ref="file_upload_2"
      file_list_label="Files you've uploaded:"
      submit_button_text="Submit your files!"
      @submit_click="print_message($event)">
    </FileUpload>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import FileUpload from '@/components/file_upload.vue';

  @Component({
    components: {FileUpload}
  })
  export default class FileUploadDemo extends Vue {
    print_message(word: string) {
      console.log("Something was emitted");
    }
  }

</script>

<style scoped lang="scss">

.spacer {
  height: 100px;
}

#file-upload-demo {
  margin-top: 100px;
  margin-bottom: 100px;
}

</style>
