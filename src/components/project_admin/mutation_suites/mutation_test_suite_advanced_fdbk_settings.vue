<template>
  <div class="edit-feedback">
    <div id="edit-feedback-toggle-zone" v-if="d_feedback_config !== null">
      <div class="non-advanced checkbox-input-container">
        <label class="label">
          <input data-testid="mutation_suite_is_visible"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.visible">
          Suite is Visible
        </label>
      </div>

      <div class="advanced-settings-label" @click="toggle_is_open">
        <i v-if="d_is_open" class="fas fa-caret-down caret-down"></i>
        <i v-else class="fas fa-caret-right caret-right"></i>
        <span class="advanced-settings-text"> Advanced Settings </span>
      </div>
      <div v-if="d_is_open" class="advanced-settings">
        <div class="form-field-wrapper">
          <label>
            Bugs Exposed
            <br>
            <select data-testid="bugs_exposed_fdbk_level"
                    v-model="d_feedback_config.bugs_exposed_fdbk_level"
                    @change="$emit('input', d_feedback_config)"
                    class="select">
              <option :value="BugsExposedFeedbackLevel.no_feedback">
                Hide
              </option>
              <option :value="BugsExposedFeedbackLevel.num_bugs_exposed">
                Num bugs exposed
              </option>
              <option :value="BugsExposedFeedbackLevel.exposed_bug_names">
                Exposed bug names
              </option>
            </select>
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_invalid_test_names"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_invalid_test_names">
            Show False Positive Student Tests
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_points"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_points">
            Show Points
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

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_test_name_discovery_return_code"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_get_test_names_return_code">
            Show Test Name Discovery Return Code
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_test_name_discovery_stdout"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_get_test_names_stdout">
            Show Test Name Discovery Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_test_name_discovery_stderr"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_get_test_names_stderr">
            Show Test Name Discovery Stderr
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_validity_check_stdout"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_validity_check_stdout">
            Show Validity Check Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_validity_check_stderr"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_validity_check_stderr">
            Show Validity Check Stderr
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_grade_buggy_impls_stdout"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_grade_buggy_impls_stdout">
            Show Buggy Impls Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="label">
            <input data-testid="show_grade_buggy_impls_stderr"
                   type="checkbox"
                   @change="$emit('input', d_feedback_config)"
                   class="checkbox"
                   v-model="d_feedback_config.show_grade_buggy_impls_stderr">
            Show Buggy Impls Stderr
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  BugsExposedFeedbackLevel,
  MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import { hyphenate } from '@/components/project_admin/feedback_config_panel/feedback_config_utils';

@Component
export default class EditFeedbackSettingsMutationSuite extends Vue {

  @Prop({required: true, type: String})
  config_name!: string;

  @Prop({required: true, type: Object})
  value!: MutationTestSuiteFeedbackConfig | null;

  d_feedback_config: MutationTestSuiteFeedbackConfig | null = null;
  d_is_open = false;

  readonly BugsExposedFeedbackLevel = BugsExposedFeedbackLevel;
  readonly hyphenate = hyphenate;

  @Watch('value')
  on_value_changed(new_value: MutationTestSuiteFeedbackConfig,
                   old_value: MutationTestSuiteFeedbackConfig) {
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

.non-advanced.checkbox-input-container {
  margin-top: .25rem;
}

.advanced-settings {
  margin-top: .5rem;
}
</style>
