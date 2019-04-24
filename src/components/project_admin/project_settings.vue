<template>
  <div id="project-admin" v-if="d_project != null">
    <nav id="side-nav-bar">
      <ul>
        <li @click=""
            class="active-page"> Project Settings </li>
        <li @click=""
            class="inactive-page"> Upload Project Files </li>
        <li @click=""
            class="inactive-page"> Files Students Should Submit </li>
        <li @click=""
            class="inactive-page"> Test Cases </li>
        <li @click=""
            class="inactive-page"> Student Test Suites </li>
        <li @click=""
            class="inactive-page"> Edit Groups </li>
        <li @click=""
            class="inactive-page"> Download Grades </li>
        <li @click=""
            class="inactive-page"> Rerun Tests </li>
        <li @click=""
            class="inactive-page"> Configure Handgrading </li>
      </ul>
    </nav>
    <div id="project-admin-main"
         @wheel.stop>
      <div id="inner-project-view-main">

        <div class="project-input-container">
          <label class="project-settings-label"> Project Name </label>
          <input class="project-settings-input"
                 type="text"
                 v-model="project.name"/>
        </div>

        <div class="project-input-container grades-toggle">
          <div class="toggle-container">
            <Toggle v-model="project.hide_ultimate_submission_fdbk">
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
                 v-model="project.visible_to_students"/>
          <label class="project-settings-label"
                 for="visible-to-students">
            Visible to students
          </label>
        </div>

        <div class="project-input-container">
          <input id="guests-can-submit"
                 type="checkbox"
                 v-model="project.guests_can_submit"/>
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
                 v-model="project.disallow_student_submissions"/>
          <label class="project-settings-label"
                 for="disallow-student-submissions">
            Disallow student submissions
          </label>
        </div>

        <div class="project-input-container">
          <label class="project-settings-label"> Min group size </label>
          <input class="project-settings-input input-short"
                 type="text"
                 v-model="project.min_group_size"/>
        </div>

        <div class="project-input-container">
          <label class="project-settings-label"> Max group size </label>
          <input class="project-settings-input input-short"
                 type="text"
                 v-model="project.max_group_size"/>
        </div>

        <div class="project-input-container">
          <label class="project-settings-label"> Final graded submission policy </label>
          <div class="final-graded-submission-policy">
            <dropdown ref="dropdown_final_graded_submission_policy"
                      :items="final_graded_submission_policy_options"
                      :initial_highlighted_index="0"
                      @update_item_selected="project.ultimate_submission_policy = $event">
              <template slot="header">
                <div tabindex="1" class="input-wrapper">
                  <input class="project-settings-input input-long"
                         type="text"
                         v-model="project.ultimate_submission_policy"
                         @blur="close_dropdown_menu"/>
                  <i class="fas fa-caret-down dropdown-caret"></i>
                </div>
              </template>
              <template slot-scope="{item}">
                <span> {{item}} </span>
              </template>
            </dropdown>
          </div>
        </div>

        <div class="project-input-container">
          <label class="project-settings-label"> Submission limit per day </label>
          <input class="project-settings-input input-short"
                 type="text"
                 v-model="project.submission_limit_per_day"/>
        </div>

        <div class="project-input-container">
          <input id="allow-submissions-past-limit"
                 type="checkbox"
                 v-model="project.allow_submissions_past_limit"/>
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
          <input class="project-settings-input input-short"
                 type="text"
                 v-model="project.num_bonus_submissions"/>
        </div>

        <div class="project-input-container">
          <input id="groups-combine-daily-submissions"
                 type="checkbox"
                 v-model="project.groups_combine_daily_submissions"/>
          <label class="project-settings-label"
                 for="groups-combine-daily-submissions">
            Groups get more submissions than individuals
          </label>
        </div>

        <!--// RESET SUBMISSIONS PER DAY AT-->

        <div class="project-input-container">
          <input id="allow-late-days"
                 type="checkbox"
                 v-model="project.allow_late_days"/>
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
          <input class="project-settings-input input-short"
                 type="text"
                 v-model="project.total_submission_limit"/>
        </div>

        <div class="project-input-container grades-toggle">
          <label class="project-settings-label"> Soft deadline </label>
          <i class="far fa-question-circle input-tooltip">
            <tooltip width="medium" placement="right">
              Possibly more clarification
            </tooltip>
          </i>
          <div class="toggle-container">
            <Toggle v-model="project.soft_closing_time">
              <div slot="on">
                Yes
              </div>
              <div slot="off">
                No
              </div>
            </Toggle>
          </div>
          <!--Calendar-->
        </div>

        <div class="project-input-container grades-toggle">
          <label class="project-settings-label"> Hard deadline </label>
          <i class="far fa-question-circle input-tooltip">
            <tooltip width="medium" placement="right">
              Possibly more clarification
            </tooltip>
          </i>
          <div class="toggle-container">
            <Toggle v-model="project.closing_time">
              <div slot="on">
                Yes
              </div>
              <div slot="off">
                No
              </div>
            </Toggle>
          </div>

          <!--Calendar-->
        </div>

      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Dropdown from '@/components/dropdown.vue';
import Toggle from '@/components/toggle.vue';
import Tooltip from '@/components/tooltip.vue';
import { Course, Semester, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';

@Component({
  components: { Dropdown, Toggle, Tooltip }
})

export default class ProjectSettings extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  d_project: Project | null = null;

  hide_final_grades = false;

  final_graded_submission_policy_options = ["Most recent submission",
    "Best score using 'Normal' feedback", "Best score"];

  dropdown_do_something(item: Event) {
    // console.log("Dropdown item chosen");
  }

  drop_dropdown_final_submission_policy() {
    // let grading_policy_dropdown = <Dropdown> this.$refs.dropdown_final_graded_submission_policy;
    // grading_policy_dropdown.show_the_dropdown_menu();
    // grading_policy_dropdown.
  }

  close_dropdown_menu() {
    // let grading_policy_dropdown = <Dropdown> this.$refs.dropdown_final_graded_submission_policy;
    // grading_policy_dropdown.hide_the_dropdown_menu();
  }

  async created() {
    this.d_project = this.project;
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import url('https://fonts.googleapis.com/css?family=Montserrat');
$current-lang-choice: "Montserrat";

#project-admin {
  font-family: $current-lang-choice;
  /*display: flex;*/
}

#side-nav-bar {
  background-color: darken($stormy-gray-dark, 25);
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 300px;
}

#project-admin-main{
  position: absolute;
  /*padding: 20px;*/
  top: 0;
  left: 300px;
  height: 100vh;
  width: 100%;
  overflow: scroll;
  display: block;
  /*background-color:paleturquoise;*/
}

#project-admin-main::-webkit-scrollbar {
  display: none;
}

#side-nav-bar ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

#side-nav-bar li {
  text-decoration: none;
  padding: 18px 20px;
  cursor: pointer;
  font-weight: bold;
}

.inactive-page {
  color: white;
}

.inactive-page:hover {
  background-color: darken(rgba(119, 136, 153, 0.7), 20);
}

.active-page {
  /*background-color: rgb(128, 0, 128);*/
  /*background-color: hsl(558, 93%, 36%);*/
  /*background-color: hsl(78, 39%, 47%);*/
  background-color: $green;
  /*background-color: plum;*/
  /*background-color: tomato;*/
  color: white;
}

.active-page:hover {
  /*background-color: hsl(281, 100%, 13%);*/
}

#inner-project-view-main {
  padding: 20px 40px;
  min-width: 500px;
}

.project-settings-label {
  text-align: right;
  font-size: 17px;
  margin: 5px 15px 7px 0;
  display: inline-block;
  color: lighten(black, 10);
  font-weight: 700;
}

.project-settings-input {
  outline: none;
  display: block;
  margin: 0;
  border-radius: 3px;
  border: 2px solid lighten($stormy-gray-dark, 10);
  padding: 6px 9px;
  font-family: $current-lang-choice;
  font-size: 18px;
  width: 400px;
}

.project-input-container {
  padding-bottom: 20px;
}

.grades-toggle {
  margin-top: 0px;
}

.input-short {
  width: 100px;
}

.input-tooltip {
  color: $ocean-blue;
  margin-left: 0px;
  font-size: 20px;
  top: 2px;
  left: -3px;
}

.toggle-container {
  margin-top: 3px;
  margin-bottom: 3px;
}

.input-wrapper {
  position: relative;
  display: inline-block;
  margin: 0px;
}

.dropdown-caret {
  position: absolute;
  right: 18px;
  top: 4px;
  font-size: 30px;
  cursor: pointer;
}

.input-medium {
  width: 310px;
}

.input-wrapper:focus {
  /*border: 2px solid green;*/
}

.input-medium:focus {
  /*border: 2px solid purple;*/
}

input[type=checkbox] + label::before {
  font-family: "Font Awesome 5 Free";
  font-size: 18px;
  content: '\f0c8';
  display: inline-block;
  /*vertical-align: .2em;*/
  width: 18px;
  height: 18px;
  margin-right: 10px;
  border-radius: 2px;
  color: $pebble-dark;
  /*color: transparent;*/
  /*text-indent: .15em;*/
  /*line-height: .65;*/
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

</style>
