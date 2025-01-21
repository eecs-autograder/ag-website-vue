<template>
  <div>
    <div id="validated-text" style="padding: 10px;">
      <h1>Validated Text Input</h1>

      <div id="validated-text-1">
        <small>Validated Text 1</small>
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
          is_valid() result:
          <span style="font-weight: bold">{{is_valid_1}}</span>
        </p>
        <p>
          Last emitted value (Note: it will not be updated until inputted value
          is valid. Also note: warnings will show up if you click on the input
          and then click away without editing):
          <span style="font-weight: bold">{{val_1}}</span>
        </p>
      </div>
    </div>

    <div id="validated-int" style="padding: 10px;">
      <h1>Validated Int Input</h1>

      <div id="validated-int-1">
        <small>Validated Int 1</small>
        <hr />
        <p>
          The below input must be an even number of dollars in the range [6,
          24].
        </p>

        <validated-int-input
          v-model="val_2"
          :validators="[
            make_min_validator(6),
            make_max_validator(24),
            even_number
          ]"
          placeholder="Enter a number of dollars..."
          @validity_changed="(new_is_valid) => { is_valid_2 = new_is_valid; }"
        >
          <template v-slot:prefix> $ </template>
          <template v-slot:label> Cost </template>
        </validated-int-input>
        <p>
          is_valid() result:
          <span style="font-weight: bold">{{is_valid_2}}</span>
        </p>
        <p>
          Last emitted value:
          <span style="font-weight: bold">{{val_2}}</span>
        </p>
      </div>
    </div>

    <div id="validated-text-area" style="padding: 10px;">
      <h1>Validated Text Area</h1>

      <div id="validated-text-area-1">
        <small>Validated Text Area 1</small>
        <hr />
        <p>
          The below input must be at least 2 lines, and contain the words "Mario"
          or "Luigi" (case insensitive).
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
          is_valid() result:
          <span style="font-weight: bold">{{is_valid_3}}</span>
        </p>
        <p>
          Last emitted value:
          <span style="font-weight: bold">{{val_3}}</span>
        </p>
      </div>
    </div>

    <div id="validated-pair" style="padding: 10px;">
      <h1>Validating Multiple Inputs</h1>

      <div id="validated-pair-1">
        <small>Validated Pair 1</small>
        <hr />
        <p>
          The below pair of inputs must both be positive integers that sum to a
          number that is divisible by 4. Note that the custom component has a
          validator that forms a closure with the is_valid values of the two
          child ValidateIntInput components to produce it's own error if both
          operands are not valid. This would be necessary if this component were
          part of a ValidatedForm, because emitted events don't bubble.
          Alternatively, the component could listen for the validity_changed
          events of the child components and re-emit them without creating
          another validator.
        </p>

        <paired-inputs
          v-model="val_4"
          @validity_changed="(new_is_valid) => { is_valid_4 = new_is_valid; }"
        />
        <p>
          is_valid() result:
          <span style="font-weight: bold">{{is_valid_4}}</span>
        </p>
        <p>
          Last emitted value:
          <span style="font-weight: bold">{{val_4}}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import ValidatedTextInput, {
  TextInputValidator,
  make_min_length_validator,
  make_max_length_validator
} from '@/components/validated_input/ValidatedTextInput.vue';
import ValidatedIntInput, {
  IntInputValidator,
  make_min_validator,
  make_max_validator
} from "@/components/validated_input/ValidatedIntInput.vue";
import ValidatedTextAreaInput, {
  TextAreaInputValidator
} from "@/components/validated_input/ValidatedTextAreaInput.vue";
import PairedInputs from "./PairedInputs.vue";

/**** ValidatedTextInput demo ****/
const val_1 = ref("ab");
const is_valid_1 = ref(true);

const has_even_number_of_chars: TextInputValidator = (input: string) => {
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

const has_exclamation_point: TextInputValidator = (input: string) => {
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

const even_number: IntInputValidator = (input: number) => {
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

/*** PairedInput demo ****/
const val_3 = ref("");
const is_valid_3 = ref(true)

const has_luigi_or_mario: TextAreaInputValidator = (input: string) => {
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
const two_or_more_lines: TextAreaInputValidator = (input: string) => {
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
.scrollable {
  height: 10em;
  overflow-y: auto;
  border: solid;
}
</style>
