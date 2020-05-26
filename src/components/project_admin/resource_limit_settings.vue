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
    <div class="resource-limit-wrapper">
      <div class="resource-limit form-field-wrapper">
        <label class="label"> Time limit </label>
        <div class="resource-input">
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
      </div>

      <!-- <div class="resource-limit form-field-wrapper">
        <label class="label"> Process spawn limit </label>
        <div class="resource-input">
          <validated-input ref="process_spawn_limit"
                            id="input-process-spawn-limit"
                            v-model="d_resource_limits.process_spawn_limit"
                            @input="$emit('field_change', d_resource_limits)"
                            input_style="width: 150px;"
                            :validators="[
                              is_not_empty,
                              is_integer,
                              is_greater_than_or_equal_to_zero,
                              max_process_limit_validator,
                            ]"
                            :from_string_fn="string_to_num">
            <div slot="suffix" class="unit-suffix"> child processes </div>
          </validated-input>
        </div>
      </div> -->
    </div>

    <div class="resource-limit-wrapper">
      <div class="resource-limit form-field-wrapper">
        <label class="label"> Virtual memory limit </label>
        <div class="resource-input">
          <validated-input ref="virtual_memory_limit"
                            id="input-virtual-memory-limit"
                            v-model="d_resource_limits.virtual_memory_limit"
                            @input="$emit('field_change', d_resource_limits)"
                            input_style="width: 150px;"
                            :validators="[
                              is_not_empty,
                              is_integer,
                              is_greater_than_or_equal_to_one,
                            ]"
                            :from_string_fn="string_to_num">
            <div slot="suffix" class="unit-suffix"> bytes </div>
          </validated-input>
        </div>
      </div>

      <!-- <div class="resource-limit form-field-wrapper">
        <label class="label"> Stack size limit </label>
        <div class="resource-input">
          <validated-input ref="stack_size_limit"
                            id="input-stack-size-limit"
                            v-model="d_resource_limits.stack_size_limit"
                            @input="$emit('field_change', d_resource_limits)"
                            input_style="width: 150px;"
                            :validators="[
                              is_not_empty,
                              is_integer,
                              is_greater_than_or_equal_to_one,
                              max_stack_size_validator,
                            ]"
                            :from_string_fn="string_to_num">
            <div slot="suffix" class="unit-suffix"> bytes </div>
          </validated-input>
        </div>
      </div> -->
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
  // MAX_VIRTUAL_MEM_LIMIT,
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
  stack_size_limit: number;
  virtual_memory_limit: number;
  process_spawn_limit: number;

  constructor(args: ResourceLimits) {
    this.time_limit = args.time_limit;
    this.stack_size_limit = args.stack_size_limit;
    this.virtual_memory_limit = args.virtual_memory_limit;
    this.process_spawn_limit = args.process_spawn_limit;
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
  readonly max_stack_size_validator = make_max_value_validator(MAX_STACK_SIZE_LIMIT);
  // readonly max_virtual_memory_validator = make_max_value_validator(MAX_VIRTUAL_MEM_LIMIT);
  readonly max_process_limit_validator = make_max_value_validator(MAX_PROCESS_LIMIT);

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

.resource-limit-wrapper {
  display: flex;
  flex-wrap: wrap;

  @media only screen and (min-width: 700px) {
    .resource-limit {
      width: 50%;
      max-width: 330px;
    }
  }
}

.unit-suffix {
  padding-left: .5rem;
  font-size: .875rem;
}

</style>
