<template>
  <div :id="`project-settings-component-${label_uid}`">
    <new-validated-form
      ref="project_settings_form"
      autocomplete="off"
      spellcheck="false"
      aria-label="Project settings"
      @submit="save_project_settings"
      @update:is_valid="state.settings_form_is_valid = $event"
    >
      <div
        :id="`project-name-container-${label_uid}`"
        class="form-field-wrapper"
      >
        <validated-text-input
          ref="project_name_input"
          v-model="state.project.name"
          :validators="[is_not_empty]"
          input_style="max-width: 500px; width: 100%"
        >
          <template v-slot:label>Project Name</template>
        </validated-text-input>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Project Deadline</legend>
          <div class="form-field-wrapper">
            <label class="label" :for="`soft-deadline-${label_uid}`">
              Soft Deadline
              <tooltip width="large" placement="top">
                The deadline shown to students.
              </tooltip>
            </label>

            <div>
              <input
                type="datetime-local"
                :id="`soft-deadline-${label_uid}`"
                v-model="soft_closing_time_model"
              />

              <button
                type="button"
                class="clear-button"
                data-testid="clear_soft_closing_time"
                @click.stop="soft_closing_time_model = ''"
                :disabled="soft_closing_time_model === ''"
                aria-label="clear soft deadline"
              >
                <i class="fas fa-times"></i>
                <span class="clear-text">Clear</span>
              </button>
            </div>
          </div>

          <div class="form-field-wrapper">
            <label class="label" :for="`hard-deadline-${label_uid}`">
              Hard Deadline
              <tooltip width="large" placement="top">
                The actual deadline. Submissions will not be accepted after this
                time unless late days are allowed. This date is NOT shown to
                students.
              </tooltip>
            </label>

            <div>
              <input
                type="datetime-local"
                :id="`hard-deadline-${label_uid}`"
                v-model="closing_time_model"
              />

              <button
                type="button"
                class="clear-button"
                data-testid="clear_closing_time"
                @click.stop="closing_time_model = ''"
                :disabled="closing_time_model === ''"
                aria-label="clear hard deadline"
              >
                <i class="fas fa-times"></i>
                <span class="clear-text">Clear</span>
              </button>
            </div>
          </div>

          <div class="form-field-wrapper">
            <label class="label" :for="`timezone-${label_uid}`">
              Timezone
            </label>
            <div>
              <select
                ref="timezone_input"
                :id="`timezone-${label_uid}`"
                data-testid="timezone"
                class="select"
                v-model="timezone_model"
              >
                <option
                  v-for="timezone of timezones"
                  :value="timezone"
                  :key="timezone"
                >
                  {{ timezone }}
                </option>
              </select>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Access</legend>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="visible_to_students"
                type="checkbox"
                class="checkbox"
                v-model="state.project.visible_to_students"
              />
              Publish project
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="guests_can_submit"
                type="checkbox"
                class="checkbox"
                v-model="state.project.guests_can_submit"
              />
              Anyone with the link can submit
              <tooltip width="large" placement="top">
                This can be restricted to users with a specific email domain in
                the course settings.
              </tooltip>
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="disallow_student_submissions"
                type="checkbox"
                class="checkbox"
                v-model="state.project.disallow_student_submissions"
              />
              Disable submitting
              <tooltip width="large" placement="top">
                Temporarily prevent students from submitting (they can still see
                their previous submissions).
              </tooltip>
            </label>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="publish_final_grades"
                type="checkbox"
                class="checkbox"
                :checked="!state.project.hide_ultimate_submission_fdbk"
                @change="
                  state.project.hide_ultimate_submission_fdbk =
                    !$event.target.checked
                "
              />
              Publish final grades
              <tooltip width="large" placement="top">
                When the hard deadline has passed and scores are published,
                students will see their final grade for the project on the
                submit page.
              </tooltip>
            </label>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Groups</legend>

          <div class="form-field-wrapper">
            <div class="group-size-container">
              <validated-int-input
                data-testid="min_group_size"
                v-model="state.project.min_group_size"
                :validators="[make_min_validator(1)]"
                input_style="max-width: 80px;"
              >
                <template v-slot:label> Min group size </template>
              </validated-int-input>
            </div>

            <div class="group-size-container">
              <validated-int-input
                data-testid="max_group_size"
                v-model="state.project.max_group_size"
                :validators="[make_min_validator(1)]"
                input_style="max-width: 80px;"
              >
                <template v-slot:label>
                  Max group size
                  <tooltip width="large" placement="top">
                    When this is > 1, users will be prompted to register their
                    group members the first time they visit the project page.
                  </tooltip>
                </template>
              </validated-int-input>
            </div>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="disallow_group_registration"
                type="checkbox"
                class="checkbox"
                v-model="state.project.disallow_group_registration"
              />
              Disable group registration
              <tooltip width="large" placement="top">
                Temporarily prevent students registering new groups. Groups
                already registered will be unaffected. <br />
                NOTE: This will effectively prevent unregistered students from
                submitting.
              </tooltip>
            </label>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Grading Policy</legend>
          <div class="form-field-wrapper">
            <label
              class="label"
              :for="`ultimate-submission-policy-${label_uid}`"
            >
              Final graded submission policy
              <tooltip width="large" placement="top">
                Use students' most recent or best submission for their final
                score.
              </tooltip>
            </label>
            <div>
              <select
                :id="`ultimate-submission-policy-${label_uid}`"
                data-testid="ultimate_submission_policy"
                v-model="state.project.ultimate_submission_policy"
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
                  v-if="
                    state.project.ultimate_submission_policy ===
                    UltimateSubmissionPolicy.best_with_normal_fdbk
                  "
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
            <validated-nullable-int-input
              data-testid="submission_limit_per_day"
              v-model="state.project.submission_limit_per_day"
              :validators="[make_nullable_min_validator(1)]"
              input_style="max-width: 80px;"
            >
              <template v-slot:label> Submissions per day </template>
            </validated-nullable-int-input>
          </div>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="allow_submissions_past_limit"
                type="checkbox"
                class="checkbox"
                :disabled="state.project.submission_limit_per_day === null"
                v-model="state.project.allow_submissions_past_limit"
              />
              Allow submissions past limit
            </label>
          </div>

          <div class="form-field-wrapper">
            <label
              class="label"
              :for="`submission-limit-reset-time-${label_uid}`"
            >
              Reset submissions per day at:
            </label>
            <div :id="`reset-time-picker-container-${label_uid}`">
              <input
                type="time"
                ref="submission_limit_reset_time_picker"
                v-model="state.project.submission_limit_reset_time"
                :id="`submission-limit-reset-time-${label_uid}`"
              />
              <span class="display-timezone">
                {{ state.project.timezone }}
                <i
                  class="edit-timezone-icon fas fa-pencil-alt"
                  role="button"
                  aria-label="edit timezone"
                  tabindex="0"
                  @click="timezone_input.focus()"
                  @keydown.space.prevent="timezone_input.focus()"
                  @keydown.enter="timezone_input.focus()"
                ></i>
              </span>
            </div>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="groups_combine_daily_submissions"
                type="checkbox"
                class="checkbox"
                v-model="state.project.groups_combine_daily_submissions"
                :disabled="state.project.max_group_size === 1"
              />
              Groups get more submissions than individuals
              <tooltip width="large" placement="top">
                When unchecked, individuals and groups receive the same number
                of submissions per day. When checked, the daily limit for a
                group is multiplied by the number of users in that group. For
                example, if the daily limit is 2, a group with 3 members would
                receive 6 submissions per day with this box checked.
              </tooltip>
            </label>
          </div>

          <div class="form-field-wrapper">
            <validated-int-input
              ref="bonus_submissions_input"
              v-model="state.project.num_bonus_submissions"
              :validators="[make_min_validator(0)]"
              input_style="max-width: 80px;"
            >
              <template v-slot:label> Bonus submissions per group </template>
            </validated-int-input>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="allow_late_days"
                type="checkbox"
                class="checkbox"
                v-model="state.project.allow_late_days"
              />
              Allow late day tokens
              <tooltip width="large" placement="top">
                Whether students can use late day tokens for this project.
              </tooltip>
            </label>
          </div>

          <div class="form-field-wrapper">
            <validated-nullable-int-input
              ref="total_submissions_input"
              data-testid="total_submission_limit"
              v-model="state.project.total_submission_limit"
              :validators="[make_nullable_min_validator(1)]"
              input_style="max-width: 80px;"
            >
              <template v-slot:label>
                Total submission limit (Ever!)
                <tooltip width="large" placement="top">
                  A hard limit on how many times students can submit ever.
                </tooltip>
              </template>
            </validated-nullable-int-input>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Email Receipts</legend>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="send_email_on_submission_received"
                type="checkbox"
                class="checkbox"
                v-model="state.project.send_email_on_submission_received"
              />
              Send submission received email
              <tooltip width="large" placement="top">
                Students will receive a confirmation email when their submission
                is recorded in the database.
              </tooltip>
            </label>
          </div>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="send_email_on_non_deferred_tests_finished"
                type="checkbox"
                class="checkbox"
                v-model="
                  state.project.send_email_on_non_deferred_tests_finished
                "
              />
              Send score summary email
              <tooltip width="large" placement="top">
                Students will receive a score-summary email when all
                non-deferred test cases are finished grading.
              </tooltip>
            </label>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset class="fieldset">
          <legend class="legend">Honor Pledge</legend>
          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input
                data-testid="use_honor_pledge"
                type="checkbox"
                class="checkbox"
                v-model="state.project.use_honor_pledge"
              />
              Require honor pledge
              <tooltip width="large" placement="top">
                Students will be prompted to sign an honor pledge each time they
                submit.
              </tooltip>
            </label>
          </div>
          <div class="form-field-wrapper" v-if="state.project.use_honor_pledge">
            <validated-text-area-input
              data-testid="honor_pledge_text"
              v-model="state.project.honor_pledge_text"
              :validators="[]"
              :num_rows="4"
              input_style="max-width: 500px; width: 100%"
            >
              <template v-slot:label> Honor pledge text </template>
            </validated-text-area-input>
          </div>
        </fieldset>
      </div>

      <APIErrors ref="api_errors"></APIErrors>

      <div class="button-footer">
        <button
          :id="`save-button-${label_uid}`"
          class="save-button"
          type="submit"
          :disabled="!state.settings_form_is_valid || state.saving"
        >
          Save
        </button>
        <div class="last-saved-timestamp">
          <i v-if="state.saving" class="loading fa fa-spinner fa-pulse"></i>
          <template v-else
            >Last saved:
            {{ format_datetime_short(state.project.last_modified) }}</template
          >
        </div>
      </div>
    </new-validated-form>

    <div
      class="danger-zone-container"
      role="region"
      aria-label="delete project"
    >
      <div class="delete-instructions">
        To delete this project, please delete all of its test cases first
        (regular test suites and mutation test suites).
      </div>
      <div class="danger-text">Delete Project: {{ state.project.name }}</div>
      <button
        data-testid="show_delete_project_modal_button"
        class="delete-button"
        type="button"
        @click="state.show_delete_project_modal = true"
      >
        Delete
      </button>

      <modal
        v-if="state.show_delete_project_modal"
        @close="state.show_delete_project_modal = false"
        ref="delete_project_modal"
        size="large"
        :click_outside_to_close="!state.deleting"
        :show_closing_x="!state.deleting"
      >
        <div class="modal-header">Confirm Delete</div>
        <div class="modal-body">
          Are you sure you want to delete the project
          <span class="item-to-delete">{{ state.project.name }}</span
          >? <br /><br />
          This will delete all associated submissions and handgrading
          results.<br />
          <b>THIS ACTION CANNOT BE UNDONE.</b>
          <APIErrors ref="delete_errors"></APIErrors>
          <div class="modal-button-footer">
            <button
              data-testid="delete_project_button"
              class="red-button"
              :disabled="state.deleting"
              @click="delete_project"
            >
              Delete
            </button>

            <button
              class="modal-cancel-button white-button"
              @click="state.show_delete_project_modal = false"
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
import { Project, UltimateSubmissionPolicy } from "ag-client-typescript";
import { watch, reactive, computed, ref } from "vue";
import { useRouter } from "vue-router/composables";
import moment from "moment-timezone";
import APIErrors from "@/components/api_errors.vue";
import { APIErrorsExposed } from "@/exposed_component_types/api_errors_exposed";
import Modal from "@/components/modal.vue";
import Tooltip from "@/components/tooltip.vue";
import NewValidatedForm from "../validated_input/NewValidatedForm.vue";
import ValidatedTextInput from "../validated_input/ValidatedTextInput.vue";
import ValidatedTextAreaInput from "../validated_input/ValidatedTextAreaInput.vue";
import ValidatedIntInput from "../validated_input/ValidatedIntInput.vue";
import ValidatedNullableIntInput from "../validated_input/ValidatedNullableIntInput.vue";
import {
  assert,
  assert_not_null,
  deep_copy,
  format_datetime_short,
  toggle,
  generate_uid,
} from "@/utils";
import {
  is_not_empty,
  make_min_validator,
  make_nullable_min_validator,
} from "@/new_validators";

type PropTypes = {
  project: Project;
};

const props = defineProps<PropTypes>();

const api_errors = ref<APIErrorsExposed>();
const delete_errors = ref<APIErrorsExposed>();
const timezone_input = ref<HTMLSelectElement>();

const state = reactive({
  project: deep_copy(props.project, Project),
  saving: false,
  settings_form_is_valid: true,
  show_reset_time_picker: false,
  show_delete_project_modal: false,
  deleting: false,
});

watch(
  () => props.project,
  (project) => {
    state.project = deep_copy(project, Project);
  },
);

const router = useRouter();

const timezones = computed(() => {
  return moment.tz.names();
});

class DatetimeConverter {
  // This is the format that datetime-local inputs expect
  static readonly WALL_TIME_FORMAT = "YYYY-MM-DD[T]HH:mm";

  static to_wall_time(iso_datetime: string | null, zone: string) {
    return iso_datetime !== null
      ? moment
          .parseZone(iso_datetime)
          .tz(zone)
          .format(DatetimeConverter.WALL_TIME_FORMAT)
      : "";
  }

  static to_iso(wall_time: string, zone: string) {
    return wall_time !== ""
      ? moment.tz(wall_time, DatetimeConverter.WALL_TIME_FORMAT, zone).format()
      : null;
  }
}

const timezone_model = computed({
  get() {
    return state.project.timezone;
  },
  set(new_zone) {
    const wall_soft_closing_time = DatetimeConverter.to_wall_time(
      state.project.soft_closing_time,
      state.project.timezone,
    );

    // closing_time is only undefined for students, who won't visit this page
    assert(state.project.closing_time !== undefined);
    const wall_closing_time = DatetimeConverter.to_wall_time(
      state.project.closing_time,
      state.project.timezone,
    );

    state.project.timezone = new_zone;

    // Update the underlying ISO time so that the wall times
    // in the form don't change when the timezone changes.

    state.project.soft_closing_time = DatetimeConverter.to_iso(
      wall_soft_closing_time,
      new_zone,
    );

    state.project.closing_time = DatetimeConverter.to_iso(
      wall_closing_time,
      new_zone,
    );
  },
});

const soft_closing_time_model = computed({
  get() {
    return DatetimeConverter.to_wall_time(
      state.project.soft_closing_time,
      state.project.timezone,
    );
  },
  set(local_value) {
    state.project.soft_closing_time = DatetimeConverter.to_iso(
      local_value,
      state.project.timezone,
    );
  },
});

const closing_time_model = computed({
  get() {
    // closing_time is only undefined for students, who won't visit this page
    assert(state.project.closing_time !== undefined);
    return DatetimeConverter.to_wall_time(
      state.project.closing_time,
      state.project.timezone,
    );
  },
  set(local_value) {
    state.project.closing_time = DatetimeConverter.to_iso(
      local_value,
      state.project.timezone,
    );
  },
});

const save_project_settings = () => {
  return toggle(state, "saving", async () => {
    assert_not_null(state.project);
    try {
      api_errors.value?.clear();
      await state.project.save();
    } catch (error: unknown) {
      api_errors.value?.show_errors_from_response(error);
    }
  });
};

const delete_project = () => {
  return toggle(state, "deleting", async () => {
    assert_not_null(state.project);
    try {
      api_errors.value?.clear();
      await state.project.delete();
      await router.push({
        name: "course_admin",
        params: { course_id: state.project.course.toString() },
        query: { current_tab: "projects" },
      });
    } catch (error: unknown) {
      delete_errors.value?.show_errors_from_response(error);
    }
  });
};

// This only needs to be unique across instances of the component.
// We combine it with unique id fragrments for each form input label.
const label_uid = generate_uid();

defineExpose({
  state,
  soft_closing_time_model,
});
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/button_styles.scss";
@import "@/styles/components/datetime.scss";
@import "@/styles/forms.scss";
@import "@/styles/loading.scss";
@import "@/styles/modal.scss";

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#project-settings-component {
  padding: 0.625rem;
}

.section-container {
  margin-bottom: 0.625rem;
}

.group-size-container {
  display: inline-block;
  min-width: 150px;
  max-width: 250px;
  vertical-align: top;
}

#reset-time-picker-container {
  display: flex;
  align-items: center;
}

.delete-instructions {
  width: 100%;
  margin-bottom: 1rem;
}

.display-timezone {
  height: auto;
  padding: 0.5rem;
}

.edit-timezone-icon {
  cursor: pointer;
}
</style>
