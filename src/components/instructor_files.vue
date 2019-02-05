<template>
  <div id="instructor-files-component">

    <FileUpload ref="instructor_file_upload"
                @upload_files="log_uploaded_files($event)">
    </FileUpload>

    <div id="viewing-area">
      <p id="file-side-title"> Uploaded Files </p>
    </div>
    <!--<MultiFileViewer ref="instructor_files_viewer"-->
                     <!--height_of_view_file="240px"></MultiFileViewer>-->
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import FileUpload from '@/components/file_upload.vue';
  import Modal from '@/components/modal.vue';
  import MultiFileViewer from '@/components/multi_file_viewer.vue';

  @Component({
    components: {
      FileUpload,
      Modal,
      MultiFileViewer
    }
  })
  export default class InstructorFiles extends Vue {

    log_uploaded_files(files: File[]) {
      console.log(files);
    }

  }

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

#instructor-files-component {
  width: 80%;
  margin-left: 10%;
  margin-top: 100px;
}

</style>
