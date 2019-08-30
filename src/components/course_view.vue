<template>
  <div id="project-list-component">

    <div v-if="d_loading" class="loading-spinner">
      <div> <i class="fa fa-spinner fa-pulse"></i> </div>
    </div>

    <div v-if="!d_loading">
      <div id="project-list-title"
           :style="[{paddingLeft: projects.length === 0 ? '0' : '10px'}]">
        Projects
      </div>

      <div v-if="projects.length === 0"
           id="no-projects-message">
        No projects have been published yet.
      </div>

      <table id="list-of-projects" v-else>
        <tr class="project" v-for="(project, index) of projects">
          <router-link tag="td"
                       :to="`/web/project/${project.pk}`"
                       :class="['project-name',
                                (index % 2 === 0) ? 'even-project' : 'odd-project']">
            {{project.name}}
          </router-link>

          <router-link tag="td"
                       :to="`/web/project_admin/${project.pk}`"
                       :title="'Edit ' + project.name"
                       class="edit-project"
                       v-if="is_admin">
            <i class="fas fa-cog cog"></i>
          </router-link>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Inject, Vue } from 'vue-property-decorator';

import {
  Course,
  Project,
  User
} from 'ag-client-typescript';

import { GlobalData } from '@/App.vue';

@Component
export default class CourseView extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;

  course!: Course;
  d_loading = true;
  projects: Project[] = [];

  async created() {
    this.course = await Course.get_by_pk(Number(this.$route.params.course_id));
    this.projects = await Project.get_all_from_course(this.course.pk);

    this.globals.set_current_course(this.course);
    this.d_loading = false;
  }

  get is_admin() {
    return this.globals.user_roles.is_admin;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#project-list-component {
  margin: 0 10px;
}

.loading-spinner {
  align-items: center;
  color: $ocean-blue;
  display: flex;
  font-size: 55px;
  height: 60vh;
  justify-content: center;
}

#project-list-title {
  color: lighten(black, 25);
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  padding: 20px 10px 15px 0;
}

#list-of-projects {
  border-spacing: 10px;
}

.project {
  box-sizing: border-box;
}

.project-name {
  border: 2px solid lighten(lavender, 1);
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 18px;
  padding: 10px 40px 10px 10px;
}

.edit-project {
  background-color: hsl(220, 30%, 95%);
  border: 2px solid hsl(212, 20%, 93%);
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  padding: 10.5px 12px;
  vertical-align: top;
  color: hsl(212, 50%, 27%);
}

.even-project {
  background-image: linear-gradient(to bottom right, lighten(lavender, 1), lavender);
}

.odd-project {
  background-image: linear-gradient(to bottom right, lighten(lavender, 1), lighten(lavender, 1));
}

.project-name:hover {
  border: 2px solid darken(lavender, 6);
}

.edit-project:hover {
  border: 2px solid darken(lavender, 6);
}

.cog {
  font-size: 18px;
}

@media only screen and (min-width: 481px) {
  #project-list-component {
    margin: 0 2.5%;
  }
}

</style>
