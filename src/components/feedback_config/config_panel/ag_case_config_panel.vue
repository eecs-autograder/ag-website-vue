<template>
  <config-panel v-model="d_feedback_config">
    <template v-slot:header>
      <slot name="header"></slot>
    </template>

    <template v-slot:settings>
      <div class="checkbox-input-container">
        <input :id="`${hyphenate(config_name)}-visible`"
              type="checkbox"
              @change="$emit('input', d_feedback_config)"
              class="checkbox"
              v-model="d_feedback_config.visible">
        <label :for="`${hyphenate(config_name)}-visible`"> Case is Visible </label>
      </div>

      <div class="checkbox-input-container">
        <input :id="`${hyphenate(config_name)}-show-individual-commands`"
              type="checkbox"
              @change="$emit('input', d_feedback_config)"
              class="checkbox"
              v-model="d_feedback_config.show_individual_commands">
        <label :for="`${hyphenate(config_name)}-show-individual-commands`">
          Show Individual Commands
        </label>
      </div>
    </template>
  </config-panel>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCaseFeedbackConfig } from 'ag-client-typescript';

import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import { hyphenate } from "@/components/feedback_config/feedback_config/feedback_config_utils.ts";

@Component({
  components: {ConfigPanel}
})
export default class AGCaseConfigPanel extends Vue {
  @Prop({required: true, type: String})
  config_name!: string;

  @Prop({required: true, type: Object})
  value!: AGTestCaseFeedbackConfig;

  readonly hyphenate = hyphenate;
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
@import '@/styles/components/feedback_config.scss';

</style>
