<template>
  <new-validated-form
    @submit="save_data"
    ref="form1"
    @validity_changed="is_valid = $event"
  >
    <h3>Validated Input 1</h3>
    <p>Has to be a number</p>
    <validated-int-input
      v-model="number_input"
      :validators="[]"
    ></validated-int-input>

    <h3>Validated Input 2</h3>
    <p>Has to be the string "mars"</p>
    <validated-text-input
      v-model="text_input"
      :validators="[is_mars]"
    ></validated-text-input>

    <h3>Toggleable Validated Input</h3>
    <p>
      If you make this input invalid (not a number) and then toggle it away, it
      won't count towards the form's validity. <br />
      Note: When the input comes back, it should have its previously valid value
      still.
    </p>
    <toggle v-model="show_toggleable_input">
      <div slot="on">Show</div>
      <div slot="off">Hide</div>
    </toggle>
    <validated-int-input
      v-model="toggleable_input_value"
      v-if="show_toggleable_input"
      :validators="[]"
    ></validated-int-input>

    <p>
      The save button below is disabled (red) if any of the above inputs are
      invalid. Otherwise, it is enabled (blue).
    </p>
    <button
      type="submit"
      :disabled="!is_valid"
      :class="{
                disabled: !is_valid,
                enabled: is_valid
              }"
    >
      Save
    </button>
    <h3>Validated Form is_valid status: {{is_valid}}</h3>
    <br /><br />
  </new-validated-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ValidatedIntInput from '@/components/validated_input/ValidatedIntInput.vue';
import ValidatedTextInput, { TextInputValidator } from '@/components/validated_input/ValidatedTextInput.vue';
import NewValidatedForm from '@/components/validated_input/NewValidatedForm.vue';
import Toggle from '@/components/toggle.vue';

const number_input = ref(42);
const text_input = ref('mars');
const toggleable_input_value = ref(42);
const show_toggleable_input = ref(true);


const is_valid = ref(false);
const is_mars: TextInputValidator = (value) => {
  const is_valid = value === 'mars';
  if (is_valid) {
    return { is_valid };
  } else {
    return { is_valid, error_msg: 'not mars' };
  }
}

const save_data = () => alert('succesfully saved!');
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
