<template>
  <div class="validated-input-component">
    <div class="form-field-wrapper">
      <label class="label" :for="label_id">
        <slot name="label"></slot>
      </label>
      <div class="input-line">
        <textarea
          class="input"
          :id="label_id"
          :rows="num_rows"
          :style="input_style"
          :class="{ 'error-input' : !input_style && !hide_errors && errors_to_render}"
          v-model="input"
          :placeholder="placeholder"
          @blur="on_blur"
        />
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
} from '@/composables/use_validation';
import InputErrors from '@/components/validated_input/InputErrors.vue';
import { generate_uid } from "@/utils";

type PropTypes = {
  value: string
  validators: TextAreaInputValidator[]
  num_rows?: number
  input_style?: CSSProperties
  placeholder?: string
  force_show_errors?: boolean
};
const props = withDefaults(defineProps<PropTypes>(), {
  num_rows: 1
});

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
// define a product type for emits as well).
// i.e. const emit = defineEmits<ValidatedInputEmitTypes<string>>();
// See https://vuejs.org/guide/typescript/composition-api.html#syntax-limitations
type EmitTypes = {
  (e: "input", value: string): void;
};
const emit = defineEmits<EmitTypes>();

const { is_valid, errors } = use_validation<string>({
    input,
    validators: props.validators,
    emit
});

watch(
  () => props.value,
  (new_value) => { input.value = new_value},
  { immediate: true}
);

watch(input, () => { hide_errors.value = false });

function on_blur() {
  if (!is_valid.value) {
    hide_errors.value = false;
  }
};
</script>

<script lang="ts">
import { ValidatorFuncType } from "@/composables/use_validation";

export type TextAreaInputValidator = ValidatorFuncType<string>;
</script>

<style scoped lang="scss">
@import 'styles.scss'
</style>
