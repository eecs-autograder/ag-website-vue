<template>
  <div class="build-sandbox-image">
    <p>
      Instructions and requirements for building custom sandbox images can be
      found in our
      <a href="https://eecs-autograder.github.io/autograder.io/topics/custom_sandbox_images.html">
        UI documentation
      </a>.
    </p>

    <file-upload @upload_files="start_build_task"
                 ref="file_upload"
                 :disable_upload_button="d_starting_build">
      <template v-slot:upload_button_text>Build</template>
    </file-upload>

    <progress-bar
      class="progress-bar"
      v-if="d_file_upload_progress !== null"
      :progress="d_file_upload_progress"
    />
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
import ProgressBar from '@/components/progress_bar.vue';
import { handle_api_errors_async, make_error_handler_func } from '@/error_handling';
import { toggle } from '@/utils';

@Component({
  components: {
    APIErrors,
    FileUpload,
    ProgressBar,
  }
})
export default class BuildSandboxImage extends Vue {
  @Prop({required: true, validator: prop => prop instanceof Course || prop === null})
  course!: Course;

  @Prop({required: true, validator: prop => prop instanceof SandboxDockerImage || prop === null})
  sandbox_image!: SandboxDockerImage;

  d_starting_build = false;
  d_file_upload_progress: number | null = null;

  @handle_api_errors_async(make_error_handler_func())
  start_build_task(files: File[]) {
    this.d_file_upload_progress = null;
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
        build_task = await SandboxDockerImage.create_image(
          files, this.course?.pk  ?? null, progress_listener);
      }

      (<FileUpload> this.$refs.file_upload).clear_files();
      this.$emit('new_build_task', build_task);
    });
  }
}
</script>

<style scoped lang="scss">
.progress-bar {
  margin-top: .25rem;
}
</style>
