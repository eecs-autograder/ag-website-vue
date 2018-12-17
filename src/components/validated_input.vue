<template>
  <div>
    <input class="input"
           :class="{'error-input' : d_error_msg !== ''}"
           type="text"
           :value="d_input_value"
           @input="$e => _change_input($e.target.value)"/>

    <ul v-if="d_error_msg !== ''" class="error-ul">
      <li class="error-li error-text">{{d_error_msg}}</li>
    </ul>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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

  @Component
  export default class ValidatedInput extends Vue {
    @Prop({required: true})
    value!: unknown;

    @Prop({required: true, type: Array})
    validators!: ValidatorFuncType[];

    @Prop({required: false})
    to_string_fn!: ToStringFuncType;

    @Prop({required: false})
    from_string_fn!: FromStringFuncType;

    d_input_value: string = "";
    d_error_msg: string = "";

    private _to_string_fn(value: unknown): string {
      return (this.to_string_fn !== undefined) ? this.to_string_fn(value)
        : default_to_string_func(value);
    }

    private _from_string_fn(value: string): unknown {
      return (this.from_string_fn !== undefined) ? this.from_string_fn(value)
        : default_from_string_func(value);
    }

    // Note: This assumes "value" provided will not throw exception when running _to_string_fn
    mounted() {
      this._update_and_validate(this._to_string_fn(this.value));
    }

    is_valid(): boolean {
      return this.d_error_msg === "";
    }

    // Note: This assumes "value" provided will not throw exception when running _to_string_fn
    @Watch('value')
    on_value_change(new_value: unknown, old_value: unknown) {
      this._update_and_validate(this._to_string_fn(new_value));
    }

    private _change_input(new_value: string) {
      this._update_and_validate(new_value);

      // Only if there are no errors should the value be emitted to the parent component
      if (this.d_error_msg === "") {
        const value: unknown = this._from_string_fn(this.d_input_value);
        this.$emit('input', value);
      }
    }

    private _run_validators(new_value: string) {
      // Clear d_error_msg
      this.d_error_msg = "";

      // Display error message of first validator that fails
      for (let validator of this.validators) {
        let response: ValidatorResponse = validator(new_value);

        if (!response.is_valid) {
          this.d_error_msg = response.error_msg;
          return;
        }
      }
    }

    private _update_and_validate(new_value: string) {
      this.d_input_value = new_value;
      this._run_validators(new_value);
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .error-ul {
    list-style-type: none; /* Remove bullets */
    padding-left: 0;
    margin-bottom: 20px;
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
    position: relative;
    display: block;
    width: 100%;
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
    position: relative;
    display: block;
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

  /*.error-text {
    color: $warning-red;
  }*/

  /*.alert-danger {*/
    /*color: #721c24;*/
    /*background-color: #f8d7da;*/
    /*border-color: #f5c6cb;*/
  /*}*/

</style>
