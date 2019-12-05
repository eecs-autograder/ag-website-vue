<template>
  <div class="edit-feedback">
    <div id="edit-feedback-toggle-zone" v-if="d_feedback_config !== null">

      <div class="non-advanced">
        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-mutation-suite-visible`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.visible">
          <label :for="`${hyphenate(config_name)}-mutation-suite-visible`">
            Suite is Visible
          </label>
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

        <div class="select-row">
          <label class="setting-title"> Bugs Exposed </label>
          <div>
            <select ref="bugs_exposed_fdbk_level_select"
                    :id="`${hyphenate(config_name)}-bugs-exposed-fdbk-level`"
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
          </div>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-invalid-test-names`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_invalid_test_names">
          <label :for="`${hyphenate(config_name)}-show-invalid-test-names`">
            Show False Positive Student Tests
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-points`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_points">
          <label :for="`${hyphenate(config_name)}-show-points`"> Show Points </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-setup-return-code`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_setup_return_code">
          <label :for="`${hyphenate(config_name)}-show-setup-return-code`">
            Show Setup Return Code
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-setup-stdout`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_setup_stdout">
          <label :for="`${hyphenate(config_name)}-show-setup-stdout`">
            Show Setup Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-setup-stderr`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_setup_stderr">
          <label :for="`${hyphenate(config_name)}-show-setup-stderr`">
            Show Setup Stderr
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-get-test-names-return-code`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_get_test_names_return_code">
          <label :for="`${hyphenate(config_name)}-show-get-test-names-return-code`">
            Show Test Name Discovery Return Code
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-get-test-names-stdout`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_get_test_names_stdout">
          <label :for="`${hyphenate(config_name)}-show-get-test-names-stdout`">
            Show Test Name Discovery Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-get-test-names-stderr`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_get_test_names_stderr">
          <label :for="`${hyphenate(config_name)}-show-get-test-names-stderr`">
            Show Test Name Discovery Stderr
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-validity-check-stdout`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_validity_check_stdout">
          <label :for="`${hyphenate(config_name)}-show-validity-check-stdout`">
            Show Validity Check Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-validity-check-stderr`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_validity_check_stderr">
          <label :for="`${hyphenate(config_name)}-show-validity-check-stderr`">
            Show Validity Check Stderr
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-grade-buggy-impls-stdout`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_grade_buggy_impls_stdout">
          <label :for="`${hyphenate(config_name)}-show-grade-buggy-impls-stdout`">
            Show Buggy Impls Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-grade-buggy-impls-stderr`"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_grade_buggy_impls_stderr">
          <label :for="`${hyphenate(config_name)}-show-grade-buggy-impls-stderr`">
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

import { hyphenate } from '@/components/project_admin/feedback_config_utils';

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
@import '@/styles/components/feedback_config.scss';

.advanced-settings-divider {
  border-top: 1px solid darken($white-gray, 10);
  width: 100%;
  margin: 2px 0;
}

</style>
