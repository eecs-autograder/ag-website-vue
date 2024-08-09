<template>
  <feedback-config-panel v-model="d_feedback_config">
    <template v-slot:header>
      <slot name="header"></slot>
    </template>

    <template v-slot:settings>
      <div class="checkbox-input-container">
        <label class="label">
          <input data-testid="is_visible"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.visible">
          Test is Visible
        </label>
      </div>

      <div class="checkbox-input-container">
        <label class="label">
          <input data-testid="show_student_description"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_student_description">
          Show Student-Facing Description
        </label>
      </div>

      <div class="checkbox-input-container">
        <label class="label">
          <input data-testid="show_individual_commands"
                 type="checkbox"
                 @change="$emit('input', d_feedback_config)"
                 class="checkbox"
                 v-model="d_feedback_config.show_individual_commands">
          Show Individual Commands
        </label>
      </div>
    </template>
  </feedback-config-panel>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCaseFeedbackConfig } from 'ag-client-typescript';

import FeedbackConfigPanel from '../feedback_config_panel/feedback_config_panel.vue';

@Component({
  components: {FeedbackConfigPanel}
})
export default class AGTestCaseFdbkConfigPanel extends Vue {
  // @Prop({required: true, type: String})
  // config_name!: string;

  @Prop({required: true, type: Object})
  value!: AGTestCaseFeedbackConfig;

  d_feedback_config: AGTestCaseFeedbackConfig | null = null;

  @Watch('value')
  on_value_changed(new_value: AGTestCaseFeedbackConfig, old_value: AGTestCaseFeedbackConfig) {
    this.d_feedback_config = JSON.parse(JSON.stringify(new_value));
  }

  created() {
    this.d_feedback_config = JSON.parse(JSON.stringify(this.value));
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

* {
  box-sizing: border-box;
}

.checkbox-input-container {
  margin: 0;
  padding: .25rem 0;
}

.checkbox-input-container:first-child {
  padding-top: 0;
}

.checkbox-input-container:last-child {
  padding-bottom: 0;
}

</style>
