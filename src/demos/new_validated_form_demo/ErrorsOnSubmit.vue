<template>
  <new-validated-form
    @submit_invalid="has_submitted = true"
    @submit="handle_submit"
  >
    <p>
      Sometimes you'll have form inputs that start out invalid. Warnings for
      those fields will be enabled when the user changes the data. They can also
      be enabled by listening for the `submit_invalid` event from the form and
      using that to set the `force_show_errors` prop on the validated input
      component. The below input must be non-empty, and the initial error will
      be displayed after trying to submit with an empty value.
    </p>

    <validated-text-input
      v-model="empty_val"
      :validators="[make_min_length_validator(1)]"
      :force_show_errors="has_submitted"
    ></validated-text-input>

    <button type="submit" class="enabled">Submit</button>
  </new-validated-form>
</template>

<script setup lang="ts">
import { ref } from "vue";

import NewValidatedForm from "@/components/validated_input/NewValidatedForm.vue";
import ValidatedTextInput from "@/components/validated_input/ValidatedTextInput.vue";
import { make_min_length_validator } from "@/new_validators";

const empty_val = ref("");
const has_submitted = ref(false);

const handle_submit = () => alert("successfully submitted!");
</script>
