<template>
  <div id="mutation-command-component">
    <validated-form id="ag-settings-form"
                    autocomplete="off"
                    spellcheck="false"
                    @form_validity_changed="d_ag_command_settings_form_is_valid = $event;
                                            $emit('form_validity_changed',
                                              d_ag_command_settings_form_is_valid)">
      <div class="input-container"
           v-if="include_command_name">
        <label class="text-label"> Name </label>
        <validated-input ref="name"
                         id="name"
                         v-model="d_ag_command.name"
                         :validators="[is_not_empty]"
                         input_style="max-width: 500px; width: 100%"
                         @change="$emit('input', d_ag_command)">
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Command </label>
        <validated-input ref="cmd"
                         id="cmd"
                         v-model="d_ag_command.cmd"
                         :validators="[is_not_empty]"
                         input_style="max-width: 500px; width: 100%"
                         @change="$emit('input', d_ag_command)">
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Time limit </label>
        <validated-input ref="time_limit"
                         id="time-limit"
                         v-model="d_ag_command.time_limit"
                         :validators="[
                           is_not_empty,
                           is_integer,
                           is_greater_than_or_equal_to_one
                         ]"
                         input_style="width: 150px"
                         @change="$emit('input', d_ag_command)"
                         :from_string_fn="string_to_num">
          <div slot="suffix" class="unit-of-measurement"> second(s) </div>
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Stack size limit </label>
        <validated-input ref="stack_size_limit"
                         id="stack-size-limit"
                         v-model="d_ag_command.stack_size_limit"
                         :validators="[
                           is_not_empty,
                           is_integer,
                           is_greater_than_or_equal_to_one
                         ]"
                         input_style="width: 150px"
                         @change="$emit('input', d_ag_command)"
                         :from_string_fn="string_to_num">
          <div slot="suffix" class="unit-of-measurement"> bytes </div>
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Virtual memory limit </label>
        <validated-input ref="virtual_memory_limit"
                         id="virtual-memory-limit"
                         v-model="d_ag_command.virtual_memory_limit"
                         :validators="[
                           is_not_empty,
                           is_integer,
                           is_greater_than_or_equal_to_one
                         ]"
                         input_style="width: 150px"
                         @change="$emit('input', d_ag_command)"
                         :from_string_fn="string_to_num">
          <div slot="suffix" class="unit-of-measurement"> bytes </div>
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Process spawn limit </label>
        <validated-input ref="process_spawn_limit"
                         id="process-spawn-limit"
                         v-model="d_ag_command.process_spawn_limit"
                         :validators="[
                           is_not_empty,
                           is_integer,
                           is_non_negative
                         ]"
                         input_style="width: 150px"
                         @change="$emit('input', d_ag_command)"
                         :from_string_fn="string_to_num">
          <div slot="suffix" class="unit-of-measurement"> child processes </div>
        </validated-input>
      </div>

    </validated-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGCommand } from 'ag-client-typescript/dist/src/ag_command';

import ValidatedForm from "@/components/validated_form.vue";
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
    ValidatedForm,
    ValidatedInput
  }
})
export default class MutationCommand extends Vue {
  @Prop({required: true, type: Object})
  value!: AGCommand;

  @Prop({default: false, type: Boolean})
  include_command_name!: boolean;

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_non_negative = is_non_negative;
  readonly is_greater_than_or_equal_to_one = make_min_value_validator(1);
  readonly string_to_num = string_to_num;

  d_ag_command: AGCommand | null = null;
  d_ag_command_settings_form_is_valid = true;

  @Watch('value')
  on_ag_command_change(new_value: AGCommand, old_value: AGCommand) {
    this.d_ag_command = JSON.parse(JSON.stringify(new_value));
  }

  created() {
    this.d_ag_command = JSON.parse(JSON.stringify(this.value));
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';

.input-container {
  margin: 10px 0;
}

.unit-of-measurement {
  font-size: 14px;
  padding-left: 10px;
}

</style>
