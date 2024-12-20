<template>
  <div class="validated-input-component">
    <div class="validated-input-wrapper">
      <slot name="prefix"> </slot>
      <input
        class="input"
        :data-testid="testid"
        v-if="num_rows === 1"
        :style="input_style"
        :class="{
              'error-input' : input_style === '' && show_errors
             }"
        type="text"
        v-model="input_value"
        :placeholder="placeholder"
        @blur="on_blur"
      />

      <textarea
        v-else
        :rows="num_rows"
        :style="input_style"
        class="input"
        :data-testid="testid"
        :class="{
                 'error-input' : input_style === '' && show_errors
                }"
        v-model="input_value"
        :placeholder="placeholder"
        @blur="on_blur"
      ></textarea>
      <slot name="suffix"> </slot>
    </div>
    <transition name="fade">
      <slot :error_msg="error_msg" v-if="show_errors">
        <ul class="error-ul">
          <li class="error-text error-li" :data-testid="error_testid">
            {{error_msg}}
          </li>
        </ul>
      </slot>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import {
  use_validation,
  ValidatedInputEmitTypes,
  ValidatorFuncType,
} from "@/composables/use_validation";

export type FromStringFuncType = (value: string) => unknown;
export type ToStringFuncType = (value: unknown) => string;

type propTypes = {
  value: unknown
  validators: ValidatorFuncType<string>[]
  to_string_fn?: ToStringFuncType
  from_string_fn?: FromStringFuncType
  num_rows?: number
  input_style?: string | object
  placeholder?: string
  show_warnings_on_blur?: boolean
  testid?: string
};
const props = withDefaults(defineProps<propTypes>(), {
  to_string_fn: (value: unknown) => String(value),
  from_string_fn: (value: string) => value,
  num_rows: 1,
  input_style: "",
  placeholder: "",
  show_warnings_on_blur: false,
  testid: "input"
});

const input_value = ref("");
const show_warnings = ref(false);
const error_testid = ref("");

watch(
  () => props.to_string_fn(props.value),
  (new_value) => {
    input_value.value = new_value;
  },
  { immediate: true }
)

// TODO: A limitation of the vue SFC is that emit types need to be known at compile
// time. As of 3.3, however, imported types can be used to define emits.
// Once we upgrade to 3.3, this can be changed to the following to reduce
// coupling:
//
// const emit = defineEmits<ValidatedInputEmitTypes>();
const emit = defineEmits<{
  (e: "validity_changed", value: boolean): void;
  (e: "unregister"): void;
  (e: "input", value: unknown): void;
}>();
const { error_msg, show_errors } =  use_validation({
  input: input_value,
  emit,
  validators: props.validators,
});

function on_blur() {
  if (props.show_warnings_on_blur) {
    show_warnings.value = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

* {
  box-sizing: border-box;
}

.validated-input-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.error-ul {
  list-style-type: none; /* Remove bullets */
  padding-left: 0;
  margin-bottom: 0;
}

.error-li:first-child {
  margin-top: -.625rem;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}

.error-li:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 2px;
}

.error-ul .error-li {
  word-wrap: break-word;
  padding: .625rem .875rem;
  margin-bottom: -1px;    /* Prevent double borders */
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.input.error-input {
  border: 1px solid $warning-red;
}

.error-input:focus {
  outline: none;
  box-shadow: 0 0 10px $warning-red;
  border: 1px solid $warning-red;
  border-radius: 2px;
}

.input {
  display: inline-block;
  width: 100%;

  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.input::placeholder {
  color: $stormy-gray-light;
}

.validated-input-component {
  display: inline-block;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

</style>
