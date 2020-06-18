<template>
  <!--
    This component provides a common abstraction for form segments
    that contain resource limit data.

    This component does NOT support v-model. See below for usage.

    USAGE:

    <resource-limit-settings
      :resource_limits="my_command"
      @field_change="Object.assign(my_command, $event)"></resource-limit-settings>
  -->

  <div class="resource-limit-settings">
    <div class="form-field-wrapper">
      <label class="label"> Time limit </label>
        <validated-input ref="time_limit"
                          id="input-time-limit"
                          v-model="d_resource_limits.time_limit"
                          @input="$emit('field_change', d_resource_limits)"
                          input_style="width: 150px;"
                          :validators="[
                            is_not_empty,
                            is_integer,
                            is_greater_than_or_equal_to_one,
                            max_command_timeout_validator,
                          ]"
                          :from_string_fn="string_to_num">
          <div slot="suffix" class="unit-suffix"> seconds </div>
        </validated-input>
    </div>

    <div class="advanced-limits-info">
      <i class="fas fa-info-circle"></i>
      The options below can be used to apply stricter resource limits
      for pedagogical purposes.<br>
      We apply separate (less restrictive) limits to preserve system
      integrity.
    </div>

    <div class="form-field-wrapper">
      <div class="checkbox-input-container">
        <label class="label">
          <input data-testid="limit_virtual_memory"
                 type="checkbox"
                 class="checkbox"
                 v-model="d_resource_limits.use_virtual_memory_limit"
                 @change="$emit('field_change', d_resource_limits)"/>
          Limit virtual memory
          <tooltip width="large">
            Limiting virtual memory can sometimes provide cleaner error messages
            when the test uses too much memory.<br>
            Note: Some programs (Java applications, for example) may crash
            prematurely if the virtual memory limit is too small.
          </tooltip>
        </label>
      </div>
      <div v-if="d_resource_limits.use_virtual_memory_limit">
        <label class="label">Virtual memory limit</label>
        <validated-input
          ref="virtual_memory_limit"
          id="input-virtual-memory-limit"
          :value="Math.floor(
            d_resource_limits.virtual_memory_limit / Math.pow(10, 6)
          )"
          @input="d_resource_limits.virtual_memory_limit = $event * Math.pow(10, 6);
                  $emit('field_change', d_resource_limits)"
          input_style="width: 100px;"
          :validators="[
            is_not_empty,
            is_integer,
            is_greater_than_or_equal_to_one,
          ]"
          :from_string_fn="string_to_num"
        >
          <div slot="suffix" class="unit-suffix"> MB </div>
        </validated-input>
      </div>
    </div>

    <div class="form-field-wrapper">
      <div class="checkbox-input-container">
        <label class="label">
          <input data-testid="block_process_spawn"
                 type="checkbox"
                 class="checkbox"
                 v-model="d_resource_limits.block_process_spawn"
                 @change="$emit('field_change', d_resource_limits)"/>
          Block subprocess spawning
          <tooltip width="large">
            Only use this option if you know that your test does not
            need to spawn subprocesses to work correctly.
          </tooltip>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Tooltip from '@/components/tooltip.vue';
import ValidatedInput from '@/components/validated_input.vue';
import {
  MAX_COMMAND_TIMEOUT,
  MAX_PROCESS_LIMIT,
  MAX_STACK_SIZE_LIMIT,
} from '@/constants';
import {
  is_integer,
  is_not_empty,
  make_max_value_validator,
  make_min_value_validator,
  string_to_num,
} from '@/validators';

class ResourceLimits {
  time_limit: number;
  use_virtual_memory_limit: boolean;
  virtual_memory_limit: number;
  block_process_spawn: boolean;

  constructor(args: ResourceLimits) {
    this.time_limit = args.time_limit;
    this.use_virtual_memory_limit = args.use_virtual_memory_limit;
    this.virtual_memory_limit = args.virtual_memory_limit;
    this.block_process_spawn = args.block_process_spawn;
  }
}

@Component({
  components: {
    Tooltip,
    ValidatedInput,
  }
})
export default class ResourceLimitSettings extends Vue {
  @Prop({required: true})
  resource_limits!: ResourceLimits;

  d_resource_limits: ResourceLimits | null = null;

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_greater_than_or_equal_to_zero = make_min_value_validator(0);
  readonly is_greater_than_or_equal_to_one = make_min_value_validator(1);
  readonly is_less_than_or_equal_to_zero = make_max_value_validator(0);
  readonly string_to_num = string_to_num;

  readonly max_command_timeout_validator = make_max_value_validator(MAX_COMMAND_TIMEOUT);

  created() {
    this.d_resource_limits = new ResourceLimits(this.resource_limits);
  }

  @Watch('resource_limits', {deep: true})
  on_suite_changed(new_value: ResourceLimits, old_value: ResourceLimits) {
    this.d_resource_limits = new ResourceLimits(new_value);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.unit-suffix {
  padding-left: .5rem;
  font-size: .875rem;
}

.form-field-wrapper {
  margin-bottom: 1rem;
}

.advanced-limits-info {
  margin: 1rem 0;
  font-size: .875rem;
}

.fa-info-circle {
  color: $ocean-blue;
}
</style>
