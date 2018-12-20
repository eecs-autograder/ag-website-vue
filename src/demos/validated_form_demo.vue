<template>
  <div style="padding: 10px;">
    <hr/>
    <h1>Validated Form</h1>
    <validated-form @submit="save_data" ref="form1">
      <h3>Validated Input 1</h3>
      <p>Has to be a number</p>
      <validated-input v-model="data.id"
                       :validators="[is_number]"
                       :from_string_fn="(val) => parseInt(val, 10)"></validated-input>

      <div id="hello">
        <h3>Validated Input 2</h3>
        <p>Has to be the string "mars"</p>
        <validated-input v-model="data.name" :validators="[(val) => {
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
              :disabled="loading || !$refs.form1.is_valid"
              :class="{
                disabled: loading || !$refs.form1.is_valid,
                enabled: loading || $refs.form1.is_valid
              }">Save</button>
      <h3>Validated Form is_valid status: {{loading || this.$refs.form1.is_valid}}</h3>
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
    data = {
      id: 42,
      name: "Waaaaaaluigi"
    };

    loading = true;

    save_data() {
      console.log("saved!");
    }

    is_number(value: string): ValidatorResponse {
      return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg:  "Invalid number!",
      };
    }

    mounted() {
      /*
       * The loading variable is necessary in order to display the value of
       * this.$refs.my_input.is_valid() on render.

       * For more info, see notice at end of section
       * "Accessing Child Component Instances & Child Elements" at
       * https://vuejs.org/v2/guide/components-edge-cases.html
       */
      this.loading = false;
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
