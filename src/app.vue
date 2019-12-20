<template>
  <div id="app">
    <div v-if="d_loading" class="loading-centered loading-large">
      <i class="fa fa-spinner fa-pulse"></i>
    </div>
    <template v-else>
      <div id="global-error-banner" v-show="d_global_error_count !== 0">
        <APIErrors
          ref="global_errors"
          id="global-api-errors"
          @num_errors_changed="d_global_error_count = $event">
        </APIErrors>
      </div>
      <div id="breadcrumbs">
        <router-link to="/" id="home-logo">
          Autograder
        </router-link>
        <template v-if="globals.current_course !== null">
          <router-link :to="`/web/course/${globals.current_course.pk}`"
                        class="breadcrumb-link">
            <span> - {{globals.current_course.name}}</span>
            <span v-if="globals.current_course.semester !== null">
              {{globals.current_course.semester}}
            </span>
            <span v-if="globals.current_course.year !== null">
              {{globals.current_course.year}}
            </span>
          </router-link>

          <span v-if="globals.user_roles.is_admin">
            <router-link :to="`/web/course_admin/${globals.current_course.pk}`"
                          class="breadcrumb-link">
              <i class="fas fa-cog cog"></i>
            </router-link>
          </span>

          <span v-if="globals.current_project !== null">
            -
            <router-link :to="`/web/project/${globals.current_project.pk}`"
                          class="breadcrumb-link">
              {{globals.current_project.name}}
            </router-link>

            <span v-if="globals.user_roles.is_admin">
              <router-link :to="`/web/project_admin/${globals.current_project.pk}`"
                            class="breadcrumb-link">
                <i class="fas fa-cog cog"></i>
              </router-link>
            </span>
          </span>
        </template>
      </div>
      <router-view></router-view>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator';

import { Course, Project, User, UserRoles } from 'ag-client-typescript';

import { GlobalErrorsObserver, GlobalErrorsSubject } from '@/error_handling';
import APIErrors from '@/components/api_errors.vue';

import UIDemos from './demos/ui_demos.vue';
import { BeforeDestroy, Created } from './lifecycle';
import { safe_assign } from './utils';


/* IMPORTANT! How to use the provided globals:
@Inject({from: 'globals'})
globals!: GlobalData;
// We need the provided globals to be one of our reactive data members,
// so we alias it here.
// ALWAYS ACCESS GLOBALS THROUGH THIS VARIABLE!
d_globals = this.globals;
*/
export class GlobalData {
  current_user!: User;
  current_course: Course | null = null;
  current_project: Project | null = null;

  // User roles for the current user for the current course.
  user_roles: UserRoles = new UserRoles({
    is_admin: false,
    is_staff: false,
    is_student: false,
    is_handgrader: false,
  });

  async set_current_course(course: Course | null) {
    if (course === null) {
      this.user_roles = new UserRoles({
        is_admin: false,
        is_staff: false,
        is_student: false,
        is_handgrader: false,
      });
      this.current_course = null;
    }
    else {
      this.user_roles = await User.get_current_user_roles(course.pk);
      this.current_course = course;
    }

    this.current_project = null;
  }

  async set_current_project(project: Project, course?: Course) {
    if (course === undefined) {
      course = await Course.get_by_pk(project.course);
    }

    // Setting the current course makes some HTTP requests and sets
    // current_project to null, so we need this call to finish before
    // we set the current project.
    await this.set_current_course(course);
    this.current_project = project;
  }
}

@Component({
  components: {
    APIErrors,
  }
})
export default class App extends Vue implements GlobalErrorsObserver, Created, BeforeDestroy {
  /* IMPORTANT! How to use the provided globals:
  @Inject({from: 'globals'})
  globals!: GlobalData;
  // We need the provided globals to be one of our reactive data members,
  // so we alias it here.
  // ALWAYS ACCESS GLOBALS THROUGH THIS VARIABLE!
  d_globals = this.globals;
  */
  @Provide()
  globals: GlobalData = new GlobalData();

  d_global_error_count = 0;

  d_loading = true;

  async created() {
    this.globals.current_user = await User.get_current();
    GlobalErrorsSubject.get_instance().subscribe(this);
    this.d_loading = false;
  }

  beforeDestroy() {
    GlobalErrorsSubject.get_instance().unsubscribe(this);
  }

  handle_error(error: unknown): void {
    this.$refs.global_errors.show_errors_from_response(error);
  }
}

</script>

<style lang="scss" scoped>
@import '@/styles/colors.scss';
@import '@/styles/loading.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#global-error-banner {
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: 90%;

  max-width: 700px;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: .25rem .5rem;

  background-color: lighten(desaturate($light-yellow, 20%), 10%);
  border: 1px solid $pebble-dark;
  border-top: none;
}

#global-api-errors {
  width: 100%;
}

#breadcrumbs {
  padding: .25rem .5rem;
  width: 100%;
  font-size: 1.5rem;
  white-space: nowrap;
  overflow-x: auto;

  .breadcrumb-link {
    color: $ocean-blue;
  }

  .breadcrumb-link.router-link-active {
    color: black;
    pointer-events: none;
  }
}
</style>

<style lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/global.scss';

html {
  height: 100%;
}

body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}


body, input, textarea {
  font-family: $font-family;
}

a {
  text-decoration: none;
}
</style>
