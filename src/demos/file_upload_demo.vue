<template>
  <div id="file-upload-demo">
    <p> This File Upload Instance uses default values for its slots. </p>
    <FileUpload ref="file_upload_1"
                @upload_files="print_upload_files($event)">
    </FileUpload>

    <div class="spacer"> </div>

    <p> This File Upload Instance uses custom values for its slots. </p>
    <FileUpload ref="file_upload_2"
                @upload_files="print_upload_files($event)">
    <template slot="file_list_label"> Files You've Uploaded </template>
    <template slot="upload_button_text"> Submit your files </template>
    </FileUpload>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import FileUpload from '@/components/file_upload.vue';

  @Component({
    components: {FileUpload}
  })
  export default class FileUploadDemo extends Vue {
    print_upload_files(files: File[]) {
      console.log(files);
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
