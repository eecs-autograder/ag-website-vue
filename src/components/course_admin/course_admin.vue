<template>
    <div class="course-admin-component"
         ref="course_admin_component"
         v-if="course !== null">
      <div>
        <tabs ref="course_admin_tabs"
              tab_active_class="gray-theme-active-no-padding"
              tab_inactive_class="gray-theme-inactive-no-padding"
              v-model="current_tab_index"
              v-if="!loading">
  <!--SETTINGS TAB-->
          <tab>
            <tab-header ref="settings_tab"
                        @click.native="update_tab_index(0)">
              <div class="tab-label">
                <p class="tab-header"> Settings </p>
              </div>
            </tab-header>
            <template slot="body">
              <div class="tab-body">
                <course-settings v-if="course !== null" :course="course"> </course-settings>
              </div>
            </template>
          </tab>

  <!--PERMISSIONS TAB-->

          <tab>
            <tab-header ref="permissions_tab"
                        id="permissions-tab"
                        @click.native="update_tab_index(1)">

                <dropdown ref="permission_dropdown"
                          :items="roles"
                          @update_item_selected="update_role_selected($event)">
                  <template slot="header">
                    <div class="tab-label" tabindex="1">
                      <p class="tab-header"
                         ref="edit_permissions_tab"
                         @click="show_permissions_tab_dropdown_menu">
                        Permissions {{ role_selected === "" ? '' : `(${role_selected})`}}
                      </p>
                    </div>
                  </template>
                  <div slot-scope="{item}">
                    <div class="permissions-row-content">
                      <span>{{item}}</span>
                    </div>
                  </div>
                </dropdown>

             </tab-header>

            <template slot="body">
              <div class="tab-body">
                <p class="role-selected"> {{role_selected}} </p>
                <div v-if="role_selected === 'admin'">
                  <div class="class-permissions-body">
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
                      <div v-if="admins !== null">
                        <div class="permissions-column">
                          <table class="permissions-table">
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
                  <div class="class-permissions-body">
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
                      <div v-if="staff !== null">
                        <div class="permissions-column">
                          <table class="permissions-table">
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
                  <div class="class-permissions-body">
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
                      <div v-if="students !== null">
                        <div class="permissions-column">
                          <table class="permissions-table">
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
                  <div class="class-permissions-body">
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
                      <div v-if="handgraders !== null">
                        <div class="permissions-column">
                          <table class="permissions-table">
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
            <tab-header ref="projects_tab"
                        @click.native="update_tab_index(2)">
              <div class="tab-label">
                <p class="tab-header"> Projects </p>
              </div>
            </tab-header>
            <template slot="body">
              <course-projects v-if="course !== null" :course="course"></course-projects>
            </template>
          </tab>
        </tabs>
      </div>
    </div>
</template>

<script lang="ts">
  import CourseProjects from '@/components/course_admin/course_projects.vue';
  import CourseSettings from '@/components/course_admin/course_settings.vue';
  import Dropdown from '@/components/dropdown.vue';
  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
  import { array_has_unique, handle_400_errors_async } from '@/utils.ts';

  import { Course, Project, Semester, User } from 'ag-client-typescript';
  import { AxiosResponse } from 'axios';
  import { Component, Vue, Watch } from 'vue-property-decorator';

  @Component({
    components: {
      CourseSettings,
      CourseProjects,
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

    role_selected = "";
    roles = ["admin", "staff", "student", "handgrader"];
    course: Course | null = null;
    last_modified_format = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    current_tab_index = 0;
    admins: User[] | null = null;
    staff: User[] | null = null;
    students: User[] | null = null;
    handgraders: User[] | null = null;
    new_admins_list = "";
    new_staff_list = "";
    new_students_list = "";
    new_handgraders_list = "";

    course_pk_param: number = 1;

    async created() {
      this.course_pk_param = Number(this.$route.params.courseId);
      this.course = await Course.get_by_pk(this.course_pk_param);
      this.loading = false;
    }

    async update_tab_index(index: number) {
      console.log("changing tab from: " + this.current_tab_index + " to " + index);
      this.current_tab_index = index;
      if (this.current_tab_index === 0 || this.current_tab_index === 2) {
        this.role_selected = "";
      }
    }

    async update_role_selected(role: string) {
      console.log("CALL ME");
      this.role_selected = role;
      if (this.role_selected === "admin" && this.admins === null) {
        console.log("Admin stuff!");
        this.admins = await this.course!.get_admins();
        this.sort_users(this.admins);
      }
      else if (role === "staff" && this.staff === null) {
        console.log("Staff stuff!");
        this.staff = await this.course!.get_staff();
        this.sort_users(this.staff);
      }
      else if (role === "student" && this.students === null) {
        console.log("Student stuff!");
        this.students = await this.course!.get_students();
        this.sort_users(this.students);
      }
      else if (role === "handgrader" && this.handgraders === null) {
        console.log("Handgrader stuff!");
        this.handgraders = await this.course!.get_handgraders();
        this.sort_users(this.handgraders);
      }
    }

    show_permissions_tab_dropdown_menu(event: Event) {
      let permission_dropdown = <Dropdown> this.$refs.permission_dropdown;
      permission_dropdown.show_the_dropdown_menu();
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
      this.admins!.splice(index, 1);
    }

    remove_staff(staff_to_delete: User[], index: number) {
      this.course!.remove_staff(staff_to_delete);
      this.staff!.splice(index, 1);
    }

    remove_students(students_to_delete: User[], index: number) {
      this.course!.remove_students(students_to_delete);
      this.students!.splice(index, 1);
    }

    remove_handgraders(handgraders_to_delete: User[], index: number) {
      this.course!.remove_handgraders(handgraders_to_delete);
      this.handgraders!.splice(index, 1);
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
        error_msg: "You must enter a number",
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

/* ---------------- Permissions Styling ---------------- */

.class-permissions-body {
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

.permissions-row-content {
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

.permissions-table {
  margin-top: 15px;
  border-collapse: collapse;
  margin-bottom: 100px;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
  font-size: 18px;
}

.permissions-table th {
  background-color: $stormy-gray-dark;
  color: white;
  padding: 10px 25px;
}

.permissions-table td {
  padding: 10px 25px;
  margin-bottom: 10px;
  position: relative;
}

.permissions-table tr td {
  border-top: 3px solid white;
}

.odd-row {
  background-color: $pebble-medium;
}

.even-row {
  background-color: lighten($pebble-dark, 10);
}

.permissions-column {
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

  /* ---------------- Permissions Styling ---------------- */

  .adding-container, .enrolled-container {
    margin: 0 10%;
  }

  .permissions-table {
    width: 100%;
  }

  .enrollment-add-label {
    padding: 10px 0;
  }

  .add-enrollees-button {
    margin-top: 20px;
  }

  .permissions-row-content {
    font-size: 18px;
  }

  /* ---------------- Projects Styling ---------------- */

}

@media only screen and (min-width: 768px) {
  /* ---------------- Edit Permissions Styling ---------------- */
  .permissions-column {
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
