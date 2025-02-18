<template>
  <transition-group v-if="visible" name="fade" class="error-ul" tag="ul">
    <li
      v-for="error of errors_to_render"
      class="error-text error-li"
      :key="error.uid"
    >
      {{ error.error_msg }}
    </li>
  </transition-group>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { debounce } from "lodash";

import { generate_uid } from "@/utils";

type PropTypes = {
  errors: string[];
  max_errors_to_show: number | null;
  visible: boolean;
};
const props = withDefaults(defineProps<PropTypes>(), {
  max_errors_to_show: 1,
});

// Allows parent component to know if any errors are rendered for consistent styling,
// i.e. a parent component might put a red border around the input when errors are
// displayed
type EmitTypes = {
  (e: "errors_to_render", value: boolean): void;
};
const emit = defineEmits<EmitTypes>();

type VisibleError = {
  error_msg: string;
  uid: number;
};
const debounced_errors = ref<VisibleError[]>([]);
const errors_to_render = computed(() => {
  if (props.max_errors_to_show === null) {
    return debounced_errors.value;
  } else {
    return debounced_errors.value.slice(0, props.max_errors_to_show);
  }
});

const debounce_cancel_map = new Map<string, () => void>();

watch(
  () => props.errors,
  (new_errors: string[], old_errors: string[] | undefined) => {
    const removed_errors = old_errors?.filter(
      (err) => !new_errors.includes(err),
    );
    const added_errors = new_errors.filter((err) => !old_errors?.includes(err));

    // immediately remove resolved errors and cancel any debounced additions
    // to visible errors
    debounced_errors.value = debounced_errors.value.filter((err) =>
      new_errors.includes(err.error_msg),
    );
    removed_errors?.forEach((err) => {
      const cancel = debounce_cancel_map.get(err);
      if (cancel) {
        cancel();
      }
      debounce_cancel_map.delete(err);
    });

    // Debounce additions to visible errors for smoother UX, keeping track of
    // the cancel functions
    added_errors.forEach((err) => {
      const debounce_add = debounce(() => {
        debounced_errors.value.push({ error_msg: err, uid: generate_uid() });
        debounce_cancel_map.delete(err);
        emit("errors_to_render", true);
      }, 500);
      debounce_cancel_map.set(err, () => debounce_add.cancel());
      debounce_add();
    });

    if (debounced_errors.value.length === 0) {
      emit("errors_to_render", false);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  debounce_cancel_map.forEach((cancel) => cancel());
});
</script>

<style scoped lang="scss">
@import "styles.scss";
</style>
