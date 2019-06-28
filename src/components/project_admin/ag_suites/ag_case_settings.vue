<template>
  <div>
    <div id="ag-test-case-settings-component">
      <validated-form ref="ag_test_case_settings_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="save_ag_test_case_settings"
                      @form_validity_changed="settings_form_is_valid = $event">

          <div id="name-container">
            <label class="text-label"> Case name </label>
            <validated-input ref="name"
                             v-model="d_ag_test_case.name"
                             :validators="[is_not_empty]">
            </validated-input>
          </div>
          <div id="button-footer">
            <APIErrors ref="api_errors"></APIErrors>

            <button id="save-button"
                    type="submit"
                    :disabled="!settings_form_is_valid || saving"> Save Updates
            </button>
          </div>
      </validated-form>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCase } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGCaseSettings extends Vue {

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  readonly is_not_empty = is_not_empty;

  default_case_feedback_config = {
    visible: false,
    show_individual_commands: false
  };

  d_ag_test_case: AGTestCase = new AGTestCase({
    pk: 1,
    name: "",
    ag_test_suite: 1,
    normal_fdbk_config: this.default_case_feedback_config,
    ultimate_submission_fdbk_config: this.default_case_feedback_config,
    past_limit_submission_fdbk_config: this.default_case_feedback_config,
    staff_viewer_fdbk_config: this.default_case_feedback_config,
    last_modified: '',
    ag_test_commands: []
  });

  saving = false;
  settings_form_is_valid = true;

  @Watch('ag_test_case', {deep: true})
  on_test_case_change(new_test_case: AGTestCase, old_test_case: AGTestCase) {
    this.d_ag_test_case = deep_copy(new_test_case, AGTestCase);
  }

  created() {
    this.d_ag_test_case = deep_copy(this.ag_test_case, AGTestCase);
  }

  @handle_api_errors_async(handle_save_ag_test_case_settings_error)
  async save_ag_test_case_settings() {
    try {
      this.saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_ag_test_case!.save();
    }
    finally {
      this.saving = false;
    }
  }
}

function handle_save_ag_test_case_settings_error(component: AGCaseSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
$current-lang-choice: "Poppins";

#button-footer {
  margin: 12px 0 0 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

#save-button {
  @extend .green-button;
}

</style>
