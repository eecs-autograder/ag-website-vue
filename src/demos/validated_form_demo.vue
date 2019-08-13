<template>
  <div style="padding: 10px;">
    <hr/>
    <h1>Validated Form</h1>
    <validated-form @submit="save_data" ref="form1"
                    @form_validity_changed="d_form_is_valid = $event">
      <h3>Validated Input 1</h3>
      <p>Has to be a number</p>
      <validated-input v-model="d_data.id"
                       :validators="[is_number]"
                       :from_string_fn="(val) => parseInt(val, 10)"></validated-input>

      <h3>Validated Input 2</h3>
      <p>Has to be the string "mars"</p>
      <validated-input v-model="d_data.name" :validators="[(val) => {
                                                          return {
                                                            is_valid: val === 'mars',
                                                            error_msg: 'not mars'
                                                          }
                                                         }]"></validated-input>

      <h3>Toggleable Validated Input</h3>
      <p>
        If you make this input invalid (not a number) and then toggle it away, it won't
        count towards the form's validity. <br>
        Note: When the input comes back, it should have its previously valid value still.
      </p>
      <toggle v-model="show_toggleable_input">
        <div slot="on">Show</div>
        <div slot="off">Hide</div>
      </toggle>
      <validated-input v-model="toggleable_input_value"
                       v-if="show_toggleable_input"
                       :validators="[is_number]"
                       :from_string_fn="(val) => parseInt(val, 10)"></validated-input>

      <p>
        The save button below is disabled (red) if any of the above inputs are invalid.
        Otherwise, it is enabled (blue).
      </p>
      <button type="submit"
              :disabled="!d_form_is_valid"
              :class="{
                disabled: !d_form_is_valid,
                enabled: d_form_is_valid
              }">Save</button>
      <h3>Validated Form is_valid status: {{d_form_is_valid}}</h3>
      <br/><br/>
    </validated-form>

    <h2>Errors display on submit</h2>
    <validated-form>
      <p>
        Sometimes you'll have form inputs that start out invalid.
        Warnings for those fields will be enabled when the user changes the
        data or tries to submit the form.
      </p>

      <validated-input v-model="d_empty_val"
                       :validators="[is_not_empty]"></validated-input>

      <button type="submit" class="enabled">Submit</button>
    </validated-form>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import Toggle from '@/components/toggle.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

  @Component({
    components: { Toggle, ValidatedForm, ValidatedInput }
  })
  export default class ValidatedFormDemo extends Vue {
    d_data = {
      id: 42,
      name: "mars"
    };
    d_form_is_valid = false;

    d_empty_val = '';

    save_data() {
      console.log("saved!");
    }

    is_number(value: string): ValidatorResponse {
      return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg:  "Invalid number!",
      };
    }

    is_not_empty(value: string): ValidatorResponse {
      return {
        is_valid: value !== '',
        error_msg: "This field is required!"
      };
    }

    toggleable_input_value = 42;
    show_toggleable_input = true;
  }
</script>

<style scoped lang="scss">
  .disabled {
    background-color: red;
  }

  .enabled {
    background-color: lightblue;
  }

  .enabled, .disabled {
    margin-top: 5px;
  }
</style>
