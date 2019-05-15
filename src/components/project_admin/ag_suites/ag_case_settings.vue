<template>
  <div id="ag-test-suite-settings-component">
    <div>
      <tabs ref="tabs-gray" v-model="current_tab_index"
            tab_active_class="gray-white-theme-active"
            tab_inactive_class="gray-white-theme-inactive">

        <!------------------------ Case Settings Tab ------------------------------------->

        <tab>
          <tab-header>
            <div class="tab-heading"> Case Settings </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">
              <validated-form id="command-settings-form"
                              autocomplete="off"
                              spellcheck="false"
                              @submit.native.prevent="save_ag_test_case_settings"
                              @form_validity_changed="settings_form_is_valid = $event">

                <div id="name-container">
                  <label class="text-label"> Case name </label>
                  <validated-input ref="case_name"
                                   v-model="d_ag_test_case.name"
                                   :validators="[is_not_empty]">
                  </validated-input>
                </div>

                <div class="bottom-of-form">
                  <APIErrors ref="api_errors"></APIErrors>

                  <button type="submit"
                          class="save-button"
                          :disabled="!settings_form_is_valid"> Save Updates
                  </button>

                  <div v-if="!saving" class="last-saved-timestamp">
                    <span> Last Saved: </span>
                  </div>

                  <div v-else class="last-saved-spinner">
                    <i class="fa fa-spinner fa-pulse"></i>
                  </div>
                </div>

              </validated-form>
            </div>
          </template>
        </tab>

        <!------------------------ Case Feedback Tab ------------------------------------->

        <tab>
          <tab-header>
            <div class="tab-heading">
              Feedback
            </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">

            </div>
          </template>
        </tab>

        <!--------------------------- Danger Zone Tab --------------------------------------->

        <tab>
          <tab-header>
            <div class="tab-heading">
              Danger Zone
            </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">

              <button class="delete-case-button"
                      type="button"
                      @click="$refs.delete_case_modal.open()">
                Delete Case: <span> {{d_ag_test_case.name}} </span>
              </button>

              <modal ref="delete_case_modal"
                     :size="'large'"
                     :include_closing_x="false">
                <div class="modal-header">
                  Are you sure you want to delete the case:
                  <span class="case-to-delete">{{d_ag_test_case.name}}</span>?
                </div>
                <hr>
                <div class="modal-body">
                  <p> This action cannot be reversed! </p>
                  <div id="modal-button-container">
                    <button class="modal-delete-button"
                            @click="delete_ag_test_case()"> Delete </button>

                    <button class="modal-cancel-button"
                            @click="$refs.delete_case_modal.close()"> Cancel </button>
                  </div>
                </div>
              </modal>
            </div>
          </template>
        </tab>

      </tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { handle_api_errors_async } from '@/utils';
import { Component, Vue } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import ValidatedForm from '@/components/validated_form.vue';

import { is_not_empty } from '@/validators';

interface AGTestCase {
  pk: number;
  name: string;
  ag_test_suite: number;
  ag_test_commands: AGTestCommand[];
  last_modified: string;
}

interface AGTestCommand {
  pk: number;
  name: string;
  ag_test_case: number;
  last_modified: number;
  cmd: string;
  stdin_source: string;
  stdin_text: string;
  stdin_instructor_file: string;
  expected_return_code: string;
  expected_stdout_source: string;
  expected_stdout_text: string;
  expected_stdout_instructor_file: string;
  expected_stderr_source: string;
  expected_stderr_text: string;
  expected_stderr_instructor_file: string;
  ignore_case: boolean;
  ignore_whitespace: boolean;
  ignore_whitespace_changes: boolean;
  ignore_blank_lines: boolean;
  points_for_correct_return_code: number;
  points_for_correct_stdout: number;
  points_for_correct_stderr: number;
  deduction_for_wrong_return_code: number;
  deduction_for_wrong_stdout: number;
  deduction_for_wrong_stderr: number;
  normal_feedback_config: null;
  first_failed_test_normal_fdbk_config: null;
  ultimate_submission_fdbk_config: null;
  past_limit_submission_fdbk_config: null;
  staff_viewer_fdbk_config: null;
  time_limit: number;
  stack_size_limit: number;
  virtual_memory_limit: number;
  process_spawn_limit: number;
}

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
  current_tab_index = 0;
  saving = false;
  settings_form_is_valid = false;

  // will be a prop
  ag_test_case: AGTestCase = {
    pk: 1,
    name: "Test Case 1",
    ag_test_suite: 2,
    ag_test_commands: [],
    last_modified: ""
  };
  d_ag_test_case!: AGTestCase;

  readonly is_not_empty = is_not_empty;

  created() {
    this.d_ag_test_case = this.ag_test_case;
  }

  async delete_ag_test_case() {
    // call to delete test case 4ever
  }

  @handle_api_errors_async(handle_save_ag_suite_settings_error)
  save_ag_test_case_settings() {
    try {
      this.saving = true;
      // call to save test case
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

#name-container {
  padding: 10px 12px 22px 12px;
}

.delete-case-button {
  @extend .delete-level-button;
}

.case-to-delete {
  @extend .item-to-delete;
}

</style>
