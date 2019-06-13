<template>
  <div id="ag-test-command-settings-component" v-if="d_test_command !== null">
    <tabs ref="tabs-gray"
          v-model="current_tab_index"
          tab_active_class="white-theme-active"
          tab_inactive_class="white-theme-inactive">

<!------------------------ Command Settings Tab ------------------------------------->
      <tab>
        <tab-header>
          <div class="tab-heading"> Settings </div>
        </tab-header>
        <template slot="body">
          <div class="tab-body">
            <validated-form id="command-settings-form"
                            autocomplete="off"
                            spellcheck="false"
                            @submit.native.prevent="save_ag_test_command_settings"
                            @form_validity_changed="settings_form_is_valid = $event">

              <div id="name-container">
                <label class="text-label"> Command name </label>
                <validated-input ref="command_name"
                                 id="input-name"
                                 v-model="d_test_command.name"
                                 :validators="[is_not_empty]">
                </validated-input>
              </div>

              <div id="command-container">
                <label class="text-label"> Command </label>
                <validated-input ref="cmd"
                                 id="input-cmd"
                                 v-model="d_test_command.cmd"
                                 :num_rows="2"
                                 :validators="[is_not_empty]">
                </validated-input>
              </div>

              <div class="section-container">
                <fieldset>
                  <legend> Stdin </legend>
                  <div class="command-input-container file-dropdown-adjacent">
                    <label class="text-label"> Stdin source: </label>

                    <div class="dropdown">
                      <select id="stdin_source_dropdown"
                              v-model="d_test_command.stdin_source"
                              class="select">

                        <option :value="StdinSource.none">
                          No input
                        </option>

                        <option :value="StdinSource.text">
                          Text
                        </option>

                        <option :value="StdinSource.instructor_file">
                          Project file content
                        </option>

                        <option :value="StdinSource.setup_stdout">
                          Stdout from setup
                        </option>

                        <option :value="StdinSource.setup_stderr">
                          Stderr from setup
                        </option>

                      </select>
                    </div>

                  </div>

                  <div v-if="d_test_command.stdin_source === StdinSource.text"
                       class="text-container">
                    <label class="text-label"> Stdin source text: </label>
                    <validated-input ref="stdin_text"
                                     placeholder="Enter the stdin input here."
                                     :num_rows="5"
                                     v-model="d_test_command.stdin_text"
                                     :validators="[is_not_empty]">
                    </validated-input>
                  </div>

                  <div v-if="d_test_command.stdin_source === StdinSource.instructor_file"
                       class="file-dropdown-container">
                    <label class="text-label"> File name: </label>

                    <div class="dropdown">
                      <select id="file_stdin_source_dropdown"
                              v-model="d_test_command.stdin_instructor_file"
                              class="select">
                        <option v-for="file of project.instructor_files" :value="file">
                          {{file.name}}
                        </option>
                      </select>
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
                      <select id="expected_return_code_dropdown"
                              v-model="d_test_command.expected_return_code"
                              class="select">
                        <option :value="ExpectedReturnCode.none">
                          Don't Check
                        </option>
                        <option :value="ExpectedReturnCode.zero">
                          Zero
                        </option>
                        <option :value="ExpectedReturnCode.nonzero">
                          Nonzero
                        </option>
                      </select>
                    </div>
                  </div>

                  <div v-if="d_test_command.expected_return_code !== ExpectedReturnCode.none"
                       class="point-assignment-container">
                    <div class="add-points-container">
                      <label class="text-label"> Correct return code </label>
                      <div>
                        <validated-input ref="points_for_correct_return_code"
                                         v-model="d_test_command.points_for_correct_return_code"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]"
                                         input_style="width: 80px;">
                          <div slot="suffix" class="unit-of-measurement"> points </div>
                        </validated-input>
                      </div>
                    </div>

                    <div class="subtract-points-container">
                      <label class="text-label"> Wrong return code </label>
                      <div>
                        <validated-input ref="deduction_for_wrong_return_code"
                                         v-model="d_test_command.deduction_for_wrong_return_code"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]"
                                         input_style="width: 80px;">
                          <div slot="suffix" class="unit-of-measurement"> points </div>
                        </validated-input>
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
                      <select id="expected_stdout_source_dropdown"
                              v-model="d_test_command.expected_stdout_source"
                              class="select">
                        <option :value="ExpectedOutputSource.none">
                          Don't Check
                        </option>
                        <option :value="ExpectedOutputSource.text">
                          Text
                        </option>
                        <option :value="ExpectedOutputSource.instructor_file">
                          Project file content
                        </option>
                      </select>
                    </div>
                  </div>

                  <div v-if="d_test_command.expected_stdout_source === ExpectedOutputSource.text"
                       class="text-container">
                    <label class="text-label"> Expected stdout text: </label>
                    <validated-input ref="expected_stdout_text"
                                     placeholder="Enter the expected stdout output here."
                                     v-model="d_test_command.expected_stdout_text"
                                     :num_rows="5"
                                     :validators="[is_not_empty]">
                    </validated-input>
                  </div>

                  <div v-if="d_test_command.expected_stdout_source === ExpectedOutputSource.instructor_file"
                       class="file-dropdown-container">
                    <label class="text-label"> File name: </label>
                    <div class="dropdown">
                      <select id="file_stdout_dropdown"
                              v-model="d_test_command.expected_stdout_instructor_file"
                              class="select">
                        <option v-for="file of project.instructor_files" :value="file">
                          {{file.name}}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div v-if="d_test_command.expected_stdout_source !== ExpectedOutputSource.none"
                       class="point-assignment-container">
                    <div class="add-points-container">
                      <label class="text-label"> Correct stdout </label>
                      <div>
                        <validated-input ref="points_for_correct_stdout"
                                         v-model="d_test_command.points_for_correct_stdout"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]"
                                         input_style="width: 80px;">
                          <div slot="suffix" class="unit-of-measurement"> points </div>
                        </validated-input>
                      </div>
                    </div>

                    <div class="subtract-points-container">
                      <label class="text-label"> Wrong stdout</label>
                      <div>
                        <validated-input ref="deduction_for_wrong_stdout"
                                         v-model="d_test_command.deduction_for_wrong_stdout"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]"
                                         input_style="width: 80px;">
                          <div slot="suffix" class="unit-of-measurement"> points </div>
                        </validated-input>
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
                      <select id="expected_stderr_source_dropdown"
                              v-model="d_test_command.expected_stderr_source"
                              class="select">
                        <option :value="ExpectedOutputSource.none">
                          Don't Check
                        </option>
                        <option :value="ExpectedOutputSource.text">
                          Text
                        </option>
                        <option :value="ExpectedOutputSource.instructor_file">
                          Project file content
                        </option>
                      </select>
                    </div>
                  </div>

                  <div v-if="d_test_command.expected_stderr_source === ExpectedOutputSource.text"
                       class="text-container">
                    <label class="text-label"> Expected stderr text: </label>
                    <validated-input ref="expected_stderr_text"
                                     placeholder="Enter the expected stderr output here."
                                     v-model="d_test_command.expected_stderr_text"
                                     :num_rows="5"
                                     :validators="[is_not_empty]">
                    </validated-input>
                  </div>

                  <div v-if="d_test_command.expected_stderr_source
                             === ExpectedOutputSource.instructor_file"
                       class="file-dropdown-container">
                    <label class="text-label"> File name: </label>
                    <div class="dropdown">
                      <select id="file_stderr_dropdown"
                              v-model="d_test_command.expected_stderr_instructor_file"
                              class="select">
                        <option v-for="file of project.instructor_files" :value="file">
                          {{file.name}}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div v-if="d_test_command.expected_stderr_source !== ExpectedOutputSource.none"
                       class="point-assignment-container">
                    <div class="add-points-container">
                      <label class="text-label"> Correct stderr </label>
                      <div>
                        <validated-input ref="points_for_correct_stderr"
                                         v-model="d_test_command.points_for_correct_stderr"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]"
                                         input_style="width: 80px;">
                          <div slot="suffix" class="unit-of-measurement"> points </div>
                        </validated-input>
                      </div>
                    </div>

                    <div class="subtract-points-container">
                      <label class="text-label">  Wrong stderr </label>
                      <div>
                        <validated-input ref="deduction_for_wrong_stderr"
                                         v-model="d_test_command.deduction_for_wrong_stderr"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]"
                                         input_style="width: 80px;">
                          <div slot="suffix" class="unit-of-measurement"> points </div>
                        </validated-input>
                      </div>
                    </div>
                  </div>

                </fieldset>
              </div>

              <div v-if="d_test_command.expected_stdout_source === ExpectedOutputSource.text ||
                         d_test_command.expected_stdout_source
                         === ExpectedOutputSource.instructor_file  ||
                         d_test_command.expected_stderr_source === ExpectedOutputSource.text  ||
                         d_test_command.expected_stderr_source
                         === ExpectedOutputSource.instructor_file"
                   class="section-container">
                <fieldset>
                  <legend> Diff Options </legend>
                  <div class="command-input-container">
                    <input id="ignore-case"
                           type="checkbox"
                           v-model="d_test_command.ignore_case">
                    <label class="checkbox-label"
                           for="ignore-case"> Ignore case sensitivity
                    </label>
                  </div>

                  <div class="checkbox-input-container">
                    <input id="ignore-whitespace"
                           type="checkbox"
                           v-model="d_test_command.ignore_whitespace">
                    <label class="checkbox-label"
                           for="ignore-whitespace"> Ignore whitespace
                    </label>
                  </div>

                  <div class="checkbox-input-container">
                    <input id="ignore-whitespace-changes"
                           type="checkbox"
                           v-model="d_test_command.ignore_whitespace_changes">
                    <label class="checkbox-label"
                           for="ignore-whitespace-changes"> Ignore whitespace changes
                    </label>
                  </div>

                  <div class="checkbox-input-container">
                    <input id="ignore-blank-lines"
                           type="checkbox"
                           v-model="d_test_command.ignore_blank_lines">
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
                        <validated-input ref="time_limit"
                                         id="input-time-limit"
                                         v-model="d_test_command.time_limit"
                                         input_style="width: 150px;"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]">
                          <div slot="suffix" class="unit-of-measurement"> seconds </div>
                        </validated-input>
                      </div>
                    </div>

                    <div id="virtual-memory-container">
                      <label class="text-label"> Virtual memory limit </label>
                      <div class="resource-input">
                        <validated-input ref="virtual_memory_limit"
                                         id="input-virtual-memory-limit"
                                         v-model="d_test_command.virtual_memory_limit"
                                         input_style="width: 150px;"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]">
                          <div slot="suffix" class="unit-of-measurement"> bytes </div>
                        </validated-input>
                      </div>
                    </div>
                  </div>

                  <div id="stack-and-process">

                    <div id="stack-size-container">
                      <label class="text-label"> Stack size limit </label>
                      <div class="resource-input">
                        <validated-input ref="stack_size_limit"
                                         id="input-stack-size-limit"
                                         v-model="d_test_command.stack_size_limit"
                                         input_style="width: 150px;"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_one
                                         ]">
                          <div slot="suffix" class="unit-of-measurement"> bytes </div>
                        </validated-input>
                      </div>
                    </div>

                    <div id="process-spawn-container">
                      <label class="text-label"> Process spawn limit </label>
                      <div class="resource-input">
                        <validated-input ref="process_spawn_limit"
                                         id="input-process-spawn-limit"
                                         v-model="d_test_command.process_spawn_limit"
                                         input_style="width: 150px;"
                                         :validators="[
                                           is_not_empty,
                                           is_integer,
                                           is_greater_than_or_equal_to_zero
                                         ]">
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
                        :disabled="!settings_form_is_valid || saving"> Save Updates
                </button>

                <div v-if="!saving" class="last-saved-timestamp">
                  <span> Last Saved: </span>
                  {{(new Date(d_test_command.last_modified)).toLocaleString(
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
              {{case_has_exactly_one_command ? 'Delete Case' : 'Delete Command'}}:
              <span>
                {{case_has_exactly_one_command ? d_test_case.name : d_test_command.name}}
              </span>
            </button>

            <modal ref="delete_command_modal"
                   :size="'large'"
                   :include_closing_x="false">
              <div class="modal-header">
                Confirm Delete
              </div>
              <hr>
              <div class="modal-body">
                <p>
                Are you sure you want to delete the test {{case_has_exactly_one_command
                                                           ? 'case' : 'command'}} :
                <span class="command-to-delete">
                  {{case_has_exactly_one_command ? d_test_case.name : d_test_command.name}}
                </span>?

                <span v-if="case_has_exactly_one_command"> This will delete all associated test
                  cases and run results. THIS ACTION CANNOT BE UNDONE.</span>

                <span v-if="!case_has_exactly_one_command">
                  This will delete all associated commands and run results.
                  THIS ACTION CANNOT BE UNDONE. </span>
                </p>
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
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCommand,
  ExpectedOutputSource,
  ExpectedReturnCode,
  InstructorFile,
  Project,
  StdinSource
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import {
  is_integer,
  is_not_empty,
  make_min_value_validator
} from '@/validators';

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
export default class AGCommandSettings extends Vue {

  @Prop({required: true, type: AGTestCommand})
  test_command!: AGTestCommand;

  @Prop({required: true, type: AGTestCase})
  test_case!: AGTestCase;

  @Prop({required: true, type: Project})
  project!: Project;

  @Watch('test_command')
  on_test_command_change(new_test_command: AGTestCommand, old_test_command: AGTestCommand) {
    this.d_test_command = deep_copy(new_test_command, AGTestCommand);
    if (this.current_tab_index === 2) {
      this.current_tab_index = 0;
    }
  }

  @Watch('test_case')
  on_test_case_change(new_test_case: AGTestCase, old_test_case: AGTestCase) {
    this.d_test_case = deep_copy(new_test_case, AGTestCase);
    if (this.current_tab_index === 2) {
      this.current_tab_index = 0;
    }
  }

  current_tab_index = 0;
  d_test_command: AGTestCommand | null = null;
  d_test_case: AGTestCase | null = null;
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};
  saving = false;
  settings_form_is_valid = true;

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_greater_than_or_equal_to_zero = make_min_value_validator(0);
  readonly is_greater_than_or_equal_to_one = make_min_value_validator(1);
  readonly StdinSource = StdinSource;
  readonly ExpectedOutputSource = ExpectedOutputSource;
  readonly ExpectedReturnCode = ExpectedReturnCode;

  async created() {
    this.d_test_command = deep_copy(this.test_command, AGTestCommand);
    this.d_test_case = deep_copy(this.test_case, AGTestCase);
    this.sort_instructor_files();
  }

  get case_has_exactly_one_command() {
    return this.d_test_case!.ag_test_commands.length === 1;
  }

  async delete_ag_test_command() {
    if (this.case_has_exactly_one_command) {
      console.log("Deleting case");
      await this.d_test_case!.delete();
    }
    else {
      console.log("Deleting command");
      await this.d_test_command!.delete();
    }
    // (<Modal> this.$refs.delete_command_modal).close();
  }

  sort_instructor_files() {
    this.project.instructor_files!.sort(
      (file_a: InstructorFile, file_b: InstructorFile) => {
        return file_a.name.localeCompare(file_b.name, undefined, {numeric: true});
      }
    );
  }

  @handle_api_errors_async(handle_save_ag_suite_settings_error)
  async save_ag_test_command_settings() {
    try {
      this.saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_test_command!.save();
      if (this.d_test_case!.ag_test_commands.length === 1) {
        this.d_test_case!.name = this.d_test_command!.name;
        await this.d_test_case!.save();
      }
    }
    finally {
      this.saving = false;
    }
  }
}

function handle_save_ag_suite_settings_error(component: AGCommandSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/forms.scss';
$current-lang-choice: "Poppins";

#ag-test-command-settings-component {
  font-family: $current-lang-choice;
}

.tab-body {
  box-sizing: border-box;
  padding: 15px;
  height: 700px;
  overflow-y: scroll;
  border-left: 2px solid darken($pebble-light, 1);
}

.command-to-delete {
  @extend .item-to-delete;
}

.delete-command-button {
  @extend .delete-level-button;
}

.command-input-container {
  padding: 10px 0 10px 3px;
}

#name-container {
  padding: 15px 12px 12px 12px;
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

.point-assignment-container {
  padding: 10px 0 0 0;
}

.add-points-container {
  display: block;
  box-sizing: border-box;
  width: 300px;
  margin-right: 50px;
  vertical-align: top;
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
