<template>
  <div class="unlocked-hint">
    <div class="hint-wrapper">
      <div class="hint-title">
        Hint {{ hint.hint_number + 1 }} for {{ display_mutant_name(hint) }}
      </div>
      <div class="hint-text">{{ hint.hint_text }}</div>
    </div>

    <form v-if="hint.hint_rating === null" class="feedback-form">
      <div class="feedback-prompt">Help us improve. Was this hint useful?</div>

      <div class="option-container">
        <div class="radio-container">
          <input
            type="radio"
            name="hint_rating"
            class="radio"
            v-model="d_hint_rating"
            :value="3"
            :id="`very-useful-${d_radio_button_uid}`"
          />
          <label class="label" :for="`very-useful-${d_radio_button_uid}`">
            Very useful
          </label>
        </div>

        <div class="radio-container">
          <input
            type="radio"
            name="hint_rating"
            class="radio"
            v-model="d_hint_rating"
            :value="2"
            :id="`somewhat-useful-${d_radio_button_uid}`"
          />
          <label class="label" :for="`somewhat-useful-${d_radio_button_uid}`">
            Somewhat useful
          </label>
        </div>

        <div class="radio-container">
          <input
            type="radio"
            name="hint_rating"
            class="radio"
            v-model="d_hint_rating"
            :value="1"
            :id="`not-useful-${d_radio_button_uid}`"
          />
          <label class="label" :for="`not-useful-${d_radio_button_uid}`">
            Not useful
          </label>
        </div>
      </div>

      <div class="comment-box">
        <div>Any comments?</div>
        <textarea
          v-model="d_user_comment"
          cols="30"
          rows="2"
          class="input"
        ></textarea>
      </div>

      <button
        class="green-button rate-hint-button"
        @click="rate_hint"
        :disabled="d_saving || d_hint_rating === null"
      >
        Send feedback
      </button>
    </form>
    <APIErrors ref="api_errors"></APIErrors>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import APIErrors from "@/components/api_errors.vue";
import { APIErrorsExposed } from "@/exposed_component_types/api_errors_exposed";
import { assert_not_null, generate_uid, new_toggle } from "@/utils";
import {
  display_mutant_name,
  MutantHintService,
  UnlockedHintData,
} from "./mutant_hint_service";

const props = defineProps<{
  hint: UnlockedHintData;
}>();

const api_errors = ref<APIErrorsExposed>();

const d_hint_rating = ref<number | null>(null);
const d_user_comment = ref("");
const d_saving = ref(false);

const d_radio_button_uid = generate_uid();

watch(
  () => props.hint,
  (new_value: UnlockedHintData) => {
    d_hint_rating.value = new_value.hint_rating;
    d_user_comment.value = new_value.user_comment;
  },
  { deep: true },
);

async function rate_hint() {
  return new_toggle(d_saving, async () => {
    assert_not_null(d_hint_rating.value);
    api_errors.value?.clear();
    try {
      await MutantHintService.rate_hint(props.hint.pk, {
        hint_rating: d_hint_rating.value,
        user_comment: d_user_comment.value,
      });
    } catch (error: unknown) {
      api_errors.value?.show_errors_from_response(error);
    }
  });
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/forms.scss";
@import "@/styles/button_styles.scss";

.unlocked-hint {
  // margin-top: .5rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid $pebble-medium;
  // font-size: .875rem;
}

.hint-wrapper {
}

.hint-title {
  padding: 0.125rem 0;
  // font-size: .875em;
  font-weight: bold;
}

.hint-text {
}

.feedback-form {
  font-size: 0.875rem;
  padding-top: 0.75rem;
}

.feedback-prompt {
  // padding-top: .25rem;
}

.comment-box {
  padding-top: 0.5rem;
}

.rate-hint-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
