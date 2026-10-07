<template>
  <div class="validated-input-component">
    <div class="validated-input-wrapper">
      <slot name="prefix"> </slot>
      <input class="input"
             ref="input"
             :id="input_id"
             data-testid="input"
             v-if="num_rows === 1"
             :style="input_style"
             :class="{
              'error-input' : input_style === '' && show_errors
             }"
             type="text"
             :aria-required="aria_required"
             :value="d_input_value"
             :placeholder="placeholder"
             @blur="on_blur"
             @input="$e => change_input($e.target.value)"/>

      <textarea v-else
                 ref="input"
                :id="input_id"
                :rows="num_rows"
                :style="input_style"
                class="input"
                data-testid="input"
                :class="{
                 'error-input' : input_style === '' && show_errors
                }"
                :aria-required="aria_required"
                :value="d_input_value"
                :placeholder="placeholder"
                @blur="on_blur"
                @input="$e => change_input($e.target.value)"></textarea>
      <slot name="suffix"> </slot>
    </div>
    <div role="alert" aria-atomic="true">
      <transition name="fade">
        <slot :d_error_msg="d_error_msg" v-if="show_errors">
          <ul class="error-ul">
              <li class="error-text error-li">{{d_error_msg}}</li>
          </ul>
        </slot>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { Ref } from 'vue';

export default {
  name: "ValidatedInput",
}

function default_to_string_func(value: unknown): string {
  return "" + value;
}

function default_from_string_func(value: string): unknown {
  return value;
}

export interface ValidatorResponse {
  is_valid: boolean;
  error_msg: string;
}

interface ValidatedInputMethods {
  uid: number;

  enable_warnings(): void;

  focus(args?: {cursor_to_front?: boolean, select?: boolean}): void;

  reset_warning_state(): void;

  rerun_validators(): void;
}

// What a ValidatedInput passes to its ValidatedForm's register() and unregister().
export interface RegisteredValidatedInput extends ValidatedInputMethods {
  is_valid: Ref<boolean>;
}

// What a template ref to a ValidatedInput resolves to. The component instance
// unwraps exposed refs, so is_valid is a plain boolean here.
export interface ValidatedInputExposed extends Vue, ValidatedInputMethods {
  is_valid: boolean;
}
</script>

<script setup lang="ts">
import { debounce } from 'lodash';

import { computed, inject, onUnmounted, ref, watch } from 'vue';
import { generate_uid } from '@/utils';
// import { ValidatedInputExposed } from './validated_input_exposed';


type ValidatorFuncType = (value: string) => ValidatorResponse;
type FromStringFuncType = (value: string) => unknown;
type ToStringFuncType = (value: unknown) => string;


function do_nothing(...args: unknown[]): void {}

const props = withDefaults(defineProps<{
  value: any, // eslint-disable no-any
  aria_required?: boolean,
  validators: ValidatorFuncType[],
  to_string_fn?: ToStringFuncType,
  from_string_fn?: FromStringFuncType,
  num_rows?: number,
  input_style?: string | object,
  input_id?: string,
  placeholder?: string,
  show_warnings_on_blur?: boolean,
}>(), {
  aria_required: false,
  to_string_fn: default_to_string_func,
  from_string_fn: default_from_string_func,
  num_rows: 1,
  input_style: "",
  input_id: "",
  placeholder: "",
  show_warnings_on_blur: false,
});

const emit = defineEmits(['input', 'input_validity_changed']);

const d_input_value = ref("");
const d_is_valid = ref(false);
const d_error_msg = ref("");
const d_show_warnings = ref(false);

const register = inject<(input: RegisteredValidatedInput) => void>('register', do_nothing);
const unregister = inject<(input: RegisteredValidatedInput) => void>('unregister', do_nothing);

const input = ref<HTMLInputElement | null>(null);

const self: RegisteredValidatedInput = {
  uid: generate_uid(),

  enable_warnings() {
    d_show_warnings.value = true;
  },

  // Calls .focus() on the underlying input/textarea element.
  // Options object:
  // - cursor_to_front: If true, will put the cursor at the beginning of the
  //   input text.
  // - select: If true, will highlight the input text.
  focus({cursor_to_front = false, select = false} = {}) {
    if (input.value === null) {
      return;
    }
    input.value.focus();

    if (cursor_to_front) {
      input.value.setSelectionRange(0, 0);
    }

    if (select) {
      input.value.select();
    }
  },

  is_valid: computed(() => d_is_valid.value),

  reset_warning_state() {
    d_show_warnings.value = false;
  },

  rerun_validators() {
    change_input(d_input_value.value);
  },
};

const debounced_enable_warnings = debounce(() => d_show_warnings.value = true, 500);

// Note: This assumes "value" provided will not throw exception when running props.to_string_fn
// Add ValidatedInput to list of inputs stored in parent ValidatedForm component
register(self);
update_and_validate(props.to_string_fn(props.value));
// We always want this event to fire on creation.
emit('input_validity_changed', self.is_valid.value);

onUnmounted(() => {
  unregister(self);
});

watch(() => props.value, (new_value) => {
  const str_value = props.to_string_fn(new_value);

  if (str_value !== d_input_value.value) {
    update_and_validate(str_value);
  }
});


function change_input(new_value: string) {
  // If the input is invalid, don't turn off warnings.
  if (self.is_valid.value) {
    d_show_warnings.value = false;
  }
  update_and_validate(new_value);
  debounced_enable_warnings();

  // Only if there are no errors should the value be emitted to the parent component
  if (d_error_msg.value === "") {
    const value: unknown = props.from_string_fn(d_input_value.value);
    emit('input', value);
  }
}

function update_and_validate(new_value: string) {
  d_input_value.value = new_value;
  let original_is_valid = self.is_valid.value;
  run_validators();
  if (original_is_valid !== self.is_valid.value) {
      emit('input_validity_changed', self.is_valid.value);
  }
}

function run_validators() {
  // Display error message of first validator that fails
  let is_valid = true;
  let error_msg = "";
  for (const validator of props.validators) {
    let response: ValidatorResponse = validator(d_input_value.value);

    if (!response.is_valid) {
      is_valid = false;
      error_msg = response.error_msg;
      break;
    }
  }

  d_is_valid.value = is_valid;
  d_error_msg.value = error_msg;
}

const show_errors = computed(() => {
  return d_error_msg.value !== '' && d_show_warnings.value;
});

function on_blur() {
  if (props.show_warnings_on_blur) {
    d_show_warnings.value = true;
  }
}

defineExpose({
  d_input_value,
  d_is_valid,
  d_error_msg,
  d_show_warnings,

  ...self,
});
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
