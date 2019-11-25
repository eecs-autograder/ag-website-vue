<template>
  <div v-if="d_loading" class="loading-large">
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

@Component
export default class CourseView extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  course!: Course;
  d_loading = true;
  projects: Project[] = [];


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

// #project-list-title {
//   color: lighten(black, 25);
//   font-size: 22px;
//   font-weight: bold;
//   margin: 0;
//   padding: 20px 10px 15px 0;
// }

// #list-of-projects {
  // border-spacing: 10px;
  // border-spacing: 0;
  // border-collapse: collapse;
// }

// .project-row {
//   // box-sizing: border-box;
//   font-size: 1.25rem;
// }

// .project-cell {
//   padding: .125rem;

//   &:hover {
//     font-weight: bold;
//   }
// }

// $border-radius: 3px;

// .name-cell {
//   background-color: $gray-blue-1;

//   // border: 2px solid lighten(lavender, 1);
//   border-top-left-radius: $border-radius;
//   border-bottom-left-radius: $border-radius;

// }


// .project-name {
//   color: $dark-blue;

//   // padding: 10px 40px 10px 10px;
// }

// .edit-project {
//   background-color: hsl(212, 60%, 94%);

//   // background-color: hsl(220, 30%, 95%);
//   // border: 2px solid hsl(212, 20%, 93%);
//   // border-radius: 4px;
//   border-top-right-radius: $border-radius;
//   border-bottom-right-radius: $border-radius;

//   // cursor: pointer;
//   // display: inline-block;
//   // padding: 10.5px 12px;
//   // vertical-align: top;
//   color: hsl(212, 50%, 27%);
// }

// .even-project {
//   background-image: linear-gradient(to bottom right, lighten(lavender, 1), lavender);
// }

// .odd-project {
//   background-image: linear-gradient(to bottom right, lighten(lavender, 1), lighten(lavender, 1));
// }

// .project-name:hover {
//   border: 2px solid darken(lavender, 6);
// }

// .edit-project:hover {
//   border: 2px solid darken(lavender, 6);
// }

// .cog {
//   font-size: 1.125rem;
//   // font-size: 18px;
// }

// @media only screen and (min-width: 481px) {
//   #project-list-component {
//     margin: 0 2.5%;
//   }
// }

</style>
