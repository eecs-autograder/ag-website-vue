<template>
  <div id="config-panel">

    <div id="header">
      <p id="config-name">{{config_name}}</p>

      <div v-if="d_configuration !== null"
           class="setting-selection-container">
        <span id="preset-label">Preset:</span>
        <select id="config-preset-select"
                v-model="preset_selected"
                @change="$emit('apply_preset', preset_selected)"
                class="select">
          <option hidden>Custom</option>
          <option v-for="preset_name of preset_names"
                  :value="preset_name">
            {{preset_name}}
          </option>
        </select>
      </div>
    </div>

    <div id="footer">
        <slot name="settings"> </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCommandFeedbackConfig,
  AGTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import {
  AGTestCommandFeedbackPreset,
  AGTestSuiteFeedbackPreset,
  MutationTestSuiteFeedbackPreset
} from '@/components/feedback_config/feedback_config/feedback_config_utils';
import { SafeMap } from '@/safe_map';

export type FeedbackPresetType = MutationTestSuiteFeedbackPreset
                                 | AGTestCommandFeedbackPreset
                                 | AGTestSuiteFeedbackPreset;

export type FeedbackConfigType = AGTestCommandFeedbackConfig
                                 | AGTestSuiteFeedbackConfig
                                 | MutationTestSuiteFeedbackPreset
                                 | null;
@Component
export default class ConfigPanel extends Vue {
  @Prop({required: true, type: String})
  config_name!: string;

  @Prop({required: true, type: Function})
  get_preset_fn!: (config_being_viewed: FeedbackConfigType,
                   preset_options: SafeMap<string, FeedbackPresetType>) => string;

  @Prop({required: true, type: SafeMap})
  preset_options!: SafeMap<string, FeedbackPresetType>;

  @Prop({required: false, type: Object})
  value!: FeedbackConfigType | null;

  d_configuration: FeedbackConfigType | null = null;
  preset_names: string[] = [];
  preset_selected: string = "Custom";

  @Watch('value')
  on_value_changed(new_value: FeedbackConfigType, old_value: FeedbackConfigType) {
    this.d_configuration = new_value === null ? null : JSON.parse(JSON.stringify(new_value));
    if (this.d_configuration !== null) {
      this.preset_selected = this.get_preset_fn(this.d_configuration, this.preset_options);
    }
  }

  created() {
    for (let [preset_label, preset_settings] of this.preset_options) {
      this.preset_names.push(preset_label);
    }
    this.d_configuration = this.value === null ? null : JSON.parse(JSON.stringify(this.value));
    if (this.d_configuration !== null) {
      this.preset_selected = this.get_preset_fn(this.d_configuration, this.preset_options);
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/components/feedback_config.scss';
</style>
