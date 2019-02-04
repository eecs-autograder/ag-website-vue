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
                        id="permissions-tab">

                <dropdown ref="permission_dropdown"
                          :items="roles"
                          @update_item_selected="role_selected = $event; update_tab_index(1)">
                  <template slot="header">
                    <div class="tab-label" tabindex="1">
                      <p class="permissions-tab-header tab-header"
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
                <admin-roster v-if="role_selected === 'Admin'
                              && course !== null"
                              :course="course"></admin-roster>

                <staff-roster v-if="role_selected === 'Staff'
                              && course !== null"
                              :course="course"></staff-roster>

                <student-roster v-if="role_selected === 'Student'
                                && course !== null"
                                :course="course"></student-roster>

                <handgrader-roster v-if="role_selected === 'Handgrader'
                                   && course !== null"
                                   :course="course"></handgrader-roster>
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
              <div class="tab-body">
                <manage-projects v-if="course !== null" :course="course"></manage-projects>
              </div>
            </template>
          </tab>
        </tabs>
      </div>
    </div>
</template>

<script lang="ts">
  import AdminRoster from '@/components/course_admin/permissions/admin_roster.vue';
  import HandgraderRoster from '@/components/course_admin/permissions/handgrader_roster.vue';
  import StaffRoster from '@/components/course_admin/permissions/staff_roster.vue';
  import StudentRoster from '@/components/course_admin/permissions/student_roster.vue';

  import CourseSettings from '@/components/course_admin/course_settings.vue';
  import ManageProjects from '@/components/course_admin/manage_projects.vue';
  import Dropdown from '@/components/dropdown.vue';
  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import { Course } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      AdminRoster,
      HandgraderRoster,
      StaffRoster,
      StudentRoster,
      ManageProjects,
      CourseSettings,
      Dropdown,
      Tab,
      TabHeader,
      Tabs,
      Tooltip,
      ValidatedForm
    }
  })
  export default class CourseAdmin extends Vue {
    current_tab_index = 0;
    loading = true;
    saving = false;
    role_selected = "";
    roles = ["Admin", "Staff", "Student", "Handgrader"];
    course: Course | null = null;
    last_modified_format = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    async created() {
      this.course = await Course.get_by_pk(Number(this.$route.params.courseId));
      this.loading = false;
    }

    async update_tab_index(index: number) {
      this.current_tab_index = index;
      console.log("Hello from tab: " + this.current_tab_index);
      if (this.current_tab_index === 0 || this.current_tab_index === 2) {
        this.role_selected = "";
      }
    }

    show_permissions_tab_dropdown_menu(event: Event) {
      let permission_dropdown = <Dropdown> this.$refs.permission_dropdown;
      permission_dropdown.show_the_dropdown_menu();
      event.stopPropagation();
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import url('https://fonts.googleapis.com/css?family=Montserrat');
@import url('https://fonts.googleapis.com/css?family=Muli');

$current-lang-choice: "Muli";
$github-black-color: #24292e;

.course-admin-component {
  font-family: $current-lang-choice;
}

.tab-header {
  margin: 0;
  color: $github-black-color;
  font-size: 18px;
  padding: 10px 25px 12px 25px;
  font-weight: 600;
}

.tab-body {
  padding-top: 20px;
  text-align: left;
  position: relative;
}

.tab-label {
  outline: none;
}

.permissions-row-content {
  font-size: 16px;
  font-family: $current-lang-choice;
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
}
</style>
