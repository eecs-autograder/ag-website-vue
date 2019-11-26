<template>
  <div class="config-panel">

    <div class="header">
      <slot name="header"></slot>

      <div v-if="d_configuration !== null && preset_names.length"
           class="setting-selection-container">
        <span class="preset-label">Preset:</span>
        <select class="select"
                v-model="d_selected_preset_name"
                @change="change_preset">
          <option hidden>Custom</option>
          <option v-for="preset_name of preset_names"
                  :value="preset_name">
            {{preset_name}}
          </option>
        </select>
      </div>
    </div>

    <div class="footer">
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
} from '@/components/project_admin/feedback_config_utils';
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
export default class FeedbackConfigPanel extends Vue {
  @Prop({default: null, type: SafeMap})
  preset_options!: SafeMap<string, FeedbackPresetType> | null;

  @Prop({required: false, type: Object})
  value!: FeedbackConfigType | null;

  d_configuration: FeedbackConfigType | null = null;
  preset_names: string[] = [];
  get selected_preset_name() {
    return this.d_selected_preset_name;
  }
  d_selected_preset_name: string = "Custom";

  @Watch('value', {deep: true})
  on_value_changed(new_value: FeedbackConfigType, old_value: FeedbackConfigType) {
    this.set_d_configuration(new_value);
  }

  created() {
    if (this.preset_options !== null) {
      for (let [preset_label, preset_settings] of this.preset_options) {
        this.preset_names.push(preset_label);
      }
    }
    this.set_d_configuration(this.value);
  }

  private set_d_configuration(feedback_config: FeedbackConfigType) {
    this.d_configuration = this.value === null ? null : JSON.parse(JSON.stringify(this.value));
    this.d_selected_preset_name = this.detect_current_preset();
  }

  private detect_current_preset(): string {
    if (this.preset_options === null) {
      return '';
    }

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
    console.assert(this.d_selected_preset_name !== "Custom");
    let updated_config = JSON.parse(JSON.stringify(this.d_configuration));
    safe_assign(updated_config, this.preset_options!.get(this.d_selected_preset_name));
    this.$emit('input', updated_config);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.config-panel {
    width: 100%;
    max-width: 600px;

    margin-bottom: .625rem;
    box-shadow: 0 1px 1px $white-gray;
    border-radius: 3px;
}

.header {
    background-color: hsl(220, 30%, 94%);
    border: 2px solid hsl(220, 30%, 92%);
    border-bottom: none;
    border-radius: 3px 3px 0 0;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    padding: .25rem .25rem .25rem .625rem;
}

.setting-selection-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.preset-label {
  margin-right: .375rem;

  display: none;
  @media only screen and (min-width: 500px) {
    display: block;
  }
}

.footer {
    border: 2px solid hsl(210, 20%, 92%);
    border-top: none;
    border-radius: 0 0 3px 3px;
    background-color: white;
    padding: .375rem;
}
</style>
