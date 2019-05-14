<template>
  <div id="ag-test-suite-settings-component">
    <div v-if="!loading">
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
                              @submit.native.prevent="save_ag_test_command_settings"
                              @form_validity_changed="settings_form_is_valid = $event">

                <div id="name-container">
                  <label class="text-label"> Name </label>
                  <validated-input ref="case_name"
                                   v-model="test_case.name"
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
                Delete Case: <span> {{test_case.name}} </span>
              </button>

              <modal ref="delete_case_modal"
                     :size="'large'"
                     :include_closing_x="false">
                <div class="modal-header">
                  Are you sure you want to delete the case:
                  <span class="case-to-delete">{{test_case.name}}</span>?
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
    <div v-else class="loading-spinner">
      <i class="fa fa-spinner fa-pulse"></i>
    </div>
  </div>
</template>

<script lang="ts">
  import { ExpectedStudentFile, InstructorFile } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  import APIErrors from '@/components/api_errors.vue';
  import Dropdown from '@/components/dropdown.vue';
  import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
  import Modal from '@/components/modal.vue';
  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import Toggle from '@/components/toggle.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
  import ValidatedForm from '@/components/validated_form.vue';

  import {
    is_integer,
    is_non_negative,
    is_not_empty,
    is_number,
    string_to_num
  } from '@/validators';

  interface AGTestSuite {
    pk: number;
    name: string;
    project: number;
    instructor_files_needed: string[];
    student_files_needed: string[];
    setup_suite_cmd: string;
    setup_suite_cmd_name: string;
    sandbox_docker_image: string;
    allow_network_access: boolean;
    deferred: boolean;
    last_modified: string;
  }

  @Component({
               components: {
                 APIErrors,
                 Dropdown,
                 DropdownTypeahead,
                 Modal,
                 Tab,
                 TabHeader,
                 Tabs,
                 Toggle,
                 Tooltip,
                 ValidatedForm,
                 ValidatedInput
               }
             })
  export default class AGCaseSettings extends Vue {
    current_tab_index = 0;
    saving = false;
    loading = true;
    settings_form_is_valid = false;

    test_case = {
      name: "Test Case 1",
    };

    async created() {
      this.loading = false;
    }

    delete_ag_test_case() {

    }

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

  .bottom-of-form {
    padding: 0 14px 50px 14px;
  }

  .delete-case-button {
    @extend .red-button;
    margin: 15px 0 0 0;
  }

  .case-to-delete {
    color: $ocean-blue;
    margin-left: 3px;
  }

</style>
