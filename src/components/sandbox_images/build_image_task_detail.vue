<template>
  <div class="build-image-task-detail">
    <div class="status-info">
      <build-image-status-icon :status="build_task.status"/>
      <template v-if="build_task.status === BuildImageStatus.queued">
        In Queue
      </template>
      <template v-else-if="build_task.status === BuildImageStatus.in_progress">
        In Progress
      </template>
      <template v-else-if="build_task.status === BuildImageStatus.done">
        Success!
      </template>
      <template v-else-if="build_task.status === BuildImageStatus.failed">
        Build Failed
        <div v-if="build_task.timed_out" class="explanation">
          The build exceeded the time limit of 10 minutes. Please optimize
          your build or use the strategy detailed
          <a :href="tips_and_tricks_url">here.</a>
        </div>
      </template>
      <template v-else-if="build_task.status === BuildImageStatus.image_invalid">
        Invalid Image
        <div class="explanation">
          <i class="fas fa-exclamation-triangle"></i>
          {{build_task.validation_error_msg}}
        </div>
      </template>
      <template v-else-if="build_task.status === BuildImageStatus.cancelled">
        Cancelled
      </template>
      <template v-else-if="build_task.status === BuildImageStatus.internal_error">
        Internal Error
        <div class="explanation">
          An unexpected error occurred while building your image.
          If the problem persists, please contact <b>{{SYSADMIN_CONTACT}}</b> and include
          the information <b>"Image Build ID: {{build_task.pk}}"</b> in your email.
        </div>
        <pre
          class="internal-error-msg"
          v-if="d_globals.current_user.is_superuser"
        >{{build_task.internal_error_msg}}</pre>
      </template>
      <span class="refresh-icon">
        <i
          data-testid="refresh_button"
          class="fas fa-sync-alt"
          v-if="build_task.status === BuildImageStatus.queued
                || build_task.status === BuildImageStatus.in_progress"
          @click="refresh_images_and_build_tasks"
        ></i>
      </span>
    </div>

    <div class="started-at">
      <template v-if="build_task.image === null">New</template>
      <template v-else>"{{build_task.image.display_name}}"</template>
      image build started at <b>{{format_datetime(build_task.created_at)}}</b>
    </div>

    <div class="files">
      Files
      <i class="fas fa-file-download"
         @click="download_files"
         data-testid="download_files_icon"></i>
      <ul class="file-list">
        <li class="filename" v-for="filename of build_task.filenames">{{filename}}</li>
      </ul>
    </div>

    <div v-if="build_task.status === BuildImageStatus.queued
               || build_task.status === BuildImageStatus.in_progress"
         class="cancel-button-wrapper">
      <button type="button" class="red-button"
              @click="cancel_build"
              :disabled="d_cancelling_build"
              data-testid="cancel_button">
        Cancel Build
      </button>
    </div>

    <progress-overlay v-if="d_downloading_files" :progress="d_files_download_progress"/>

    <template v-if="build_task.status !== BuildImageStatus.queued">
      <div class="output-header">Build Output</div>
      <view-file
        ref="output"
        v-if="d_output !== null"
        :file_contents="d_output"
        class="output"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { BuildImageStatus, BuildSandboxDockerImageTask } from 'ag-client-typescript';
import FileSaver from 'file-saver';

import { GlobalData } from '@/app.vue';
import ProgressOverlay from '@/components/progress_overlay.vue';
import ViewFile from '@/components/view_file/view_file.vue';
import { SYSADMIN_CONTACT } from '@/constants';
import { handle_global_errors_async } from '@/error_handling';
import { blob_to_string, format_datetime, toggle } from '@/utils';

import BuildImageStatusIcon from './build_image_status_icon.vue';

@Component({
  components: {
    BuildImageStatusIcon,
    ProgressOverlay,
    ViewFile,
  }
})
export default class BuildImageTaskDetail extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: BuildSandboxDockerImageTask})
  build_task!: BuildSandboxDockerImageTask;

  @Prop({required: true, type: Boolean})
  refresh_in_progress!: boolean;

  readonly format_datetime = format_datetime;
  readonly SYSADMIN_CONTACT = SYSADMIN_CONTACT;
  readonly BuildImageStatus = BuildImageStatus;

  private d_output_download_progress: number | null = null;
  private d_output: Promise<string> | null = null;

  private d_files_download_progress: number | null = null;
  d_downloading_files = false;

  d_cancelling_build = false;

  tips_and_tricks_url = 'https://eecs-autograder.github.io/autograder.io'
                        + '/topics/custom_sandbox_images.html#tips-and-tricks';

  created() {
    return this.load_output();
  }

  @Watch('build_task')
  on_build_task_change(
      new_task: BuildSandboxDockerImageTask, old_task: BuildSandboxDockerImageTask) {
    if (new_task.status !== old_task.status || new_task.status === BuildImageStatus.in_progress) {
      return this.load_output();
    }
  }

  refresh_images_and_build_tasks() {
    if (!this.refresh_in_progress) {
      this.$emit('refresh_images_and_build_tasks');
    }
  }

  @handle_global_errors_async
  private download_files() {
    this.d_files_download_progress = null;
    return toggle(this, 'd_downloading_files', async () => {
      let content = this.build_task.get_files(event => {
          if (event.lengthComputable) {
              this.d_files_download_progress = 100 * (1.0 * event.loaded / event.total);
          }
      });
      FileSaver.saveAs(new File([await content], `build${this.build_task.pk}_files.zip`));
    });
  }

  @handle_global_errors_async
  load_output() {
    if (this.build_task.status === BuildImageStatus.queued) {
      // Output file might not exist yet.
      return;
    }

    this.d_output_download_progress = null;
    let output = this.build_task.get_output((event) => {
      if (event.lengthComputable) {
        this.d_output_download_progress = 100 * (1.0 * event.loaded / event.total);
      }
    });
    this.d_output = blob_to_string(output);
  }

  @handle_global_errors_async
  cancel_build() {
    return toggle(this, 'd_cancelling_build', () => {
      return this.build_task.cancel();
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
}

.status-info {
  font-size: 1.25rem;
  font-weight: bold;

  .explanation {
    font-weight: normal;
    font-size: 1rem;
    margin: .5rem 0 .625rem;

    .fa-exclamation-triangle {
      color: darken($light-yellow, 25%);
    }
  }
}

.started-at {
  margin: .5rem 0;
  color: darken($stormy-gray-dark, 7%);
}

.output-header {
  margin-top: 1rem;
  font-size: 1.125rem;
  padding-left: .125rem;
  color: $navy-blue;
}

.output {
  border-top: 1px solid $pebble-dark;
}

.refresh-icon {
  cursor: pointer;
  font-size: .875rem;
  color: $navy-blue;
}

.files {
  margin: .75rem 0 0;
  font-size: 1.125rem;
  color: darken($stormy-gray-dark, 20%);

  .fa-file-download {
    margin-left: .125rem;
    color: $ocean-blue;

    &:hover {
      color: darken($ocean-blue, 10%);
      cursor: pointer;
    }
  }

  .file-list {
    margin: .25rem 0 0;
    font-size: 1rem;
  }
}

.internal-error-msg {
  white-space: pre-wrap;
  word-break: break-all;
  font-weight: normal;
  font-size: .875rem;

  max-height: 400px;
  overflow: auto;

  border: 1px solid $pebble-dark;
  padding: .25rem;
}

.cancel-button-wrapper {
  margin: .75rem 0;
}
</style>
