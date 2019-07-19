<template>
  <div id="ag-case-config-panel">

    <div id="header">
      <p id="config-name">{{config_name}}</p>
    </div>

    <div id="footer">
      <div class="checkbox-input-container">
        <input :id="`${hyphenate(config_name)}-visible`"
               type="checkbox"
               @change="$emit('input', d_ag_test_case_settings)"
               class="checkbox"
               v-model="d_ag_test_case_settings.visible">
        <label :for="`${hyphenate(config_name)}-visible`"> Case is Visible </label>
      </div>

      <div class="checkbox-input-container">
        <input :id="`${hyphenate(config_name)}-show-individual-commands`"
               type="checkbox"
               @change="$emit('input', d_ag_test_case_settings)"
               class="checkbox"
               v-model="d_ag_test_case_settings.show_individual_commands">
        <label :for="`${hyphenate(config_name)}-show-individual-commands`">
          Show Individual Commands
        </label>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCaseFeedbackConfig } from 'ag-client-typescript';

import { hyphenate } from "@/components/feedback_config/feedback_config/feedback_config_utils.ts";
import Toggle from '@/components/toggle.vue';

@Component({
  components: {
    Toggle
  }
})
export default class AGCaseConfigPanel extends Vue {
  @Prop({required: true, type: String})
  config_name!: string;

  @Prop({required: true, type: Object})
  value!: AGTestCaseFeedbackConfig;

  hyphenate = hyphenate;
  d_ag_test_case_settings: AGTestCaseFeedbackConfig | null = null;

  @Watch('value')
  on_value_changed(new_value: AGTestCaseFeedbackConfig, old_value: AGTestCaseFeedbackConfig) {
    this.d_ag_test_case_settings = JSON.parse(JSON.stringify(new_value));
  }

  created() {
    this.d_ag_test_case_settings = JSON.parse(JSON.stringify(this.value));
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/components/feedback_config.scss';
</style>
