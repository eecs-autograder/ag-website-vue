<template>
  <div id="manage-projects-component">
    <div>
      <div id="new-project-side">
        <div id="new-project-space">

          <p id="new-project-label"> Create a New Project </p>

          <div class="new-project-validation-wrapper">
            <ValidatedForm ref="new_project_form"
                           autocomplete="off"
                           spellcheck="false"
                           @submit.native.prevent="add_project">
              <ValidatedInput ref="new_project_name"
                              v-model="new_project_name"
                              :validators="[is_not_empty]"
                              :num_rows="1"
                              input_style="width: 100%;
                                           max-width: 500px;
                                           border: 1px solid #ced4da;"
                              @input_validity_changed="new_project_name_is_valid = $event">
              </ValidatedInput>

              <APIErrors ref="api_errors"></APIErrors>

              <button type="submit"
                      :disabled="!new_project_name_is_valid || d_adding_project"
                      class="add-project-button">
                Add Project
              </button>

            </ValidatedForm>
          </div>
        </div>
      </div>

      <div id="existing-projects-side">
        <p id="existing-projects-label"> Existing Projects </p>
        <div v-if="loading"
             class="loading-projects">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>
        <div v-else-if="!loading && projects.length === 0"
             class="no-projects-message">
          This course doesn't have any projects yet.
        </div>
        <div v-else v-for="(project, index) of projects"
              :key="project.pk">
          <single-project ref="single_project"
                          :course="course"
                          :existing_projects="projects"
                          :project="project"
                          :odd_index="index % 2 !== 0"
                          @add_cloned_project="add_cloned_project($event)">
          </single-project>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Project } from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import SingleProject from '@/components/course_admin/manage_projects/single_project.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    SingleProject,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class ManageProjects extends Vue {

  @Prop({required: true, type: Course})
  course!: Course;

  readonly is_not_empty = is_not_empty;

  loading = true;
  projects: Project[] = [];
  new_project_name = "";
  new_project_name_is_valid = false;
  d_course!: Course;

  d_adding_project = false;

  async created() {
    this.d_course = this.course;
    this.projects = await Project.get_all_from_course(this.d_course.pk);
    this.loading = false;
  }

  sort_projects() {
    this.projects.sort((project_a: Project, project_b: Project) => {
      if (project_a.name <= project_b.name) {
        return -1;
      }
      return 1;
    });
  }

  add_cloned_project(new_project: Project) {
    this.projects.push(new_project);
    this.sort_projects();
  }

  @handle_api_errors_async(handle_add_project_error)
  async add_project() {
    try {
      this.d_adding_project = true;
      this.new_project_name.trim();
      let new_project: Project = await Project.create(
        this.d_course.pk, {name: this.new_project_name}
      );
      this.projects.push(new_project);
      this.sort_projects();
      this.new_project_name = "";
      (<ValidatedInput> this.$refs.new_project_name).reset_warning_state();
    }
    finally {
      this.d_adding_project = false;
    }
  }
}

export function handle_add_project_error(component: ManageProjects, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/components/course_admin.scss';

.no-projects-message {
  padding: 8px 0;
}

.loading-projects {
  padding: 6px 0;
  font-size: 20px;
  color: $ocean-blue;
}

#new-project-space {
  margin: 0 5%;
  width: 90%;
}

#new-project-label, #existing-projects-label {
  font-size: $title-size;
  font-weight: 600;
}

#new-project-label {
  margin: 10px 0 8px 0;
}

.add-project-button {
  @extend .green-button;
}

.add-project-button {
  margin: 15px 0 20px 0;
}

#existing-projects-side {
  margin: 0 5%;
  width: 90%;
}

#existing-projects-label {
  margin: 40px 0 8px 0;
}

@media only screen and (min-width: 960px) {
  #manage-projects-component {
    margin: 0 2.5%;
  }

  #new-project-side {
    display: inline-block;
    width: 40%;
    max-width: 500px;
    box-sizing: border-box;
    padding-right: 10px;
  }

  #new-project-space {
    margin: 0;
  }

  #existing-projects-side {
    display: inline-block;
    margin: 0;
    vertical-align: top;
    width: 60%;
  }

  #existing-projects-label {
    margin: 10px 0 12px 0;
  }
}
</style>
