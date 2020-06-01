<template>
  <div class="edit-feedback">
    <div id="edit-feedback-toggle-zone" v-if="d_feedback_config !== null">

      <div class="non-advanced">
        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="suite_is_visible"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.visible">
            Suite is Visible
          </label>
        </div>
      </div>

      <div class="advanced-settings-label" @click="toggle_is_open">
        <i v-if="d_is_open" class="fas fa-caret-down caret-down"></i>
        <i v-else class="fas fa-caret-right caret-right"></i>
        <div class="advanced-settings-text"> Advanced Settings </div>
      </div>

      <div v-if="d_is_open" class="advanced-settings">
        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_individual_tests"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_individual_tests">
            Show Individual Tests
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_setup_return_code"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_setup_return_code">
            Show Setup Return Code
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_setup_timed_out"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_setup_timed_out">
            Show Setup Timed Out
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_setup_stdout"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_setup_stdout">
            Show Setup Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_setup_stderr"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_setup_stderr">
            Show Setup Stderr
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestSuiteFeedbackConfig } from 'ag-client-typescript';

import Toggle from '@/components/toggle.vue';

@Component({
  components: {
    Toggle
  }
})
export default class AGTestSuiteAdvancedFdbkSettings extends Vue {
  @Prop({required: true, type: Object})
  value!: AGTestSuiteFeedbackConfig | null;

  d_feedback_config: AGTestSuiteFeedbackConfig | null = null;
  d_is_open = false;

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
@import '@/styles/forms.scss';

@import '../feedback_config_panel/feedback_config_panel.scss';

.non-advanced .checkbox-input-container {
  margin: 0;
  padding: .25rem 0 .625rem;
}

</style>
