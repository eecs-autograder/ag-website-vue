<template>
  <div class="build-sandbox-image">
    <file-upload @upload_files="start_build_task"
                 ref="file_upload"
                 :disable_upload_button="d_starting_build">
      <template v-slot:upload_button_text>Build</template>
    </file-upload>

    <APIErrors ref="api_errors"></APIErrors>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  BuildSandboxDockerImageTask,
  Course,
  SandboxDockerImage,
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import FileUpload from '@/components/file_upload.vue';
import { handle_api_errors_async, make_error_handler_func } from '@/error_handling';
import { toggle } from '@/utils';

@Component({
  components: {
    APIErrors,
    FileUpload,
  }
})
export default class BuildSandboxImage extends Vue {
  @Prop({required: true, validator: prop => prop instanceof Course || prop === null})
  course!: Course;

  @Prop({required: true, validator: prop => prop instanceof SandboxDockerImage || prop === null})
  sandbox_image!: SandboxDockerImage;

  d_starting_build = false;
  d_file_upload_progress = 0;

  @handle_api_errors_async(make_error_handler_func())
  start_build_task(files: File[]) {
    this.d_file_upload_progress = 0;
    (<APIErrors> this.$refs.api_errors).clear();
    return toggle(this, 'd_starting_build', async () => {
      let progress_listener = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_file_upload_progress = 100 * (1.0 * event.loaded / event.total);
        }
      };

      let build_task: BuildSandboxDockerImageTask;
      if (this.sandbox_image !== null) {
        build_task = await this.sandbox_image.rebuild(files, progress_listener);
      }
      else {
        build_task = await SandboxDockerImage.create_image(files, this.course?.pk  ?? null);
      }

      (<FileUpload> this.$refs.file_upload).clear_files();
      this.$emit('new_build_task', build_task);
    });
  }
}
</script>

<style scoped lang="scss">

</style>
