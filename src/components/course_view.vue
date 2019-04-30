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

      <div id="list-of-projects" v-else>
        <div id="project" v-for="project of projects">
          <router-link tag="div"
                       :to="`/web/project/${project.pk}`"
                       class="project-name">
            {{project.name}}
          </router-link>

          <router-link tag="div"
                       :to="`/web/project_admin/${project.pk}`"
                       :title="'Edit ' + project.name"
                       class="edit-project"
                       v-if="is_admin">
            <i class="fas fa-cog cog"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

import {
  Course,
  Project,
  User
} from 'ag-client-typescript';

@Component
export default class CourseView extends Vue {
  course!: Course;
  d_loading = true;
  is_admin = false;
  projects: Project[] = [];

  async created() {
    let user = await User.get_current();
    let courses_user_is_admin_for = await user.courses_is_admin_for();
    this.course = await Course.get_by_pk(Number(this.$route.params.course_id));
    let index = courses_user_is_admin_for.findIndex(course => course.pk === this.course.pk);
    if (index !== -1) {
      this.is_admin = true;
    }
    this.projects = await Project.get_all_from_course(this.course.pk);
    this.d_loading = false;
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
  padding: 20px 10px 15px 0px;
}

#project {
  border-radius: 2px;
  box-sizing: border-box;
  margin-bottom: 8px;
  padding: 0;
}

.project-name {
  background-image: linear-gradient(to bottom right, lighten(lavender, 1), lavender);
  border: 2px solid lighten(lavender, 1);
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-block;
  font-size: 18px;
  margin: 0;
  padding: 10px;
  width: 80%;
}

.edit-project {
  background-color: hsl(220, 30%, 95%);
  border: 2px solid hsl(212, 20%, 93%);
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  margin: 0 0 0 6px;
  padding: 10.5px 12px;
  vertical-align: top;
}

.project-name:hover {
  border: 2px solid darken(lavender, 6);
}

.edit-project:hover {
  border: 2px solid hsl(212, 20%, 88%);
}

.edit-project:hover .cog {
  transform: rotate(365deg);
  transition-duration: 1s;
}

.cog {
  color: hsl(212, 50%, 27%);
  font-size: 18px;
  transform: rotate(0deg);
  transition-duration: 1s;
}

@media only screen and (min-width: 481px) {
  #project-list-component {
    margin: 0 2.5%;
  }
}

@media only screen and (min-width: 1000px) {
  .project-name {
    width: 50%;
    min-width: 700px;
  }
}
</style>
