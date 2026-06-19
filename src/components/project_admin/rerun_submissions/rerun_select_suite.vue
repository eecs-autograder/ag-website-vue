<template>
  <div class="ag-test-suite-header ag-test-suite-collapsible">
    <div class="unpadded-checkbox-container">
      <label>
        <input
          type="checkbox"
          class="checkbox"
          data-testid="ag_test_suite_checkbox"
          :checked="suite_is_selected"
          @change="emit('ag_test_suite_selected', ag_test_suite)"
        />
        {{ ag_test_suite.name }}
      </label>
      <button
        type="button"
        class="white-button toggle-tests-button"
        :aria-expanded="is_open"
        :aria-controls="`select-test-cases-${component_uid}`"
        @click="is_open = !is_open"
      >
        {{ is_open ? is_open_text : is_closed_text }}
      </button>
    </div>

    <div v-show="is_open" :id="`select-test-cases-${component_uid}`">
      <div
        class="unpadded-checkbox-container ag-test-case-checkbox-wrapper"
        v-for="ag_test_case of ag_test_suite.ag_test_cases"
        :key="ag_test_case.pk"
      >
        <label>
          <input
            type="checkbox"
            class="checkbox"
            data-testid="ag_test_case_checkbox"
            :checked="selected_test_case_pks.has(ag_test_case.pk)"
            @change="emit('ag_test_case_selected', ag_test_case)"
          />
          {{ ag_test_case.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AGTestCase, AGTestSuite } from "ag-client-typescript";
import { ref } from "vue";

import { generate_uid } from "@/utils";

interface PropTypes {
  ag_test_suite: AGTestSuite;
  suite_is_selected: boolean;
  selected_test_case_pks: Set<number>;
  is_open_text: string;
  is_closed_text: string;
}
defineProps<PropTypes>();

interface EmitTypes {
  ag_test_suite_selected: [ag_test_suite: AGTestSuite];
  ag_test_case_selected: [ag_test_case: AGTestCase];
}
const emit = defineEmits<EmitTypes>();

const component_uid = generate_uid();
const is_open = ref(false);
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/forms.scss";

.ag-test-suite-collapsible {
  margin: 0.5rem 0;
}

.ag-test-suite-header {
  width: 100%;
  margin-left: 0.25rem;
  white-space: nowrap;
}

.toggle-tests-button {
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.875rem;
  vertical-align: middle;
}

.ag-test-case-checkbox-wrapper {
  margin: 0.25rem 0;
  margin-left: 2.5rem;

  white-space: nowrap;
}
</style>
