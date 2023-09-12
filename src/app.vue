<template>
  <div id="app">
    <div id="global-error-banner" v-show="d_global_error_count !== 0">
      <APIErrors
        ref="global_errors"
        id="global-api-errors"
        @num_errors_changed="d_global_error_count = $event">
      </APIErrors>
    </div>
    <div v-if="d_loading" class="loading-fullscreen loading-large">
      <i class="fa fa-spinner fa-pulse"></i>
    </div>
    <template v-else>
      <div id="banner">
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
        <div id="right-side-icons">
          <a id="github-icon" class="icon"
              target="_blank"
              href="https://eecs-autograder.github.io/autograder.io/">
            <i class="fas fa-book"></i>
          </a>

          <a id="github-icon" class="icon"
              target="_blank"
              href="https://github.com/eecs-autograder/autograder.io">
            <i class="fab fa-github"></i>
          </a>

          <div v-if="globals.current_user === null"
               id="login-button-wrapper">
            <button @click="login"
                    type="button"
                    data-testid="login_button"
                    class="blue-button">
              Sign In
            </button>
          </div>
          <div v-else class="current-user-dropdown">
            <div class="dropdown-header">
              <span class="hello-message"><i class="fas fa-user"></i></span>
            </div>
            <div class="menu">
              <div class="greeting">Hi, {{globals.current_user.first_name}}!</div>
              <div class="signed-in-as">Signed in as:</div>
              <div class="username">{{globals.current_user.username}}</div>
              <div class="superuser-link" v-if="globals.current_user.is_superuser">
                <router-link to="/web/superusers">
                  Superuser Dashboard
                </router-link>
              </div>
              <div class="sign-out-button-wrapper">
                <button @click="logout"
                        data-testid="logout_button"
                        type="button"
                        class="flat-white-button">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="welcome" v-if="globals.current_user === null">
        <div class="welcome-text">Welcome!</div>
        <button type="button" ref="welcome_login_button" class="blue-button" @click="login">
          Sign In
        </button>
      </div>
      <template v-else>
        <router-view></router-view>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator';

import {
  Course,
  HttpClient,
  HttpError,
  Project,
  User,
  UserRoles,
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import { GlobalErrorsObserver, GlobalErrorsSubject, handle_global_errors_async } from '@/error_handling';

import { delete_all_cookies, get_cookie } from './cookie';
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
  current_user: User | null = null;
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

  @handle_global_errors_async
  async created() {
    GlobalErrorsSubject.get_instance().subscribe(this);
    try {
      // If no token is available, we want to just show the welcome
      // page and let the user click the sign in button to avoid login loops.
      if (get_cookie('token') !== null) {
        await this.login();
      }
    }
    finally {
      // If we encountered an error loading the current user,
      // we want that to be displayed.
      this.d_loading = false;
      await this.$nextTick();
    }
  }

  beforeDestroy() {
    GlobalErrorsSubject.get_instance().unsubscribe(this);
  }

  @handle_global_errors_async
  async login() {
    let auth_token = get_cookie('token');
    if (auth_token !== null) {
      HttpClient.get_instance().authenticate(auth_token);
    }

    try {
      this.globals.current_user = await User.get_current();
    }
    catch (e) {
      if (!(e instanceof HttpError) || e.status !== 401) {
        throw e;
      }
      // If logging in with the available token didn't work, delete
      // the token so that the user can start a fresh auth flow.
      // If no token is available, start the auth flow.
      if (auth_token !== null) {
        delete_all_cookies();
      }
      else {
        let oauth_url = e.headers['www-authenticate'].split('Redirect_to: ')[1];
        window_location.assign(oauth_url);
      }
    }
  }

  logout() {
    delete_all_cookies();
    this.globals.current_user = null;
  }

  handle_error(error: unknown): void {
    (<APIErrors> this.$refs.global_errors).show_errors_from_response(error);
  }
}

export let window_location = {
  assign: (url: string) => window.location.assign(url)
};

</script>

<style lang="scss" scoped>
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/global.scss';
@import '@/styles/loading.scss';
@import '@/styles/static_dropdown.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#banner {
  display: flex;
  justify-content: space-between;
  width: 100%;
  background-color: $banner-background-color;
}

$padding: .5rem;
$breadcrumb-font-size: 1.5rem;

#breadcrumbs {
  padding: $padding;
  font-size: $breadcrumb-font-size;
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

#right-side-icons {
  display: flex;
  align-items: stretch;
  padding-right: .5rem;
  padding-left: .5rem;

  .button {
    white-space: nowrap;
  }

  .icon {
    font-size: 1.3rem;
    padding: .5rem;

    &:hover {
      background-color: darken($banner-background-color, 5%);
    }
  }
}

#github-icon {
  text-decoration: none;
  color: black;
}

#login-button-wrapper {
  display: flex;
  align-items: center;
}

.current-user-dropdown {
  @include static-dropdown($open-on-hover: true, $orient-right: true);

  &:hover {
    background-color: darken($banner-background-color, 5%);
  }

  .dropdown-header {
    display: flex;
    align-items: center;

    padding: $padding;
    font-size: 1.3rem;
    height: $padding * 2 + ($breadcrumb-font-size * $line-height);

    white-space: nowrap;
    cursor: default;
  }

  .hello-message {
    display: none;

    @media only screen and (min-width: 700px) {
      display: inline-block;
      padding-right: .375rem;
    }
  }

  .menu {
    padding: .5rem;
    min-width: 250px;
  }

  .greeting {
    font-size: 1.1rem;
    margin-bottom: .5rem;
  }

  .signed-in-as {
    font-size: 1.1rem;
  }

  .username {
    font-size: 1rem;
    font-weight: bold;
  }

  .superuser-link {
    margin-top: .5rem;
  }

  .sign-out-button-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}

#welcome {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .welcome-text {
    font-size: 1.75rem;
    margin-bottom: .25rem;
  }
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
// TODO: define line height as variable

body, input, textarea {
  font-family: $font-family;
}

a {
  text-decoration: none;
}
</style>
