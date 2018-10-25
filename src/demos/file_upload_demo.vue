<template>
  <div>
    <FileUpload></FileUpload>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import FileUpload from '@/components/file_upload.vue';

  @Component({
    components: {FileUpload}
  })
  export default class FileUploadDemo extends Vue {

  }

</script>

<style scoped lang="scss">

</style>
