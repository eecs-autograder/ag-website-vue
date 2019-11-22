<template>
  <div v-if="loading" class="loading-large">
      <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else class="course-admin-component" ref="course_admin_component">
    <div class="navbar default-navbar">
      <div class="nav-link"
           ref="settings_tab"
           :class="{'active': current_tab === 'settings'}"
           @click="set_current_tab('settings')">
        Settings
      </div>

      <div class="nav-link dropdown-link"
           ref="roster_tab"
           :class="{'active': current_tab.endsWith('roster')}">
        <div class="dropdown">
          <div class="roster-tab-header">
            Roster {{role_selected === "" ? '' : `(${role_selected})`}}
          </div>
          <div class="menu">
            <div class="menu-item"
                 v-for="role of roles" :key="role"
                 @click="role_selected = role; set_current_tab(role + '_roster')">
              {{role}}
            </div>
          </div>
        </div>
      </div>

      <div class="nav-link"
          ref="projects_tab"
          :class="{'active': current_tab === 'projects'}"
          @click="set_current_tab('projects')">
        Projects
      </div>
    </div>

    <div class="body">
    <course-settings v-show="current_tab === 'settings'"
                     v-if="loaded_tabs.has('settings')"
                     :course="course"></course-settings>

    <admin-roster v-show="current_tab === RosterChoice.admin + '_roster'"
                  v-if="loaded_tabs.has(RosterChoice.admin + '_roster')"
                  :course="course">
    </admin-roster>

    <staff-roster v-show="current_tab === RosterChoice.staff + '_roster'"
                  v-if="loaded_tabs.has(RosterChoice.staff + '_roster')"
                  :course="course">
    </staff-roster>

    <student-roster v-show="current_tab === RosterChoice.student + '_roster'"
                    v-if="loaded_tabs.has(RosterChoice.student + '_roster')"
                    :course="course">
    </student-roster>

    <handgrader-roster v-show="current_tab === RosterChoice.handgrader + '_roster'"
                       v-if="loaded_tabs.has(RosterChoice.handgrader + '_roster')"
                       :course="course">
    </handgrader-roster>

    <manage-projects v-show="current_tab === 'projects'"
                     v-if="loaded_tabs.has('projects')"
                     :course="course">
    </manage-projects>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';

import { Course } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
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
import { CurrentTabMixin } from '@/current_tab_mixin';
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
export default class CourseAdmin extends CurrentTabMixin {
  @Inject({from: 'globals'})
  globals!: GlobalData;

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
    await this.globals.set_current_course(this.course);
    this.loading = false;
  }

  mounted() {
    this.initialize_current_tab('settings');

    let query_val = get_query_param(this.$route.query, 'current_tab');
    if (query_val === RosterChoice.admin + '_roster') {
      this.role_selected = RosterChoice.admin;
    }
    else if (query_val === RosterChoice.staff + '_roster') {
      this.role_selected = RosterChoice.staff;
    }
    else if (query_val === RosterChoice.student + '_roster') {
      this.role_selected = RosterChoice.student;
    }
    else if (query_val === RosterChoice.handgrader + '_roster') {
      this.role_selected = RosterChoice.handgrader;
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
@import '@/styles/loading.scss';
@import '@/styles/navbar.scss';
@import '@/styles/static_dropdown.scss';

@include navbar(
  $background-color: $pebble-light,
  $hover-color: lighten($pebble-dark, 5%),
  $active-color: $pebble-dark,
  $border-color: lighten($pebble-dark, 5%)
);

.dropdown {
  @include static-dropdown($open-on-hover: true);

  .menu-item {
    padding: .375rem;
  }
}

.roster-tab-header {
  padding: $default-nav-link-padding;
}

.nav-link.dropdown-link {
  padding: 0;
}

.roster-dropdown-row {
  font-size: 16px;
}

.body {
  overflow: hidden;
}
</style>
