<template>
  <div id="validated-input-component">
    <div>
      <input id="input"
             v-if="num_rows === 1"
             :style="input_style"
             class="input"
             :class="{
              'error-input' : input_style === '' && show_errors
             }"
             type="text"
             :value="d_input_value"
             :placeholder="placeholder"
             @blur="on_blur"
             @input="$e => change_input($e.target.value)"/>

      <textarea id="textarea"
                v-else
                :rows="num_rows"
                :style="input_style"
                class="input"
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
            <li id="error-text" class="error-li">{{d_error_msg}}</li>
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

  d_input_value: string = "";
  private d_is_valid: boolean = false;
  d_error_msg: string = "";
  d_show_warnings: boolean = false;

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

    // Add ValidatedInput to list of inputs stored in parent ValidatedForm component
    this.register(this);
    this.update_and_validate(this.to_string_fn(this.value));
    // We always want this event to fire on creation.
    this.$emit('input_validity_changed', this.is_valid);

    this.debounced_enable_warnings = debounce(() => this.d_show_warnings = true, 500);
  }

  invoke_focus() {
    let class_name = this.num_rows === 1 ? 'input' : 'textarea';
    (<HTMLInputElement> this.$el.getElementsByClassName(class_name)[0]).focus();
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

  private run_validators(new_value: string) {
    let original_is_valid = this.is_valid;
    this.d_is_valid = true;
    this.d_error_msg = "";

    // Display error message of first validator that fails
    for (const validator of this.validators) {
      let response: ValidatorResponse = validator(new_value);

      if (!response.is_valid) {
        this.d_is_valid = false;
        this.d_error_msg = response.error_msg;
        return;
      }
    }
  }

  private update_and_validate(new_value: string) {
    this.d_input_value = new_value;
    let original_is_valid = this.is_valid;
    this.run_validators(new_value);
    if (original_is_valid !== this.is_valid) {
        this.$emit('input_validity_changed', this.is_valid);
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

.error-ul {
  list-style-type: none; /* Remove bullets */
  padding-left: 0;
  margin-bottom: 0;
}

.error-li:first-child {
  margin-top: -10px;
  border-top-left-radius: .25rem;
  border-top-right-radius: .25rem;
}

.error-li:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: .25rem;
  border-bottom-left-radius: .25rem;
}

.error-ul .error-li {
  box-sizing: border-box;
  word-wrap: break-word;
  position: relative;
  padding: 10px 15px;
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
  border-radius: .25rem;
}

.input {
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  width: 100%;
  padding: .375rem .75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.input::placeholder {
  color: $stormy-gray-light;
}

#validated-input-component {
  position: relative;
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
