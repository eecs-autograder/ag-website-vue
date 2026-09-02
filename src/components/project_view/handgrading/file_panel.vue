<template>
  <div class="file-panel" ref="root">
    <button
      class="panel unstyled-button"
      tabindex="0"
      @click="toggle_open"
      :aria-controls="`file-panel-${component_uid}`"
      :aria-expanded="is_open"
    >
      <i
        class="fas"
        :class="is_open ? 'fa-chevron-down' : 'fa-chevron-right'"
        aria-hidden="true"
      ></i>
      <span class="filename">{{ filename }}</span>
    </button>
    <div :id="`file-panel-${component_uid}`" class="body" v-show="is_open">
      <view-file
        v-if="content !== null"
        :filename="filename"
        :file_contents="content"
        :progress="progress"
        :handgrading_result="handgrading_result"
        :enable_custom_comments="enable_custom_comments"
        :readonly_handgrading_results="readonly_handgrading_results"
        :is_code_file="true"
      ></view-file>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";

import { HandgradingResult } from "ag-client-typescript";

import ViewFile from "@/components/view_file/view_file.vue";
import { generate_uid } from "@/utils";

type PropTypes = {
  handgrading_result: HandgradingResult;
  filename: string;
  enable_custom_comments: boolean;
  // When true, editing handgrading results will be disabled.
  readonly_handgrading_results: boolean;
};

const props = defineProps<PropTypes>();

const component_uid = generate_uid();

const root = ref<HTMLElement>();
const is_open = ref(false);
const content = ref<Promise<string> | null>(null);
const progress = ref<number | null>(null);

function toggle_open() {
  let top = root.value!.getBoundingClientRect().top;

  progress.value = null;
  is_open.value = !is_open.value;
  if (content.value === null) {
    content.value = HandgradingResult.get_file_from_handgrading_result(
      props.handgrading_result.group,
      props.filename,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          progress.value = 100 * ((1.0 * event.loaded) / event.total);
        }
      },
    );
  }

  // This prevents any open files below this one from being pushed
  // into the top of the viewport due to the size change of the parent.
  // istanbul ignore next
  if (!is_open.value && top < 0) {
    nextTick(() => {
      root.value!.scrollIntoView();
    });
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/button_styles.scss";

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.file-panel {
  $margin: 0.375rem;

  margin: $margin;
  $border-color: $pebble-dark;

  .panel {
    width: 100%;

    position: sticky;
    top: 0;
    z-index: 1;

    display: flex;
    padding: 0.5rem;
    cursor: pointer;

    background-color: $white-gray;
    border: 1px solid $border-color;

    margin-top: $margin;

    .filename {
      font-weight: bold;
      padding-left: 0.375rem;
    }
  }

  .body {
    border: 1px solid $border-color;
    border-top: none;
  }
}
</style>
