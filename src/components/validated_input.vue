<template>
  <div>
    <input id="input"
           :class="{error : errors.length > 0}"
           type="text"
           :value="input_value"
           @input="$e => _change_input($e.target.value)"/>
    <h4 id="invalid-input-header"
        v-if="!is_valid()"
        class="error-text">Invalid input!</h4>
    <ul>
      <li v-for="error of errors"
          class="error-message error-text">{{error}}</li>
    </ul>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  type ValidatorResponse = [boolean, string];
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

    input_value: string = "";
    errors: string[] = [];

    private _to_string_fn(value: unknown): string {
      return (this.to_string_fn !== undefined) ? this.to_string_fn(value)
        : default_to_string_func(value);
    }

    private _from_string_fn(value: string): unknown {
      return (this.from_string_fn !== undefined) ? this.from_string_fn(value)
        : default_from_string_func(value);
    }

    // Note: This assumes "value" is valid when passed as prop to this component
    mounted() {
      this.input_value = this._to_string_fn(this.value);
    }

    is_valid(): boolean {
      return this.errors.length === 0;
    }

    // Note: This assumes "value" is valid when updated
    @Watch('value')
    on_value_change(new_value: unknown, old_value: unknown) {
      this.input_value = this._to_string_fn(new_value);
    }

    private _change_input(new_value: string) {
      this.input_value = new_value;
      this._run_validators(new_value);

      if (this.errors.length === 0) {
        const value: unknown = this._from_string_fn(this.input_value);
        this.$emit('input', value);
      }
    }

    private _run_validators(new_value: string) {
      // Clear errors
      this.errors = [];

      for (let validator of this.validators) {
        let response: ValidatorResponse = validator(new_value);

        // If it did not pass, add error message to list of errors
        if (!response[0]) {
          this.errors.push(response[1]);
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .error {
    border: 2px solid $warning-red;
  }

  .error:focus {
    outline: none;
    box-shadow: 0 0 10px $warning-red;
    border: 2px solid $warning-red;
    border-radius: 1px;
  }

  .error-text {
    color: $warning-red;
  }

</style>
