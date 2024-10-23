<template>
  <div id="project-settings-component">
    <validated-form
      ref="project_settings_form"
      autocomplete="off"
      spellcheck="false"
      @submit="save_project_settings"
      @form_validity_changed="settings_form_is_valid = $event"
    >
      <div id="project-name-container" class="form-field-wrapper">
        <label class="label"> Project Name </label>
        <validated-input
          ref="project_name_input"
          v-model="d_project.name"
          :validators="[is_not_empty]"
          input_style="max-width: 500px; width: 100%"
        >
        </validated-input>
      </div>

      <fieldset class="fieldset">
        <legend class="legend">Project Deadline</legend>
        <div
          class="clearable-datetime-picker soft-deadline"
          data-testid="soft-deadline-picker"
        >
          <div class="label">
            Soft Deadline
            <tooltip width="medium" placement="top">
              The deadline shown to students.
            </tooltip>
          </div>
          <div
            class="datetime-input"
            data-testid="soft-deadline-input"
            @click="$refs.soft_closing_time.toggle_visibility()"
          >
            {{format_datetime(d_project.soft_closing_time)}}
            <i class="far fa-calendar-alt"></i>
          </div>
          <button
            type="button"
            class="clear-button"
            data-testid="clear-soft-deadline"
            @click.stop="d_project.soft_closing_time = null"
            :disabled="d_project.soft_closing_time === null"
          >
            <i class="fas fa-times"></i>
            <span class="clear-text">Clear</span>
          </button>

          <datetime-picker
            v-model="d_project.soft_closing_time"
            data-testid="soft-deadline-datetime-picker"
            ref="soft_closing_time"
          ></datetime-picker>
        </div>

        <div
          class="clearable-datetime-picker hard-deadline"
          data-testid="hard-deadline-picker"
        >
          <div class="label">
            Hard Deadline
            <tooltip width="large" placement="top">
              The actual deadline. Submissions will not be accepted after this
              time unless late days are allowed. This date is NOT shown to
              students.
            </tooltip>
          </div>
          <div
            class="datetime-input"
            data-testid="hard-deadline-input"
            @click="$refs.closing_time.toggle_visibility()"
          >
            {{format_datetime(d_project.closing_time)}}
            <i class="far fa-calendar-alt"></i>
          </div>
          <button
            type="button"
            class="clear-button"
            data-testid="clear-hard-deadline"
            @click.stop="d_project.closing_time = null"
            :disabled="d_project.closing_time === null"
          >
            <i class="fas fa-times"></i>
            <span class="clear-text">Clear</span>
          </button>

          <datetime-picker
            v-model="d_project.closing_time"
            ref="closing_time"
          ></datetime-picker>
        </div>
      </fieldset>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Access</legend>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="visible-to-students"
                type="checkbox"
                class="checkbox"
                v-model="d_project.visible_to_students"
              />
              Publish project
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="guests-can-submit"
                type="checkbox"
                class="checkbox"
                v-model="d_project.guests_can_submit"
              />
              Anyone with the link can submit
            </label>
            <tooltip width="large" placement="top">
              This can be restricted to users with a specific email domain in
              the course settings.
            </tooltip>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="disallow-student-submissions"
                type="checkbox"
                class="checkbox"
                v-model="d_project.disallow_student_submissions"
              />
              Disable submitting
            </label>
            <tooltip width="large" placement="top">
              Temporarily prevent students from submitting (they can still see
              their previous submissions).
            </tooltip>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="publish-final-grades"
                type="checkbox"
                class="checkbox"
                :checked="!d_project.hide_ultimate_submission_fdbk"
                @change="d_project.hide_ultimate_submission_fdbk = !$event.target.checked"
              />
              Publish final grades
            </label>
            <tooltip width="large" placement="top">
              When the hard deadline has passed and scores are published,
              students will see their final grade for the project on the submit
              page.
            </tooltip>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Groups</legend>

          <div class="form-field-wrapper">
            <div class="group-size-container">
              <label class="label"> Min group size </label>
              <validated-input
                id="min-group-size"
                testid="min-group-size"
                v-model="d_project.min_group_size"
                :validators="[is_integer, is_not_empty, is_positive]"
                :from_string_fn="string_to_num"
                input_style="width: 80px;"
              >
              </validated-input>
            </div>

            <div class="group-size-container">
              <label class="label"> Max group size </label>
              <tooltip width="large" placement="top">
                When this is > 1, users will be prompted to register their group
                members the first time they visit the project page.
              </tooltip>
              <validated-input
                id="max-group-size"
                testid="max-group-size"
                v-model="d_project.max_group_size"
                :validators="[is_integer, is_not_empty, is_positive]"
                :from_string_fn="string_to_num"
                input_style="width: 80px;"
              >
              </validated-input>
            </div>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="disallow-group-registration"
                type="checkbox"
                class="checkbox"
                v-model="d_project.disallow_group_registration"
              />
              Disable group registration
            </label>
            <tooltip width="large" placement="top">
              Temporarily prevent students registering new groups. Groups
              already registered will be unaffected. <br />
              NOTE: This will effectively prevent unregistered students from
              submitting.
            </tooltip>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Grading Policy</legend>
          <div class="form-field-wrapper">
            <label class="label" for="ultimate-submission-policy">
              Final graded submission policy
            </label>
            <tooltip width="large" placement="top">
              Use students' most recent or best submission for their final
              score.
            </tooltip>
            <div>
              <select
                id="ultimate-submission-policy"
                data-testid="ultimate-submission-policy"
                v-model="d_project.ultimate_submission_policy"
                class="select"
              >
                <option :value="UltimateSubmissionPolicy.most_recent">
                  Most recent submission
                </option>
                <option :value="UltimateSubmissionPolicy.best">
                  Best score
                </option>
                <option
                  disabled
                  v-if="d_project.ultimate_submission_policy
                                === UltimateSubmissionPolicy.best_with_normal_fdbk"
                  :value="UltimateSubmissionPolicy.best_with_normal_fdbk"
                >
                  Best score using Normal feedback (deprecated)
                </option>
              </select>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Submission Limits</legend>
          <div class="form-field-wrapper">
            <label class="label"> Submissions per day </label>
            <validated-input
              id="submission-limit-per-day"
              testid="submission-limit-per-day"
              v-model="d_project.submission_limit_per_day"
              :validators="[is_positive_int_or_empty_str]"
              :to_string_fn="(num) => num === null ? '' : num.toString()"
              :from_string_fn="(val) => val.trim() === '' ? null : Number(val)"
              input_style="width: 80px;"
            >
            </validated-input>
          </div>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="allow-submissions-past-limit"
                type="checkbox"
                class="checkbox"
                :disabled="d_project.submission_limit_per_day === null"
                v-model="d_project.allow_submissions_past_limit"
              />
              Allow submissions past limit
            </label>
          </div>

          <div class="form-field-wrapper extra-space">
            <label class="label"> Reset submissions per day at: </label>
            <div id="reset-time-picker-container">
              <div class="clearable-datetime-picker">
                <div
                  class="datetime-input"
                  ref="submission_limit_reset_time"
                  data-testid="reset-time-input"
                  @click="d_show_reset_time_picker = !d_show_reset_time_picker"
                >
                  {{format_time(d_project.submission_limit_reset_time)}}
                  <i class="far fa-clock"></i>
                </div>

                <div class="timezone">
                  <select
                    id="submission-limit-reset-timezone"
                    data-testid="submission-limit-reset-timezone"
                    class="select"
                    v-model="d_project.submission_limit_reset_timezone"
                  >
                    <option v-for="timezone of timezones" :value="timezone">
                      {{timezone}}
                    </option>
                  </select>
                </div>
              </div>

              <time-picker
                v-model="d_project.submission_limit_reset_time"
                v-if="d_show_reset_time_picker"
                ref="submission_limit_reset_time_picker"
              ></time-picker>
            </div>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="groups-combine-daily-submissions"
                type="checkbox"
                class="checkbox"
                v-model="d_project.groups_combine_daily_submissions"
                :disabled="d_project.max_group_size === 1"
              />
              Groups get more submissions than individuals
            </label>
            <tooltip width="large" placement="top">
              When unchecked, individuals and groups receive the same number of
              submissions per day. When checked, the daily limit for a group is
              multiplied by the number of users in that group. For example, if
              the daily limit is 2, a group with 3 members would receive 6
              submissions per day with this box checked.
            </tooltip>
          </div>

          <div class="form-field-wrapper extra-space">
            <label class="label"> Bonus submissions per group </label>
            <validated-input
              ref="bonus_submissions_input"
              testid="bonus-submissions-input"
              v-model="d_project.num_bonus_submissions"
              :validators="[is_integer, is_not_empty, is_non_negative]"
              input_style="width: 80px;"
            >
            </validated-input>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="allow-late-days"
                type="checkbox"
                class="checkbox"
                v-model="d_project.allow_late_days"
              />
              Allow late day tokens
            </label>
            <tooltip width="medium" placement="top">
              Whether students can use late day tokens for this project.
            </tooltip>
          </div>

          <div class="form-field-wrapper extra-space">
            <label for="total-submission-limit" class="label">
              Total submission limit (Ever!)
            </label>
            <tooltip width="medium" placement="top">
              A hard limit on how many times students can submit ever.
            </tooltip>
            <validated-input
              ref="total_submissions_input"
              id="total-submission-limit"
              testid="total-submission-limit"
              v-model="d_project.total_submission_limit"
              :validators="[is_positive_int_or_empty_str]"
              :to_string_fn="(num) => num === null ? '' : num.toString()"
              :from_string_fn="(val) => val.trim() === '' ? null : Number(val)"
              input_style="width: 80px;"
            >
            </validated-input>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Email Receipts</legend>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="send-email-on-submission-received"
                type="checkbox"
                class="checkbox"
                v-model="d_project.send_email_on_submission_received"
              />
              Send submission received email
            </label>
            <tooltip width="medium" placement="top">
              Students will receive a confirmation email when their submission
              is recorded in the database.
            </tooltip>
          </div>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="send-email-on-non-deferred-tests-finished"
                type="checkbox"
                class="checkbox"
                v-model="d_project.send_email_on_non_deferred_tests_finished"
              />
              Send score summary email
            </label>
            <tooltip width="medium" placement="top">
              Students will receive a score-summary email when all non-deferred
              test cases are finished grading.
            </tooltip>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Honor Pledge</legend>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="use-honor-pledge"
                type="checkbox"
                class="checkbox"
                v-model="d_project.use_honor_pledge"
              />
              Require honor pledge
            </label>
            <tooltip width="medium" placement="top">
              Students will be prompted to sign an honor pledge each time they
              submit.
            </tooltip>
          </div>
          <div class="form-field-wrapper" v-if="d_project.use_honor_pledge">
            <label class="label">Honor pledge text</label>
            <validated-input
              data-testid="honor-pledge-text"
              v-model="d_project.honor_pledge_text"
              :validators="[]"
              :num_rows="4"
              input_style="max-width: 500px; width: 100%"
            />
          </div>
        </fieldset>
      </div>

      <APIErrors ref="api_errors"></APIErrors>

      <div class="button-footer">
        <button
          id="save-button"
          data-testid="save-button"
          class="save-button"
          type="submit"
          :disabled="!settings_form_is_valid || d_saving"
        >
          Save
        </button>
        <div class="last-saved-timestamp">
          <i v-if="d_saving" class=" loading fa fa-spinner fa-pulse"></i>
          <template v-else
            >Last saved:
            {{format_datetime_short(project.last_modified)}}</template
          >
        </div>
      </div>
    </validated-form>

    <div class="danger-zone-container">
      <div class="delete-instructions">
        To delete this project, please delete all of its test cases first
        (regular test suites and mutation test suites).
      </div>
      <div class="danger-text">Delete Project: {{project.name}}</div>
      <button
        data-testid="show-delete-project-modal-button"
        class="delete-button"
        type="button"
        @click="d_show_delete_project_modal = true"
      >
        Delete
      </button>

      <modal
        v-if="d_show_delete_project_modal"
        @close="d_show_delete_project_modal = false"
        ref="delete_project_modal"
        size="large"
        :click_outside_to_close="!d_deleting"
        :show_closing_x="!d_deleting"
      >
        <div class="modal-header">Confirm Delete</div>
        <div class="modal-body">
          Are you sure you want to delete the project
          <span class="item-to-delete">{{project.name}}</span
          >? <br /><br />
          This will delete all associated submissions and handgrading
          results.<br />
          <b>THIS ACTION CANNOT BE UNDONE.</b>
          <APIErrors ref="delete_errors"></APIErrors>
          <div class="modal-button-footer">
            <button
              data-testid="delete-project-button"
              class="red-button"
              :disabled="d_deleting"
              @click="delete_project"
            >
              Delete
            </button>

            <button
              class="modal-cancel-button white-button"
              data-testid="cancel-delete-project-button"
              @click="d_show_delete_project_modal = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import moment from "moment-timezone";
import { computed, watch, toRaw, ref } from "vue";

import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import TimePicker from "@/components/datetime/time_picker.vue";
import Modal from "@/components/modal.vue";
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { handle_api_errors_async, make_error_handler_func } from '@/error_handling_composition';
import { assert_not_null, deep_copy, format_datetime, format_datetime_short, format_time } from "@/utils";
import { toggle, useRouter } from "@/utils_composition"
import {
  is_integer,
  is_non_negative,
  is_not_empty,
  make_min_value_validator,
  string_to_num
} from '@/validators';

type PropTypes = {
  project: Project
};
const props = defineProps<PropTypes>();

const router = useRouter();

const timezones = computed(() => moment.tz.names());

const d_project = ref<Project>();
const d_saving = ref(false);
const settings_form_is_valid = ref(true);

const d_show_reset_time_picker = ref(false);

const d_show_delete_project_modal = ref(false);
const d_deleting = ref(false);

const api_errors = ref<APIErrors>();
const delete_errors = ref<APIErrors>();

const is_positive = make_min_value_validator(1);

watch(
  () => props.project,
  (project: Project) => {
    d_project.value = deep_copy(toRaw(project), Project)
  },
  { immediate: true }
);

const save_project_settings = handle_api_errors_async(
  async () => {
    try {
      assert_not_null(d_project.value);
      d_saving.value = true;
      (<APIErrors> api_errors.value).clear();
      await d_project.value.save();
    }
    finally {
      d_saving.value = false;
    }
  }, make_error_handler_func(api_errors)
);

const delete_project = handle_api_errors_async(
  async () => {
    return toggle(d_deleting, async () => {
      await props.project.delete();
      return router.push({
        name: 'course_admin',
        params: {course_id: props.project.course.toString()},
        query: {current_tab: 'projects'}
      });
    });
  }, make_error_handler_func(delete_errors)
);

function is_positive_int_or_empty_str(value: string): ValidatorResponse {
  value = value.trim();
  if (value === '') {
    return {is_valid: true, error_msg: ''};
  }

  return make_min_value_validator(1)(value);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/datetime.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#project-settings-component {
  padding: .625rem;
}

.section-container {
  margin-bottom: .625rem;
}

.group-size-container {
  display: inline-block;
  min-width: 150px;
  max-width: 250px;
  vertical-align: top;
}

.soft-deadline {
  padding-bottom: 1rem;
}

#reset-time-picker-container {
  .clearable-datetime-picker {
    display: flex;
    align-items: center;
  }
}

.delete-instructions {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
