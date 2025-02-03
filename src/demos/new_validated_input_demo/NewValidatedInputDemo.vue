<template>
  <div>
    <div id="validated-text" class="demo">
      <h1>Validated Text Input</h1>

      <div id="validated-text-1">
        <hr />
        <p>
          The below input must have an even number of characters, contain an
          exclamation point (!), and have a length in the range [4, 10].
        </p>

        <validated-text-input
          v-model="val_1"
          :validators="[
            has_even_number_of_chars,
            has_exclamation_point,
            make_min_length_validator(4),
            make_max_length_validator(10)
          ]"
          placeholder="Enter text..."
          @validity_changed="(new_is_valid) => { is_valid_1 = new_is_valid; }"
        >
          <template v-slot:label> Input </template>
        </validated-text-input>

        <p>
          Last emitted validity:
          <span
            ><strong>{{is_valid_1}}</strong></span
          >
        </p>
        <p>
          Last emitted value (Note: it will not be updated until inputted value
          is valid. Also note: warnings will show up if you click on the input
          and then click away without editing):
          <span
            ><strong>{{val_1}}</strong></span
          >
        </p>
      </div>
    </div>

    <div id="validated-int" class="demo">
      <h1>Validated Int Input</h1>

      <div id="validated-int-1">
        <hr />
        <p>
          The below input must be an even number of dollars in the range [6,
          24]. Note the use of the prefix and postfix slots, along with the
          custom styling.
        </p>

        <validated-int-input
          v-model="val_2"
          :input_style="{flex: '0', minWidth: '4em', textAlign: 'right'}"
          :validators="[
            make_min_validator(6),
            make_max_validator(24),
            even_number
          ]"
          @validity_changed="(new_is_valid) => { is_valid_2 = new_is_valid; }"
        >
          <template v-slot:prefix> $ </template>
          <template v-slot:suffix> .00 </template>
          <template v-slot:label> Cost </template>
        </validated-int-input>
        <p>
          Last emitted validity:
          <span
            ><strong>{{is_valid_2}}</strong></span
          >
        </p>
        <p>
          Last emitted value:
          <span
            ><strong>{{val_2}}</strong></span
          >
        </p>
      </div>
    </div>

    <div id="validated-text-area" class="demo">
      <h1>Validated Text Area</h1>

      <div id="validated-text-area-1">
        <hr />
        <p>
          The below input must be at least 2 lines, and contain the words
          "Mario" or "Luigi" (case insensitive).
        </p>

        <validated-text-area-input
          v-model="val_3"
          :num_rows="2"
          :validators="[
            two_or_more_lines,
            has_luigi_or_mario
          ]"
          placeholder="Write a story about Mario or Luigi..."
          @validity_changed="(new_is_valid) => { is_valid_3 = new_is_valid; }"
        >
          <template v-slot:label> Text Area </template>
        </validated-text-area-input>
        <p>
          Last emitted validity:
          <span
            ><strong>{{is_valid_3}}</strong></span
          >
        </p>
        <p>
          Last emitted value:
          <span
            ><strong>{{val_3}}</strong></span
          >
        </p>
      </div>
    </div>

    <div id="validated-pair" class="demo">
      <h1>Custom Validated Pair Input</h1>

      <div id="validated-pair-1">
        <hr />
        <p>
          The below pair of inputs must both be positive integers that sum to a
          number that is divisible by 4. Note that each input will individually
          display an error if the value is not a positive integer, and the pair
          of inputs shows an error if the sum is not divisibly by 4.
        </p>
        <p>
          Note: the change in validity is <strong>only</strong> emitted when the
          validity of the <strong>PairedInputs</strong> component changes.
          Because the ValidatedIntInput components only update the input value
          when they are valid, changing the inputs to something valid (i.e. 4 +
          4) to something where one operand is invalid (i.e. A + 4) will not
          change the last emitted validity shown below. This
          <strong>does not</strong>
          affect how nested validated input components behave when used inside a
          NewValidatedForm component, because that mechanism for tracking
          validity does not rely on emitted events.
        </p>

        <paired-inputs
          v-model="val_4"
          @validity_changed="(new_is_valid) => { is_valid_4 = new_is_valid; }"
        />
        <p>
          Last emitted pair validity:
          <span
            ><strong>{{is_valid_4}}</strong></span
          >
        </p>
        <p>
          Last emitted value:
          <span
            ><strong>{{val_4}}</strong></span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, CSSProperties } from "vue";

import ValidatedTextInput from '@/components/validated_input/ValidatedTextInput.vue';
import ValidatedIntInput from "@/components/validated_input/ValidatedIntInput.vue";
import ValidatedTextAreaInput from "@/components/validated_input/ValidatedTextAreaInput.vue";
import {
  make_min_validator,
  make_max_validator,
  make_max_length_validator,
  make_min_length_validator,
  TextValidator,
  NumberValidator,
} from "@/new_validators";
import PairedInputs from "./PairedInputs.vue";

/**** ValidatedTextInput demo ****/
const val_1 = ref("ab");
const is_valid_1 = ref(true);

const has_even_number_of_chars: TextValidator = (input: string) => {
  if (input.length % 2 === 0) {
    return { is_valid: true }
  }
  else {
    return {
      is_valid: false,
      error_msg: 'Input must contain an even number of characters'
    }
  }
}

const has_exclamation_point: TextValidator = (input: string) => {
  if (input.includes('!')) {
    return { is_valid: true }
  }
  else {
    return {
      is_valid: false,
      error_msg: 'Input must contain an exclamation point (!)'
    }
  }
}

/**** ValidatedNumberInput demo ****/
const val_2 = ref(0);
const is_valid_2 = ref(true);

const even_number: NumberValidator = (input: number) => {
  if (input % 2 == 0) {
    return { is_valid: true };
  }
  else {
    return {
      is_valid: false,
      error_msg: 'Input must be an even number'
    };
  }
}

/*** ValidatedTextArea demo ****/
const val_3 = ref("");
const is_valid_3 = ref(true)

const has_luigi_or_mario: TextValidator = (input: string) => {
  const text = input.toLowerCase();
  if (!(text.includes('luigi') || text.includes('mario'))) {
    return {
      is_valid: false,
      error_msg: 'Does not contain Mario or Luigi. Proposterous!'
    }
  }
  else {
    return {
      is_valid: true
    }
  }
}
const two_or_more_lines: TextValidator = (input: string) => {
  const num_lines = input.split('\n');
  if (num_lines.length >= 2) {
    return { is_valid: true };
  }
  else {
    return {
      is_valid: false,
      error_msg: "Input must two or more lines"
    }
  }
}

/*** PairedInput demo ****/
const val_4 = ref();
const is_valid_4 = ref();
</script>

<style scoped lang="scss">
.demo {
  padding: 10px;
}
</style>
