<template>
    <div class="course-admin-component"
         ref="course_admin_component"
         v-if="course != null">
      <div>
        <tabs ref="course_admin_tabs"
              tab_active_class="gray-theme-active-no-padding"
              tab_inactive_class="gray-theme-inactive-no-padding"
              v-if="!loading">
  <!--GENERAL TAB-->
          <tab>
            <tab-header>
              <div class="tab-label">
                <p class="tab-header"> Settings </p>
              </div>
            </tab-header>
            <template slot="body">
              <div class="tab-body">
                <div id="settings-container">
                  <div id="settings-container-inputs">
                    <ValidatedForm id="course-settings-form"
                                   autocomplete="off"
                                   @submit.native.prevent="save_course_settings"
                                   @form_validity_changed="settings_form_is_valid = $event">

                      <div class="name-container">
                        <label class="settings-input-label"> Course name: </label>
                        <ValidatedInput
                          ref="course_name"
                          v-model="course.name"
                          input_style="width: 100%; max-width: 500px;"
                          :validators="[is_not_empty]"
                          :num_rows="1">
                        </ValidatedInput>
                      </div>

                      <div class="semester-container">
                        <label class="settings-input-label"> Semester: </label>
                        <div class="semester-dropdown-wrapper">
                          <dropdown ref="semester_dropdown"
                                    :items="semesters"
                                    @update_item_selected="course.semester = $event">
                          <template slot="header">
                            <div tabindex="1" class="input-wrapper">
                              <div id="input-course-semester"
                                   class="settings-input">
                                {{course.semester}}
                                <i class="fas fa-caret-down dropdown-caret"></i>
                              </div>
                            </div>
                          </template>
                          <div slot-scope="{item}">
                            <span class="semester-item">{{item}}</span>
                          </div>
                        </dropdown>
                        </div>
                      </div>

                      <div class="year-container">
                        <label class="settings-input-label"> Year: </label>
                        <ValidatedInput ref="course_year"
                                        v-model="course.year"
                                        :num_rows="1"
                                        input_style="width: 65px;"
                                        :validators="[is_not_empty, is_number, is_valid_year]">
                        </ValidatedInput>
                      </div>


                      <div class="late-days-container">
                        <label class="settings-input-label"> Late days per student: </label>
                        <ValidatedInput
                          ref="course_late_days"
                          v-model="course.num_late_days"
                          :num_rows="1"
                          input_style="width: 50px;"
                          :validators="[is_not_empty, is_number, is_non_negative]">
                          <div slot="suffix" class="suffix-element">
                            {{ course.num_late_days === 1 ? 'day' : 'days'}} </div>
                        </ValidatedInput>
                      </div>

                      <ul class="error-ul">
                        <li v-for="error of errors" class="error-li">{{error}}</li>
                      </ul>

                      <input type="submit"
                             class="submit-button"
                             value="Save Updates"
                             :disabled="!settings_form_is_valid || settings_400_error_present">
                        <div v-if="!saving"
                             class="last-saved-timestamp">
                          <span> Last Saved: </span>
                          {{(new Date(course.last_modified)).toLocaleString(
                              'en-US', last_modified_format
                          )}}
                        </div>
                        <div v-else class="last-saved-spinner">
                          <i class="fa fa-spinner fa-pulse"></i>
                        </div>

                      <!--<p> Settings form is valid: {{settings_form_is_valid}}</p>-->
                    </ValidatedForm>
                  </div>
                </div>
              </div>
            </template>
          </tab>

  <!--PERMISSIONS TAB-->

          <tab>
            <tab-header>

                <dropdown ref="roster_dropdown"
                          :items="roles"
                          @update_item_selected="role_selected = $event">
                  <template slot="header">
                    <div class="tab-label" tabindex="1">
                      <p class="tab-header"
                         ref="edit_roster_tab"
                         @click="show_permissions_tab_dropdown_menu">
                        Permissions ({{role_selected}})
                      </p>
                    </div>
                  </template>
                  <div slot-scope="{item}">
                    <div class="edit-rosters-dropdown-row-content">
                      <span>{{item}}</span>
                    </div>
                  </div>
                </dropdown>

            </tab-header>

            <template slot="body">
              <div class="tab-body">

                <div v-if="role_selected === 'admin'">
                  <div class="class-roster-body">
                    <div class="adding-container">
                      <form id="add-admins-form" @submit.prevent="add_admins">
                        <label class="enrollment-add-label"> Add admins
                          <i class="far fa-question-circle enrollment-tooltip">
                            <tooltip width="large" placement="top">
                              Enter a comma-separated list of email addresses.
                            </tooltip>
                          </i>
                        </label>
                        <ValidatedInput
                          ref="new_admin_list"
                          v-model="new_admins_list"
                          :validators="[]"
                          :num_rows="7">
                        </ValidatedInput>
                        <input type="submit" class="add-enrollees-button" value="Add to Roster">
                      </form>
                    </div>

                    <div class="enrolled-container">
                      <div v-if="admins.length > 0">
                        <div class="roster-column">
                          <table class="roster-table">
                            <tr>
                              <th> Username </th>
                              <th> First Name </th>
                              <th> Last Name </th>
                              <th></th>
                            </tr>
                            <tr v-for="(admin, index) in admins"
                                :class="index % 2 ? 'odd-row' : 'even-row'">
                              <td>{{admin.username}}</td>
                              <td>{{admin.first_name}}</td>
                              <td>{{admin.last_name}}</td>
                              <td> <i class="fas fa-times delete-enrollee"
                                      @click="remove_admins([admin], index)"></i> </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="role_selected === 'staff'">
                  <div class="class-roster-body">
                    <div class="adding-container">
                      <form id="add-staff-form" @submit.prevent="add_staff">
                        <label class="enrollment-add-label"> Add staff members:
                          <i class="far fa-question-circle enrollment-tooltip">
                            <tooltip width="large" placement="top">
                              Enter a comma-separated list of email addresses.
                            </tooltip>
                          </i>
                        </label>
                        <ValidatedInput
                          ref="new_staff_list"
                          v-model="new_staff_list"
                          :validators="[]"
                          :num_rows="7">
                        </ValidatedInput>
                        <input type="submit" class="add-enrollees-button" value="Add to Roster">
                      </form>
                    </div>

                    <div class="enrolled-container">
                      <div v-if="staff.length > 0">
                        <div class="roster-column">
                          <table class="roster-table">
                            <tr>
                              <th> Username </th>
                              <th> First Name </th>
                              <th> Last Name </th>
                              <th></th>
                            </tr>
                            <tr v-for="(staff_member, index) in staff"
                                :class="index % 2 ? 'odd-row' : 'even-row'">
                              <td>{{staff_member.username}}</td>
                              <td>{{staff_member.first_name}}</td>
                              <td>{{staff_member.last_name}}</td>
                              <td> <i class="fas fa-times delete-enrollee"
                                      @click="remove_staff([staff_member], index)"></i> </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="role_selected === 'student'">
                  <div class="class-roster-body">
                    <div class="adding-container">
                      <form id="add-students-form" @submit.prevent="add_students">
                        <label class="enrollment-add-label"> Add students:
                          <i class="far fa-question-circle enrollment-tooltip">
                            <tooltip width="large" placement="top">
                              Enter a comma-separated list of email addresses.
                            </tooltip>
                          </i>
                        </label>
                        <ValidatedInput
                          ref="new_students_list"
                          v-model="new_students_list"
                          :validators="[]"
                          :num_rows="7">
                        </ValidatedInput>
                        <input type="submit" class="add-enrollees-button" value="Add to Roster">
                      </form>
                    </div>

                    <div class="enrolled-container">
                      <div v-if="students.length > 0">
                        <div class="roster-column">
                          <table class="roster-table">
                            <tr>
                              <th> Username </th>
                              <th> First Name </th>
                              <th> Last Name </th>
                              <th></th>
                            </tr>
                            <tr v-for="(student, index) in students"
                                :class="index % 2 ? 'odd-row' : 'even-row'">
                              <td>{{student.username}}</td>
                              <td>{{student.first_name}}</td>
                              <td>{{student.last_name}}</td>
                              <td> <i class="fas fa-times delete-enrollee"
                                      @click="remove_students([student], index)"></i> </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div class="class-roster-body">
                    <div class="adding-container">
                      <form id="add-handgraders-form" @submit.prevent="add_handgraders">
                        <label class="enrollment-add-label"> Add handgraders:
                          <i class="far fa-question-circle enrollment-tooltip">
                            <tooltip width="large" placement="top">
                              Enter a comma-separated list of email addresses.
                            </tooltip>
                          </i>
                        </label>
                        <ValidatedInput
                          ref="new_handgraders_list"
                          v-model="new_handgraders_list"
                          :validators="[]"
                          :num_rows="7">
                        </ValidatedInput>
                        <input type="submit" class="add-enrollees-button" value="Add to Roster">
                      </form>
                    </div>

                    <div class="enrolled-container">
                      <div v-if="handgraders.length > 0">
                        <div class="roster-column">
                          <table class="roster-table">
                            <tr>
                              <th> Username </th>
                              <th> First Name </th>
                              <th> Last Name </th>
                              <th></th>
                            </tr>
                            <tr v-for="(handgrader, index) in handgraders"
                                :class="index % 2 ? 'odd-row' : 'even-row'">
                              <td>{{handgrader.username}}</td>
                              <td>{{handgrader.first_name}}</td>
                              <td>{{handgrader.last_name}}</td>
                              <td> <i class="fas fa-times delete-enrollee"
                                      @click="remove_handgraders([handgrader], index)"></i> </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </tab>

  <!--PROJECTS TAB-->

          <tab>
            <tab-header>
              <div class="tab-label">
                <p class="tab-header"> Projects </p>
              </div>
            </tab-header>
            <template slot="body">
              <div class="tab-body">
                <div id="project-body-container">

                  <div id="new-project-side">
                    <div id="new-project-space">
                      <ValidatedForm id="new-project-form"
                            @submit.prevent="add_project"
                            autocomplete="off"
                            @submit.native.prevent="add_project"
                            @form_validity_changed="project_form_is_valid = $event">
                        <p id="new-project-label"> Create a New Project</p>

                        <ValidatedInput ref="new_project"
                                        v-model="new_project_name"
                                        :validators="[]"
                                        :num_rows="1"
                                        input_style="width: 100%; max-width: 400px;">
                        </ValidatedInput>

                        <ul class="error-ul">
                          <li v-for="error of errors" class="error-li">{{error}}</li>
                        </ul>

                        <input type="submit"
                               :disabled="!project_form_is_valid || project_400_error_present"
                               value="Add Project"
                               class="submit-button">
                      </ValidatedForm>
                    </div>
                  </div>

                  <div id="existing-projects-side">
                    <p class="existing-projects-label"> Existing Projects </p>

                    <router-link tag="div"
                                 :to="`/web/project/${project.pk}`"
                                 v-for="(project, index) of projects"
                                 class="project-div">
                      <a>
                        <div :class="[index % 2 ?
                                      'odd-row' : 'even-row', 'project-submission-div']">
                          <p class="project-name"> {{project.name}} </p>
                        </div>
                      </a>
                      <router-link tag="div"
                                   :to="`/web/project_admin/${project.pk}`"
                                   class="project-edit-div">
                        <a>
                          <div class="edit-project-settings-button"> Edit Project Settings </div>
                        </a>
                      </router-link>
                    </router-link>
                  </div>

                </div>
              </div>
            </template>
          </tab>
        </tabs>
      </div>
    </div>
</template>

<script lang="ts">

  import Dropdown from '@/components/dropdown.vue';
  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
  import { array_has_unique, handle_400_errors_async } from '@/utils.ts';
  import { AxiosResponse } from 'axios';
  import { Component, Vue, Watch } from 'vue-property-decorator';

  import { Course, Project, Semester, User } from 'ag-client-typescript';

  @Component({
    components: {
      Dropdown,
      Tab,
      TabHeader,
      Tabs,
      Tooltip,
      ValidatedForm,
      ValidatedInput
    }
  })
  export default class CourseAdmin extends Vue {
    loading = true;
    saving = false;

    role_selected = "admin";
    roles = ["admin", "staff", "student", "handgraders"];
    course: Course | null = null;
    semesters = ["Fall", "Winter", "Spring", "Summer"];
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};

    course_names_same_semester: string[] = [];
    admins: User[] = [];
    staff: User[] = [];
    students: User[] = [];
    handgraders: User[] = [];
    new_admins_list = "";
    new_staff_list = "";
    new_students_list = "";
    new_handgraders_list = "";

    projects: Project[] = [];
    new_project_name = "";

    settings_form_is_valid = false;
    settings_400_error_present = false;
    project_form_is_valid = false;
    project_400_error_present = false;
    errors: string[] = [];

    async created() {
      this.course = await Course.get_by_pk(Number(this.$route.params.courseId));
      this.admins = await this.course.get_admins();
      this.staff = await this.course.get_staff();
      this.students = await this.course.get_students();
      this.handgraders = await this.course.get_handgraders();
      this.projects = await Project.get_all_from_course(this.course.pk);
      this.sort_users(this.admins);
      this.sort_users(this.staff);
      this.sort_users(this.students);
      this.sort_users(this.handgraders);
      // sort projects?
      this.loading = false;
    }

    close_course_semester_dropdown_menu() {
      let grading_policy_dropdown = <Dropdown> this.$refs.semester_dropdown;
      grading_policy_dropdown.hide_the_dropdown_menu();
    }

    @Watch('course.name')
    on_course_name_change(new_name: string, old_name: string) {
      this.settings_400_error_present = false;
      this.errors = [];
    }

    @Watch('course.semester')
    on_course_semester_change(new_semester: string, old_semester: string) {
      this.settings_400_error_present = false;
      this.errors = [];
    }

    @Watch('course.year')
    on_course_year_change(new_year: number, old_year: number) {
      this.settings_400_error_present = false;
      this.errors = [];
    }

    @Watch('new_project_name')
    on_new_project_name_change(new_name: string, old_name: string) {
      this.project_400_error_present = false;
      this.project_form_is_valid = true;
      this.errors = [];
    }

    show_permissions_tab_dropdown_menu(event: Event) {
      let roster_dropdown = <Dropdown> this.$refs.roster_dropdown;
      roster_dropdown.show_the_dropdown_menu();
      event.stopPropagation();
    }

    sort_users(users: User[]) {
      users.sort((user_a: User, user_b: User) => {
        if (user_a.username <= user_b.username) {
          return -1;
        }
        return 1;
      });
    }

    async add_admins() {
      if (this.new_admins_list.trim() !== "") {
        this.new_admins_list = this.new_admins_list.replace(/,/g, ' ');
        let new_admins = this.new_admins_list.trim().split(/\ +/);
        await this.course!.add_admins(new_admins);
        this.new_admins_list = "";
        this.admins = await this.course!.get_admins();
        this.sort_users(this.admins);
      }
    }

    async add_staff() {
      if (this.new_staff_list.trim() !== "") {
        this.new_staff_list = this.new_staff_list.replace(/,/g, ' ');
        let new_staff = this.new_staff_list.trim().split(/\ +/);
        await this.course!.add_staff(new_staff);
        this.new_staff_list = "";
        this.staff = await this.course!.get_staff();
        this.sort_users(this.staff);
      }
    }

    async add_students() {
      if (this.new_students_list.trim() !== "") {
        this.new_students_list = this.new_students_list.replace(/,/g, ' ');
        let new_students = this.new_students_list.trim().split(/\ +/);
        console.log(new_students);
        await this.course!.add_students(new_students);
        this.new_students_list = "";
        this.students = await this.course!.get_students();
        this.sort_users(this.students);
      }
    }

    async add_handgraders() {
      if (this.new_handgraders_list.trim() !== "") {
        this.new_handgraders_list = this.new_handgraders_list.replace(/,/g, ' ');
        let new_handgraders = this.new_handgraders_list.trim().split(/\ +/);
        await this.course!.add_handgraders(new_handgraders);
        this.new_handgraders_list = "";
        this.handgraders = await this.course!.get_handgraders();
        this.sort_users(this.handgraders);
      }
    }

    remove_admins(admins_to_delete: User[], index: number) {
      this.course!.remove_admins(admins_to_delete);
      this.admins.splice(index, 1);
    }

    remove_staff(staff_to_delete: User[], index: number) {
      this.course!.remove_staff(staff_to_delete);
      this.staff.splice(index, 1);
    }

    remove_students(students_to_delete: User[], index: number) {
      this.course!.remove_students(students_to_delete);
      this.students.splice(index, 1);
    }

    remove_handgraders(handgraders_to_delete: User[], index: number) {
      this.course!.remove_handgraders(handgraders_to_delete);
      this.handgraders.splice(index, 1);
    }

    project_name_is_unique(value: string): ValidatorResponse {
      return {
        is_valid: !array_has_unique(this.projects, value),
        error_msg: `There already exists a project in this course called ${value}.`
      };
    }

    is_valid_year(value: string): ValidatorResponse {
      return {
        is_valid: Number(value) >= 2000,
        error_msg: "Please enter a valid year"
      };
    }

    is_number(value: string): ValidatorResponse {
      return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg:  "You must enter a number",
      };
    }

    is_not_empty(value: string): ValidatorResponse {
      return {
        is_valid: value !== "",
        error_msg: "This field is required"
      };
    }

    is_not_null(value: string): ValidatorResponse {
      return {
        is_valid: value !== null,
        error_msg: "This field is required"
      };
    }

    is_non_negative(value: string): ValidatorResponse {
      return {
        is_valid: this.is_number(value).is_valid && value[0] !== "-",
        error_msg: "The number of late days cannot be negative."
      };
    }

    @handle_400_errors_async(handle_save_course_settings_error)
    async save_course_settings() {
      try {
        this.saving = true;
        this.errors = [];
        await this.course!.save();
      }
      finally {
        this.saving = false;
      }
    }

    @handle_400_errors_async(handle_add_project_error)
    async add_project() {
      if (this.new_project_name === "") {
        this.errors.push("New project name cannot be an empty string.");
        this.project_form_is_valid = false;
        return;
      }
      try {
        this.new_project_name.trim();
        this.saving = true;
        this.errors = [];
        let new_project: Project = await Project.create(
          {name: this.new_project_name, course: this.course!.pk}
        );
        this.new_project_name = "";
        this.projects.push(new_project);
        this.projects.sort((project_a: Project, project_b: Project) => {
          if (project_a.name <= project_b.name) {
            return -1;
          }
          return 1;
        });
      }
      finally {
        this.saving = false;
      }
    }
  }

  function handle_save_course_settings_error(component: CourseAdmin, response: AxiosResponse) {
    let errors = response.data["__all__"];

    if (errors !== undefined && errors.length > 0) {
      Vue.set(component, "settings_400_error_present", true);
      Vue.set(component, "errors", [errors[0]]);
    }
  }

  function handle_add_project_error(component: CourseAdmin, response: AxiosResponse) {
    let errors = response.data["__all__"];

    if (errors !== undefined && errors.length > 0) {
      Vue.set(component, "project_400_error_present", true);
      Vue.set(component, "errors", [errors[0]]);
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import url('https://fonts.googleapis.com/css?family=Montserrat');

$current-lang-choice: "Montserrat";

.course-admin-component {
  font-family: $current-lang-choice;
}

.tab-header {
  margin: 0;
  font-size: 18px;
  padding: 10px 25px 12px 25px;
  font-weight: 500;
}

.tab-body {
  padding-top: 30px;
  text-align: left;
  position: relative;
}

.tab-label {
  outline: none;
}

/* ---------------- Settings Styling ---------------- */

#settings-container { }

.submit-button {
  @extend .green-button;
  text-align: center;
  display: block;
  font-family: $current-lang-choice;
  font-size: 18px;
  padding: 20px 15px;
  margin: 10px 0 20px 0;
}

.submit-button:disabled {
  @extend .gray-button;
  text-align: center;
  display: block;
  font-family: $current-lang-choice;
  font-size: 18px;
  padding: 20px 15px;
  margin: 10px 0 20px 0;
}

.submit-button:disabled:hover {
  background-color: hsl(210, 13%, 63%);
  cursor: default;
}

#settings-container-inputs {
  width: 80%;
  margin-left: 10%;
  margin-right: 10%;
}

.settings-input-label {
  text-align: right;
  font-size: 17px;
  margin: 5px 15px 7px 0;
  display: inline-block;
  color: #495057;
  font-weight: 700;
}

.settings-input {
  position: relative;
  display: block;
  width: 100%;
  padding: .375rem .75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.settings-input:focus {
  border-color: $ocean-blue;
}

.semester-dropdown-wrapper {
  display: block;
}

.name-container, .year-container, .semester-container, .late-days-container {
  padding-bottom: 16px;
  display: block;
  max-width: 500px;
}

#input-course-semester {
  width: 120px;
}

.semester-item {
  font-size: 18px;
}

.last-saved-timestamp {
  padding-top: 6px;
  margin: 0;
  font-size: 15px;
  color: lighten(#495057, 40);
}

.last-saved-spinner {
  font-size: 18px;
  color: $stormy-gray-dark;
  display: inline-block;
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

.error-ul {
  list-style-type: none; /* Remove bullets */
  padding-left: 0;
  max-width: 500px;
  width: 100%
}

.error-li:first-child {
  margin-top: -10px;
  border-top-left-radius: .25rem;
  border-top-right-radius: .25rem;
}

.error-li:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: .25rem;
  border-bottom-left-radius: .25rem;
}

.error-ul .error-li {
  box-sizing: border-box;
  word-wrap: break-word;
  position: relative;
  padding: 10px 15px;
  margin-bottom: -1px;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.input.error-input {
  border: 1px solid $warning-red;
}

.error-input:focus {
  outline: none;
  box-shadow: 0 0 10px $warning-red;
  border: 1px solid $warning-red;
  border-radius: .25rem;
}

.suffix-element {
  display: inline-block;
  vertical-align: top;
  padding-top: 10px;
  padding-left: 10px;
}

/* ---------------- Permissions Styling ---------------- */

.class-roster-body {
  margin: 0;
}

.adding-container, .enrolled-container {
  margin: 0 10%;
}

.enrollment-tooltip {
  color: $ocean-blue;
  margin-left: 3px;
  font-size: 20px;
  top: 1px;
}

.add-enrollees-button {
  @extend .green-button;
  display: block;
  font-family: $current-lang-choice;
  font-size: 18px;
  margin: 18px 0 0 0;
  padding: 20px 15px;
  text-align: center;
}

.edit-rosters-dropdown-row-content {
  text-align: left;
  padding: 0 2px;
  font-family: $current-lang-choice;
  font-size: 16px;
}

.enrollment-add-label {
  display: block;
  font-size: 20px;
  padding: 6px 0 10px 0;
  margin: 0;
  position: relative;
  font-weight: 800;
}

.number-enrolled-message {
  margin: 30px 0 12px 0;
  font-size: 20px;
}

.roster-table {
  margin-top: 15px;
  border-collapse: collapse;
  margin-bottom: 100px;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
  font-size: 18px;
}

.roster-table th {
  background-color: $stormy-gray-dark;
  color: white;
  padding: 10px 25px;
}

.roster-table td {
  padding: 10px 25px;
  margin-bottom: 10px;
  position: relative;
}

.roster-table tr td {
  border-top: 3px solid white;
}

.odd-row {
  background-color: $pebble-medium;
}

.even-row {
  background-color: lighten($pebble-dark, 10);
}

.roster-column {
  overflow: scroll;
}

textarea {
  width: 97%;
  height: 200px;
  font-size: 16px;
  padding: 1%;
  border-radius: 6px;
  border: 2px solid $stormy-gray-dark;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
  margin: 0;
  outline: none;
  font-family: $current-lang-choice;
}

.delete-enrollee {
  position: absolute;
  color: $stormy-gray-dark;
  right: 30px;
  top: 13px;
  font-size: 18px;
  cursor: pointer;
}

.delete-enrollee:hover {
  color: black;
}

/* ---------------- Projects Styling ---------------- */

#new-project-space {
  width: 80%;
  margin: 0 10%;
}

#new-project-label {
  font-size: 20px;
  margin: 0 0 12px 0;
  padding: 6px 0 0 0;
  font-weight: 800;
}

#new-project-input {
  width: 70.5%;
}

#existing-projects-side {
  width: 80%;
  margin: 0 10% 0 10%;
}

.existing-projects-label {
  font-size: 20px;
  margin: 40px 0 20px 0;
  padding: 6px 0 0 0;
  font-weight: 800;
}

.project-div {
  background-color: white;
  border-radius: 2px;
  width: 100%;
  max-width: 590px;
  display: block;
  margin: 10px 0;
}

.project-submission-div {
  width: 100%;
  position: relative;
  border-radius: 2px;
  display: inline-block;
}

.project-name {
  padding: 15px;
  margin: 0;
  display: inline-block;
}

.project-edit-div {
  display: block;
  vertical-align: top;
  width: 100%;
  background-color: white;
}

.edit-project-settings-button {
  background-color: hotpink;
  padding: 15px;
  text-align: center;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  color: black;
  display: none;
  box-sizing: border-box;
}

.edit-project-settings-button:hover {
  background-color: darken(hotpink, 4);
}

.project-div:hover {
  .edit-project-settings-button {
    display: block;
    margin-bottom: 20px;
  }
  .project-submission-div {
  }
}

a {
  text-decoration: none;
  color: black;
}

@media only screen and (min-width: 481px) {

  .tab-body {
    margin-left: 2px;
    margin-right: 2px;
    border-top: 2px solid $pebble-dark;
  }

  .tab-header {
    padding: 10px 15px 10px 15px;
  }

  .submit-button, .submit-button:disabled, .add-enrollees-button {
    padding: 10px 15px;
    font-family: $current-lang-choice;
    font-size: 18px;
    margin: 0px 15px 12px 0;
    display: inline-block;
  }

  /* ---------------- Settings Styling ---------------- */

  #settings-container {
    margin: 0;
  }

  #settings-container-inputs {
    margin: 10px 0 0 50px;
  }

  #input-course-name {
    width: 400px;
  }

  /* ---------------- Permissions Styling ---------------- */

  .adding-container, .enrolled-container {
    margin: 0 10%;
  }

  .roster-table {
    width: 100%;
  }

  .enrollment-add-label {
    padding: 10px 0;
  }

  .add-enrollees-button {
    margin-top: 20px;
  }

  .edit-rosters-dropdown-row-content {
    font-size: 18px;
  }

  /* ---------------- Projects Styling ---------------- */

}

@media only screen and (min-width: 768px) {
  /* ---------------- Edit Rosters Styling ---------------- */
  .roster-column {
    overflow: visible;
  }
}

@media only screen and (min-width: 960px) {

  #existing-projects-side {
    width: 60%;
    margin: 0;
    display: inline-block;
    vertical-align: top;
  }

  #new-project-space {
    text-align: left;
  }

  .existing-projects-label {
    font-size: 20px;
    margin: 0 0 12px 0;
    padding: 6px 0 0 0;
    text-align: left;
  }

  #new-project-side {
    width: 40%;
    display: inline-block;
  }

  .project-div {
    background-color: white;
    border-radius: 2px;
    width: 100%;
    max-width: 590px;
    display: block;
    margin: 5px 0;
  }

  .project-submission-div {
    width: 100%;
    max-width: 350px;
    position: relative;
    border-radius: 2px;
    display: inline-block;
    border: 2px solid lighten($pebble-dark, 10);
  }

  .project-name {
    padding: 15px;
    margin: 0;
    display: inline-block;
  }

  .project-edit-div {
    display: inline-block;
    vertical-align: top;
    width: 220px;
  }

  .edit-project-settings-button {
    padding: 15px;
    margin-left: 15px;
    border-radius: 3px;
    color: black;
    display: none;
    background-color: white;
  }

  .edit-project-settings-button:hover {
    background-color: $pebble-light;
  }

  .project-div:hover {
    .edit-project-settings-button {
      display: block;
      border: 2px solid hotpink;
      margin-bottom: 0;
    }
    .project-submission-div {
      background-image: linear-gradient(
          to right, darken(hotpink, 2), hotpink, darken(hotpink, 2), hotpink
      );
      border: 2px solid hotpink;
      color: white;
    }
  }
}

</style>
