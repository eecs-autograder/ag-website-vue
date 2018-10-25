<template>
  <div id="file-upload-demo">
    <FileUpload
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
    print_message(word: String) {
      console.log("Something was emitted");
    }
  }

</script>

<style scoped lang="scss">

#file-upload-demo {
  margin-top: 100px;
  margin-bottom: 100px;
}

</style>
