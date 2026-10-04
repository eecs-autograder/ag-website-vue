<template>
  <div class="edit-feedback">
    <div id="edit-feedback-toggle-zone" v-if="feedback_config !== null">
      <div class="non-advanced">
        <div class="checkbox-input-container">
          <label class="label">
            <input
              data-testid="suite_is_visible"
              type="checkbox"
              @change="$emit('input', feedback_config)"
              class="checkbox"
              v-model="feedback_config.visible"
            />
            Suite is Visible
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input
              data-testid="show_student_description"
              type="checkbox"
              @change="$emit('input', feedback_config)"
              class="checkbox"
              v-model="feedback_config.show_student_description"
            />
            Show Student-Facing Description
          </label>
        </div>
      </div>

      <collapsible-section section_id="advanced-test-suite-feedback-settings">
        <template #header> Advanced Settings </template>

        <template #body>
          <div class="checkbox-input-container">
            <label class="label">
              <input
                data-testid="show_individual_tests"
                type="checkbox"
                @change="$emit('input', feedback_config)"
                class="checkbox"
                v-model="feedback_config.show_individual_tests"
              />
              Show Individual Tests
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="label">
              <input
                data-testid="show_setup_return_code"
                type="checkbox"
                @change="$emit('input', feedback_config)"
                class="checkbox"
                v-model="feedback_config.show_setup_return_code"
              />
              Show Setup Return Code
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="label">
              <input
                data-testid="show_setup_timed_out"
                type="checkbox"
                @change="$emit('input', feedback_config)"
                class="checkbox"
                v-model="feedback_config.show_setup_timed_out"
              />
              Show Setup Timed Out
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="label">
              <input
                data-testid="show_setup_stdout"
                type="checkbox"
                @change="$emit('input', feedback_config)"
                class="checkbox"
                v-model="feedback_config.show_setup_stdout"
              />
              Show Setup Stdout
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="label">
              <input
                data-testid="show_setup_stderr"
                type="checkbox"
                @change="$emit('input', feedback_config)"
                class="checkbox"
                v-model="feedback_config.show_setup_stderr"
              />
              Show Setup Stderr
            </label>
          </div>
        </template>
      </collapsible-section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import { AGTestSuiteFeedbackConfig } from "ag-client-typescript";

import CollapsibleSection from "@/components/CollapsibleSection.vue";

type PropTypes = {
  value: AGTestSuiteFeedbackConfig | null;
};

const props = defineProps<PropTypes>();

defineEmits<{
  input: [config: AGTestSuiteFeedbackConfig | null];
}>();

function copy_config(
  config: AGTestSuiteFeedbackConfig | null,
): AGTestSuiteFeedbackConfig | null {
  return JSON.parse(JSON.stringify(config)) as AGTestSuiteFeedbackConfig | null;
}

const feedback_config = ref<AGTestSuiteFeedbackConfig | null>(
  copy_config(props.value),
);

watch(
  () => props.value,
  (new_value) => {
    feedback_config.value = copy_config(new_value);
  },
);
</script>

<style scoped lang="scss">
@import "@/styles/forms.scss";

@import "../feedback_config_panel/feedback_config_panel.scss";

.non-advanced .checkbox-input-container {
  margin: 0;
  padding: 0.25rem 0 0.625rem;
}
</style>
