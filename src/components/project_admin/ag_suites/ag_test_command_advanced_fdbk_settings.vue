<template>
  <div v-show="d_feedback_config !== null" class="ag-test-command-advanced-fdbk">
    <template v-if="d_feedback_config !== null">
      <div class="checkbox-input-container"
           v-if="ag_test_case.ag_test_commands.length > 1 || !d_feedback_config.visible">
        <input :id="`${hyphenate(config_name)}-cmd-visible`"
                type="checkbox"
                @change="$emit('input', d_feedback_config)"
                class="checkbox"
                v-model="d_feedback_config.visible">
        <label :for="`${hyphenate(config_name)}-cmd-visible`"> Command is Visible </label>
      </div>

      <div class="advanced-settings-label" @click="toggle_is_open">
        <i v-if="d_is_open" class="fas fa-caret-down caret-down"></i>
        <i v-else class="fas fa-caret-right caret-right"></i>
        <div class="advanced-settings-text"> Advanced Settings </div>
      </div>

      <div v-if="d_is_open" class="advanced-settings">
        <div class="form-field-wrapper">
          <label class="label"> Return Code Correctness </label>
          <br>
          <select :id="`${hyphenate(config_name)}-return-code-fdbk-level`"
                  ref="return_code_fdbk_level"
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
        </div>

        <div class="form-field-wrapper">
          <label class="label"> Stdout Correctness </label>
          <br>
          <select :id="`${hyphenate(config_name)}-stdout-fdbk-level`"
                  ref="stdout_fdbk_level"
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
        </div>

        <div class="form-field-wrapper">
          <label class="label"> Stderr Correctness </label>
          <br>
          <select :id="`${hyphenate(config_name)}-stderr-fdbk-level`"
                  ref="stderr_fdbk_level"
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
        </div>
        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-points`"
                  type="checkbox"
                  class="checkbox"
                  @change="$emit('input', d_feedback_config)"
                  v-model="d_feedback_config.show_points">
          <label :for="`${hyphenate(config_name)}-show-points`"
                class="checkbox-label">
            Show Points
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-actual-return-code`"
                  type="checkbox"
                  class="checkbox"
                  @change="$emit('input', d_feedback_config)"
                  v-model="d_feedback_config.show_actual_return_code">
          <label :for="`${hyphenate(config_name)}-show-actual-return-code`"
                class="checkbox-label">
            Show Actual Return Code
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-actual-stdout`"
                  type="checkbox"
                  @change="$emit('input', d_feedback_config)"
                  class="checkbox"
                  v-model="d_feedback_config.show_actual_stdout">
          <label :for="`${hyphenate(config_name)}-show-actual-stdout`"
                class="checkbox-label">
            Show Actual Stdout
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-actual-stderr`"
                  type="checkbox"
                  @change="$emit('input', d_feedback_config)"
                  class="checkbox"
                  v-model="d_feedback_config.show_actual_stderr">
          <label :for="`${hyphenate(config_name)}-show-actual-stderr`"
                class="checkbox-label">
            Show Actual Stderr
          </label>
        </div>

        <div class="checkbox-input-container">
          <input :id="`${hyphenate(config_name)}-show-whether-timed-out`"
                  type="checkbox"
                  class="checkbox"
                  @change="$emit('input', d_feedback_config)"
                  v-model="d_feedback_config.show_whether_timed_out">
          <label :for="`${hyphenate(config_name)}-show-whether-timed-out`"
                class="checkbox-label">
            Show Whether Timed Out
          </label>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCase,
         AGTestCommandFeedbackConfig,
         ValueFeedbackLevel
} from 'ag-client-typescript';

import { hyphenate } from '@/components/project_admin/feedback_config_panel/feedback_config_utils';
import Toggle from '@/components/toggle.vue';

@Component({
  components: {
    Toggle
  }
})
export default class AGTestCommandAdvancedFdbkSettings extends Vue {
  @Prop({required: true, type: String})
  config_name!: string;

  @Prop({required: false, type: Object})
  value!: AGTestCommandFeedbackConfig | null;

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  d_feedback_config: AGTestCommandFeedbackConfig | null = null;
  d_is_open = false;

  readonly ValueFeedbackLevel = ValueFeedbackLevel;
  readonly hyphenate = hyphenate;

  @Watch('value')
  on_value_changed(new_value: AGTestCommandFeedbackConfig,
                   old_value: AGTestCommandFeedbackConfig) {
    this.d_feedback_config = JSON.parse(JSON.stringify(new_value));
  }

  created() {
    this.d_feedback_config = JSON.parse(JSON.stringify(this.value));
  }

  toggle_is_open() {
    this.d_is_open = !this.d_is_open;
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

.advanced-settings {
  padding-left: .375rem;
  padding-top: .375rem;
}

.checkbox-input-container:first-child {
  margin-top: .25rem;
}

.checkbox-input-container:last-child {
  margin-bottom: .25rem;
}
</style>
