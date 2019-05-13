<template>
  <div id="ag-test-command-settings-component">
    <div v-if="!loading">
      <tabs ref="tabs-gray" v-model="current_tab_index"
            tab_active_class="gray-white-theme-active"
            tab_inactive_class="gray-white-theme-inactive">

<!------------------------ Command Settings Tab ------------------------------------->
        <tab>
          <tab-header>
            <div class="tab-heading"> Command Settings </div>
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
                  <validated-input ref="command_name"
                                   id="input-name"
                                   v-model="command.name"
                                   :validators="[is_not_empty]">
                  </validated-input>
                </div>

                <div id="command-container">
                  <label class="text-label"> Command </label>
                  <validated-input ref="command_cmd"
                                   id="input-cmd"
                                   v-model="command.cmd"
                                   :num_rows="5"
                                   :validators="[is_not_empty]">
                  </validated-input>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Stdin </legend>
                    <div class="command-input-container file-dropdown-adjacent">
                      <label class="text-label"> Stdin source: </label>
                      <div class="dropdown">
                        <dropdown ref="stdin_source_dropdown"
                                  :items="stdin_source_options"
                                  @update_item_selected="command.stdin_source = $event">

                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{command.stdin_source}}
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

                    <div v-if="command.stdin_source === 'Text'"
                         class="text-container">
                      <label class="text-label"> Stdin source text: </label>
                      <validated-input placeholder="Enter the stdin input here."
                                       :num_rows="5"
                                       v-model="command.stdin_text"
                                       :validators="[]">
                      </validated-input>
                    </div>

                    <div v-if="command.stdin_source === 'Project file content'"
                         class="file-dropdown-container">
                      <label class="text-label"> File name: </label>
                      <div>
                        <dropdown ref="file_stdin_source_dropdown"
                                  :items="file_options"
                                  :initial_highlighted_index="0"
                                  @update_item_selected="command.stdin_instructor_file = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{command.stdin_instructor_file}}
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
                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Return Code </legend>
                    <div class="command-input-container">
                      <label class="text-label"> Expected Return Code: </label>
                      <div class="dropdown">
                        <dropdown ref="expected_return_code_dropdown"
                                  :items="expected_return_code_options"
                                  @update_item_selected="command.expected_return_code = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{command.expected_return_code}}
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

                    <div v-if="command.expected_return_code != `Don't check`"
                         class="point-assignment-container">
                      <div class="add-points-container">
                        <label class="text-label"> Correct return code </label>
                        <div>
                          <i class="fas fa-plus plus-sign"></i>
                          <input class="command-settings-input"
                                 v-model="command.points_for_correct_return_code"
                                 type="number"
                                 min="0">
                          <div class="unit-of-measurement"> points </div>
                        </div>
                      </div>

                      <div class="subtract-points-container">
                        <label class="text-label"> Wrong return code </label>
                        <div>
                          <i class="fas fa-minus minus-sign"></i>
                          <input class="command-settings-input"
                                 v-model="command.deduction_for_wrong_return_code"
                                 type="number"
                                 min="0">
                          <div class="unit-of-measurement"> points </div>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Stdout </legend>
                    <div class="command-input-container file-dropdown-adjacent">
                      <label class="text-label"> Check stdout against: </label>
                      <div class="dropdown">
                        <dropdown ref="expected_stdout_source_dropdown"
                                  :items="expected_stdout_source_options"
                                  @update_item_selected="command.expected_stdout_source = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{command.expected_stdout_source}}
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

                    <div v-if="command.expected_stdout_source === 'Text'"
                         class="text-container">
                      <label class="text-label"> Expected stdout text: </label>
                      <validated-input placeholder="Enter the expected stdout output here."
                                       v-model="command.expected_stdout_text"
                                       :num_rows="5"
                                       :validators="[]">
                      </validated-input>
                    </div>

                    <div v-if="command.expected_stdout_source === 'Project file content'"
                         class="file-dropdown-container">
                      <label class="text-label"> File name: </label>
                      <div>
                        <dropdown ref="file_stdout_dropdown"
                                  :items="file_options"
                                  :initial_highlighted_index="0"
                                  @update_item_selected="command.expected_stdout_instructor_file = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{command.expected_stdout_instructor_file}}
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

                    <div v-if="command.expected_stdout_source != `Don't check`"
                         class="point-assignment-container">
                      <div class="add-points-container">
                        <label class="text-label"> Correct stdout </label>
                        <div>
                          <i class="fas fa-plus plus-sign"></i>
                          <input class="command-settings-input"
                                 v-model="command.points_for_correct_stdout"
                                 type="number"
                                 min="0">
                          <div class="unit-of-measurement"> points </div>
                        </div>
                      </div>

                      <div class="subtract-points-container">
                        <label class="text-label"> Wrong stdout</label>
                        <div>
                          <i class="fas fa-minus minus-sign"></i>
                          <input class="command-settings-input"
                                 v-model="command.deduction_for_wrong_stdout"
                                 type="number"
                                 min="0">
                          <div class="unit-of-measurement"> points </div>
                        </div>
                      </div>
                    </div>

                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Stderr </legend>
                    <div class="command-input-container file-dropdown-adjacent">
                      <label class="text-label"> Check stderr against: </label>
                      <div class="dropdown">
                        <dropdown ref="expected_stderr_source_dropdown"
                                  :items="expected_stderr_source_options"
                                  :initial_highlighted_index="0"
                                  @update_item_selected="command.expected_stderr_source = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{command.expected_stderr_source}}
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

                    <div v-if="command.expected_stderr_source === 'Text'"
                         class="text-container">
                      <label class="text-label"> Expected stderr text: </label>
                      <validated-input placeholder="Enter the expected stderr output here."
                                       v-model="command.expected_stderr_text"
                                       :num_rows="5"
                                       :validators="[]">
                      </validated-input>
                    </div>

                    <div v-if="command.expected_stderr_source === 'Project file content'"
                         class="file-dropdown-container">
                      <label class="text-label"> File name: </label>
                      <div>
                        <dropdown ref="file_stderr_dropdown"
                                  :items="file_options"
                                  :initial_highlighted_index="0"
                                  @update_item_selected="command.expected_stderr_instructor_file = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header large-dropdown">
                                {{command.expected_stderr_instructor_file}}
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

                    <div v-if="command.expected_stderr_source != `Don't check`"
                         class="point-assignment-container">
                      <div class="add-points-container">
                        <label class="text-label"> Correct stderr </label>
                        <div>
                          <i class="fas fa-plus plus-sign"></i>
                          <input class="command-settings-input"
                                 type="number"
                                 v-model="command.points_for_correct_stderr"
                                 min="0">
                          <div class="unit-of-measurement"> points </div>
                        </div>
                      </div>

                      <div class="subtract-points-container">
                        <label class="text-label">  Wrong stderr </label>
                        <div>
                          <i class="fas fa-minus minus-sign"></i>
                          <input class="command-settings-input"
                                 type="number"
                                 v-model="command.deduction_for_wrong_stderr"
                                 min="0">
                          <div class="unit-of-measurement"> points </div>
                        </div>
                      </div>
                    </div>

                  </fieldset>
                </div>

                <div v-if="command.expected_stdout_source === 'Project file content' ||
                           command.expected_stdout_source === 'Text' ||
                           command.expected_stderr_source === 'Project file content' ||
                           command.expected_stderr_source === 'Text'"
                     class="section-container">
                  <fieldset>
                    <legend> Diff Options </legend>
                    <div class="command-input-container">
                      <input id="ignore-case"
                             type="checkbox"
                             v-model="command.ignore_case">
                      <label class="checkbox-label"
                             for="ignore-case"> Ignore case sensitivity
                      </label>
                    </div>

                    <div class="checkbox-input-container">
                      <input id="ignore-whitespace"
                             type="checkbox"
                             v-model="command.ignore_whitespace">
                      <label class="checkbox-label"
                             for="ignore-whitespace"> Ignore whitespace
                      </label>
                    </div>

                    <div class="checkbox-input-container">
                      <input id="ignore-whitespace-changes"
                             type="checkbox"
                             v-model="command.ignore_whitespace_changes">
                      <label class="checkbox-label"
                             for="ignore-whitespace-changes"> Ignore whitespace changes
                      </label>
                    </div>

                    <div class="checkbox-input-container">
                      <input id="ignore-blank-lines"
                             type="checkbox"
                             v-model="command.ignore_blank_lines">
                      <label class="checkbox-label"
                             for="ignore-blank-lines"> Ignore blank lines
                      </label>
                    </div>
                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset>
                    <legend> Resource Settings </legend>
                    <div id="time-and-virtual">
                      <div id="time-limit-container">
                        <label class="text-label"> Time limit </label>
                        <div class="resource-input">
                          <validated-input ref="command_time_limit"
                                           id="input-time-limit"
                                           v-model="command.time_limit"
                                           input_style="width: 150px;"
                                           :validators="[]">
                            <div slot="suffix" class="unit-of-measurement"> seconds </div>
                          </validated-input>
                        </div>
                      </div>

                      <div id="virtual-memory-container">
                        <label class="text-label"> Virtual memory limit </label>
                        <div class="resource-input">
                          <validated-input ref="command_virtual_memory_limit"
                                           id="input-virtual-memory-limit"
                                           v-model="command.virtual_memory_limit"
                                           input_style="width: 150px;"
                                           :validators="[]">
                            <div slot="suffix" class="unit-of-measurement"> bytes </div>
                          </validated-input>
                        </div>
                      </div>
                    </div>

                    <div id="stack-and-process">

                      <div id="stack-size-container">
                        <label class="text-label"> Stack size limit </label>
                        <div class="resource-input">
                          <validated-input ref="command_stack_size_limit"
                                           id="input-stack-size-limit"
                                           v-model="command.stack_size_limit"
                                           input_style="width: 150px;"
                                           :validators="[]">
                            <div slot="suffix" class="unit-of-measurement"> bytes </div>
                          </validated-input>
                        </div>
                      </div>

                      <div id="process-spawn-container">
                        <label class="text-label"> Process spawn limit </label>
                        <div class="resource-input">
                          <validated-input ref="command_process_spawn_limit"
                                           id="input-process-spawn-limit"
                                           v-model="command.process_spawn_limit"
                                           input_style="width: 150px;"
                                           :validators="[]">
                            <div slot="suffix" class="unit-of-measurement"> child processes </div>
                          </validated-input>
                        </div>
                      </div>

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
                    {{(new Date(command.last_modified)).toLocaleString(
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

              <button class="delete-command-button"
                      type="button"
                      @click="$refs.delete_command_modal.open()">
                Delete Command: <span> {{command.name}} </span>
              </button>

              <modal ref="delete_command_modal"
                     :size="'large'"
                     :include_closing_x="false">
                <div class="modal-header">
                  Are you sure you want to delete the command:
                  <span class="command-to-delete">{{command.name}}</span>?
                </div>
                <hr>
                <div class="modal-body">
                  <p> This action cannot be reversed! </p>
                  <div id="modal-button-container">
                    <button class="modal-delete-button"
                            @click="delete_ag_test_command()"> Delete </button>

                    <button class="modal-cancel-button"
                            @click="$refs.delete_command_modal.close()"> Cancel </button>
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
  import { Component, Vue } from 'vue-property-decorator';

  import APIErrors from '@/components/api_errors.vue';
  import Dropdown from '@/components/dropdown.vue';
  import Modal from '@/components/modal.vue';
  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
  import ValidatedForm from '@/components/validated_form.vue';

  import {
    is_integer,
    is_non_negative,
    is_not_empty,
    is_number,
    string_to_num
  } from '@/validators';

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
      Dropdown,
      Modal,
      Tab,
      TabHeader,
      Tabs,
      ValidatedForm,
      ValidatedInput
    }
  })
  export default class AGCommandSettings extends Vue {
    current_tab_index = 0;
    saving = false;
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};
    existing_command_names: string[] = [];
    loading = true;

    settings_form_is_valid = false;

    command: AGTestCommand = {
      pk: 1,
      name: "Star Command",
      ag_test_case: 2,
      last_modified: 712,
      cmd: "g++ BinarySearchTree_compile_check.cpp -Wall " +
           "-Werror -Wno-sign-compare -Wno-comment -pedantic --std=c++11 -g",
      stdin_source: "No input",
      stdin_text: "",
      stdin_instructor_file: "",
      expected_return_code: "Don't check",
      expected_stdout_source: "Don't check",
      expected_stdout_text: "",
      expected_stdout_instructor_file: "",
      expected_stderr_source: "Don't check",
      expected_stderr_text: "",
      expected_stderr_instructor_file: "",
      ignore_case: false,
      ignore_whitespace: false,
      ignore_whitespace_changes: false,
      ignore_blank_lines: false,
      points_for_correct_return_code: 0,
      points_for_correct_stdout: 0,
      points_for_correct_stderr: 0,
      deduction_for_wrong_return_code: 0,
      deduction_for_wrong_stdout: 0,
      deduction_for_wrong_stderr: 0,
      normal_feedback_config: null,
      first_failed_test_normal_fdbk_config: null,
      ultimate_submission_fdbk_config: null,
      past_limit_submission_fdbk_config: null,
      staff_viewer_fdbk_config: null,
      time_limit: 10,
      stack_size_limit: 10000000,
      virtual_memory_limit: 500000000,
      process_spawn_limit: 0
    };

    readonly is_non_negative = is_non_negative;
    readonly is_not_empty = is_not_empty;
    readonly is_integer = is_integer;
    readonly is_number = is_number;
    readonly string_to_num = string_to_num;

    async created() {
      this.loading = false;
    }

    delete_ag_test_command() {

    }

    async save_ag_test_command_settings() {
      this.saving = true;
      try {

      }
      finally {
        this.saving = false;
      }
    }
    stdin_source_options = [
      "No input",
      "Text",
      "Project file content",
      "Stdout from setup",
      "Stderr from setup"
    ];
    expected_return_code_options = [
      "Don't check",
      "Zero",
      "Nonzero"
    ];
    expected_stdout_source_options = [
      "Don't check",
      "Text",
      "Project file content"
    ];
    expected_stderr_source_options = [
      "Don't check",
      "Text",
      "Project file content"
    ];
    file_options = [
      "Card.h",
      "Pack.h",
      "Card.cpp"
    ];
  }
</script>

<style scoped lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
  @import '@/styles/button_styles.scss';
  @import '@/styles/colors.scss';
  $current-lang-choice: "Poppins";

  #ag-test-command-settings-component {
    font-family: $current-lang-choice;
  }

  .tab-body {
    padding: 0 15px;
  }

  .command-to-delete {
    color: $ocean-blue;
    margin-left: 3px;
  }

  .delete-command-button {
    @extend .red-button;
    margin: 15px 0 0 0;
  }

  .delete-command-button span {
    margin-left: 3px;
    font-style: italic;
  }

  .save-button {
    @extend .green-button;
    margin: 0 0 10px 0;
  }

  legend {
    color: $ocean-blue;
    font-size: 18px;
  }

  fieldset {
    border-bottom: none;
    border-left: none;
    border-right: none;
    border-color: rgba(255, 255, 255, 0.3);
    border-width: 2px;
  }

  .input-tooltip {
    color: mediumvioletred;
    font-size: 15px;
    margin-left: 8px;
  }

  .section-container {
    padding: 0 0 10px 0;
  }

  .command-input-container {
    padding: 10px 0 10px 3px;
  }

  #name-container {
    padding: 10px 12px 12px 12px;
  }

  #command-container {
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

  .command-settings-input {
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

  .checkbox-label {
    color: lighten(black, 10);
    display: inline-block;
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 0 0;
    text-align: right;
  }

  .text-label {
    color: lighten(black, 10);
    display: inline-block;
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 7px 0;
    text-align: right;
  }

  .bottom-of-form {
    padding: 0 14px 50px 14px;
  }

  // Start Modal Related ***********************************************************

  .modal-header {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    padding: 5px 0;
  }

  .modal-body {
    padding: 10px 10px 0 10px;
  }

  .modal-cancel-button {
    @extend .gray-button;
  }

  .modal-delete-button {
    @extend .red-button;
  }


  // Dropdown related ************************************************************

  .small-dropdown {
    width: 100px;
  }

  .medium-dropdown {
    width: 200px;
  }

  .large-dropdown {
    width: 300px;
  }

  .dropdown-header-wrapper {
    display: inline-block;
    margin: 0;
    position: relative;
  }

  .dropdown-header {
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: .25rem;
    box-sizing: border-box;
    color: #495057;
    cursor: default;
    display: block;
    font-size: 1rem;
    line-height: 1.5;
    min-height: 38px;
    padding: .375rem .75rem;
    position: relative;
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  }

  .dropdown-header:focus {
    border-color: $ocean-blue;
  }

  .dropdown-caret {
    cursor: pointer;
    font-size: 30px;
    position: absolute;
    right: 18px;
    top: 3px;
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

  .saving-spinner {
    color: $ocean-blue;
    display: inline-block;
    padding-left: 10px;
    font-size: 18px;
  }

  .loading-spinner {
    color: $ocean-blue;
    display: inline-block;
    padding-left: 10px;
    font-size: 18px;
  }

  .last-saved-timestamp {
    color: lighten(#495057, 40);
    font-size: 15px;
  }

  .last-saved-spinner {
    font-size: 18px;
    color: $ocean-blue;
    margin-top: 15px;
    margin-left: 24px;
    display: inline-block;
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

  #time-limit-container {
    display: inline-block;
    margin-right: 50px;
    padding-bottom: 20px;
    vertical-align: top;
  }
  #virtual-memory-container {
    display: inline-block;
    padding-bottom: 20px;
    vertical-align: top;
  }
  #stack-size-container {
    display: inline-block;
    margin-right: 50px;
    padding-bottom: 20px;
    vertical-align: top;
  }
  #process-spawn-container {
    display: inline-block;
    padding-bottom: 25px;
    vertical-align: top;
  }

  #time-limit-and-stack-size {
    padding: 0 0 0 0;
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

    #time-limit-container {
      width: 400px;
    }

    #virtual-memory-container {
      width: 400px;
    }

    #stack-size-container {
      width: 400px;
    }

    #process-spawn-container {
      width: 400px;
    }

  }
</style>
