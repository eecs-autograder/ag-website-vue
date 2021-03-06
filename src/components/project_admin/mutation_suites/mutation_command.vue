<template>
  <div class="mutation-command-component">
    <div class="command-label">
      <slot name="command-label"></slot>
    </div>
    <div class="command-content">
      <div class="form-field-wrapper" v-if="include_command_name_input">
        <label class="label"> Name </label>
        <validated-input ref="name"
                         id="name"
                         v-model="d_ag_command.name"
                         :validators="[is_not_empty]"
                         input_style="width: 100%"
                         @input="$emit('input', d_ag_command)">
        </validated-input>
      </div>

      <div class="form-field-wrapper">
        <label class="label"> Command </label>
        <validated-input ref="cmd"
                         id="cmd"
                         v-model="d_ag_command.cmd"
                         :validators="[is_not_empty]"
                         input_style="width: 100%"
                         @input="$emit('input', d_ag_command)">
        </validated-input>
      </div>

      <div class="resource-limits-label" @click="toggle_is_open">
        <i v-if="d_is_open" class="fas fa-caret-down caret-down"></i>
        <i v-else class="fas fa-caret-right caret-right"></i>
        <span class="header-text"> Resource Limits </span>
      </div>

      <resource-limit-settings
        v-if="d_is_open"
        :resource_limits="d_ag_command"
        @field_change="Object.assign(d_ag_command, $event); $emit('input', d_ag_command)">
      </resource-limit-settings>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGCommand } from 'ag-client-typescript';

import ResourceLimitSettings from '@/components/project_admin/resource_limit_settings.vue';
import ValidatedInput, { ValidatorResponse } from "@/components/validated_input.vue";
import {
    is_integer,
    is_non_negative,
    is_not_empty,
    make_min_value_validator,
    string_to_num
} from '@/validators';

@Component({
  components: {
    ResourceLimitSettings,
    ValidatedInput
  }
})
export default class MutationCommand extends Vue {

  @Prop({required: true, type: Object})
  value!: AGCommand;

  @Prop({default: false, type: Boolean})
  include_command_name_input!: boolean;

  d_is_open = false;
  d_ag_command: AGCommand | null = null;

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_non_negative = is_non_negative;
  readonly is_greater_than_or_equal_to_one = make_min_value_validator(1);
  readonly string_to_num = string_to_num;

  toggle_is_open() {
    this.d_is_open = !this.d_is_open;
  }

  @Watch('value')
  on_value_changed(new_value: AGCommand, old_value: AGCommand) {
    this.d_ag_command = JSON.parse(JSON.stringify(new_value));
  }

  created() {
    this.d_ag_command = JSON.parse(JSON.stringify(this.value));
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';
@import '@/styles/section_header.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.caret-down, .caret-right {
  font-size: .875rem;
}

.command-label {
  align-items: center;
  display: flex;
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: .25rem;
}

.resource-limits-label {
  @include collapsible-section-header($pad-text: true, $line-color: $stormy-gray-light);

  margin-bottom: .5rem;
  font-size: .875rem;
}

.unit-of-measurement {
  font-size: .875rem;
  padding-left: .625rem;
}
</style>
