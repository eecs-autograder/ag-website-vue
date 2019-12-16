<template>
  <div id="manage-projects-component">
    <div id="new-project-label"> Create a New Project </div>

    <div class="new-project-validation-wrapper">
      <validated-form ref="new_project_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="add_project">
        <validated-input ref="new_project_name"
                         v-model="new_project_name"
                         :validators="[is_not_empty]"
                         :num_rows="1"
                         input_style="width: 100%;
                                      max-width: 500px;
                                      border: 1px solid #ced4da;"
                         @input_validity_changed="new_project_name_is_valid = $event">
        </validated-input>

        <APIErrors ref="api_errors"></APIErrors>

        <div class="button-footer">
          <button type="submit"
                  :disabled="!new_project_name_is_valid || d_adding_project"
                  class="save-button add-project-button">
            Add Project
          </button>
        </div>
      </validated-form>
    </div>

    <div v-if="loading" class="loading-wrapper loading-medium">
      <i class="loading-centered fa fa-spinner fa-pulse"></i>
    </div>
    <div v-else-if="!loading && projects.length === 0"
          class="no-projects-message">
      This course has no projects.
    </div>
    <single-project v-else v-for="(project, index) of projects"
                    :key="project.pk"
                    ref="single_project"
                    class="project"
                    :course="course"
                    :project="project">
    </single-project>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Project, ProjectObserver } from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import SingleProject from '@/components/course_admin/manage_projects/single_project.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { BeforeDestroy, Created } from '@/lifecycle';
import { handle_api_errors_async, toggle } from '@/utils';
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
export default class ManageProjects extends Vue implements ProjectObserver,
                                                           Created, BeforeDestroy {
  @Prop({required: true, type: Course})
  course!: Course;

  readonly is_not_empty = is_not_empty;

  loading = true;
  projects: Project[] = [];
  new_project_name = "";
  new_project_name_is_valid = false;

  d_adding_project = false;

  async created() {
    this.projects = await Project.get_all_from_course(this.course.pk);
    this.loading = false;
    Project.subscribe(this);
  }

  beforeDestroy() {
    Project.unsubscribe(this);
  }

  sort_projects() {
    this.projects.sort((first, second) => first.name.localeCompare(second.name));
  }

  @handle_api_errors_async(handle_add_project_error)
  add_project() {
    return toggle(this, 'd_adding_project', async () => {
      this.d_adding_project = true;
      this.new_project_name.trim();
      let new_project: Project = await Project.create(
        this.course.pk, {name: this.new_project_name}
      );
      this.new_project_name = "";
      this.$nextTick(() => {
        (<ValidatedForm> this.$refs.new_project_form).reset_warning_state();
      });
    });
  }

  update_project_created(new_project: Project) {
    if (new_project.course === this.course.pk) {
      this.projects.push(new_project);
      this.sort_projects();
    }
  }

  update_project_changed(project: Project): void {
  }
}

export function handle_add_project_error(component: ManageProjects, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.loading-wrapper {
  margin-top: 2rem;
}

.no-projects-message {
  padding: .5rem 0;
  color: darken($stormy-gray-dark, 10%);
}

#manage-projects-component {
  max-width: 350px;
}

#new-project-label {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: .5rem;
}

.project {
  margin-bottom: .75rem;
}

</style>
