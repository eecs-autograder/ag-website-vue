<template>
  <div class="validated-input-component">
    <div class="form-field-wrapper">
      <label class="label" :for="label_id">
        <slot name="label"></slot>
      </label>
      <div class="input-line">
        <span class="prefix"><slot name="prefix"> </slot></span>
        <input
          class="input"
          :id="label_id"
          :style="input_style"
          :class="{ 'error-input' : !input_style && !hide_errors && errors_to_render}"
          type="text"
          v-model="input"
          :placeholder="placeholder"
          @blur="on_blur"
        />
        <span class="suffix"><slot name="suffix" class="suffix"> </slot></span>
      </div>
    </div>

    <input-errors
      :visible="force_show_errors || !hide_errors"
      :errors="errors"
      @errors_to_render="(val) => { errors_to_render = val; }"
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
  ParserFuncType
} from '@/composables/use_validation';
import InputErrors from '@/components/validated_input/InputErrors.vue';
import { generate_uid } from "@/utils";

type PropTypes = {
  value: number
  validators: ValidatorFuncType<number>[]
  input_style?: CSSProperties
  placeholder?: string
  force_show_errors?: boolean
};
const props = defineProps<PropTypes>();

const label_id = `label-${generate_uid()}`;
const input = ref("");

// Don't show errors until input changes or on_blur
const hide_errors = ref(true);

// Tracks whether any errors are ready to be rendered. Used to determine
// whether error styling should be used, in conjunction with hide_errors.
// This is updated when InputErrors emits.
const errors_to_render = ref(false);

// TODO: when we upgrade to Vue>=3.3, components using use_validation can just
// import ValidatedInputEmitTypes to define the components emits (can be used to
// define an intersection type for emits as well).
// i.e. const emit = defineEmits<ValidatedInputEmitTypes<number>>();
// See https://vuejs.org/guide/typescript/composition-api.html#syntax-limitations
type EmitTypes = {
  (e: "input", value: number): void;
  (e: "validity_changed", value: boolean): void;
};
const emit = defineEmits<EmitTypes>();

const parser: ParserFuncType<string, number> = (value: string) => {
  const val = value.trim() === '' ? NaN : Number(value);
  const is_valid = !isNaN(val) && Number.isInteger(val);

  if (is_valid) {
    return {
      is_valid, output: val
    }
  } else {
    return {
      is_valid, error_msg: "The input must be a valid integer"
    }
  }
}

const { is_valid, errors } = use_validation<string, number>({
    input,
    validators: props.validators,
    emit,
    parser
});

watch(
  () => props.value,
  (new_value) => { input.value = new_value.toString()},
  { immediate: true}
);

watch(input, () => { hide_errors.value = false });

function on_blur() {
  if (!is_valid.value) {
    hide_errors.value = false;
  }
}
</script>

<style scoped lang="scss">
@import 'styles.scss'
</style>
