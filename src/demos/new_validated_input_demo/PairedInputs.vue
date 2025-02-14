<template>
  <!-- This is a minimal component just to demo how multiple
    inputs can be validated independently as well as together -->
  <div class="paired-inputs-component">
    Sum input:
    <div style="border: solid 1px; padding: 10px; display: flex">
      <validated-int-input
        v-model="first"
        :validators="[make_min_validator(1)]"
        style="padding-right: 5px"
      >
        <template v-slot:label>First operand</template>
      </validated-int-input>
      <validated-int-input
        v-model="second"
        :validators="[make_min_validator(1)]"
      >
        <template v-slot:prefix>+</template>
        <template v-slot:label>Second operand</template>
      </validated-int-input>
    </div>
    <input-errors :errors="errors" visible></input-errors>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import ValidatedIntInput from "@/components/validated_input/ValidatedIntInput.vue";
import InputErrors from "@/components/validated_input/InputErrors.vue";
import { make_min_validator } from "@/new_validators";
import {
  use_validation,
  ValidatorFuncType,
  ParserFuncType,
} from "@/composables/use_validation";

type NumberPair = {
  first: number;
  second: number;
};

const first = ref<number>(1);
const second = ref<number>(1);
const pair = computed<NumberPair>(() => ({
  first: first.value,
  second: second.value,
}));

type EmitTypes = {
  (e: "validity_changed", value: boolean): void;
  (e: "input", value: number): void;
};
const emit = defineEmits<EmitTypes>();

const parser: ParserFuncType<NumberPair, number> = (value: NumberPair) => {
  return {
    is_valid: true,
    output: value.first + value.second,
  };
};

const is_div_by_4_validator: ValidatorFuncType<number> = (value: number) => {
  if (value % 4 === 0) {
    return { is_valid: true };
  } else {
    return {
      is_valid: false,
      error_msg: "The sum of the operands must be divisble by 4",
    };
  }
};

const { errors } = use_validation<NumberPair, number>({
  input: pair,
  validators: [is_div_by_4_validator],
  emit,
  parser,
});
</script>
