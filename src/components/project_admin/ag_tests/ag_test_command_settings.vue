<template>
  <div id="ag-test-command-settings-component" v-if="d_ag_test_command !== null">
    <div class="test-name-wrapper">
      <template v-if="!d_editing_test_name">
        <div class="test-name">{{ag_test_case.name}}</div>
        <i @click="d_new_test_name = ag_test_case.name;
                   d_editing_test_name = !d_editing_test_name"
           ref="toggle_name_edit"
           class="fas fa-pencil-alt"></i>
      </template>
      <template v-else>
        <validated-form ref="ag_test_case_name_form" @submit="save_ag_test_case"
                        @form_validity_changed="d_name_form_valid = $event">
          <label class="label" for="test-case-name"> Test Name </label>
          <validated-input ref="test_case_name"
                           v-model="d_new_test_name"
                           :validators="[is_not_empty]"
                           input_id="test-case-name">
          <template slot="suffix">
          <div class="name-form-buttons">
            <button type="submit" class="green-button" :disabled="d_saving || !d_name_form_valid">
              Save
            </button>
            <button type="button" class="white-button" :disabled="d_saving"
                    @click="d_editing_test_name = false">Cancel</button>
          </div>
          </template>
          </validated-input>
        </validated-form>
        <APIErrors ref="ag_test_case_api_errors"></APIErrors>
      </template>
    </div>

    <!------------------- Command Settings ---------------------------->
    <validated-form id="ag-test-command-settings-form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit="save_ag_test_command_settings"
                    @form_validity_changed="d_settings_form_is_valid = $event">

      <div v-if="!case_has_exactly_one_command"
           class="form-field-wrapper">
        <label class="label" for="input-name"> Command Name </label>
        <validated-input ref="command_name"
                         input_id="input-name"
                         v-model="d_ag_test_command.name"
                         :validators="[is_not_empty]">
        </validated-input>
      </div>

      <div class="form-field-wrapper">
        <label class="label" for="input-cmd">
          Command
          <tooltip width="large" placement="right">
            Can be any valid bash command.
          </tooltip>
        </label>
        <validated-input ref="cmd"
                         input_id="input-cmd"
                         v-model="d_ag_test_command.cmd"
                         :num_rows="2"
                         :validators="[is_not_empty]">
        </validated-input>
      </div>

      <div class="form-field-wrapper">
        <label class="label" for="input-internal-admin-notes">
          Staff-Only Description
        </label>
        <validated-input ref="internal_admin_notes"
                         input_id="input-internal-admin-notes"
                         v-model="d_ag_test_command.internal_admin_notes"
                         :num_rows="2"
                         :validators="[]">
        </validated-input>
      </div>

      <div class="form-field-wrapper">
        <label class="label" for="input-staff-description">
          Staff-Only Description
        </label>
        <validated-input ref="staff_description"
                         input_id="input-staff-description"
                         v-model="d_ag_test_command.staff_description"
                         :num_rows="2"
                         :validators="[]">
        </validated-input>
      </div>

      <div class="form-field-wrapper">
        <label class="label" for="input-student-description">
          Student-Facing Description
        </label>
        <validated-input ref="student_description"
                         input_id="input-student-description"
                         v-model="d_ag_test_command.student_description"
                         :num_rows="2"
                         :validators="[]">
        </validated-input>
      </div>

      <div class="form-field-wrapper">
        <label class="label" for="input-student-on-fail-description">
          Student-Facing Description (On Failure Only)
        </label>
        <validated-input ref="student_on_fail_description"
                         input_id="input-student-on-fail-description"
                         v-model="d_ag_test_command.student_on_fail_description"
                         :num_rows="2"
                         :validators="[]">
        </validated-input>
      </div>

      <fieldset class="fieldset">
        <legend class="legend"> Stdin </legend>
        <div class="form-field-wrapper">
          <label class="label" for="stdin-source"> Stdin source </label>
          <br>
          <select id="stdin-source"
                  v-model="d_ag_test_command.stdin_source"
                  class="select">
            <option :value="StdinSource.none">
              No input
            </option>
            <option :value="StdinSource.text">
              Text
            </option>
            <option :value="StdinSource.instructor_file">
              Instructor file content
            </option>
          </select>
        </div>

        <div v-if="d_ag_test_command.stdin_source === StdinSource.text"
             class="form-field-wrapper">
          <label class="label" for="stdin-text"> Stdin text </label>
          <validated-input ref="stdin_text"
                           input_id="stdin-text"
                           placeholder="Enter the stdin input here."
                           :num_rows="5"
                           v-model="d_ag_test_command.stdin_text"
                           :validators="[]">
          </validated-input>
        </div>

        <div v-if="d_ag_test_command.stdin_source === StdinSource.instructor_file"
             class="form-field-wrapper">
          <label class="label"> File </label>
          <select-object ref="stdin_instructor_file"
                         :items="project.instructor_files"
                         v-model="d_ag_test_command.stdin_instructor_file"
                         id_field="pk">
            <option selected disabled :value="null">-- Select a File --</option>
            <template v-slot:option-text="{item}">
              {{item.name}}
            </template>
          </select-object>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Correctness and Scoring </legend>

        <div class="section-box">
          <fieldset class="fieldset-box">
            <div class="header">
              <legend class="header-text"> Return Code </legend>
            </div>
            <div class="body">
              <div class="form-field-wrapper">
                <label class="label" for="expected-return-code"> Expected Return Code </label>
                <div class="dropdown">
                  <select id="expected-return-code"
                          v-model="d_ag_test_command.expected_return_code"
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

              <div v-if="d_ag_test_command.expected_return_code !== ExpectedReturnCode.none"
                   class="form-field-wrapper correct-incorrect-points-wrapper">
                <div class="form-field-wrapper">
                  <label class="label" for="points-for-correct-return-code"> Correct return code </label>
                  <validated-input ref="points_for_correct_return_code"
                                    input_id="points-for-correct-return-code"
                                    v-model="d_ag_test_command.points_for_correct_return_code"
                                    :validators="[
                                      is_not_empty,
                                      is_integer,
                                      is_greater_than_or_equal_to_zero
                                    ]"
                                    input_style="width: 80px;"
                                    :from_string_fn="string_to_num">
                    <div slot="suffix" class="unit-of-measurement"> points </div>
                  </validated-input>
                </div>

                <div class="form-field-wrapper">
                  <label class="label" for="deduction-for-wrong-return-code"> Wrong return code </label>
                  <validated-input ref="deduction_for_wrong_return_code"
                                    input_id="deduction-for-wrong-return-code"
                                    v-model="
                                    d_ag_test_command.deduction_for_wrong_return_code"
                                    :validators="[
                                      is_not_empty,
                                      is_integer,
                                      is_less_than_or_equal_to_zero
                                    ]"
                                    input_style="width: 80px;"
                                    :from_string_fn="string_to_num">
                    <div slot="suffix" class="unit-of-measurement"> points </div>
                  </validated-input>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="section-box">
          <fieldset class="fieldset-box">
            <div class="header">
              <legend class="header-text"> Output Diff</legend>
            </div>

            <div class="body">
              <!-- stdout diff -->
              <fieldset class="fieldset">
                <legend class="legend"> Stdout </legend>
                <div class="form-field-wrapper">
                  <label class="label" for="expected-stdout-source"> Check stdout against: </label>
                  <br>
                  <select id="expected-stdout-source"
                          v-model="d_ag_test_command.expected_stdout_source"
                          class="select">
                    <option :value="ExpectedOutputSource.none">
                      Don't Check
                    </option>
                    <option
                      :value="ExpectedOutputSource.text"
                      :disabled="d_ag_test_command.custom_scoring_source === CustomScoringSource.stdout"
                    >
                      Text
                    </option>
                    <option
                      :value="ExpectedOutputSource.instructor_file"
                      :disabled="d_ag_test_command.custom_scoring_source === CustomScoringSource.stdout"
                      >
                      Instructor file content
                    </option>
                  </select>
                  <info-blurb v-if="d_ag_test_command.custom_scoring_source === CustomScoringSource.stdout">
                    Diff-checking and custom scoring must use different output streams. Change the setting
                    "Parse score from:" to stderr if you want to diff-check stdout.
                  </info-blurb>
                </div>

                <div v-if="d_ag_test_command.expected_stdout_source === ExpectedOutputSource.text"
                      class="form-field-wrapper">
                  <label class="label" for="expected-stdout-text"> Expected stdout text: </label>
                  <validated-input ref="expected_stdout_text"
                                   input_id="expected-stdout-text"
                                   placeholder="Enter the expected stdout output here."
                                   v-model="d_ag_test_command.expected_stdout_text"
                                   :num_rows="5"
                                   :validators="[]">
                  </validated-input>
                </div>

                <div v-if="d_ag_test_command.expected_stdout_source
                           === ExpectedOutputSource.instructor_file"
                     class="form-field-wrapper">
                  <label class="label"> File </label>
                  <select-object ref="expected_stdout_instructor_file"
                                :items="project.instructor_files"
                                v-model="d_ag_test_command.expected_stdout_instructor_file"
                                id_field="pk">
                    <option selected disabled :value="null">-- Select a File --</option>
                    <template v-slot:option-text="{item}">
                      {{item.name}}
                    </template>
                  </select-object>
                </div>

                <div v-if="d_ag_test_command.expected_stdout_source !== ExpectedOutputSource.none"
                      class="form-field-wrapper correct-incorrect-points-wrapper">
                  <div class="form-field-wrapper">
                    <label class="label" for="points-for-correct-stdout"> Correct stdout </label>
                    <validated-input ref="points_for_correct_stdout"
                                      input_id="points-for-correct-stdout"
                                      v-model="d_ag_test_command.points_for_correct_stdout"
                                      :validators="[
                                        is_not_empty,
                                        is_integer,
                                        is_greater_than_or_equal_to_zero
                                      ]"
                                      input_style="width: 80px;"
                                      :from_string_fn="string_to_num">
                      <div slot="suffix" class="unit-of-measurement"> points </div>
                    </validated-input>
                  </div>

                  <div class="form-field-wrapper">
                    <label class="label" for="deduction-for-wrong-stdout"> Wrong stdout</label>
                    <validated-input ref="deduction_for_wrong_stdout"
                                      input_id="deduction-for-wrong-stdout"
                                      v-model="d_ag_test_command.deduction_for_wrong_stdout"
                                      :validators="[
                                        is_not_empty,
                                        is_integer,
                                        is_less_than_or_equal_to_zero
                                      ]"
                                      input_style="width: 80px;"
                                      :from_string_fn="string_to_num">
                      <div slot="suffix" class="unit-of-measurement"> points </div>
                    </validated-input>
                  </div>
                </div>
              </fieldset>

              <!-- stderr diff -->
              <fieldset class="fieldset">
                <legend class="legend"> Stderr </legend>
                <div class="form-field-wrapper">
                  <label class="label" for="expected-stderr-source"> Check stderr against: </label>
                  <br>
                  <select id="expected-stderr-source"
                          v-model="d_ag_test_command.expected_stderr_source"
                          class="select">
                    <option :value="ExpectedOutputSource.none">
                      Don't Check
                    </option>
                    <option
                      :value="ExpectedOutputSource.text"
                      :disabled="d_ag_test_command.custom_scoring_source === CustomScoringSource.stderr"
                    >
                      Text
                    </option>
                    <option
                      :value="ExpectedOutputSource.instructor_file"
                      :disabled="d_ag_test_command.custom_scoring_source === CustomScoringSource.stderr"
                    >
                      Instructor file content
                    </option>
                  </select>
                  <info-blurb v-if="d_ag_test_command.custom_scoring_source === CustomScoringSource.stderr">
                    Diff-checking and custom scoring must use different output streams. Change the setting
                    "Parse score from:" to stdout if you want to diff-check stderr.
                  </info-blurb>
                </div>

                <div v-if="d_ag_test_command.expected_stderr_source === ExpectedOutputSource.text"
                     class="form-field-wrapper">
                  <label class="label" for="expected-stderr-text"> Expected stderr text </label>
                  <validated-input ref="expected_stderr_text"
                                   input_id="expected-stderr-text"
                                   placeholder="Enter the expected stderr output here."
                                   v-model="d_ag_test_command.expected_stderr_text"
                                   :num_rows="5"
                                   :validators="[]">
                  </validated-input>
                </div>

                <div v-if="d_ag_test_command.expected_stderr_source
                           === ExpectedOutputSource.instructor_file"
                     class="form-field-wrapper">
                  <label class="label"> File </label>
                  <select-object ref="expected_stderr_instructor_file"
                                :items="project.instructor_files"
                                v-model="d_ag_test_command.expected_stderr_instructor_file"
                                id_field="pk">
                    <option selected disabled :value="null">-- Select a File --</option>
                    <template v-slot:option-text="{item}">
                      {{item.name}}
                    </template>
                  </select-object>
                </div>

                <div v-if="d_ag_test_command.expected_stderr_source
                            !== ExpectedOutputSource.none"
                      class="form-field-wrapper correct-incorrect-points-wrapper">
                  <div class="form-field-wrapper">
                    <label class="label" for="points-for-correct-stderr"> Correct stderr </label>
                    <validated-input ref="points_for_correct_stderr"
                                     input_id="points-for-correct-stderr"
                                     v-model="d_ag_test_command.points_for_correct_stderr"
                                     :validators="[
                                       is_not_empty,
                                       is_integer,
                                       is_greater_than_or_equal_to_zero
                                     ]"
                                     input_style="width: 80px;"
                                     :from_string_fn="string_to_num">
                      <div slot="suffix" class="unit-of-measurement"> points </div>
                    </validated-input>
                  </div>

                  <div class="form-field-wrapper">
                    <label class="label" for="deduction-for-wrong-stderr"> Wrong stderr </label>
                    <validated-input ref="deduction_for_wrong_stderr"
                                     input_id="deduction-for-wrong-stderr"
                                     v-model="d_ag_test_command.deduction_for_wrong_stderr"
                                     :validators="[
                                       is_not_empty,
                                       is_integer,
                                       is_less_than_or_equal_to_zero
                                     ]"
                                     input_style="width: 80px;"
                                     :from_string_fn="string_to_num">
                      <div slot="suffix" class="unit-of-measurement"> points </div>
                    </validated-input>
                  </div>
                </div>
              </fieldset>

              <!-- diff options -->
              <fieldset v-if="d_ag_test_command.expected_stdout_source !== ExpectedOutputSource.none
                              || d_ag_test_command.expected_stderr_source !== ExpectedOutputSource.none"
                        class="fieldset"
                        ref="diff_options">
                <legend class="legend"> Diff Options </legend>
                <div class="checkbox-input-container">
                  <label class="checkbox-label">
                    <input id="ignore-case"
                           type="checkbox"
                           class="checkbox"
                           v-model="d_ag_test_command.ignore_case">
                    Ignore case
                  </label>
                </div>

                <div class="checkbox-input-container">
                  <label class="checkbox-label">
                    <input id="ignore-whitespace"
                           type="checkbox"
                           class="checkbox"
                           v-model="d_ag_test_command.ignore_whitespace">
                    Ignore whitespace
                  </label>
                </div>

                <div class="checkbox-input-container">
                  <label class="checkbox-label">
                    <input id="ignore-whitespace-changes"
                           type="checkbox"
                           class="checkbox"
                           v-model="d_ag_test_command.ignore_whitespace_changes">
                    Ignore whitespace changes
                  </label>
                </div>

                <div class="checkbox-input-container">
                  <label class="checkbox-label">
                    <input id="ignore-blank-lines"
                           type="checkbox"
                           class="checkbox"
                           v-model="d_ag_test_command.ignore_blank_lines">
                    Ignore blank lines
                  </label>
                </div>
              </fieldset>
            </div>
          </fieldset>
        </div>

        <div class="section-box">
          <fieldset class="fieldset-box">
            <div class="header">
              <legend class="header-text">
                Custom Scoring
                <tooltip width="large" placement="top">
                  Programmatically assign or adjust points to this
                  {{case_has_exactly_one_command ? 'test case' : 'command'}}
                  by printing a simple formatted string.
                </tooltip>
              </legend>
            </div>
            <div class="body">
              <div class="form-field-wrapper">
                <div class="checkbox-input-container">
                  <label class="checkbox-label">
                    <input
                      id="enable-custom-scoring"
                      type="checkbox"
                      class="checkbox"
                      v-model="custom_scoring_enabled"
                      :disabled="!can_enable_custom_scoring"
                    >
                    Enable custom scoring
                  </label>
                </div>
              </div>

              <info-blurb v-if="!can_enable_custom_scoring">
                Diff-checking and custom scoring must use different output streams.
                If you are diff-checking stdout, set "Parse score from:" to stderr (or vice-versa).
              </info-blurb>

              <div v-if="custom_scoring_enabled">
                <info-blurb>
                  If multiple score messages are printed, the last one will be used.
                  The whole message must be on one line of output. Using the default
                  regex pattern, the following print statement in a Python test would
                  assign 5 points:

                  <div class="code-snippet">
                    <code>
                      print('&lt;!! score: 5 !!&gt;')
                    </code>
                    <copy-button
                      style="position: right;"
                      content_to_copy="print(<!! score: 5 !!>')"
                    />
                  </div>

                </info-blurb>

                <div class="form-field-wrapper">

                  <label class="label" for="custom-scoring-source"> Parse score from: </label>
                  <br>
                  <select id="custom-scoring-source"
                          v-model="d_ag_test_command.custom_scoring_source"
                          class="select">
                    <option
                      :value="CustomScoringSource.stdout"
                      :disabled="d_ag_test_command.expected_stdout_source !== ExpectedOutputSource.none"
                    >
                      stdout
                    </option>
                    <option
                      :value="CustomScoringSource.stderr"
                      :disabled="d_ag_test_command.expected_stderr_source !== ExpectedOutputSource.none"
                    >
                      stderr
                    </option>
                  </select>
                  <info-blurb v-if="d_ag_test_command.expected_stdout_source !== ExpectedOutputSource.none">
                    Custom scoring and diff-checking must use different output streams. Change the setting
                    "Check stdout against" to "Don't check" if you want to parse the custom score from stdout.
                  </info-blurb>
                  <info-blurb v-if="d_ag_test_command.expected_stderr_source !== ExpectedOutputSource.none">
                    Custom scoring and diff-checking must use different output streams. Change the setting
                    "Check stderr against" to "Don't check" if you want to parse the custom score from stderr.
                  </info-blurb>
                </div>

                <div class="form-field-wrapper correct-incorrect-points-wrapper">
                  <label class="label" for="max-custom-scoring-points"> Max custom scoring points </label>
                  <validated-input ref="max_custom_scoring_points"
                                   input_id="max-custom-scoring-points"
                                   v-model="d_ag_test_command.max_points_for_custom_scoring"
                                   :validators="[
                                     is_not_empty,
                                     is_integer,
                                     is_greater_than_or_equal_to_zero
                                   ]"
                                   input_style="width: 80px;"
                                   :from_string_fn="string_to_num">
                    <div slot="suffix" class="unit-of-measurement"> points </div>
                  </validated-input>
                </div>
                <collapsible-section data-testid="custom-scoring-advanced-settings">
                  <template #header>
                    Advanced Settings
                  </template>
                  <template #body>
                    <info-blurb>
                      The system infers a reasonable default label for the custom score
                      value shown to students. The default label is "Score" if no other
                      checks in this {{case_has_exactly_one_command ? 'test case' : 'command'}}
                      have points attached to them. If any other checks have points attached
                      to them, the default label is "Instructor score adjustment". You can
                      override this behavior below.
                    </info-blurb>

                    <div class="form-field-wrapper">
                      <div class="checkbox-input-container">
                        <label class="checkbox-label">
                          <input
                            id="override-custom-scoring-label"
                            type="checkbox"
                            class="checkbox"
                            v-model="override_custom_scoring_label"
                          >
                          Override default custom scoring label
                        </label>
                      </div>
                    </div>

                    <div class="form-field-wrapper" v-if="override_custom_scoring_label">
                      <label class="label" for="custom-scoring-label"> Custom scoring label </label>
                      <validated-input ref="custom_scoring_label"
                                       input_id="custom-scoring-label"
                                       v-model="d_ag_test_command.custom_scoring_label"
                                       :validators="[is_not_empty]" />
                    </div>

                    <!-- Dummy disabled input to avoid showing "null" -->
                    <div class="form-field-wrapper" v-else>
                      <label class="label">
                        Custom scoring label
                        <input ref="disabled-custom_scoring_label"
                               class="input"
                               disabled="true"
                               value="" />
                      </label>
                    </div>

                    <div class="form-field-wrapper">
                      <label class="label" for="custom-scoring-regex"> Custom scoring regex </label>
                      <validated-input ref="custom_scoring_regex"
                                       input_id="custom-scoring-regex"
                                       v-model="d_ag_test_command.custom_scoring_regex"
                                       :validators="[is_not_empty, is_valid_regex]" />
                    </div>
                  </template>
                </collapsible-section>
              </div>

            </div>
          </fieldset>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Resource Limits </legend>
        <resource-limit-settings
          :resource_limits="d_ag_test_command"
          @field_change="Object.assign(d_ag_test_command, $event)"></resource-limit-settings>
      </fieldset>

      <!------------------------ Feedback ------------------------------------->
      <fieldset class="fieldset">
        <legend class="legend"> Feedback </legend>
        <feedback-config-panel ref="normal_config_panel"
                               v-model="d_ag_test_command.normal_fdbk_config"
                               :preset_options="fdbk_presets">
          <template slot="header">
            {{FeedbackConfigLabel.normal}}
            <tooltip width="large" placement="top">
              {{FeedbackDescriptions.normal}}
            </tooltip>
          </template>
          <template slot="settings">
            <AGTestCommandAdvancedFdbkSettings
              ref="normal_edit_feedback_settings"
              v-model="d_ag_test_command.normal_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.normal">
            </AGTestCommandAdvancedFdbkSettings>
          </template>
        </feedback-config-panel>

        <feedback-config-panel ref="first_failure_config_panel"
                               v-model="d_ag_test_command.first_failed_test_normal_fdbk_config"
                               :preset_options="fdbk_presets">
          <template slot="header">
            {{FeedbackConfigLabel.first_failure}}
            <tooltip width="large" placement="top">
              {{FeedbackDescriptions.first_failure}}
            </tooltip>
          </template>
          <template slot="settings">
            <div id="first-failure-checkbox-wrapper" class="checkbox-input-container">
              <label>
                <input id="first-failure-config-enabled"
                       type="checkbox"
                       @change="toggle_first_failure_feedback"
                       class="checkbox"
                       :checked="d_ag_test_command.first_failed_test_normal_fdbk_config !== null">
                Enabled
              </label>
            </div>
            <AGTestCommandAdvancedFdbkSettings
              ref="first_failure_edit_feedback_settings"
              id="first-failure-settings"
              v-model="d_ag_test_command.first_failed_test_normal_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.first_failure">
            </AGTestCommandAdvancedFdbkSettings>
          </template>
        </feedback-config-panel>

        <feedback-config-panel ref="final_graded_config_panel"
                               v-model="d_ag_test_command.ultimate_submission_fdbk_config"
                               :preset_options="fdbk_presets">
          <template slot="header">
            <div class="config-name">
              {{FeedbackConfigLabel.ultimate_submission}}
              <tooltip width="large" placement="top">
                {{FeedbackDescriptions.ultimate_submission}}
              </tooltip>
            </div>
          </template>
          <template slot="settings">
            <AGTestCommandAdvancedFdbkSettings
              ref="final_graded_edit_feedback_settings"
              v-model="d_ag_test_command.ultimate_submission_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.ultimate_submission">
            </AGTestCommandAdvancedFdbkSettings>
          </template>
        </feedback-config-panel>

        <feedback-config-panel ref="past_limit_config_panel"
                                v-model="d_ag_test_command.past_limit_submission_fdbk_config"
                                :preset_options="fdbk_presets">
          <template slot="header">
            <div class="config-name">
              {{FeedbackConfigLabel.past_limit}}
              <tooltip width="large" placement="top">
                {{FeedbackDescriptions.past_limit}}
              </tooltip>
            </div>
          </template>
          <template slot="settings">
            <AGTestCommandAdvancedFdbkSettings
              ref="past_limit_edit_feedback_settings"
              v-model="d_ag_test_command.past_limit_submission_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.past_limit">
            </AGTestCommandAdvancedFdbkSettings>
          </template>
        </feedback-config-panel>

        <feedback-config-panel ref="student_lookup_config_panel"
                                v-model="d_ag_test_command.staff_viewer_fdbk_config"
                                :preset_options="fdbk_presets">
          <template slot="header">
            <div class="config-name">
              {{FeedbackConfigLabel.staff_viewer}}
              <tooltip width="large" placement="top">
                {{FeedbackDescriptions.staff_viewer}}
              </tooltip>
            </div>
          </template>
          <template slot="settings">
            <AGTestCommandAdvancedFdbkSettings
              ref="student_lookup_edit_feedback_settings"
              v-model="d_ag_test_command.staff_viewer_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.staff_viewer">
            </AGTestCommandAdvancedFdbkSettings>
          </template>
        </feedback-config-panel>
      </fieldset>

      <APIErrors ref="api_errors" @num_errors_changed="d_num_api_errors = $event"></APIErrors>

      <div class="button-footer">
        <button type="submit"
                class="save-button"
                :disabled="!d_settings_form_is_valid || d_saving">Save</button>

        <button type="submit"
                class="sticky-save-button"
                :disabled="!d_settings_form_is_valid || d_saving">
          <i v-if="d_num_api_errors === 0" class="far fa-save"></i>
          <i v-else class="fas fa-exclamation-triangle"></i>
        </button>

        <div v-if="!d_saving" class="last-saved-timestamp">
          Last Saved: {{format_datetime(d_ag_test_command.last_modified)}}
        </div>
        <div v-else class="last-saved-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>
      </div>

    </validated-form>

    <!--------------------------- Danger Zone --------------------------------------->

    <div class="danger-zone-container">
      <div class="danger-text">
        {{case_has_exactly_one_command ? 'Delete Test Case' : 'Delete Command'}}:
        <span>
          {{case_has_exactly_one_command ? ag_test_case.name : d_ag_test_command.name}}
        </span>
      </div>
      <button class="delete-ag-test-command-button delete-button"
              type="button"
              @click="d_show_delete_ag_test_command_modal = true">
        Delete
      </button>

      <modal v-if="d_show_delete_ag_test_command_modal"
              @close="d_show_delete_ag_test_command_modal = false"
              ref="delete_ag_test_command_modal"
              size="large"
              click_outside_to_close>
        <div class="modal-header">
          Confirm Delete
        </div>

        <div class="modal-body">
          Are you sure you want to delete the
          {{case_has_exactly_one_command ? 'test case' : 'command'}}:
          <span class="item-to-delete">
            "{{case_has_exactly_one_command ? ag_test_case.name : d_ag_test_command.name}}"
          </span>? <br><br>
          This will delete all associated run results. <br>
          THIS ACTION CANNOT BE UNDONE.

          <APIErrors ref="delete_errors"></APIErrors>
          <div class="modal-button-footer">
            <button class="modal-delete-button delete-button"
                    :disabled="d_deleting"
                    @click="delete_ag_test_command()"> Delete </button>

            <button class="modal-cancel-button white-button"
                    @click="d_show_delete_ag_test_command_modal = false"> Cancel </button>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCommand,
  AGTestCommandFeedbackConfig,
  ExpectedOutputSource,
  ExpectedReturnCode,
  CustomScoringSource,
  Project,
  StdinSource,
  ValueFeedbackLevel,
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import { APIErrorsExposed } from '@/exposed_component_types/api_errors_exposed';
import CollapsibleSection from '@/components/CollapsibleSection.vue';
import CopyButton from '@/components/CopyButton.vue';
import Dropdown from '@/components/dropdown.vue';
import InfoBlurb from '@/components/InfoBlurb.vue';
import Modal from '@/components/modal.vue';
import AGTestCommandAdvancedFdbkSettings from '@/components/project_admin/ag_tests/ag_test_command_advanced_fdbk_settings.vue';
import {
  AGTestCommandFeedbackPreset,
  FeedbackConfigLabel,
  FeedbackDescriptions,
} from '@/components/project_admin/feedback_config_panel/feedback_config_utils';
import ResourceLimitSettings from '@/components/project_admin/resource_limit_settings.vue';
import SelectObject from '@/components/select_object.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import ViewFile from '@/components/view_file/view_file.vue';
import {
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func
} from '@/error_handling';
import { SafeMap } from '@/safe_map';
import { assert_not_null, deep_copy, format_datetime, toggle } from '@/utils';
import {
  is_integer,
  is_not_empty,
  make_max_value_validator,
  make_min_value_validator,
  string_to_num,
  is_valid_regex,
} from '@/validators';

import FeedbackConfigPanel from '../feedback_config_panel/feedback_config_panel.vue';

@Component({
  components: {
    APIErrors,
    CopyButton,
    CollapsibleSection,
    InfoBlurb,
    FeedbackConfigPanel,
    Dropdown,
    AGTestCommandAdvancedFdbkSettings,
    Modal,
    ResourceLimitSettings,
    SelectObject,
    Tooltip,
    ValidatedForm,
    ValidatedInput,
    ViewFile
  }
})
export default class AGTestCommandSettings extends Vue {
  @Prop({required: true, type: AGTestCommand})
  ag_test_command!: AGTestCommand;

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  @Prop({required: true, type: Project})
  project!: Project;

  d_ag_test_command: AGTestCommand | null = null;

  d_editing_test_name = false;
  d_new_test_name = '';
  d_name_form_valid = false;

  d_saving = false;
  d_num_api_errors = 0;
  d_settings_form_is_valid = true;
  d_deleting = false;
  d_show_delete_ag_test_command_modal = false;

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_valid_regex = is_valid_regex;
  readonly is_greater_than_or_equal_to_zero = make_min_value_validator(0);
  readonly is_greater_than_or_equal_to_one = make_min_value_validator(1);
  readonly is_less_than_or_equal_to_zero = make_max_value_validator(0);
  readonly string_to_num = string_to_num;
  readonly StdinSource = StdinSource;
  readonly ExpectedOutputSource = ExpectedOutputSource;
  readonly ExpectedReturnCode = ExpectedReturnCode;
  readonly CustomScoringSource = CustomScoringSource;
  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  readonly FeedbackDescriptions = FeedbackDescriptions;
  readonly format_datetime = format_datetime;

  @Watch('ag_test_command')
  on_test_command_change(new_test_command: AGTestCommand, old_test_command: AGTestCommand) {
    this.d_ag_test_command = deep_copy(new_test_command, AGTestCommand);
  }

  async created() {
    this.d_ag_test_command = deep_copy(this.ag_test_command, AGTestCommand);
  }

  get case_has_exactly_one_command() {
    return this.ag_test_case.ag_test_commands.length === 1;
  }

  get override_custom_scoring_label() {
    return this.d_ag_test_command?.custom_scoring_label !== null;
  }

  set override_custom_scoring_label(value: boolean) {
    assert_not_null(this.d_ag_test_command);
    this.d_ag_test_command.custom_scoring_label = value ? '' : null;
  }

  get custom_scoring_enabled() {
    return this.d_ag_test_command?.custom_scoring_source !== CustomScoringSource.none;
  }

  set custom_scoring_enabled(value: boolean) {
    if (value) {
      if (!this.can_enable_custom_scoring) {
        throw new Error("Can't enable custom scoring when both output streams are diff checked");
      }
      this.enable_custom_scoring();
    } else {
      this.disable_custom_scoring();
    }

  }

  get can_enable_custom_scoring() {
    return (
      this.d_ag_test_command?.expected_stdout_source === ExpectedOutputSource.none
      || this.d_ag_test_command?.expected_stderr_source === ExpectedOutputSource.none
    );
  }

  disable_custom_scoring() {
    assert_not_null(this.d_ag_test_command);
    this.d_ag_test_command.custom_scoring_source = CustomScoringSource.none;
  }

  enable_custom_scoring() {
    assert_not_null(this.d_ag_test_command);
    if (this.d_ag_test_command.expected_stdout_source === ExpectedOutputSource.none) {
      this.d_ag_test_command.custom_scoring_source = CustomScoringSource.stdout;
    }
    else {
      this.d_ag_test_command.custom_scoring_source = CustomScoringSource.stderr;
    }
  }

  @handle_api_errors_async(handle_save_ag_test_case_error)
  save_ag_test_case() {
    let to_save = new AGTestCase(this.ag_test_case);
    to_save.name = this.d_new_test_name;
    return toggle(this, 'd_saving', async () => {
      await to_save.save();
      this.d_editing_test_name = false;
    });
  }

  @handle_api_errors_async(make_error_handler_func('delete_errors'))
  delete_ag_test_command() {
    return toggle(this, 'd_deleting', async () => {
      if (this.case_has_exactly_one_command) {
        await this.ag_test_case!.delete();
      }
      else {
        await this.d_ag_test_command!.delete();
      }
      this.d_show_delete_ag_test_command_modal = false;
    });
  }

  @handle_api_errors_async(handle_save_ag_test_cmd_settings_error)
  save_ag_test_command_settings() {
    return toggle(this, 'd_saving', () => {
      const api_errors = this.$refs.api_errors as APIErrorsExposed | undefined;
      api_errors?.clear();
      return this.d_ag_test_command!.save();
    });
  }

  toggle_first_failure_feedback() {
    if (this.d_ag_test_command!.first_failed_test_normal_fdbk_config === null) {
      this.d_ag_test_command!.first_failed_test_normal_fdbk_config = {
        visible: true,
        return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: true,
        show_actual_stderr: true,
        show_whether_timed_out: true,
        show_student_description: true,
      };
    }
    else {
      this.d_ag_test_command!.first_failed_test_normal_fdbk_config = null;
    }
  }

  readonly fdbk_presets = new SafeMap<string, AGTestCommandFeedbackPreset>([
    [
      'Public',
      {
        return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: true,
        show_actual_stderr: true,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail + Output',
      {
        return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: true,
        show_actual_stderr: true,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail + Diff',
      {
        return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail + Exit Status',
      {
        return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail',
      {
        return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        show_points: true,
        show_actual_return_code: false,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: false
      }
    ],
    [
      'Private',
      {
        return_code_fdbk_level: ValueFeedbackLevel.no_feedback,
        stdout_fdbk_level: ValueFeedbackLevel.no_feedback,
        stderr_fdbk_level: ValueFeedbackLevel.no_feedback,
        show_points: false,
        show_actual_return_code: false,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: false
      }
    ]
  ]);
}

function handle_save_ag_test_case_error(component: AGTestCommandSettings, error: unknown) {
  let api_errors_elt = component.$refs.ag_test_case_api_errors as APIErrorsExposed | undefined;
  api_errors_elt?.show_errors_from_response(error);
}

function handle_save_ag_test_cmd_settings_error(component: AGTestCommandSettings, error: unknown) {
  let api_errors_elt = component.$refs.api_errors as APIErrorsExposed | undefined;
  api_errors_elt?.show_errors_from_response(error);
  if (component.d_num_api_errors !== 0) {
    api_errors_elt?.$el.scrollIntoView({behavior: 'smooth'});
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';
@import '@/styles/section_box.scss';

@import './ag_tests.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.test-name-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: .875rem;

  .test-name, .fa-pencil-alt {
    font-size: 1.25rem;
  }

  .test-name {
    font-weight: bold;
    margin-right: .375rem;
  }

  .fa-pencil-alt {
    color: darken($stormy-gray-dark, 10%);

    &:hover {
      color: $stormy-gray-dark;
      cursor: pointer;
    }
  }

  .name-form-buttons {
    display: flex;
    align-items: center;

    .button {
      margin-left: .375rem;
      padding: .375rem .625rem;
    }
  }
}

.correct-incorrect-points-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.unit-of-measurement {
  padding-left: .625rem;
  font-size: .875rem;
}

#first-failure-checkbox-wrapper {
  margin: .25rem 0;
}

#first-failure-settings {
  padding-top: .375rem;
}

.danger-zone-container {
  // We want to have ample space between the delete button and the
  // sticky save button
  max-width: 75%;
}

.fieldset-box {
  border: 0;
}

.fieldset-box .legend {
  font-size: 1rem;
  color: $navy-blue;
}

.code-snippet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid lightgray;
  padding: 0.375rem;
  margin: 0.375rem 0;
}

.input {
  display: inline-block;
  width: 100%;
}
</style>
