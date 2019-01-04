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

      <div id="hello">
        <h3>Validated Input 2</h3>
        <p>Has to be the string "mars"</p>
        <validated-input v-model="d_data.name" :validators="[(val) => {
                                                            return {
                                                              is_valid: val === 'mars',
                                                              error_msg: 'not mars'
                                                            }
                                                           }]"></validated-input>
      </div>

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
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

  @Component({
    components: { ValidatedForm, ValidatedInput }
  })
  export default class ValidatedFormDemo extends Vue {
    d_data = {
      id: 42,
      name: "mars"
    };
    d_form_is_valid = false;

    save_data() {
      console.log("saved!");
    }

    is_number(value: string): ValidatorResponse {
      return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg:  "Invalid number!",
      };
    }
  }
</script>

<style scoped lang="scss">
  .disabled {
    background-color: red;
  }

  .enabled {
    background-color: lightblue;
  }
</style>
