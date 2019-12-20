<template>
  <div v-if="d_loading" class="loading-centered loading-large">
    <div> <i class="fa fa-spinner fa-pulse"></i> </div>
  </div>
  <div v-else id="project-list-component">
    <div v-if="projects.length === 0" id="no-projects-message">
      No projects have been published yet.
    </div>

    <template v-else>
      <div class="project entity" v-for="project of projects" :key="project.pk">
        <router-link class="project-name info name"
                      :class="{'round-bottom-corners': !d_globals.user_roles.is_admin}"
                      :to="`/web/project/${project.pk}`">
          {{project.name}}
        </router-link>
        <div class="toolbox" v-if="d_globals.user_roles.is_admin">
          <router-link :to="`/web/project_admin/${project.pk}`"
                        class="edit-project tool-icon"
                        :title="'Edit ' + project.name"
                        v-if="d_globals.user_roles.is_admin">
            <i class="fas fa-cog cog"></i>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">

import { Component, Inject, Vue } from 'vue-property-decorator';

import {
  Course,
  Project,
  User
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import { handle_global_errors_async } from '@/error_handling';

@Component
export default class CourseView extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  course!: Course;
  d_loading = true;
  projects: Project[] = [];

  @handle_global_errors_async
  async created() {
    this.course = await Course.get_by_pk(Number(this.$route.params.course_id));
    this.projects = await Project.get_all_from_course(this.course.pk);

    await this.d_globals.set_current_course(this.course);
    this.d_loading = false;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/components/entity_with_toolbox.scss';
@import '@/styles/loading.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#project-list-component {
  margin: 0 .5rem;
  max-width: 350px;
}

#no-projects-message {
  padding: 1rem 0;
}

.entity {
  margin: .75rem 0;
}
</style>
