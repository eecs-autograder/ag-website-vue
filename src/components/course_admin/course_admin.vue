<template>
  <div v-if="d_loading" class="loading-centered loading-large">
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

      <div class="nav-link"
          ref="late_days_tab"
          v-if="d_course.num_late_days !== 0"
          :class="{'active': current_tab === 'late_days'}"
          @click="set_current_tab('late_days')">
        Late Day Tokens
      </div>

    </div>

    <div class="body">
      <course-settings v-show="current_tab === 'settings'"
                      v-if="loaded_tabs.has('settings')"
                      :course="d_course"></course-settings>

      <admin-roster v-show="current_tab === RosterChoice.admin + '_roster'"
                    v-if="loaded_tabs.has(RosterChoice.admin + '_roster')"
                    :course="d_course">
      </admin-roster>

      <staff-roster v-show="current_tab === RosterChoice.staff + '_roster'"
                    v-if="loaded_tabs.has(RosterChoice.staff + '_roster')"
                    :course="d_course">
      </staff-roster>

      <student-roster v-show="current_tab === RosterChoice.student + '_roster'"
                      v-if="loaded_tabs.has(RosterChoice.student + '_roster')"
                      :course="d_course">
      </student-roster>

      <handgrader-roster v-show="current_tab === RosterChoice.handgrader + '_roster'"
                        v-if="loaded_tabs.has(RosterChoice.handgrader + '_roster')"
                        :course="d_course">
      </handgrader-roster>

      <manage-projects v-show="current_tab === 'projects'"
                      v-if="loaded_tabs.has('projects')"
                      :course="d_course">
      </manage-projects>

      <!-- Intentionally using v-if here because we don't have pub/sub for roster updates. -->
      <edit-late-days
        v-if="current_tab === 'late_days'"
        :course="d_course">
      </edit-late-days>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';

import { Course, CourseObserver } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import CourseSettings from '@/components/course_admin/course_settings.vue';
import EditLateDays from '@/components/course_admin/edit_late_days.vue';
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
import { handle_global_errors_async } from '@/error_handling';
import { BeforeDestroy, Mounted } from '@/lifecycle';
import { get_query_param, safe_assign } from "@/utils";

@Component({
  components: {
    AdminRoster,
    HandgraderRoster,
    StaffRoster,
    StudentRoster,
    ManageProjects,
    EditLateDays,
    CourseSettings,
    Dropdown,
    Tab,
    TabHeader,
    Tabs,
  }
})
export default class CourseAdmin extends CurrentTabMixin implements CourseObserver,
                                                                    Mounted,
                                                                    BeforeDestroy {
  @Inject({from: 'globals'})
  globals!: GlobalData;

  d_loading = true;
  role_selected = "";
  roles = [
    RosterChoice.admin,
    RosterChoice.staff,
    RosterChoice.student,
    RosterChoice.handgrader
  ];
  d_course: Course | null = null;

  readonly RosterChoice = RosterChoice;

  @handle_global_errors_async
  async mounted() {
    this.d_course = await Course.get_by_pk(Number(this.$route.params.course_id));
    await this.globals.set_current_course(this.d_course);

    let requested_tab = get_query_param(this.$route.query, "current_tab");
    if (requested_tab === 'late_days' && this.d_course!.num_late_days === 0) {
      this.set_current_tab('settings');
    }
    else {
      this.initialize_current_tab('settings');
    }

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

    this.d_loading = false;
    Course.subscribe(this);
  }

  beforeDestroy() {
    Course.unsubscribe(this);
  }

  update_course_created(course: Course): void {
  }

  update_course_changed(course: Course): void {
    if (this.d_course !== null && course.pk === this.d_course.pk) {
      safe_assign(this.d_course, course);
    }
  }
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
@import '@/styles/global.scss';
@import '@/styles/loading.scss';
@import '@/styles/navbar.scss';
@import '@/styles/static_dropdown.scss';

@include navbar(
  $background-color: $navbar-background-color,
  $hover-color: $navbar-hover-color,
  $active-color: $navbar-active-color,
  $border-color: $navbar-hover-color
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
  font-size: 1rem;
}

.body {
  padding: 1rem;
}
</style>
