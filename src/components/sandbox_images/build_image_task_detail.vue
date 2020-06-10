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
      </template>
    </div>

    <div class="started-at">
      <template v-if="build_task.image === null">New</template>
      <template v-else>"{{build_task.image.display_name}}"</template>
      image build started at <b>{{format_datetime(build_task.created_at)}}</b>
    </div>

    <template v-if="build_task.status !== BuildImageStatus.queued">
      <div class="output-header">Build Output</div>
      <view-file
        v-if="d_output !== null"
        :file_contents="d_output"
        class="output"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { BuildImageStatus, BuildSandboxDockerImageTask } from 'ag-client-typescript';

import ViewFile from '@/components/view_file.vue';
import { SYSADMIN_CONTACT } from '@/constants';
import { handle_global_errors_async } from '@/error_handling';
import { format_datetime, blob_to_string } from '@/utils';

import BuildImageStatusIcon from './build_image_status_icon.vue';

@Component({
  components: {
    BuildImageStatusIcon,
    ViewFile,
  }
})
export default class BuildImageTaskDetail extends Vue {
  @Prop({required: true, type: BuildSandboxDockerImageTask})
  build_task!: BuildSandboxDockerImageTask;

  readonly format_datetime = format_datetime;
  readonly SYSADMIN_CONTACT = SYSADMIN_CONTACT;
  readonly BuildImageStatus = BuildImageStatus;

  private d_progress = 0;
  private d_output: Promise<string> | null = null;

  created() {
    return this.load_output();
  }

  @Watch('build_task.status')
  on_build_task_status_change() {
    return this.load_output();
  }

  @handle_global_errors_async
  load_output() {
    this.d_progress = 0;
    let output = this.build_task.get_output((event) => {
      if (event.lengthComputable) {
        this.d_progress = 100 * (1.0 * event.loaded / event.total);
      }
    });
    this.d_output = blob_to_string(output);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

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
</style>
