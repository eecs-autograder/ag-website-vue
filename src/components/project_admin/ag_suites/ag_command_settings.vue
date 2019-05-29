<template>
  <div id="ag-test-command-settings-component" v-if="d_test_command !== null">
    <tabs ref="tabs-gray"
          v-model="current_tab_index"
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
                <label class="text-label"> Command name </label>
                <validated-input ref="command_name"
                                 id="input-name"
                                 v-model="d_test_command.name"
                                 :validators="[is_not_empty]">
                </validated-input>
              </div>

              <div id="command-container">
                <label class="text-label"> Command </label>
                <validated-input ref="command_cmd"
                                 id="input-cmd"
                                 v-model="d_test_command.cmd"
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
                                @update_item_selected="d_test_command.stdin_source = $event">

                        <template slot="header">
                          <div tabindex="1" class="dropdown-header-wrapper">
                            <div class="dropdown-header large-dropdown">
                              {{d_test_command.stdin_source}}
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

                  <div v-if="d_test_command.stdin_source === 'Text'"
                       class="text-container">
                    <label class="text-label"> Stdin source text: </label>
                    <validated-input placeholder="Enter the stdin input here."
                                     :num_rows="5"
                                     v-model="d_test_command.stdin_text"
                                     :validators="[]">
                    </validated-input>
                  </div>

                  <div v-if="d_test_command.stdin_source === 'Project file content'"
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
                              {{d_test_command.stdin_instructor_file}}
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
                                @update_item_selected="d_test_command.expected_return_code
                                                       = $event">
                        <template slot="header">
                          <div tabindex="1" class="dropdown-header-wrapper">
                            <div class="dropdown-header large-dropdown">
                              {{d_test_command.expected_return_code}}
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

                  <div v-if="d_test_command.expected_return_code != `Don't check`"
                       class="point-assignment-container">
                    <div class="add-points-container">
                      <label class="text-label"> Correct return code </label>
                      <div>
                        <i class="fas fa-plus plus-sign"></i>
                        <input class="command-settings-input"
                               v-model="d_test_command.points_for_correct_return_code"
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
                               v-model="d_test_command.deduction_for_wrong_return_code"
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
                                @update_item_selected="d_test_command.expected_stdout_source
                                                       = $event">
                        <template slot="header">
                          <div tabindex="1" class="dropdown-header-wrapper">
                            <div class="dropdown-header large-dropdown">
                              {{d_test_command.expected_stdout_source}}
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

                  <div v-if="d_test_command.expected_stdout_source === 'Text'"
                       class="text-container">
                    <label class="text-label"> Expected stdout text: </label>
                    <validated-input placeholder="Enter the expected stdout output here."
                                     v-model="d_test_command.expected_stdout_text"
                                     :num_rows="5"
                                     :validators="[]">
                    </validated-input>
                  </div>

                  <div v-if="d_test_command.expected_stdout_source === 'Project file content'"
                       class="file-dropdown-container">
                    <label class="text-label"> File name: </label>
                    <div>
                      <dropdown ref="file_stdout_dropdown"
                                :items="file_options"
                                :initial_highlighted_index="0"
                                @update_item_selected="
                                d_test_command.expected_stdout_instructor_file = $event">
                        <template slot="header">
                          <div tabindex="1" class="dropdown-header-wrapper">
                            <div class="dropdown-header large-dropdown">
                              {{d_test_command.expected_stdout_instructor_file}}
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

                  <div v-if="d_test_command.expected_stdout_source != `Don't check`"
                       class="point-assignment-container">
                    <div class="add-points-container">
                      <label class="text-label"> Correct stdout </label>
                      <div>
                        <i class="fas fa-plus plus-sign"></i>
                        <input class="command-settings-input"
                               v-model="d_test_command.points_for_correct_stdout"
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
                               v-model="d_test_command.deduction_for_wrong_stdout"
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
                                @update_item_selected="
                                d_test_command.expected_stderr_source = $event">
                        <template slot="header">
                          <div tabindex="1" class="dropdown-header-wrapper">
                            <div class="dropdown-header large-dropdown">
                              {{d_test_command.expected_stderr_source}}
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

                  <div v-if="d_test_command.expected_stderr_source === 'Text'"
                       class="text-container">
                    <label class="text-label"> Expected stderr text: </label>
                    <validated-input placeholder="Enter the expected stderr output here."
                                     v-model="d_test_command.expected_stderr_text"
                                     :num_rows="5"
                                     :validators="[]">
                    </validated-input>
                  </div>

                  <div v-if="d_test_command.expected_stderr_source === 'Project file content'"
                       class="file-dropdown-container">
                    <label class="text-label"> File name: </label>
                    <div>
                      <dropdown ref="file_stderr_dropdown"
                                :items="file_options"
                                :initial_highlighted_index="0"
                                @update_item_selected="
                                d_test_command.expected_stderr_instructor_file = $event">
                        <template slot="header">
                          <div tabindex="1" class="dropdown-header-wrapper">
                            <div class="dropdown-header large-dropdown">
                              {{d_test_command.expected_stderr_instructor_file}}
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

                  <div v-if="d_test_command.expected_stderr_source != `Don't check`"
                       class="point-assignment-container">
                    <div class="add-points-container">
                      <label class="text-label"> Correct stderr </label>
                      <div>
                        <i class="fas fa-plus plus-sign"></i>
                        <input class="command-settings-input"
                               type="number"
                               v-model="d_test_command.points_for_correct_stderr"
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
                               v-model="d_test_command.deduction_for_wrong_stderr"
                               min="0">
                        <div class="unit-of-measurement"> points </div>
                      </div>
                    </div>
                  </div>

                </fieldset>
              </div>

              <div v-if="d_test_command.expected_stdout_source === 'Project file content' ||
                         d_test_command.expected_stdout_source === 'Text' ||
                         d_test_command.expected_stderr_source === 'Project file content' ||
                         d_test_command.expected_stderr_source === 'Text'"
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
                        <validated-input ref="command_time_limit"
                                         id="input-time-limit"
                                         v-model="d_test_command.time_limit"
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
                                         v-model="d_test_command.virtual_memory_limit"
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
                                         v-model="d_test_command.stack_size_limit"
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
                                         v-model="d_test_command.process_spawn_limit"
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
              Delete Command: <span> {{d_test_command.name}} </span>
            </button>

            <modal ref="delete_command_modal"
                   :size="'large'"
                   :include_closing_x="false">
              <div class="modal-header">
                Are you sure you want to delete the command:
                <span class="command-to-delete">{{d_test_command.name}}</span>?
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
</template>

<script lang="ts">
import { handle_api_errors_async } from '@/utils';
import { AGTestCommand } from 'ag-client-typescript';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';
import Dropdown from '@/components/dropdown.vue';
import Modal from '@/components/modal.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import {
  is_integer,
  is_not_empty,
  string_to_num
} from '@/validators';

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

  @Prop({required: true, type: AGTestCommand})
  test_command!: AGTestCommand;

  @Watch('test_command')
  on_test_command_change(new_test_command: AGTestCommand, old_test_command: AGTestCommand) {
    this.d_test_command = new AGTestCommand(new_test_command);
    if (this.current_tab_index === 2) {
      this.current_tab_index = 0;
    }
  }

  current_tab_index = 0;
  d_test_command: AGTestCommand | null = null;
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};
  saving = false;
  settings_form_is_valid = false;

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;

  async created() {
    this.d_test_command = this.test_command;
  }

  async delete_ag_test_command() {
    await this.d_test_command!.delete();
  }

  @handle_api_errors_async(handle_save_ag_suite_settings_error)
  async save_ag_test_command_settings() {
    this.saving = true;
    try {
      console.log("Saving command settings");
      await this.d_test_command!.save();
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

function handle_save_ag_suite_settings_error(component: AGCommandSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/components/ag_tests.scss';
$current-lang-choice: "Poppins";

#ag-test-command-settings-component {
  font-family: $current-lang-choice;
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
