<template>
  <div id="ag-test-case-settings-component" v-if="d_test_case !== null">
    <div>
      <validated-form id="command-settings-form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit.native.prevent="save_ag_test_case_settings"
                      @form_validity_changed="settings_form_is_valid = $event">

        <div id="name-container">
          <label class="text-label"> Case name </label>
          <validated-input ref="case_name"
                           v-model="d_test_case.name"
                           :validators="[is_not_empty]">
          </validated-input>
        </div>

        <div class="bottom-of-form">
          <APIErrors ref="api_errors"></APIErrors>

          <button type="submit"
                  class="save-button"
                  :disabled="!settings_form_is_valid || saving"> Save Updates
          </button>

          <div v-if="!saving" class="last-saved-timestamp">
          <span> Last Saved: </span>
            {{(new Date(d_test_case.last_modified)).toLocaleString(
            'en-US', last_modified_format
            )}}
          </div>

          <div v-else class="last-saved-spinner">
            <i class="fa fa-spinner fa-pulse"></i>
          </div>
        </div>
      </validated-form>
    </div>

    <hr>

    <div id="feedback-container"> Feedback </div>


        <!------------------------ Case Feedback Tab ------------------------------------->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCase } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    Modal,
    Tab,
    TabHeader,
    Tabs,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGCaseSettings extends Vue {

  @Prop({required: true, type: AGTestCase})
  test_case!: AGTestCase;

  @Watch('test_case')
  on_test_case_change(new_test_case: AGTestCase, old_test_case: AGTestCase) {
    this.d_test_case = deep_copy(new_test_case, AGTestCase);
    if (this.current_tab_index === 2) {
      this.current_tab_index = 0;
    }
  }

  current_tab_index = 0;
  d_test_case: AGTestCase | null = null;
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};
  saving = false;
  settings_form_is_valid = false;

  readonly is_not_empty = is_not_empty;

  created() {
    this.d_test_case = deep_copy(this.test_case, AGTestCase);
  }

  async delete_ag_case() {
    await this.d_test_case!.delete();
  }

  @handle_api_errors_async(handle_save_ag_suite_settings_error)
  async save_ag_test_case_settings() {
    try {
      this.saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_test_case!.save();
    }
    finally {
      this.saving = false;
    }
  }
}

function handle_save_ag_suite_settings_error(component: AGCaseSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/components/ag_tests.scss';
$current-lang-choice: "Poppins";

#ag-test-case-settings-component {
  font-family: $current-lang-choice;
}

#name-container {
  padding: 10px 12px 22px 12px;
}

#feedback-container {
  padding: 10px 12px 22px 12px;
}

</style>
