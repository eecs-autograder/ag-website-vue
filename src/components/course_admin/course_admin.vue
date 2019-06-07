<template>
  <div class="course-admin-component"
       ref="course_admin_component">
    <div v-if="!loading">
      <tabs ref="course_admin_tabs"
            tab_active_class="gray-theme-active-no-padding"
            tab_inactive_class="gray-theme-inactive-no-padding"
            v-model="current_tab_index"
            @input="on_tab_changed"
            v-if="!loading">

        <!--SETTINGS TAB-->
        <tab>
          <tab-header ref="settings_tab">
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

        <!--ROSTER TAB-->
        <tab>
          <tab-header ref="roster_tab"
                      id="roster-tab">

            <dropdown ref="roster_dropdown"
                      :items="roles"
                      @update_item_selected="role_selected = $event;
                                             current_tab_index = 1;
                                             on_tab_changed(1);">
              <template slot="header">
                <div class="tab-label" tabindex="1">
                  <p class="roster-tab-header tab-header"
                     ref="roster_tab_header"
                     @click="show_roster_tab_dropdown_menu">
                    Roster {{role_selected === "" ? '' : `(${role_selected})`}}
                  </p>
                </div>
              </template>
              <div slot-scope="{item}">
                <div class="roster-dropdown-row">
                  <span>{{item}}</span>
                </div>
              </div>
            </dropdown>

          </tab-header>

          <template slot="body">
            <div class="tab-body">
              <admin-roster v-if="role_selected === RosterChoice.admin && course !== null"
                            :course="course">
              </admin-roster>

              <staff-roster v-if="role_selected === RosterChoice.staff && course !== null"
                            :course="course">
              </staff-roster>

              <student-roster v-if="role_selected === RosterChoice.student && course !== null"
                              :course="course">
              </student-roster>

              <handgrader-roster v-if="role_selected === RosterChoice.handgrader
                                       && course !== null"
                                 :course="course">
              </handgrader-roster>
            </div>
          </template>
        </tab>

        <!--PROJECTS TAB-->
        <tab>
          <tab-header ref="projects_tab">
            <div class="tab-label">
              <p class="tab-header"> Projects </p>
            </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">
              <manage-projects v-if="course !== null"
                               :course="course">
              </manage-projects>
            </div>
          </template>
        </tab>
      </tabs>
    </div>
    <div v-else class="loading-spinner">
        <i class="fa fa-spinner fa-pulse"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Course } from 'ag-client-typescript';

import CourseSettings from '@/components/course_admin/course_settings.vue';
import ManageProjects from '@/components/course_admin/manage_projects/manage_projects.vue';
import AdminRoster from '@/components/course_admin/roster/admin_roster.vue';
import HandgraderRoster from '@/components/course_admin/roster/handgrader_roster.vue';
import StaffRoster from '@/components/course_admin/roster/staff_roster.vue';
import StudentRoster from '@/components/course_admin/roster/student_roster.vue';
import Dropdown from '@/components/dropdown.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import { get_query_param } from "@/utils";

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
  }
})
export default class CourseAdmin extends Vue {

  current_tab_index = 0;
  loading = true;
  role_selected = "";
  roles = [
    RosterChoice.admin,
    RosterChoice.staff,
    RosterChoice.student,
    RosterChoice.handgrader
  ];
  course: Course | null = null;

  async created() {
    this.course = await Course.get_by_pk(Number(this.$route.params.course_id));
    this.loading = false;
  }

  mounted() {
    this.select_tab(get_query_param(this.$route.query, "current_tab"));
  }

  show_roster_tab_dropdown_menu(event: Event) {
    let roster_dropdown = <Dropdown> this.$refs.roster_dropdown;
    roster_dropdown.show_the_dropdown_menu();
    event.stopPropagation();
  }

  on_tab_changed(index: number) {
    if (this.current_tab_index !== 1) {
      this.role_selected = "";
    }
    switch (index) {
      case 0:
        this.$router.replace({query: {current_tab: "settings"}});
        break;
      case 1:
        if (this.role_selected === RosterChoice.admin) {
          this.$router.replace({query: {current_tab: "admin_roster"}});
        }
        else if (this.role_selected === RosterChoice.staff) {
          this.$router.replace({query: {current_tab: "staff_roster"}});
        }
        else if (this.role_selected === RosterChoice.student) {
          this.$router.replace({query: {current_tab: "student_roster"}});
        }
        else {
          this.$router.replace({query: {current_tab: "handgrader_roster"}});
        }
        break;
      case 2:
        this.$router.replace(({query: {current_tab: "manage_projects"}}));
    }
  }

  select_tab(tab_name: string | null) {
    switch (tab_name) {
      case "settings":
        break;
      case "admin_roster":
        this.current_tab_index = 1;
        this.role_selected = RosterChoice.admin;
        break;
      case "staff_roster":
        this.current_tab_index = 1;
        this.role_selected = RosterChoice.staff;
        break;
      case "student_roster":
        this.current_tab_index = 1;
        this.role_selected = RosterChoice.student;
        break;
      case "handgrader_roster":
        this.current_tab_index = 1;
        this.role_selected = RosterChoice.handgrader;
        break;
      case "manage_projects":
        this.current_tab_index = 2;
        break;
      default:
        this.current_tab_index = 0;
    }
  }
  readonly RosterChoice = RosterChoice;
}

export enum RosterChoice {
  admin = "Admin",
  staff = "Staff",
  student = "Student",
  handgrader = "Handgrader"
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');
$current-lang-choice: "Quicksand";

.loading-spinner {
  color: $ocean-blue;
  font-size: 55px;
  left: 46vw;
  position: absolute;
  text-align: center;
  top: 40vh;
}

.course-admin-component {
  font-family: $current-lang-choice;
  position: relative;
}

.tab-header {
  margin: 0;
  font-size: 18px;
  padding: 10px 25px 12px 25px;
  font-weight: 600;
}

.tab-body {
  text-align: left;
  position: relative;
  padding-top: 10px;
}

.tab-label {
  outline: none;
  cursor: pointer;
}

.roster-dropdown-row {
  font-size: 16px;
  font-family: $current-lang-choice;
}


@media only screen and (min-width: 481px) {
  .tab-body {
    border-top: 2px solid $pebble-dark;
  }

  .tab-header {
    padding: 10px 15px 10px 15px;
  }
}
</style>
