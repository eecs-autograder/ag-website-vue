<template>
  <div id="ag-test-suite-settings-component">
    <div v-if="!loading">
      <tabs ref="tabs-gray" v-model="current_tab_index"
            tab_active_class="gray-white-theme-active"
            tab_inactive_class="gray-white-theme-inactive">

        <!------------------------ Suite Settings Tab ------------------------------------->
        <tab>
          <tab-header>
            <div class="tab-heading"> Suite Settings </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">

<!--              <div class="section-container">-->
<!--                <fieldset>-->
<!--                  <legend> Add a new Case </legend>-->
<!--                  <div class="add-case-container">-->
<!--                    <button class="teal-button"> Add Case </button>-->
<!--                  </div>-->
<!--                </fieldset>-->
<!--              </div>-->

              <validated-form id="suite-settings-form"
                              autocomplete="off"
                              spellcheck="false"
                              @submit.native.prevent="save_ag_test_suite_settings"
                              @form_validity_changed="settings_form_is_valid = $event">

                <div id="name-container">
                  <label class="text-label"> Name </label>
                  <validated-input ref="suite_name"
                                   id="input-name"
                                   v-model="suite.name"
                                   :validators="[is_not_empty]">
                  </validated-input>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Grading </legend>
                    <div class="command-input-container">
                      <label class="text-label"> Sandbox environment: </label>
                      <div class="dropdown">
                        <dropdown ref="sandbox_environment_dropdown"
                                  :items="docker_images"
                                  @update_item_selected="suite.sandbox_docker_image = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{suite.sandbox_docker_image}}
                                <i class="fas fa-caret-down dropdown-caret"></i>
                              </div>
                            </div>
                          </template>
                          <div slot-scope="{item}">
                            <span class="dropdown-item">{{item}}</span>
                          </div>
                        </dropdown>
                      </div>
                    </div>

                    <div class="toggle-container">
                      <toggle v-model="suite.deferred">
                        <div slot="on">
                          Deferred
                        </div>
                        <div slot="off">
                          Synchronous
                        </div>
                      </toggle>
                      <i class="fas fa-question-circle input-tooltip">
                        <tooltip width="medium" placement="right">
                          Students can re-submit once all synchronous test suites are finished.
                          Deferred test suites are graded whenever resources are available,
                          but they do not block students from re-submitting.
                        </tooltip>
                      </i>
                    </div>

                    <div class="toggle-container">
                      <toggle v-model="suite.allow_network_access">
                        <div slot="on">
                          Allow external network access
                        </div>
                        <div slot="off">
                          Block external network access
                        </div>
                      </toggle>
                    </div>

                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Project Files </legend>
                    <div class="typeahead-search-bar">
                      <dropdown-typeahead ref="project_files_typeahead"
                                          placeholder_text="Enter a filename"
                                          :choices="instructor_files"
                                          :filter_fn="instructor_file_filter_fn"
                                          @update_item_chosen="$emit('update_group_selected', $event)">
                        <template slot-scope="{item}">
                          <span class="typeahead-row">
                            {{item}}
                          </span>
                        </template>
                      </dropdown-typeahead>
                    </div>

                    <div class="instructor-files">
                      <div v-for="(file, index) of suite.instructor_files_needed"
                           :class="['file', {'odd-index': index % 2 !== 0}]"> {{file}} </div>
                    </div>

                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Student Files </legend>
                    <div class="typeahead-search-bar">
                      <dropdown-typeahead ref="project_files_typeahead"
                                          placeholder_text="Enter a filename"
                                          :choices="expected_student_files"
                                          :filter_fn="expected_student_file_filter_fn"
                                          @update_item_chosen="$emit('update_group_selected', $event)">
                        <template slot-scope="{item}">
                          <span class="typeahead-row">
                            {{item}}
                          </span>
                        </template>
                      </dropdown-typeahead>
                    </div>

                    <div class="student-files">
                      <div v-for="(file, index) of suite.student_files_needed"
                           :class="['file', {'odd-index': index % 2 !== 0}]"> {{file}} </div>
                    </div>

                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend>  Setup </legend>

                    <div id="setup-command-label-container">
                      <label class="text-label"> Setup command label </label>
                      <validated-input ref="suite_name"
                                       id="settup-command-label"
                                       v-model="suite.setup_suite_cmd_name"
                                       :validators="[is_not_empty]">
                      </validated-input>
                    </div>

                    <div id="setup-command-container">
                      <label class="text-label"> Setup command </label>
                      <validated-input ref="suite_name"
                                       id="setup-command"
                                       v-model="suite.setup_suite_cmd"
                                       :validators="[is_not_empty]">
                      </validated-input>
                    </div>

                  </fieldset>
                </div>

                <div class="bottom-of-form">
                  <APIErrors ref="api_errors"></APIErrors>

                  <button type="submit"
                          class="save-button"
                          :disabled="!settings_form_is_valid"> Save Updates
                  </button>

                  <div v-if="!saving" class="last-saved-timestamp">
                    <span> Last Saved: </span>
                    {{(new Date(suite.last_modified)).toLocaleString(
                    'en-US', last_modified_format
                    )}}
                  </div>

                  <div v-else class="last-saved-spinner">
                    <i class="fa fa-spinner fa-pulse"></i>
                  </div>
                </div>

              </validated-form>
            </div>
          </template>
        </tab>

        <!------------------------ Command Feedback Tab ------------------------------------->
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

              <button class="delete-suite-button"
                      type="button"
                      @click="$refs.delete_suite_modal.open()">
                Delete Suite: <span> {{suite.name}} </span>
              </button>

              <modal ref="delete_suite_modal"
                     :size="'large'"
                     :include_closing_x="false">
                <div class="modal-header">
                  Are you sure you want to delete the suite:
                  <span class="suite-to-delete">{{suite.name}}</span>?
                </div>
                <hr>
                <div class="modal-body">
                  <p> This action cannot be reversed! </p>
                  <div id="modal-button-container">
                    <button class="modal-delete-button"
                            @click="delete_ag_test_suite()"> Delete </button>

                    <button class="modal-cancel-button"
                            @click="$refs.delete_suite_modal.close()"> Cancel </button>
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
  export default class AGSuiteSettings extends Vue {
    current_tab_index = 0;
    saving = false;
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'};
    loading = true;
    docker_images = [
      "Default",
      "EECS 280",
      "EECS 280"
    ];

    instructor_files = ["Card.h", "Pack.h"];
    expected_student_files = ["Card.cpp", "Pack.cpp"];
    settings_form_is_valid = false;

    suite: AGTestSuite = {
      pk: 1,
      name: "AG Test Suite",
      project: 1,
      instructor_files_needed: ["euchre_test50.in", "pack.in"],
      student_files_needed: ["Player_tests.cpp", "euchre.cpp", "Player.cpp"],
      setup_suite_cmd: "",
      setup_suite_cmd_name: "",
      sandbox_docker_image: "Default",
      allow_network_access: false,
      deferred: false,
      last_modified: ""
    };

    readonly is_non_negative = is_non_negative;
    readonly is_not_empty = is_not_empty;
    readonly is_integer = is_integer;
    readonly is_number = is_number;
    readonly string_to_num = string_to_num;

    async created() {
      this.loading = false;
    }

    delete_ag_test_suite() {

    }

    instructor_file_filter_fn(file: InstructorFile, filter_text: string) {
      return file.name.indexOf(filter_text) >= 0;
    }

    expected_student_file_filter_fn(file: ExpectedStudentFile, filter_text: string) {
      return file.pattern.indexOf(filter_text) >= 0;
    }

    async save_ag_test_suite_settings() {
      this.saving = true;
      try {

      }
      finally {
        this.saving = false;
      }
    }

  }
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/components/ag_tests.scss';
$current-lang-choice: "Poppins";

.add-case-container {
  padding: 15px 10px;
}

#ag-test-suite-settings-component {
  font-family: $current-lang-choice;
}

#setup-command-container {
  margin: 15px 0 0 0;
}

.toggle-container {
  font-size: 14px;
  margin: 12px 5px 3px 3px;
  padding-bottom: 10px;
  min-width: 500px;
}

.instructor-files, .student-files {
  margin: 10px 0;
  border: 1px solid hsl(210, 20%, 94%);
  display: inline-block;
}

.file {
  padding: 5px 10px;
}

.odd-index {
  background-color: hsl(210, 20%, 96%);
}

.tab-body {
  padding: 0 15px;
  height: 90vh;
  overflow: scroll;
}

.suite-to-delete {
  color: $ocean-blue;
  margin-left: 3px;
}

.delete-suite-button {
  @extend .red-button;
  margin: 15px 0 0 0;
}

.delete-suite-button span {
  margin-left: 3px;
  font-style: italic;
}

.command-input-container {
  padding: 10px 0 10px 3px;
}

#name-container {
  padding: 10px 12px 22px 12px;
}

.file-dropdown-container {
  display: inline-block;
  vertical-align: top;
  margin-top: 10px;
}

.file-dropdown-adjacent {
  display: inline-block;
  margin-right: 50px;
  vertical-align: top;
}

.text-container {
  margin-top: 10px;
}

.suite-settings-input {
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  box-sizing: border-box;
  color: #495057;
  display: inline-block;
  font-size: 1rem;
  line-height: 1.5;
  position: relative;
  padding: .375rem .75rem;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  width: 80px;
}

.bottom-of-form {
  padding: 0 14px 0px 14px;
}

// Checkbox related ************************************************************

input[type=checkbox] + label::before {
  border-radius: 2px;
  color: hsl(210, 20%, 86%);
  content: '\f0c8';
  display: inline-block;
  font-family: "Font Awesome 5 Free";
  font-size: 18px;
  height: 18px;
  margin-right: 10px;
  width: 12px;
}

input[type=checkbox]:checked + label::before {
  background: transparent;
  content: '\f14a';
  color: $ocean-blue;
  font-family: "Font Awesome 5 Free";
  height: 18px;
  width: 12px;
}

input[type=checkbox] {
  clip: rect(0,0,0,0);
  position: absolute;
}

.checkbox-input-container {
  padding: 10px 0 10px 5px;
}

.point-assignment-container {
  padding: 10px 0 0 0;
}

.add-points-container {
  display: block;
  box-sizing: border-box;
  width: 300px;
  margin-right: 50px;
}

.subtract-points-container {
  display: block;
}

.minus-sign {
  color: darkorange;
}

.plus-sign {
  color: $ocean-blue;
}

.minus-sign, .plus-sign {
  margin-right: 10px;
}

.unit-of-measurement {
  display: inline-block;
  vertical-align: top;
  padding-left: 10px;
  padding-top: 6px;
}

@media only screen and (min-width: 481px) {
  .point-assignment-container {
    padding: 10px 0 0 3px;
    min-width: 500px;
  }

  .add-points-container {
    display: inline-block;
  }

  .subtract-points-container {
    display: inline-block;
  }
}

</style>
