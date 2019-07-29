<template>
  <div id="config-panel">

    <div id="header">
      <p id="config-name">{{config_name}}</p>

      <div v-if="d_configuration !== null"
           class="setting-selection-container">
        <span id="preset-label">Preset:</span>
        <select id="config-preset-select"
                v-model="selected_preset_name"
                @change="change_preset"
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
import { safe_assign } from "@/utils";

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

  @Prop({required: false})
  get_preset_fn!: (config_being_viewed: FeedbackConfigType,
                   preset_options: SafeMap<string, FeedbackPresetType>) => string;

  @Prop({required: true, type: SafeMap})
  preset_options!: SafeMap<string, FeedbackPresetType>;

  @Prop({required: false, type: Object})
  value!: FeedbackConfigType | null;

  d_configuration: FeedbackConfigType | null = null;
  preset_names: string[] = [];
  selected_preset_name: string = "Custom";

  @Watch('value', {deep: true})
  on_value_changed(new_value: FeedbackConfigType, old_value: FeedbackConfigType) {
    this.set_d_configuration(new_value);
  }

  created() {
    for (let [preset_label, preset_settings] of this.preset_options) {
      this.preset_names.push(preset_label);
    }
    this.set_d_configuration(this.value);
  }

  private set_d_configuration(feedback_config: FeedbackConfigType) {
    this.d_configuration = this.value === null ? null : JSON.parse(JSON.stringify(this.value));
    this.selected_preset_name = this.detect_current_preset();
  }

  private detect_current_preset(): string {
    for (let [label, preset] of this.preset_options) {
      if (this.config_matches_preset(this.d_configuration, preset)) {
        return label;
      }
    }
    return "Custom";
  }

  private config_matches_preset(config: FeedbackConfigType, preset: FeedbackPresetType) {
    if (config === null) {
      return false;
    }

    // We have to use the keys of preset because they do not have the "visible"
    // option that the config has.
    for (let key of Object.keys(preset)) {
      // @ts-ignore
      if (config[key] !== preset[key]) {
        return false;
      }
    }

    return true;
  }

  private change_preset() {
    let updated_config = JSON.parse(JSON.stringify(this.d_configuration));
    safe_assign(updated_config, this.preset_options.get(this.selected_preset_name));
    this.$emit('input', updated_config);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/components/feedback_config.scss';
</style>
