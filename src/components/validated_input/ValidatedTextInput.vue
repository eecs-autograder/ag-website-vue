<template>
  <div class="validated-input-component">
    <div class="form-field-wrapper">
      <label class="label" :for="label_id">
        <slot name="label"></slot>
      </label>
      <div class="input-line">
        <span class="prefix"><slot name="prefix"> </slot></span>
        <input
          ref="input_element"
          class="input"
          :id="label_id"
          :style="input_style"
          :class="{
            'error-input': !input_style && !hide_errors && has_rendered_errors,
          }"
          type="text"
          v-model="input"
          :placeholder="placeholder"
          @blur="on_blur"
        />
        <span class="suffix"><slot name="suffix"> </slot></span>
      </div>
    </div>

    <input-errors
      v-if="!hide_errors"
      :errors="errors"
      @has_rendered_errors="
        (val) => {
          has_rendered_errors = val;
        }
      "
    >
      <slot v-if="$slots.errors" name="errors"></slot>
    </input-errors>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, CSSProperties } from "vue";

import {
  use_validation,
  ValidatorFuncType,
} from "@/composables/use_validation";
import InputErrors from "@/components/validated_input/InputErrors.vue";
import { generate_uid } from "@/utils";

type PropTypes = {
  value: string;
  validators: ValidatorFuncType<string>[];
  input_style?: CSSProperties;
  placeholder?: string;
};
const props = defineProps<PropTypes>();

const label_id = `label-${generate_uid()}`;
const input = ref("");
const input_element = ref<InstanceType<typeof HTMLInputElement>>();

// Don't show errors until input changes or on_blur
const hide_errors = ref(true);

// Tracks whether any errors are ready to be rendered. Used to determine
// whether error styling should be used, in conjunction with hide_errors.
// This is updated when InputErrors emits.
const has_rendered_errors = ref(false);

watch(
  () => props.value,
  (new_value) => {
    input.value = new_value;
  },
  { immediate: true },
);

watch(input, () => {
  hide_errors.value = false;
});

// TODO: when we upgrade to Vue>=3.3, components using use_validation can just
// import ValidatedInputEmitTypes to define the components emits (can be used to
// define a product type for emits as well).
// i.e. const emit = defineEmits<ValidatedInputEmitTypes<string>>();
// See https://vuejs.org/guide/typescript/composition-api.html#syntax-limitations
type EmitTypes = {
  (e: "input", value: string): void;
  (e: "update:is_valid", value: boolean): void;
};
const emit = defineEmits<EmitTypes>();

const { is_valid, errors } = use_validation<string>({
  input,
  validators: props.validators,
  emit,
});

function on_blur() {
  if (!is_valid.value) {
    hide_errors.value = false;
  }
}

// Calls .focus() on the underlying input/textarea element.
// Options object:
// - cursor_to_front: If true, will put the cursor at the beginning of the
//   input text.
// - select: If true, will highlight the input text.
function focus({ cursor_to_front = false, select = false } = {}) {
  input_element.value?.focus();

  if (cursor_to_front) {
    input_element.value?.setSelectionRange(0, 0);
  }

  if (select) {
    input_element.value?.select();
  }
}

defineExpose({
  focus,
});
</script>

<style scoped lang="scss">
@import "styles.scss";
</style>
