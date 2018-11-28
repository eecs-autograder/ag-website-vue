<template>
  <div class="course-admin-component"
       ref="course_admin_component">
    <div>
      <tabs ref="tabs2"
            tab_active_class="gray-theme-active"
            tab_inactive_class="gray-theme-inactive">
<!--GENERAL TAB-->
        <tab>
          <template slot="header">
            <div class="tab-label">
              <p class="tab-header"> Settings </p>
            </div>
          </template>
          <template slot="body">
            <div class="tab-body">
              <div id="settings-container">
                <div id="settings-container-inputs">
                  <div class="settings-single-input-container">
                    <label class="settings-input-label"> Course name: </label>
                    <input type="text"
                           name="name"
                           id="input-course-name"
                           class="settings-input"
                           v-model="course.name">
                  </div>
                  <div class="settings-single-input-container">
                    <label class="settings-input-label"> Semester: </label>
                    <div class="semester-dropdown-wrapper">
                      <dropdown ref="semester_dropdown"
                                    :items="semesters"
                                    @update_item_selected="update_semester($event)">
                      <template slot="header">
                        <input type=text
                               name="semester"
                               id="input-course-semester"
                               class="settings-input"
                               v-model="course.semester">
                      </template>
                      <div slot-scope="{item}">
                        <span>{{item}}</span>
                      </div>
                    </dropdown>
                    </div>
                  </div>
                  <div class="settings-single-input-container">
                    <label class="settings-input-label"> Year: </label>
                    <input type="text"
                           name="year"
                           id="input-course-year"
                           class="settings-input"
                           v-model="course.year">
                  </div>
                  <div class="settings-single-input-container">
                    <label class="settings-input-label"> Late days per student: </label>
                    <input type="tel"
                           name="num_late_days"
                           id="input-course-late-days"
                           class="settings-input"
                           min="0"
                           v-model="course.num_late_days">
                  </div>
                  <div class="settings-save-button"> Save Updates </div>

                  <div v-if="!saving"
                       class="last-saved-timestamp">
                    <span> Last Saved: </span>{{course.last_modified}}
                  </div>
                  <div v-else class="last-saved-spinner">
                    <i class="fa fa-spinner fa-pulse"></i>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </tab>
<!--PERMISSIONS TAB-->
        <tab>
          <template slot="header">

              <dropdown ref="roster_dropdown"
                        :items="roles"
                        @update_item_selected="update_role($event)">
                <template slot="header">
                  <div class="tab-label" tabindex="1">
                    <p class="tab-header"
                       ref="edit_roster_tab"
                       @click="show_dropdown"> Permissions ({{role_selected}})</p>
                  </div>
                </template>
                <div slot-scope="{item}">
                  <div class="edit-rosters-dropdown-row-content">
                    <span>{{item}}</span>
                  </div>
                </div>
              </dropdown>

          </template>

          <template slot="body">
            <div class="tab-body">

              <div v-if="role_selected === 'admin'">
                <div class="class-roster-body">
                  <div class="adding-container">
                    <label class="enrollment-add-label"> Add admins
                      <i class="far fa-question-circle enrollment-tooltip">
                        <tooltip width="large" placement="top">
                          Enter a comma-separated list of email addresses.
                        </tooltip>
                      </i>
                    </label>
                    <textarea ref="new_admin_list"> </textarea>
                  <p class="add-enrollees-button" @click="add_admins"> Add to Roster </p>
                  </div>

                  <div class="enrolled-container">
                    <div v-if="admins.length > 0">
                      <div class="roster-column">
                        <table class="roster-table">
                          <tr>
                            <th> Email </th>
                            <th> First Name </th>
                            <th> Last Name </th>
                            <th></th>
                          </tr>
                          <tr v-for="(admin, index) in admins"
                              :class="index % 2 ? 'odd-row' : 'even-row'">
                            <td>{{admin.email}}</td>
                            <td>{{admin.first_name}}</td>
                            <td>{{admin.last_name}}</td>
                            <td> <i class="fas fa-times delete-enrollee"
                                    @click="course.remove_admins([admin])"></i> </td>
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
                    <label class="enrollment-add-label"> Add staff members:
                      <i class="far fa-question-circle enrollment-tooltip">
                        <tooltip width="large" placement="top">
                          Enter a comma-separated list of email addresses.
                        </tooltip>
                      </i>
                    </label>
                    <textarea ref="new_staff_list"> </textarea>
                    <p class="add-enrollees-button" @click="add_staff"> Add to Roster </p>
                  </div>

                  <div class="enrolled-container">
                    <div v-if="staff.length > 0">
                      <div class="roster-column">
                        <table class="roster-table">
                          <tr>
                            <th> Email </th>
                            <th> First Name </th>
                            <th> Last Name </th>
                            <th></th>
                          </tr>
                          <tr v-for="(staff_member, index) in staff"
                              :class="index % 2 ? 'odd-row' : 'even-row'">
                            <td>{{staff_member.email}}</td>
                            <td>{{staff_member.first_name}}</td>
                            <td>{{staff_member.last_name}}</td>
                            <td> <i class="fas fa-times delete-enrollee"
                                    @click="course.remove_staff([staff])"></i> </td>
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
                    <label class="enrollment-add-label"> Add students:
                      <i class="far fa-question-circle enrollment-tooltip">
                        <tooltip width="large" placement="top">
                          Enter a comma-separated list of email addresses.
                        </tooltip>
                      </i>
                    </label>
                    <textarea ref="new_student_list"> </textarea>
                    <p class="add-enrollees-button" @click="add_students"> Add to Roster </p>
                  </div>

                  <div class="enrolled-container">
                    <div v-if="students.length > 0">
                      <div class="roster-column">
                        <table class="roster-table">
                          <tr>
                            <th> Email </th>
                            <th> First Name </th>
                            <th> Last Name </th>
                            <th></th>
                          </tr>
                          <tr v-for="(student, index) in students"
                              :class="index % 2 ? 'odd-row' : 'even-row'">
                            <td>{{student.email}}</td>
                            <td>{{student.first_name}}</td>
                            <td>{{student.last_name}}</td>
                            <td> <i class="fas fa-times delete-enrollee"
                                    @click="course.remove_students([student])"></i> </td>
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
                    <label class="enrollment-add-label"> Add handgraders:
                      <i class="far fa-question-circle enrollment-tooltip">
                        <tooltip width="large" placement="top">
                          Enter a comma-separated list of email addresses.
                        </tooltip>
                      </i>
                    </label>
                    <textarea ref="new_handgrader_list"> </textarea>
                    <p class="add-enrollees-button" @click="add_handgraders"> Add to Roster </p>
                  </div>

                  <div class="enrolled-container">
                    <div v-if="handgraders.length > 0">
                      <div class="roster-column">
                        <table class="roster-table">
                          <tr>
                            <th> Email </th>
                            <th> First Name </th>
                            <th> Last Name </th>
                            <th></th>
                          </tr>
                          <tr v-for="(handgrader, index) in handgraders"
                              :class="index % 2 ? 'odd-row' : 'even-row'">
                            <td>{{handgrader.email}}</td>
                            <td>{{handgrader.first_name}}</td>
                            <td>{{handgrader.last_name}}</td>
                            <td> <i class="fas fa-times delete-enrollee"
                                    @click="course.remove_handgraders([handgrader])"></i> </td>
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
          <template slot="header">
            <div class="tab-label">
              <p class="tab-header"> Projects </p>
            </div>
          </template>
          <template slot="body">
            <div class="tab-body">
              <div id="project-body-container">

                <div id="new-project-side">
                  <div id="new-project-space">
                    <p id="new-project-label"> Create a New Project</p>
                    <input type="text"
                           id="new-project-input"
                           ref="new_project_input"
                           placeholder="New Project Name">
                    <div class="create-new-project-button"
                         @click="add_project()">
                      Add Project
                    </div>
                  </div>
                </div>

                <div id="existing-projects-side">
                  <p class="existing-projects-label"> Existing Projects </p>
                  <table class="project-table">
                    <tr>
                      <th class="project-name"></th>
                      <th class="edit-project"></th>
                    </tr>
                    <tr v-for="(project, index) of projects"
                        :class="index % 2 ? 'odd-row' : 'even-row'">
                      <td class="project-name">{{project.name}}</td>
                      <td class="edit-project"
                        @click="edit_project_function(project)">
                        Edit Project
                      </td>
                    </tr>
                  </table>
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
  import Tabs from '@/components/tabs/tabs.vue';
  import Tooltip from '@/components/tooltip.vue';
  import { Component, Vue } from 'vue-property-decorator';

  import { Course, NewProjectData, Project, Semester, User } from 'ag-client-typescript';

  import { AllUsersInCourse, Model } from "../model";

  @Component({
    components: { Dropdown, Tab, Tabs, Tooltip }
  })
  export default class CourseAdmin extends Vue {

    role_selected: string = "admin";
    loading = true;
    saving = false;

    // settings
    course: Course = new Course({pk: 1, name: 'EECS 721', semester: Semester.fall, year: 2018,
                                 subtitle: '', num_late_days: 0, last_modified: '2:23:22'});

    // permissions
    // all_users_in_course: AllUsersInCourse;
    admins: User[] = [];
    staff: User[] = [];
    students: User[] = [];
    handgraders: User[] = [];

    // projects
    projects: Project[] = [];

    roles = ["admin", "staff", "student", "handgraders"];

    semester_chosen = "Fall";
    semesters = ["Fall", "Winter", "Spring", "Summer"];

    async created() {
      document.body.style.margin = "0";

      // get course_pk
      let course_pk = 1;
      this.course = await Course.get_by_pk(course_pk);
      this.admins = await this.course.get_admins();
      this.staff = await this.course.get_staff();
      this.students = await this.course.get_students();
      this.handgraders = await this.course.get_handgraders();
      this.projects = await Project.get_all_from_course(course_pk);

      // for (let users_in_role of this.all_users_in_course) {
      //   users_in_role.sort((user_a: User, user_b: User) => {
      //     if (user_a.email <= user_b.email) {
      //       return -1;
      //     }
      //     return 1;
      //   });
      // }
    }

    show_dropdown(event: Event) {
      let roster_dropdown = <Dropdown> this.$refs.roster_dropdown;
      roster_dropdown.show_the_dropdown_menu();
      event.stopPropagation();
    }

    edit_project_function(project: Project) {
      console.log("Editing " + project.name);
    }

    update_role(role_in: string) {
      this.role_selected = role_in;
    }

    async add_admins() {
      let add_admins_textarea = <HTMLInputElement> this.$refs.new_admin_list;
      this.course.add_admins(add_admins_textarea.value.trim().split(this.whitespace_regex));
      console.log(add_admins_textarea.value);
      add_admins_textarea.value = '';
    }

    async add_staff() {
      let add_staff_textarea = <HTMLInputElement> this.$refs.new_staff_list;
      this.course.add_admins(add_staff_textarea.value.trim().split(this.whitespace_regex));
      console.log(add_staff_textarea.value);
      add_staff_textarea.value = '';
    }

    async add_students() {
      let add_students_textarea = <HTMLInputElement> this.$refs.new_student_list;
      this.course.add_students(
        add_students_textarea.value.trim().split(this.whitespace_regex)
      );
      console.log(add_students_textarea.value);
      add_students_textarea.value = '';
    }

    async add_handgraders() {
      let add_handgraders_textarea = <HTMLInputElement> this.$refs.new_handgrader_list;
      this.course.add_handgraders(
        add_handgraders_textarea.value.trim().split(this.whitespace_regex)
      );
      console.log(add_handgraders_textarea.value);
      add_handgraders_textarea.value = '';
    }

    async add_project() {
      let new_project_input = <HTMLInputElement> this.$refs.new_project_input;
      console.log(new_project_input.value);
      let project_to_add = new NewProjectData(new_project_input.value, this.course.pk);
      await Project.create(project_to_add);
      new_project_input.value = "";
    }

    get whitespace_regex() {
      return new RegExp('\\s+');
    }

    update_semester(semester: string) {
      this.semester_chosen = semester;
    }

  }
</script>

<style scoped lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Muli');
  @import '@/styles/colors.scss';
  @import '@/styles/button_styles.scss';
  @import url('https://fonts.googleapis.com/css?family=Quicksand');
  @import url('https://fonts.googleapis.com/css?family=Ropa+Sans');
  @import url('https://fonts.googleapis.com/css?family=Varela');
  @import url('https://fonts.googleapis.com/css?family=Molengo');
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  @import url('https://fonts.googleapis.com/css?family=Oxygen');
  @import url('https://fonts.googleapis.com/css?family=Libre+Franklin');
  @import url('https://fonts.googleapis.com/css?family=Karla');
  @import url('https://fonts.googleapis.com/css?family=Lato');
  @import url('https://fonts.googleapis.com/css?family=Archivo');

  @import url('https://fonts.googleapis.com/css?family=PT+Sans');
  @import url('https://fonts.googleapis.com/css?family=Montserrat');


$current-lang-choice: "Montserrat";

.course-admin-component {
  font-family: $current-lang-choice;
}

.tab-header {
  margin: 0;
  font-size: 20px;
  padding: 10px 25px 12px 25px;
  font-weight: 600;
}

.tab-body {
  padding-top: 30px;
  text-align: left;
  position: relative;
}

.tab-label {
  outline: none;
}

.tab-header {
  padding: 15px 25px;
  margin: 0;
  font-size: 20px;
}

/* ---------------- Settings Styling ---------------- */

#settings-container { }

.settings-save-button  {
  @extend .green-button;
  text-align: center;
  display: block;
  font-family: $current-lang-choice;
  font-size: 18px;
  padding: 20px 0;
  margin: 10px 0 20px 0;
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
  color: lighten(black, 10);
  font-weight: 700;
}

.settings-input {
  outline: none;
  display: block;
  border-radius: 3px;
  border: 2px solid lighten($stormy-gray-dark, 10);
  padding: 6px 9px;
  font-family: $current-lang-choice;
  font-size: 18px;
}

.settings-input:focus {
  border-color: $ocean-blue;
}

.semester-dropdown-wrapper {
  display: block;
}

.settings-single-input-container {
  padding-bottom: 16px;
}

#input-course-name {
  width: 90%;
}

#input-course-semester {
  width: 71px;
}

#input-course-year {
  width: 43px;
}

#input-course-late-days {
  width: 43px;
}

.last-saved-timestamp {
  padding-top: 6px;
  margin: 0;
  font-size: 17px;
  opacity: 0.4;
}

.last-saved-timestamp span {
  font-weight: 600;
}

.last-saved-spinner {
  font-size: 18px;
  color: $stormy-gray-dark;
  margin-top: 15px;
  margin-left: 24px;
  display: inline-block;
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
  padding: 20px 0;
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
  // should a max height be applied here?
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

#new-project-side { }

#new-project-space {
  width: 80%;
  margin: 0 10%;
}

#new-project-label {
  font-size: 20px;
  margin: 0 0 20px 0;
  padding: 6px 0 0 0;
  font-weight: 800;
}

#new-project-input {
  outline: none;
  display: block;
  border-radius: 3px;
  border: 2px solid lighten($stormy-gray-dark, 10);
  padding: 6px 9px;
  font-family: $current-lang-choice;
  font-size: 18px;
  width: 93.5%;
}

#new-project-input::placeholder {
  color: darken($sky-blue, 10);
  opacity: 0.3;
}

.create-new-project-button {
  @extend .green-button;
  display: block;
  font-family: $current-lang-choice;
  font-size: 18px;
  margin-top: 20px;
  padding: 20px 0;
  text-align: center;
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

.project-table {
  border-collapse: collapse;
  font-size: 18px;
}

.project-name {
  padding: 15px 60px 15px 20px;
  font-size: 17px;
}

.project-name:hover {
  background-color: lighten($stormy-gray-dark, 30);
  cursor: pointer;
}

.edit-project {
  width: 110px;
  text-align: center;
  background-color: lighten($sky-blue, 5);
  padding: 15px 20px;
  cursor: pointer;
  color: black;
}

.edit-project:hover {
  background-color: $sky-blue;
}

.project-table tr th {
  display: none;
}

.project-table tr {
  border-bottom: 4px solid white;
}

@media only screen and (min-width: 481px) {
  .tab-body {
    margin-left: 2px;
    margin-right: 2px;
    border-top: 2px solid $pebble-dark;
  }

  .settings-save-button, .add-enrollees-button, .create-new-project-button {
    padding: 10px 15px;
    font-family: $current-lang-choice;
    font-size: 18px;
    margin: 12px 0;
    display: inline-block;
  }

  /* ---------------- Settings Styling ---------------- */

  #settings-container {
    margin: 0;
  }

  #settings-container-inputs {
    width: 400px;
    margin: 10px 0 0 50px;
    border-radius: 5px;
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

  #project-body-container {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

  #new-project-side {
    width: 50%;
    display: inline-block;
  }

  #existing-projects-side {
    width: 50%;
    margin: 0;
    display: inline-block;
    vertical-align: top;
  }

  .project-table {
    margin-bottom: 70px;
  }

  #new-project-space {
    text-align: left;
  }

  #new-project-input {
    font-size: 17px;
    padding: 6px 12px;
    margin: 0 0 10px 0;
    max-width: 70%;
    display: block;
  }

  .existing-projects-label {
    font-size: 20px;
    margin: 0 0 20px 0;
    padding: 6px 0 0 0;
    text-align: left;
  }
}

@media only screen and (min-width: 768px) {
  /* ---------------- Edit Rosters Styling ---------------- */
  .roster-column {
    overflow: visible;
  }
}

</style>
