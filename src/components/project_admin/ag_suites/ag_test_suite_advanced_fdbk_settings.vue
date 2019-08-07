<template>
  <div class="edit-feedback">
    <div id="edit-feedback-toggle-zone" v-if="d_feedback_config !== null">

      <div class="non-advanced">
        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-visible`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.visible">
          <label :for="`${hyphenate(config_name)}-visible`"> Suite is Visible </label>
        </div>
      </div>

      <div class="advanced-settings-label" @click="toggle_is_open">
        <i v-if="d_is_open" class="fas fa-caret-down caret-down"></i>
        <i v-else class="fas fa-caret-right caret-right"></i>
        <span> Advanced Settings </span>
        <div class="advanced-settings-divider" v-if="d_is_open"> </div>
      </div>

      <div v-if="d_is_open"
           class="advanced-settings">
        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-individual-tests`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_individual_tests">
          <label :for="`${hyphenate(config_name)}-show-individual-tests`"> Show Individual Tests
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-setup-return-code`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_setup_return_code">
          <label :for="`${hyphenate(config_name)}-show-setup-return-code`"> Show Setup Return Code
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-setup-timed-out`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_setup_timed_out">
          <label :for="`${hyphenate(config_name)}-show-setup-timed-out`"> Show Setup Timed Out
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-setup-stdout`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_setup_stdout">
          <label :for="`${hyphenate(config_name)}-show-setup-stdout`"> Show Setup Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-setup-stderr`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_setup_stderr">
          <label :for="`${hyphenate(config_name)}-show-setup-stderr`"> Show Setup Stderr
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestSuiteFeedbackConfig } from 'ag-client-typescript/dist/src/ag_test_suite';

import { hyphenate } from "@/components/project_admin/feedback_config_utils.ts";
import Toggle from '@/components/toggle.vue';

@Component({
  components: {
    Toggle
  }
})
export default class EditFeedbackSettingsAGSuite extends Vue {
  @Prop({required: true, type: String})
  config_name!: string;

  @Prop({required: true, type: Object})
  value!: AGTestSuiteFeedbackConfig | null;

  d_feedback_config: AGTestSuiteFeedbackConfig | null = null;
  d_is_open = false;

  readonly hyphenate = hyphenate;

  @Watch('value')
  on_value_changed(new_value: AGTestSuiteFeedbackConfig, old_value: AGTestSuiteFeedbackConfig) {
    this.d_feedback_config = JSON.parse(JSON.stringify(new_value));
  }

  toggle_is_open() {
    this.d_is_open = !this.d_is_open;
  }

  created() {
    this.d_feedback_config = JSON.parse(JSON.stringify(this.value));
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/feedback_config.scss';

.divider {
  border-top: 1px solid darken($white-gray, 10);
  width: 100%;
  margin: 2px 0;
}

</style>
