<template>
  <div class="edit-feedback">

    <div id="edit-feedback-toggle-zone" v-if="d_ag_test_command_settings !== null">
      <div class="checkbox-input-container">
        <input :id="`${hyphenate(config_name)}-visible`"
               type="checkbox"
               @change="$emit('input', d_ag_test_command_settings)"
               class="checkbox"
               v-model="d_ag_test_command_settings.visible">
        <label :for="`${hyphenate(config_name)}-visible`"> Command is Visible </label>
      </div>

      <div class="advanced-settings-label" @click="toggle_is_open">
        <i v-if="is_open" class="fas fa-caret-down caret-down"></i>
        <i v-else class="fas fa-caret-right caret-right"></i>
        <span> Advanced Settings </span>
        <div class="advanced-settings-divider" v-if="is_open"> </div>
      </div>

      <div v-if="is_open"
           class="advanced-settings">

        <div class="select-row">
          <label class="setting-title"> Return Code Correctness </label>
          <div>
            <select :id="`${hyphenate(config_name)}-return-code-fdbk-level`"
                    ref="return_code_fdbk_level"
                    @change="$emit('input', d_ag_test_command_settings)"
                    v-model="d_ag_test_command_settings.return_code_fdbk_level"
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
          </div>
        </div>

        <div class="select-row">
          <label class="setting-title"> Stdout Correctness </label>
          <div>

            <select :id="`${hyphenate(config_name)}-stdout-fdbk-level`"
                    ref="stdout_fdbk_level"
                    @change="$emit('input', d_ag_test_command_settings)"
                    v-model="d_ag_test_command_settings.stdout_fdbk_level"
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
          </div>
        </div>

        <div class="select-row">
          <label class="setting-title"> Stderr Correctness </label>
          <div>

            <select :id="`${hyphenate(config_name)}-stderr-fdbk-level`"
                    ref="stderr_fdbk_level"
                    @change="$emit('input', d_ag_test_command_settings)"
                    v-model="d_ag_test_command_settings.stderr_fdbk_level"
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
          </div>
        </div>
        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-points`"
                 type="checkbox"
                 class="checkbox"
                 @change="$emit('input', d_ag_test_command_settings)"
                 v-model="d_ag_test_command_settings.show_points">
          <label :for="`${hyphenate(config_name)}-show-points`"> Show Points
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-actual-return-code`"
                 type="checkbox"
                 class="checkbox"
                 @change="$emit('input', d_ag_test_command_settings)"
                 v-model="d_ag_test_command_settings.show_actual_return_code">
          <label :for="`${hyphenate(config_name)}-show-actual-return-code`">
            Show Actual Return Code
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-actual-stdout`"
                 type="checkbox"
                 @change="$emit('input', d_ag_test_command_settings)"
                 class="checkbox"
                 v-model="d_ag_test_command_settings.show_actual_stdout">
          <label :for="`${hyphenate(config_name)}-show-actual-stdout`"> Show Actual Stdout </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-actual-stderr`"
                 type="checkbox"
                 @change="$emit('input', d_ag_test_command_settings)"
                 class="checkbox"
                 v-model="d_ag_test_command_settings.show_actual_stderr">
          <label :for="`${hyphenate(config_name)}-show-actual-stderr`"> Show Actual Stderr </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-whether-timed-out`"
                 type="checkbox"
                 class="checkbox"
                 @change="$emit('input', d_ag_test_command_settings)"
                 v-model="d_ag_test_command_settings.show_whether_timed_out">
          <label :for="`${hyphenate(config_name)}-show-whether-timed-out`">
            Show Whether Timed Out
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCommandFeedbackConfig, ValueFeedbackLevel } from 'ag-client-typescript';

import { hyphenate } from "@/components/feedback_config/feedback_config/feedback_config_utils.ts";
import Toggle from '@/components/toggle.vue';

@Component({
  components: {
    Toggle
  }
})
export default class EditFeedbackSettingsAGCommand extends Vue {
  @Prop({required: true, type: String})
  config_name!: string;

  @Prop({required: false, type: Object})
  value!: AGTestCommandFeedbackConfig | null;

  hyphenate = hyphenate;
  d_ag_test_command_settings: AGTestCommandFeedbackConfig | null = null;
  ValueFeedbackLevel = ValueFeedbackLevel;

  @Watch('value')
  on_value_changed(new_value: AGTestCommandFeedbackConfig,
                   old_value: AGTestCommandFeedbackConfig) {
    this.d_ag_test_command_settings = new_value;
  }

  is_open = false;

  toggle_is_open() {
    this.is_open = !this.is_open;
  }

  created() {
    this.d_ag_test_command_settings = this.value;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/feedback_config.scss';
</style>
