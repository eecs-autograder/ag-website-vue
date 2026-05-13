<template>
  <div v-show="d_feedback_config !== null" class="ag-test-command-advanced-fdbk">
    <template v-if="d_feedback_config !== null">
      <div class="checkbox-input-container"
           v-if="ag_test_case.ag_test_commands.length > 1 || !d_feedback_config.visible">
        <label class="label">
          <input data-testid="cmd_is_visible"
                  type="checkbox"
                  @change="$emit('input', d_feedback_config)"
                  class="checkbox"
                  v-model="d_feedback_config.visible">
          Command is Visible
        </label>
      </div>

      <div class="checkbox-input-container">
        <label class="checkbox-label">
          <input data-testid="show_student_description"
                  type="checkbox"
                  class="checkbox"
                  @change="$emit('input', d_feedback_config)"
                  v-model="d_feedback_config.show_student_description">
          Show Student-Facing Descriptions
        </label>
      </div>

      <collapsible-section section_id="advanced-test-command-feedback-settings">
        <template #header>
          Advanced Settings
        </template>
        <template #body>
          <div class="form-field-wrapper">
            <label class="label">
              Return Code Correctness<br>
              <select data-testid="return_code_fdbk_level"
                      @change="$emit('input', d_feedback_config)"
                      v-model="d_feedback_config.return_code_fdbk_level"
                      class="select">
                <option :value="ValueFeedbackLevel.no_feedback">
                  Hide
                </option>
                <option :value="ValueFeedbackLevel.correct_or_incorrect">
                  Correct/Incorrect
                </option>
                <option :value="ValueFeedbackLevel.expected_and_actual">
                  Expected and actual
                </option>
              </select>
            </label>
          </div>

          <div class="form-field-wrapper">
            <label class="label">
              Stdout Correctness<br>
              <select data-testid="stdout_fdbk_level"
                      @change="$emit('input', d_feedback_config)"
                      v-model="d_feedback_config.stdout_fdbk_level"
                      class="select">
                <option :value="ValueFeedbackLevel.no_feedback">
                  Hide
                </option>
                <option :value="ValueFeedbackLevel.correct_or_incorrect">
                  Correct/Incorrect
                </option>
                <option :value="ValueFeedbackLevel.expected_and_actual">
                  Full diff
                </option>
              </select>
            </label>
          </div>

          <div class="form-field-wrapper">
            <label class="label">
              Stderr Correctness
              <br>
              <select data-testid="stderr_fdbk_level"
                      @change="$emit('input', d_feedback_config)"
                      v-model="d_feedback_config.stderr_fdbk_level"
                      class="select">
                <option :value="ValueFeedbackLevel.no_feedback">
                  Hide
                </option>
                <option :value="ValueFeedbackLevel.correct_or_incorrect">
                  Correct/Incorrect
                </option>
                <option :value="ValueFeedbackLevel.expected_and_actual">
                  Full diff
                </option>
              </select>
            </label>
          </div>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input data-testid="show_points"
                     type="checkbox"
                     class="checkbox"
                     @change="$emit('input', d_feedback_config)"
                     v-model="d_feedback_config.show_points">
              Show Points
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input data-testid="show_actual_return_code"
                     type="checkbox"
                     class="checkbox"
                     @change="$emit('input', d_feedback_config)"
                     v-model="d_feedback_config.show_actual_return_code">
              Show Actual Return Code
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input data-testid="show_actual_stdout"
                     type="checkbox"
                     @change="$emit('input', d_feedback_config)"
                     class="checkbox"
                     v-model="d_feedback_config.show_actual_stdout">
              Show Actual Stdout
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input data-testid="show_actual_stderr"
                     type="checkbox"
                     @change="$emit('input', d_feedback_config)"
                     class="checkbox"
                     v-model="d_feedback_config.show_actual_stderr">
              Show Actual Stderr
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input data-testid="show_whether_timed_out"
                     type="checkbox"
                     class="checkbox"
                     @change="$emit('input', d_feedback_config)"
                     v-model="d_feedback_config.show_whether_timed_out">
              Show Whether Timed Out
            </label>
          </div>
        </template>
      </collapsible-section>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCase,
         AGTestCommandFeedbackConfig,
         ValueFeedbackLevel
} from 'ag-client-typescript';

import CollapsibleSection from '@/components/CollapsibleSection.vue';
import Toggle from '@/components/toggle.vue';

@Component({
  components: {
    CollapsibleSection,
    Toggle
  }
})
export default class AGTestCommandAdvancedFdbkSettings extends Vue {
  @Prop({required: false, type: Object})
  value!: AGTestCommandFeedbackConfig | null;

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  d_feedback_config: AGTestCommandFeedbackConfig | null = null;

  readonly ValueFeedbackLevel = ValueFeedbackLevel;

  @Watch('value')
  on_value_changed(new_value: AGTestCommandFeedbackConfig,
                   old_value: AGTestCommandFeedbackConfig) {
    this.d_feedback_config = JSON.parse(JSON.stringify(new_value));
  }

  created() {
    this.d_feedback_config = JSON.parse(JSON.stringify(this.value));
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';

@import '../feedback_config_panel/feedback_config_panel.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.checkbox-input-container:first-child {
  margin-top: .25rem;
}

.checkbox-input-container:last-child {
  margin-bottom: .25rem;
}
</style>
