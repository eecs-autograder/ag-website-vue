<template>
  <div style="padding: 10px;">
    <!--Validated Input #1-->
    <hr/>
    <h1>Validated Input (number)</h1>
    <small>The below input must be a negative, even integer</small>
    <br/><br/>
    <validated-input ref='vinput_1'
                     v-model="number_input"
                     :validators="[is_number, is_negative, is_even]"
                     :from_string_fn="(val) => parseInt(val, 10)"></validated-input>

    <p>
      is_valid() result:
      <span style="font-weight: bold">{{loading || this.$refs.vinput_1.is_valid()}}</span>
    </p>

    <p>
      Last emitted value (note: it will not be updated until inputted value is valid):
      <span style="font-weight: bold">{{number_input}}</span>
    </p>

    <br/><br/><br/>

    <!--Validated Input #2-->
    <hr/>
    <h1>Validated Input (custom object)</h1>
    <small>
      The below input must be a valid JSON object, with exaclty one field called "field1",
      whose value must be a number.
    </small>
    <br/><br/>
    <validated-input ref='vinput_2'
                     v-model="custom_obj_input"
                     :validators="[obj_is_json, obj_has_only_field1_and_val_is_a_number]"
                     :from_string_fn="string_to_obj"
                     :to_string_fn="obj_to_string"></validated-input>

    <p>
      is_valid() result:
      <span style="font-weight: bold">{{loading || this.$refs.vinput_2.is_valid()}}</span>
    </p>

    <p>
      Last emitted value (note: it will not be updated until inputted value is valid):
      <span style="font-weight: bold">{{custom_obj_input}}</span>
    </p>

    <br/><br/><br/>

    <!--Validated Input #3-->
    <hr/>
    <h1>Validated Input (string)</h1>
    <small>The below string must be either "mario" or "luigi" (case insensitive)</small>
    <br/><br/>
    <validated-input ref='vinput_3'
                     v-model="mario_character_input"
                     :validators="[is_mario_or_luigi]"/>

    <p>
      is_valid() result:
      <span style="font-weight: bold">{{loading || this.$refs.vinput_3.is_valid()}}</span>
    </p>

    <p>
      Last emitted value (note: it will not be updated until inputted value is valid):
      <input type="text" v-model="mario_character_input"/>
    </p>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

  @Component({
    components: { ValidatedInput }
  })
  export default class ValidatedInputDemo extends Vue {
    number_input: number = 12;
    custom_obj_input: object = {
      field1: 12,
    };
    mario_character_input: string = "mario";

    loading: boolean = true;

    /* Validated number functions */
    is_number(value: string): ValidatorResponse {
      return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg:  "Invalid number!",
      };
    }

    is_negative(value: string): ValidatorResponse {
      return {
        is_valid: this.is_number(value).is_valid && value[0] === "-",
        error_msg: "Not negative!",
      };
    }

    is_even(value: string): ValidatorResponse {
      return {
        is_valid: this.is_number(value).is_valid &&             // Check if valid number
                  parseFloat(value) === parseInt(value, 10) &&  // Check if integer
                  parseInt(value, 10) % 2 === 0,                // Check if even
        error_msg: "Not even!"
      }
    }

    /* Validated object functions */
    obj_has_only_field1_and_val_is_a_number(str_obj: string): ValidatorResponse {
      const error_msg = "field1 does not exist, or is not the only field, " +
        "or value of field1 is not a number";

      let is_valid = false;

      if (this.obj_is_json(str_obj).is_valid) {
        let json = JSON.parse(str_obj);
        let keys = Object.keys(json);

        if (keys.length === 1 && keys[0] === "field1" && this.is_number(json[keys[0]]).is_valid) {
          is_valid = true;
        }
      }

      return {
        is_valid: is_valid,
        error_msg: error_msg
      }
    }

    obj_is_json(str_obj: string): ValidatorResponse {
      const error_msg = "Not valid object (JSON) syntax!";

      try {
        JSON.parse(str_obj);    // Will fail if not valid JSON
        return { is_valid: true, error_msg: error_msg };
      }
      catch (e) {
        return { is_valid: false, error_msg: error_msg };
      }
    }

    obj_to_string(obj: object): string {
      return JSON.stringify(obj);
    }

    string_to_obj(str_obj: string): object {
      return JSON.parse(str_obj);
    }

    is_mario_or_luigi(value: string): ValidatorResponse {
      value = value.toLowerCase();

      return {
        is_valid: value === "mario" || value === "luigi",
        error_msg: "Not Mario or Luigi! Proposterous!"
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
</style>
