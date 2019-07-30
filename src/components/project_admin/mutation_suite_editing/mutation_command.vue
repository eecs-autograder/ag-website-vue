<template>
  <div>
    <validated-form id="ag-command-settings-form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit="save_ag_command_settings"
                    @form_validity_changed="d_ag_command_settings_form_is_valid = $event">

      <validated-input ref="ag_command_cmd"
                       id="command-cmd"
                       v-model="d_ag_command.cmd"
                       :validators="[is_not_empty]">
      </validated-input>

      <validated-input ref="ag_command_time_limit"
                       id="command-time-limit"
                       v-model="d_ag_command.time_limit"
                       :validators="[is_not_empty]">
        <div slot="suffix" class="unit-of-measurement"> second(s) </div>
      </validated-input>

      <validated-input ref="ag_command_stack_size_limit"
                       id="command-stack-size-limit"
                       v-model="d_ag_command.stack_size_limit"
                       :validators="[is_not_empty]">
        <div slot="suffix" class="unit-of-measurement"> bytes </div>
      </validated-input>

      <validated-input ref="ag_command_virtual_memory_limit"
                       id="command-virtual-memory-limit"
                       v-model="d_ag_command.virtual_memory_limit"
                       :validators="[is_not_empty]">
        <div slot="suffix" class="unit-of-measurement"> bytes </div>
      </validated-input>

      <validated-input ref="ag_command_process_spawn_limit"
                       id="command-process-spawn-limit"
                       v-model="d_ag_command.process_spawn_limit"
                       :validators="[is_not_empty]">
        <div slot="suffix" class="unit-of-measurement"> child processes </div>
      </validated-input>

      <div class="bottom-of-form">
        <APIErrors ref="api_errors"></APIErrors>

        <button type="submit"
                class="save-button"
                :disabled="!d_ag_command_settings_form_is_valid || d_saving">
          Save
        </button>
      </div>

    </validated-form>
  </div>
</template>

<script lang="ts">
import APIErrors from '@/components/api_errors.vue';
import { handle_api_errors_async } from "@/utils";
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGCommand } from 'ag-client-typescript/dist/src/ag_command';
import ValidatedForm from "@/components/validated_form.vue";
import ValidatedInput, {ValidatorResponse} from "@/components/validated_input.vue";
import { is_not_empty } from '@/validators';

@Component({
    components: {
      ValidatedForm,
      ValidatedInput
    }
})
export default class MutationCommand extends Vue {
  @Prop({required: true, type: Object})
  ag_command!: AGCommand;

  d_ag_command: AGCommand | null = null;
  d_ag_command_settings_form_is_valid = true;
  d_saving = false;

  readonly is_not_empty = is_not_empty;

  @Watch('ag_command')
  on_ag_command_change(new_value: AGCommand, old_value:AGCommand) {
    this.d_ag_command = JSON.parse(JSON.stringify(new_value));
  }

  created() {
    this.d_ag_command = JSON.parse(JSON.stringify(this.ag_command));
  }

  @handle_api_errors_async(handle_save_mutation_command_settings_error)
  save_ag_command_settings() {
    console.log("trying to save");
  }
}

function handle_save_mutation_command_settings_error(component: MutationCommand, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
</style>
