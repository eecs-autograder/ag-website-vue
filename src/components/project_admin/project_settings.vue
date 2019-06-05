<template>
  <div id="project-settings-component">

    <validated-form ref="project_settings_form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit.native.prevent="save_project_settings"
                    @form_validity_changed="settings_form_is_valid = $event">
      <div id="project-name-container">
        <label class="text-label"> Project Name </label>
        <validated-input ref="project_name_input"
                         v-model="d_project.name"
                         :validators="[is_not_empty]"
                         input_style="max-width: 500px; width: 100%">
        </validated-input>
      </div>

      <div class="section-container">
        <fieldset>
          <legend> Access </legend>
          <div class="toggle-container">
            <toggle v-model="d_project.hide_ultimate_submission_fdbk">
              <div slot="on">
                Hide Final Grades
              </div>
              <div slot="off">
                Publish Final Grades
              </div>
            </toggle>
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="medium" placement="right">
                When the hard deadline has passed and scores are published,
                students will see their final grade for the project on the submit page.
              </tooltip>
            </i>
          </div>

          <div class="checkbox-input-container">
            <input id="visible-to-students"
                   type="checkbox"
                   v-model="d_project.visible_to_students"/>
            <label class="checkbox-label"
                   for="visible-to-students">
              Visible to students
            </label>
          </div>

          <div class="checkbox-input-container">
            <input id="guests-can-submit"
                   type="checkbox"
                   v-model="d_project.guests_can_submit"/>
            <label class="checkbox-label"
                   for="guests-can-submit">
              Guests can submit
            </label>
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="large" placement="right">
                Anyone with the link can submit.
                This can be restricted to users with a specific email domain
                in the course settings.
              </tooltip>
            </i>
          </div>

          <div class="checkbox-input-container">
            <input id="disallow-student-submissions"
                   type="checkbox"
                   v-model="d_project.disallow_student_submissions"/>
            <label class="checkbox-label"
                   for="disallow-student-submissions">
              Disallow student submissions
            </label>
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="large" placement="right">
                Temporarily prevent students from submitting (they can still see their
                previous submissions).
              </tooltip>
            </i>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset>
          <legend> Group Size </legend>
          <div class="project-input-container">
            <div class="min-group-size-container">
              <div class="side-by-side">
                <label class="text-label"> Min group size </label>
                <validated-input ref="min_group_size_input"
                                 v-model="d_project.min_group_size"
                                 :validators="[is_integer, is_not_empty, is_non_negative]"
                                 input_style="width: 80px;">
                </validated-input>
              </div>
            </div>

            <div class="max-group-size-container">
              <div class="side-by-side">
              <label class="text-label"> Max group size </label>
              <i class="fas fa-question-circle input-tooltip">
                <tooltip width="large" placement="right">
                  When this is > 1, users will be prompted to register their group
                  members the first time they visit the project page.
                </tooltip>
              </i>
              <validated-input ref="max_group_size_input"
                               v-model="d_project.max_group_size"
                               :validators="[is_integer, is_not_empty, is_non_negative]"
                               input_style="width: 80px;">
              </validated-input>
              </div>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset>
          <legend> Grading Policy </legend>
          <div class="project-input-container">
            <label class="text-label"> Final graded submission policy </label>
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="large" placement="right">
                Use students' most recent or best submission for their final score.
              </tooltip>
            </i>
            <div>
              <dropdown ref="dropdown_final_graded_submission_policy"
                        :items="final_graded_submission_policy_options"
                        :initial_highlighted_index="0"
                        @update_item_selected="d_project.ultimate_submission_policy
                                               = $event.policy">
                <template slot="header">
                  <div tabindex="1" class="dropdown-header-wrapper">
                    <div id="final-graded-submission-policy" class="dropdown-header">
                      {{submission_policy_selected}}
                      <i class="fas fa-caret-down dropdown-caret"></i>
                    </div>
                  </div>
                </template>
                <span slot-scope="{item}">
                  <span class="submission-policy">{{item.label}}</span>
                </span>
              </dropdown>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="section-container">
        <fieldset>
          <legend> Submissions </legend>
          <div class="project-input-container">
            <label class="text-label"> Submission limit per day </label>
            <input id="submission-limit-per-day"
                   class="project-settings-input"
                   type="number"
                   min="1"
                   v-model="d_submission_limit_per_day"/>
          </div>

          <div v-if="submission_limit_per_day_exists"
               class="checkbox-input-container">
            <input id="allow-submissions-past-limit"
                   type="checkbox"
                   v-model="d_project.allow_submissions_past_limit"/>
            <label class="checkbox-label"
                   for="allow-submissions-past-limit">
              Allow submissions past limit
            </label>
          </div>

          <div class="project-input-container">
            <label class="text-label"> Bonus submissions per group </label>
            <validated-input ref="bonus_submissions_input"
                             v-model="d_project.num_bonus_submissions"
                             :validators="[is_integer, is_not_empty, is_non_negative]"
                             input_style="width: 80px;">
            </validated-input>
          </div>

          <div class="checkbox-input-container">
            <input id="groups-combine-daily-submissions"
                   type="checkbox"
                   v-model="d_project.groups_combine_daily_submissions"/>
            <label class="checkbox-label"
                   for="groups-combine-daily-submissions">
              Groups get more submissions than individuals
            </label>
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="large" placement="right">
                When unchecked, individuals and groups receive the same number of
                submissions per day. When checked, the daily limit for a group
                is multiplied by the number of users in that group.
                For example, if the daily limit is 2, a group with 3 members would
                receive 6 submissions per day with this box checked.
              </tooltip>
            </i>
          </div>

          <div class="project-input-container">
            <label class="text-label">
              Reset submissions per day at:
            </label>
            <div id="reset-time-picker-container">
              <div class="clearable-datetime-picker">
                <div class="datetime-input" ref="submission_limit_reset_time"
                     @click="d_show_reset_time_picker = !d_show_reset_time_picker">
                  {{format_time(d_project.submission_limit_reset_time)}}
                  <i class="far fa-clock"></i>
                </div>

                <div class="timezone">
                  <dropdown ref="dropdown_timezone"
                            :items="timezones"
                            @update_item_selected="
                                d_project.submission_limit_reset_timezone = $event">
                    <template slot="header">
                      <div tabindex="1" class="dropdown-header-wrapper">
                        <div id="timezone-dropdown" class="dropdown-header">
                          {{d_project.submission_limit_reset_timezone}}
                          <i class="fas fa-caret-down dropdown-caret"></i>
                        </div>
                      </div>
                    </template>
                    <span slot-scope="{item}">
                      <span class="submission-policy">{{item}}</span>
                    </span>
                  </dropdown>
                </div>
              </div>

              <time-picker v-model="d_project.submission_limit_reset_time"
                           v-if="d_show_reset_time_picker"
                           ref="submission_limit_reset_time_picker"></time-picker>
            </div>
          </div>

          <div class="checkbox-input-container">
            <input id="allow-late-days"
                   type="checkbox"
                   v-model="d_project.allow_late_days"/>
            <label class="checkbox-label"
                   for="allow-late-days">
              Allow late days
            </label>
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="large" placement="right">
                Whether students can use late days for this project.
              </tooltip>
            </i>
          </div>

          <div class="project-input-container">
            <label class="text-label"> Total submission limit (Ever!) </label>
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="medium" placement="right">
                A hard limit on how many times students can submit ever.
              </tooltip>
            </i>
            <input ref="total_submissions_input"
                   class="project-settings-input"
                   type="number"
                   min="1"
                   v-model="d_project.total_submission_limit"/>
          </div>
        </fieldset>
      </div>

      <div>
        <fieldset>
          <legend> Project Deadline </legend>
          <div class="project-input-container">

            <div class="clearable-datetime-picker soft-deadline">
              <div class="label">
                Soft Deadline
                <i class="fas fa-question-circle input-tooltip">
                  <tooltip width="medium" placement="right">
                    The deadline shown to students.
                  </tooltip>
                </i>
              </div>
              <div class="datetime-input"
                   @click="$refs.soft_closing_time.toggle_visibility()">
                {{format_datetime(d_project.soft_closing_time)}}
                <i class="far fa-calendar-alt"></i>
              </div>
              <button type="button" class="clear-button" ref="clear_soft_closing_time"
                      @click.stop="d_project.soft_closing_time = null"
                      :disabled="d_project.soft_closing_time === null">
                <i class="fas fa-times"></i>
                <span class="clear-text">Clear</span>
              </button>

              <datetime-picker v-model="d_project.soft_closing_time"
                               ref="soft_closing_time"></datetime-picker>
            </div>

            <div class="clearable-datetime-picker hard-deadline">
              <div class="label">
                Hard Deadline
                <i class="fas fa-question-circle input-tooltip">
                  <tooltip width="medium" placement="right">
                    The deadline shown to students.
                  </tooltip>
                </i>
              </div>
              <div class="datetime-input"
                   @click="$refs.closing_time.toggle_visibility()">
                {{format_datetime(d_project.closing_time)}}
                <i class="far fa-calendar-alt"></i>
              </div>
              <button type="button" class="clear-button" ref="clear_closing_time"
                      @click.stop="d_project.closing_time = null"
                      :disabled="d_project.closing_time === null">
                <i class="fas fa-times"></i>
                <span class="clear-text">Clear</span>
              </button>

              <datetime-picker v-model="d_project.closing_time"
                               ref="closing_time"></datetime-picker>
            </div>

          </div>
        </fieldset>
      </div>

      <div class="footer">
        <APIErrors ref="api_errors"></APIErrors>

        <button id="save-button"
                type="submit"
                :disabled="!settings_form_is_valid || d_saving">
          Save Updates
        </button>
        <span v-show="d_saving" class="saving-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </span>
      </div>
    </validated-form>
  </div>
</template>

<script lang="ts">
  import APIErrors from '@/components/api_errors.vue';
  import DatetimePicker from "@/components/datetime/datetime_picker.vue";
  import TimePicker from "@/components/datetime/time_picker.vue";
  import Dropdown from '@/components/dropdown.vue';
  import Toggle from '@/components/toggle.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput from '@/components/validated_input.vue';

  import { deep_copy, format_datetime, format_time, handle_api_errors_async } from "@/utils";
  import {
    is_integer,
    is_non_negative,
    is_not_empty,
    is_number,
    string_to_num
  } from '@/validators';
  import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  interface UltimateSubmissionPolicyOption {
    label: string;
    policy: UltimateSubmissionPolicy;
  }

  @Component({
  components: {
    APIErrors,
    DatetimePicker,
    Dropdown,
    TimePicker,
    Toggle,
    Tooltip,
    ValidatedForm,
    ValidatedInput,
  }
})
export default class ProjectSettings extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  final_graded_submission_policy_options: UltimateSubmissionPolicyOption[] = [
    {
      label: "Most recent submission",
      policy: UltimateSubmissionPolicy.most_recent
    },
    {
      label: "Best score using Normal feedback",
      policy: UltimateSubmissionPolicy.best_with_normal_fdbk
    },
    {
      label: "Best score",
      policy: UltimateSubmissionPolicy.best
    }
  ];

  timezones = [
    'US/Central',
    'US/Eastern',
    'US/Mountain',
    'US/Pacific',
    'UTC'
  ];

  d_project: Project = make_empty_project();
  d_saving = false;
  settings_form_is_valid = true;

  d_submission_limit_per_day = '';
  d_show_reset_time_picker = false;

  readonly is_non_negative = is_non_negative;
  readonly is_not_empty = is_not_empty;
  readonly is_number = is_number;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;

  async created() {
    this.d_project = deep_copy(this.project, Project);
    if (this.d_project.submission_limit_per_day !== null) {
      this.d_submission_limit_per_day = this.d_project.submission_limit_per_day.toString();
    }
  }

  get submission_policy_selected() {
    let index = this.final_graded_submission_policy_options.findIndex((policy_option) =>
      policy_option.policy === this.d_project.ultimate_submission_policy
    );
    return this.final_graded_submission_policy_options[index].label;
  }

  get submission_limit_per_day_exists() {
    return this.d_submission_limit_per_day.toString().match('^[0-9]+$') !== null;
  }

  @handle_api_errors_async(handle_save_project_settings_error)
  async save_project_settings() {
    try {
      this.d_saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      this.d_project.submission_limit_per_day = this.submission_limit_per_day_exists
                                                ? Number(this.d_submission_limit_per_day) : null;

      await this.d_project!.save();
    }
    finally {
      this.d_saving = false;
    }
  }

  get format_datetime() {
    return format_datetime;
  }

  get format_time() {
    return format_time;
  }
}

export function handle_save_project_settings_error(component: ProjectSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

function make_empty_project(): Project {
  return new Project({
    pk: 0,
    name: '',
    last_modified: '',
    course: 0,
    visible_to_students: false,
    closing_time: null,
    soft_closing_time: null,
    disallow_student_submissions: false,
    disallow_group_registration: false,
    guests_can_submit: false,
    min_group_size: 0,
    max_group_size: 0,
    submission_limit_per_day: null,
    allow_submissions_past_limit: false,
    groups_combine_daily_submissions: false,
    submission_limit_reset_time: '12:00',
    submission_limit_reset_timezone: 'UTC',
    num_bonus_submissions: 0,
    total_submission_limit: 0,
    allow_late_days: false,
    ultimate_submission_policy: UltimateSubmissionPolicy.most_recent,
    hide_ultimate_submission_fdbk: false,
  });
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/datetime.scss';

#project-settings-component {
  padding: 10px;
  min-width: 100%;
}

fieldset {
  border-bottom: none;
  border-left: none;
  border-right: none;
  border-color: rgba(255, 255, 255, 0.3);
  border-width: 2px;
}

legend {
  color: $ocean-blue;
  font-size: 18px;
}

.input-tooltip {
  color: mediumvioletred;
  font-size: 15px;
  margin-left: 8px;
}

.section-container {
  padding: 0 0 10px 0;
}

#project-name-container {
  padding: 10px 12px 22px 12px;
}

.min-group-size-container, .max-group-size-container {
  display: inline-block;
  max-width: 250px;
  vertical-align: top;
}

.side-by-side {
  display: inline-block;
  max-width: 80%;
}

.soft-deadline, .hard-deadline {
  display: inline-block;
  min-width: 450px;
  vertical-align: top;
}

.soft-deadline {
  padding-bottom: 20px;
}

.hard-deadline {
  padding-bottom: 10px;
}

.footer {
  padding: 0 12px 22px 15px;
}

.project-settings-input {
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  box-sizing: border-box;
  color: #495057;
  display: block;
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

.project-input-container {
  padding: 10px 0 10px 3px;
}

.checkbox-input-container {
  padding: 10px 0 10px 5px;
}

.toggle-container {
  font-size: 14px;
  margin: 3px 5px 3px 0;
  padding-bottom: 10px;
}

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

#save-button {
  @extend .green-button;
}

#save-button:disabled {
  @extend .gray-button;
}

.saving-spinner {
  color: $ocean-blue;
  display: inline-block;
  padding-left: 10px;
  font-size: 18px;
}

// Dropdown related ************************************************************
#final-graded-submission-policy {
  width: 350px;
}

#timezone-dropdown {
  width: 200px;
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

// Datetime related ************************************************************

#reset-time-picker-container {
  border-radius: 5px;

  .clearable-datetime-picker {
    display: flex;
    align-items: center;

    .datetime-input {
      padding: 10px 20px;
      margin-right: 4px;

      i {
        margin-left: 5px;
      }
    }

    .clear-button {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
}

</style>
