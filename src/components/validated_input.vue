<template>
  <div class="validated-input-component">
    <div class="validated-input-wrapper">
      <slot name="prefix"> </slot>
      <input class="input"
             :data-testid="testid"
             v-if="num_rows === 1"
             :style="input_style"
             :class="{
              'error-input' : input_style === '' && show_errors
             }"
             type="text"
             :value="d_input_value"
             :placeholder="placeholder"
             @blur="on_blur"
             @input="$e => change_input($e.target.value)"/>

      <textarea v-else
                :rows="num_rows"
                :style="input_style"
                class="input"
                :data-testid="testid"
                :class="{
                 'error-input' : input_style === '' && show_errors
                }"
                :value="d_input_value"
                :placeholder="placeholder"
                @blur="on_blur"
                @input="$e => change_input($e.target.value)"></textarea>
      <slot name="suffix"> </slot>
    </div>
    <transition name="fade">
      <slot :d_error_msg="d_error_msg" v-if="show_errors">
        <ul class="error-ul">
            <li class="error-text error-li"
                :data-testid="error_testid">
              {{d_error_msg}}
            </li>
        </ul>
      </slot>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { debounce } from 'lodash';

import { Created, Destroyed } from "@/lifecycle";

export interface ValidatorResponse {
  is_valid: boolean;
  error_msg: string;
}

type ValidatorFuncType = (value: string) => ValidatorResponse;
type FromStringFuncType = (value: string) => unknown;
type ToStringFuncType = (value: unknown) => string;

function default_to_string_func(value: unknown): string {
  return "" + value;
}

function default_from_string_func(value: string): unknown {
  return value;
}

function do_nothing(...args: unknown[]): void {}

@Component
export default class ValidatedInput extends Vue implements Created, Destroyed {
  @Inject({from: 'register', default: () => do_nothing})
  register!: (input: ValidatedInput) => void;

  @Inject({from: 'unregister', default: () => do_nothing})
  unregister!: (input: ValidatedInput) => void;

  @Prop({required: true})
  value!: unknown;

  @Prop({required: true, type: Array})
  validators!: ValidatorFuncType[];

  @Prop({required: false, default: () => default_to_string_func})
  to_string_fn!: ToStringFuncType;

  @Prop({required: false, default: () => default_from_string_func})
  from_string_fn!: FromStringFuncType;

  @Prop({required: false, default: 1})
  num_rows!: number;

  @Prop({required: false, default: ""})
  input_style!: string | object;

  @Prop({required: false, type: String})
  placeholder!: string;

  @Prop({default: false})
  show_warnings_on_blur!: boolean;

  @Prop({required: false, default: "input"})
  testid!: string;

  d_input_value: string = "";
  private d_is_valid: boolean = false;
  d_error_msg: string = "";
  d_show_warnings: boolean = false;

  private error_testid: string = "";

  private debounced_enable_warnings!: (...args: unknown[]) => unknown;

  // We need a way to uniquely identify validated inputs for registering and unregistering
  // them with validated forms.
  private static _NEXT_UID = 1;
  get uid() {
    return this.input_uid;
  }
  private input_uid!: number;

  // Note: This assumes "value" provided will not throw exception when running this.to_string_fn
  created() {
    this.input_uid = ValidatedInput._NEXT_UID++;

    this.error_testid = `${this.testid}-error`;

    // Add ValidatedInput to list of inputs stored in parent ValidatedForm component
    this.register(this);
    this.update_and_validate(this.to_string_fn(this.value));
    // We always want this event to fire on creation.
    this.$emit('input_validity_changed', this.is_valid);

    this.debounced_enable_warnings = debounce(() => this.d_show_warnings = true, 500);
  }

  enable_warnings() {
    this.d_show_warnings = true;
  }

  // Calls .focus() on the underlying input/textarea element.
  // Options object:
  // - cursor_to_front: If true, will put the cursor at the beginning of the
  //   input text.
  // - select: If true, will highlight the input text.
  focus({cursor_to_front = false, select = false} = {}) {
    let class_name = this.num_rows === 1 ? 'input' : 'textarea';
    let element = <HTMLInputElement> this.$el.getElementsByClassName(class_name)[0];
    element.focus();

    if (cursor_to_front) {
      element.setSelectionRange(0, 0);
    }

    if (select) {
      element.select();
    }
  }

  destroyed() {
    this.unregister(this);
  }

  get is_valid(): boolean {
    return this.d_is_valid;
  }

  reset_warning_state() {
    this.d_show_warnings = false;
  }

  // Note: This assumes "value" provided will not throw exception when running this.to_string_fn
  @Watch('value')
  on_value_change(new_value: unknown, old_value: unknown) {
    const str_value = this.to_string_fn(new_value);

    if (str_value !== this.d_input_value) {
      this.update_and_validate(str_value);
    }
  }

  rerun_validators() {
    this.change_input(this.d_input_value);
  }

  private change_input(new_value: string) {
    // If the input is invalid, don't turn off warnings.
    if (this.is_valid) {
      this.d_show_warnings = false;
    }
    this.update_and_validate(new_value);
    this.debounced_enable_warnings();

    // Only if there are no errors should the value be emitted to the parent component
    if (this.d_error_msg === "") {
      const value: unknown = this.from_string_fn(this.d_input_value);
      this.$emit('input', value);
    }
  }

  private update_and_validate(new_value: string) {
    this.d_input_value = new_value;
    let original_is_valid = this.is_valid;
    this.run_validators();
    if (original_is_valid !== this.is_valid) {
        this.$emit('input_validity_changed', this.is_valid);
    }
  }

  private run_validators() {
    let original_is_valid = this.is_valid;
    this.d_is_valid = true;
    this.d_error_msg = "";

    // Display error message of first validator that fails
    for (const validator of this.validators) {
      let response: ValidatorResponse = validator(this.d_input_value);

      if (!response.is_valid) {
        this.d_is_valid = false;
        this.d_error_msg = response.error_msg;
        return;
      }
    }
  }

  private get show_errors(): boolean {
    return this.d_error_msg !== '' && this.d_show_warnings;
  }

  private on_blur() {
    if (this.show_warnings_on_blur) {
      this.d_show_warnings = true;
    }
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
