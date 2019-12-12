<template>
  <div class="file-panel">
    <div class="panel" @click="toggle_open">
      <i class="fas" :class="d_is_open ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      <div class="filename">{{filename}}</div>
    </div>
    <div class="body" v-show="d_is_open">
      <view-file v-if="d_content !== null"
                 :filename="filename"
                 :file_contents="d_content"
                 :progress="d_progress"
                 :handgrading_result="handgrading_result"
                 :enable_custom_comments="enable_custom_comments"
                 :readonly_handgrading_results="readonly_handgrading_results"></view-file>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { HandgradingResult } from 'ag-client-typescript';

import ViewFile from '@/components/view_file.vue';
import { toggle } from '@/utils';

@Component({
  components: {
    ViewFile
  }
})
export default class FilePanel extends Vue {
  @Prop({required: true, type: HandgradingResult})
  handgrading_result!: HandgradingResult;

  @Prop({required: true, type: String})
  filename!: string;

  @Prop({required: true, type: Boolean})
  enable_custom_comments!: boolean;

  // When true, editing handgrading results will be disabled.
  @Prop({required: true, type: Boolean})
  readonly_handgrading_results!: boolean;

  d_is_open = false;

  d_content: Promise<string> | null = null;
  d_progress: number | null = null;

  toggle_open() {
    let top = this.$el.getBoundingClientRect().top;

    this.d_is_open = !this.d_is_open;
    if (this.d_content === null) {
      this.d_content = HandgradingResult.get_file_from_handgrading_result(
        this.handgrading_result.group, this.filename,
        (event: ProgressEvent) => {
          if (event.lengthComputable) {
            this.d_progress = 100 * (1.0 * event.loaded / event.total);
          }
        }
      );
    }

    // This prevents any open files below this one from being pushed
    // into the top of the viewport due to the size change of the parent.
    // istanbul ignore next
    if (!this.d_is_open && top < 0) {
      this.$nextTick(() => {
        this.$el.scrollIntoView();
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.file-panel {
  $margin: .375rem;

  margin: $margin;
  $border-color: $pebble-dark;

  .panel {
    position: sticky;
    top: 0;

    display: flex;
    padding: .5rem;
    cursor: pointer;

    background-color: $white-gray;
    border: 1px solid $border-color;

    margin-top: $margin;

    .filename {
      font-weight: bold;
      padding-left: .375rem;
    }
  }

  .body {
    border: 1px solid $border-color;
    border-top: none;
  }
}
</style>
