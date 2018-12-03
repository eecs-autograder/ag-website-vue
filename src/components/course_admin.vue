<template>
  <div class="course-admin-component"
       ref="course_admin_component"
       v-if="course != null">
    <div>
      <tabs ref="course_admin_tabs"
            tab_active_class="gray-theme-active"
            tab_inactive_class="gray-theme-inactive"
            v-if="!loading">
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
                  <form id="course-settings-form" @submit.prevent="save_course_settings">
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
                                  @update_item_selected="course.semester = $event">
                        <template slot="header">
                          <div tabindex="1" class="input-wrapper">
                            <input type=text
                                   name="semester"
                                   id="input-course-semester"
                                   class="settings-input"
                                   v-model="course.semester"
                                   @blur="close_course_semester_dropdown_menu"/>
                            <i class="fas fa-caret-down dropdown-caret"></i>
                          </div>
                        </template>
                        <div slot-scope="{item}">
                          <span class="semester-item">{{item}}</span>
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

                    <input type="submit" class="settings-save-button" value="Save Updates">

                    <div v-if="!saving"
                         class="last-saved-timestamp">
                      <span> Last Saved: </span>
                      {{(new Date(course.last_modified)).toLocaleString('en-US', last_modified_format)}}
                    </div>
                    <div v-else class="last-saved-spinner">
                      <i class="fa fa-spinner fa-pulse"></i>
                    </div>
                  </form>
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

          </template>

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
                      <textarea ref="new_admin_list" v-model="new_admins_list"></textarea>
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
                      <textarea ref="new_staff_list" v-model="new_staff_list"></textarea>
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
                      <textarea ref="new_student_list" v-model="new_students_list"></textarea>
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
                      <textarea ref="new_handgrader_list" v-model="new_handgraders_list">
                      </textarea>
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
                    <form id="new-project-form" @submit.prevent="add_project">
                      <p id="new-project-label"> Create a New Project</p>
                      <input type="text"
                             id="new-project-input"
                             ref="new_project_input"
                             v-model="new_project_name"
                             placeholder="New Project Name">
                      <input type="submit"
                             class="create-new-project-button"
                             value="Add Project">
                    </form>
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
                      <td class="project-name">
                        <router-link tag="div"
                                     :to="`/web/project/${project.pk}`">
                          <a>
                            <div class="project-link">{{project.name}}</div>
                          </a>
                        </router-link>
                      </td>
                      <td class="edit-project">
                        <router-link tag="div"
                                     :to="`/web/project_admin/${project.pk}`">
                          <a>
                            <div class="edit-project-link"> Edit Project </div>
                          </a>
                        </router-link>
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
  import { Component, Vue, Watch } from 'vue-property-decorator';

  import { Course, Project, Semester, User } from 'ag-client-typescript';

  @Component({
    components: { Dropdown, Tab, Tabs, Tooltip }
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
      this.loading = false;
    }

    close_course_semester_dropdown_menu() {
      let grading_policy_dropdown = <Dropdown> this.$refs.semester_dropdown;
      grading_policy_dropdown.hide_the_dropdown_menu();
    }

    show_permissions_tab_dropdown_menu(event: Event) {
      let roster_dropdown = <Dropdown> this.$refs.roster_dropdown;
      roster_dropdown.show_the_dropdown_menu();
      event.stopPropagation();
    }

    async save_course_settings() {
      this.saving = true;
      try {
        await this.course!.save();
      }
      finally {
        this.saving = false;
      }
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
      let new_admins = this.new_admins_list.split(',');
      for (let i = 0; i < new_admins.length; ++i) {
        new_admins[i] = new_admins[i].trim();
      }
      await this.course!.add_admins(new_admins);
      this.new_admins_list = "";
      this.admins = await this.course!.get_admins();
      this.sort_users(this.admins);
    }

    async add_staff() {
      let new_staff = this.new_staff_list.split(',');
      for (let i = 0; i < new_staff.length; ++i) {
        new_staff[i] = new_staff[i].trim();
      }
      await this.course!.add_staff(new_staff);
      this.new_staff_list = "";
      this.staff = await this.course!.get_staff();
      this.sort_users(this.staff);
    }

    async add_students() {
      let new_students = this.new_students_list.split(',');
      for (let i = 0; i < new_students.length; ++i) {
        new_students[i] = new_students[i].trim();
      }
      await this.course!.add_students(new_students);
      this.new_students_list = "";
      this.students = await this.course!.get_students();
      for (let student of this.students) {
        console.log(student.username);
      }
      this.sort_users(this.students);
    }

    async add_handgraders() {
      let new_handgraders = this.new_handgraders_list.split(',');
      for (let i = 0; i < new_handgraders.length; ++i) {
        new_handgraders[i] = new_handgraders[i].trim();
      }
      await this.course!.add_handgraders(new_handgraders);
      this.new_handgraders_list = "";
      this.handgraders = await this.course!.get_handgraders();
      this.sort_users(this.handgraders);
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

    async add_project() {
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
  padding: 20px 15px;
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
  width: 120px;
}

.semester-item {
  font-size: 18px;
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

#new-project-side { }

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
  color: darken($sky-blue, 50);
  opacity: 0.3;
}

.create-new-project-button {
  @extend .green-button;
  display: block;
  font-family: $current-lang-choice;
  font-size: 18px;
  margin-top: 20px;
  padding: 20px 15px;
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
  font-size: 17px;
}

.project-name:hover {
  background-color: lighten($stormy-gray-dark, 30);
  cursor: pointer;
}

.edit-project {
  width: 110px;
  padding:0;
  background-color: lighten($sky-blue, 5);
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

.edit-project-link {
  padding: 15px 20px;
  width: 110px;
  text-align: center;
}

.project-link {
  padding: 15px 20px;
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
    width: 450px;
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
    margin: 0 0 12px 0;
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
