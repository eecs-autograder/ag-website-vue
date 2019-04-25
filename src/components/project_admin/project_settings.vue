<template>
  <div id="project-settings-component" v-if="d_project != null">

    <validated-form ref="project_settings_form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit.native.prevent="save_project_settings"
                    @form_validity_changed="settings_form_is_valid = $event">
      <div class="project-input-container">
        <label class="project-settings-label"> Project Name </label>
        <validated-input ref="project_name_input"
                         v-model="d_project.name"
                         :validators="[is_not_empty]">
        </validated-input>
      </div>

      <div class="project-input-container grades-toggle">
        <div class="toggle-container">
          <Toggle v-model="d_project.hide_ultimate_submission_fdbk">
            <div slot="on">
              Hide Final Grades
            </div>
            <div slot="off">
              Publish Final Grades
            </div>
          </Toggle>
        </div>
      </div>

      <div class="project-input-container">
        <input id="visible-to-students"
               type="checkbox"
               v-model="d_project.visible_to_students"/>
        <label class="project-settings-label"
               for="visible-to-students">
          Visible to students
        </label>
      </div>

      <div class="project-input-container">
        <input id="guests-can-submit"
               type="checkbox"
               v-model="d_project.guests_can_submit"/>
        <label class="project-settings-label"
               for="guests-can-submit">
          Guests can submit
        </label>
        <i class="far fa-question-circle input-tooltip">
          <tooltip width="medium" placement="right">
            I'm not sure what this means
          </tooltip>
        </i>
      </div>

      <div class="project-input-container">
        <input id="disallow-student-submissions"
               type="checkbox"
               v-model="d_project.disallow_student_submissions"/>
        <label class="project-settings-label"
               for="disallow-student-submissions">
          Disallow student submissions
        </label>
      </div>

      <div class="project-input-container">
        <label class="project-settings-label"> Min group size </label>
        <validated-input ref="min_group_size_input"
                         v-model="d_project.min_group_size"
                         :validators="[is_integer, is_not_empty, is_non_negative]">
        </validated-input>
      </div>

      <div class="project-input-container">
        <label class="project-settings-label"> Max group size </label>
        <validated-input ref="max_group_size_input"
                         v-model="d_project.max_group_size"
                         :validators="[is_integer, is_not_empty, is_non_negative]">
        </validated-input>
      </div>

      <div class="project-input-container">
        <label class="project-settings-label"> Final graded submission policy </label>
        <div>
          <dropdown ref="dropdown_final_graded_submission_policy"
                    :items="final_graded_submission_policy_options"
                    :initial_highlighted_index="0"
                    @update_item_selected="d_project.ultimate_submission_policy = $event">
            <template slot="header">
              <div tabindex="1" class="dropdown-header-wrapper">
                <div id="final-graded-submission-policy" class="dropdown-header">
                  {{d_project.ultimate_submission_policy}}
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

      <div class="project-input-container">
        <label class="project-settings-label"> Submission limit per day </label>
        <validated-input ref="submission_limit_input"
                         v-model="submission_limit_per_day"
                         :validators="[]">
        </validated-input>
      </div>

      <div v-if="submission_limit_per_day !== ''"
           class="project-input-container">
        <input id="allow-submissions-past-limit"
               type="checkbox"
               v-model="d_project.allow_submissions_past_limit"/>
        <label class="project-settings-label"
               for="allow-submissions-past-limit">
          Allow submissions past limit
        </label>
      </div>

      <div class="project-input-container">
        <label class="project-settings-label"> Bonus submissions per group </label>
        <i class="far fa-question-circle input-tooltip">
          <tooltip width="medium" placement="right">
            I'm not sure what this means
          </tooltip>
        </i>
        <validated-input ref="bonus_submissions_input"
                         v-model="d_project.num_bonus_submissions"
                         :validators="[is_integer, is_not_empty, is_non_negative]">
        </validated-input>
      </div>

      <div class="project-input-container">
        <input id="groups-combine-daily-submissions"
               type="checkbox"
               v-model="d_project.groups_combine_daily_submissions"/>
        <label class="project-settings-label"
               for="groups-combine-daily-submissions">
          Groups get more submissions than individuals
        </label>
      </div>

      <!--// timepicker & timezone-->
      <!--// RESET SUBMISSIONS PER DAY AT-->

      <div class="project-input-container">
        <input id="allow-late-days"
               type="checkbox"
               v-model="d_project.allow_late_days"/>
        <label class="project-settings-label"
               for="allow-late-days">
          Allow late days
        </label>
      </div>

      <div class="project-input-container">
        <label class="project-settings-label"> Total submission limit (Ever!) </label>
        <i class="far fa-question-circle input-tooltip">
          <tooltip width="medium" placement="right">
            I'm not sure what this means
          </tooltip>
        </i>

        <validated-input ref="total_submissions_input"
                         v-model="d_project.total_submission_limit"
                         :validators="[]">
        </validated-input>
      </div>

      <div class="project-input-container grades-toggle">
        <label class="project-settings-label"> Soft deadline </label>
        <i class="far fa-question-circle input-tooltip">
          <tooltip width="medium" placement="right">
            Possibly more clarification
          </tooltip>
        </i>
        <div class="toggle-container">
          <Toggle v-model="d_project.soft_closing_time">
            <div slot="on">
              Yes
            </div>
            <div slot="off">
              No
            </div>
          </Toggle>
        </div>
        <!--Datetime picker-->
      </div>

      <div class="project-input-container grades-toggle">
        <label class="project-settings-label"> Hard deadline </label>
        <i class="far fa-question-circle input-tooltip">
          <tooltip width="medium" placement="right">
            Possibly more clarification
          </tooltip>
        </i>
        <div class="toggle-container">
          <Toggle v-model="d_project.closing_time">
            <div slot="on">
              Yes
            </div>
            <div slot="off">
              No
            </div>
          </Toggle>
        </div>

        <!--Datetime picker-->
      </div>

      <APIErrors ref="api_errors"></APIErrors>

      <button id="save-button"
              type="submit"
              :disabled="!settings_form_is_valid || d_saving">
        Save Updates
      </button>
    </validated-form>
  </div>
</template>

<script lang="ts">
  import APIErrors from '@/components/api_errors.vue';
  import Dropdown from '@/components/dropdown.vue';
  import Toggle from '@/components/toggle.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput from '@/components/validated_input.vue';
  import { handle_api_errors_async } from "@/utils";
  import {
    is_integer,
    is_non_negative,
    is_not_empty,
    is_number,
    string_to_num
  } from '@/validators';
  import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
  components: {
    APIErrors,
    Dropdown,
    Toggle,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})

export default class ProjectSettings extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  d_project!: Project;
  d_loading = true;
  d_saving = false;
  settings_form_is_valid = true;
  submission_limit_per_day = "";
  has_soft_closing_time = false;
  has_closing_time = false;

  final_graded_submission_policy_options = [
    UltimateSubmissionPolicy.most_recent,
    UltimateSubmissionPolicy.best_with_normal_fdbk,
    UltimateSubmissionPolicy.best
  ];

  readonly is_non_negative = is_non_negative;
  readonly is_not_empty = is_not_empty;
  readonly is_number = is_number;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;

  async created() {
    this.d_project = this.project;
    this.submission_limit_per_day = this.d_project.submission_limit_per_day === null
                                    ? "" : this.submission_limit_per_day;
    this.has_soft_closing_time = this.d_project.soft_closing_time !== null;
    this.has_closing_time = this.d_project.closing_time !== null;
  }

  @handle_api_errors_async(handle_save_project_settings_error)
  async save_project_settings() {
    try {
      this.d_saving = true;
      await this.d_project!.save();
    }
    finally {
      this.d_saving = false;
    }
  }
}

  export function handle_save_project_settings_error(component: ProjectSettings, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

#project-settings-component {
  padding: 10px 1.5%;
}

.project-settings-label {
  text-align: right;
  font-size: 17px;
  margin: 5px 15px 7px 0;
  display: inline-block;
  color: lighten(black, 10);
  font-weight: 700;
}

.project-input-container {
  padding-bottom: 20px;
}

.input-tooltip {
  color: teal;
  margin-left: 0;
  font-size: 16px;
  top: 2px;
  left: -3px;
}

.toggle-container {
  margin-top: 3px;
  margin-bottom: 3px;
}

input[type=checkbox] + label::before {
  font-family: "Font Awesome 5 Free";
  font-size: 18px;
  content: '\f0c8';
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  border-radius: 2px;
  color: $pebble-dark;
}

input[type=checkbox]:checked + label::before {
  font-family: "Font Awesome 5 Free";
  color: transparent;
  /*font-size: 22px;*/
  width: 18px;
  height: 18px;
  content: '\f14a';
  color: $ocean-blue;
  background: transparent;
}

input[type=checkbox] {
  position: absolute;
  clip: rect(0,0,0,0);
}

#save-button {
  @extend .green-button;
}

#save-button:disabled {
  @extend .gray-button;
}

// Dropdown stuff ************************************************************
#final-graded-submission-policy {
  width: 350px;
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

</style>
