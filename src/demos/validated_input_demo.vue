<template>
  <div style="padding: 10px;">
    Validated Input #1
    <hr/>
    <h1>Validated Input (number)</h1>
    <small>The below input must be a negative, even integer</small>
    <br/><br/>
    <validated-input ref='input_1'
                     v-model="number_input"
                     :validators="[is_number, is_negative, is_even]"
                     :from_string_fn="(val) => parseInt(val, 10)"
                     placeholder="Enter a negative, even integer"
                     @input_validity_changed="validated_input_1_valid = $event"
                     :show_warnings_on_blur="true"></validated-input>

    <p>
      is_valid() result:
      <span style="font-weight: bold">{{validated_input_1_valid}}</span>
    </p>

    <p>
      Last emitted value (Note: it will not be updated until inputted value is valid. Also note:
      warnings will show up if you click on the input and then click away without editing):
      <span style="font-weight: bold">{{number_input}}</span>
    </p>

    <br/><br/><br/>

    <!--Validated Input #2-->
    <hr/>
    <h1>Validated Input (custom object)</h1>
    <small>
      The below input must be a valid JSON object, with exaclty one field called "field1",
      whose value must be a number.
      <strong>Notice the custom (although slightly terrible) input style!</strong>
    </small>
    <br/><br/>
    <validated-input ref='validated_input_2'
                     v-model="custom_obj_input"
                     input_style="background-color: lightblue; color: green;"
                     :validators="[obj_is_json, obj_has_only_field1_and_val_is_a_number]"
                     :from_string_fn="string_to_obj"
                     :to_string_fn="obj_to_string"></validated-input>
    <br/>
    <small>
      Same one as above except input_style is an object
    </small>
    <br/>
    <validated-input ref='validated_input_2'
                     v-model="custom_obj_input"
                     :input_style="obj_input_style"
                     :validators="[obj_is_json, obj_has_only_field1_and_val_is_a_number]"
                     :from_string_fn="string_to_obj"
                     :to_string_fn="obj_to_string"></validated-input>
    <p>
      Parent does not track the is_valid() result for this component
    </p>

    <p>
      Last emitted value (note: it will not be updated until inputted value is valid):
      <span style="font-weight: bold">{{custom_obj_input}}</span>
    </p>

    <br/><br/><br/>

    Validated Input #3
    <hr/>
    <h1>Validated Input (string)</h1>
    <small>
      The below string must be either "mario" or "luigi" (case insensitive).
      <strong>Notice that it uses custom error message styling!</strong>
    </small>
    <br/><br/>
    <validated-input ref='validated_input_3'
                     v-model="mario_character_input"
                     :validators="[is_mario_or_luigi]"
                     @input_validity_changed="validated_input_3_valid = $event">

      <!--Adding custom error message styling-->
      <template slot-scope="{d_error_msg}">
        <div style="height: 20px; background-color: lightblue">
          {{d_error_msg}}
        </div>
      </template>
    </validated-input>

    <p>
      is_valid() result:
      <span style="font-weight: bold">{{validated_input_3_valid}}</span>
    </p>

    <p>
      Last emitted value (note: it will not be updated until inputted value is valid):
      <input type="text" v-model="mario_character_input"/>
    </p>

    <br/><br/><br/>

    Validated Input #4
    <hr/>
    <h1>Validated Input (textarea)</h1>
    <small>
      The below input must contain > 30 characters and a new line character
    </small>
    <br/><br/>
    <validated-input ref='validated_input_4'
                     v-model="textarea_input"
                     num_rows="3"
                     placeholder="Response must contain > 30 characters and a new line character"
                     :validators="[is_30_chars_or_longer, has_newline_char]"
                     @input_validity_changed="validated_input_4_valid = $event"></validated-input>

    <p>
      is_valid() result:
      <span style="font-weight: bold">{{validated_input_4_valid}}</span>
    </p>

    <p>
      Last emitted value (note: it will not be updated until inputted value is valid):
      <textarea rows="3" v-model="textarea_input"/>
    </p>

    <br/><br/>
    <hr>
    <p><b>The below input uses the suffix slot.</b></p>

    <div class="my-label"> Enter a number from 1 to 10:</div>
    <div class="constrict">
      <validated-input ref='input_5'
                       v-model="number_input_2"
                       :num_rows="1"
                       input_style="width: 450px;"
                       :validators="[is_number, is_in_range_1_to_10]">
        <div slot="suffix" class="suffix-element"> books </div>
      </validated-input>
    </div>
    <br> <br><br> <br><br> <br>
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
  number_input_2: number = 2;
  custom_obj_input: object = {
    field1: 12,
  };
  mario_character_input: string = "mario";
  textarea_input: string = "";
  obj_input_style = {
    "background-color": "lightblue",
    "color": "green"
  };

  validated_input_1_valid = false;
  validated_input_3_valid = false;
  validated_input_4_valid = false;

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
    };
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
    };
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

  /* Validated textarea functions */
  is_30_chars_or_longer(value: string): ValidatorResponse {
    return {
      is_valid: value.length >= 30,
      error_msg: "Input must contain 30 characters or more"
    };
  }

  has_newline_char(value: string): ValidatorResponse {
    return {
      is_valid: (value.match(/\n/g) !== null) && (value.match(/\n/g))!.length > 0,
      error_msg: "No newline character found"
    };
  }

  is_in_range_1_to_10(value: string): ValidatorResponse {
    return {
      is_valid: this.is_number(value).is_valid
                && parseInt(value, 10) <= 10
                && parseInt(value, 10) >= 1,
      error_msg: "Please enter a number 1 to 10"
    };
  }
}
</script>

<style scoped lang="scss">

.my-label {
  display: block;
  padding-bottom: 8px;
  font-size: 16px;
  color: black;
}

.constrict {
  height: 50px;
  display: inline-block;
  position: relative;
}

.suffix-element {
  display: inline-block;
  vertical-align: top;
  width: 300px;
  background-color: pink;
  padding-top: 10px;
  padding-left: 10px;
}

</style>
