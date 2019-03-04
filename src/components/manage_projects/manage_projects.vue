<template>
  <div class="manage-projects-component">
    <div id="project-body-container">
      <div id="new-project-side">
        <div id="new-project-space">

            <p id="new-project-label"> Create a New Project</p>

            <div class="new-project-validation-wrapper">
              <ValidatedInput ref="new_project_name"
                              v-model="new_project_name"
                              :validators="[is_not_empty]"
                              :num_rows="1"
                              input_style="width: 100%;
                                         max-width: 400px;
                                         border: 2px solid #ced4da;"
                              @input_validity_changed="new_project_name_is_valid = $event">
              </ValidatedInput>
            </div>

            <div v-for="error of new_project_api_errors"
                 class="api-error-container">
              <div class="api-error">{{error}}</div>
              <button class="dismiss-error-button">
                  <span @click="new_project_api_errors = []"
                        class="dismiss-error"> Dismiss
                  </span>
              </button>
            </div>

            <button @click="add_project"
                    :disabled="!new_project_name_is_valid"
                    class="add-project-button"> Add Project </button>
        </div>
      </div>

      <div id="existing-projects-side">
        <p class="existing-projects-label"> Existing Projects </p>
        <div  v-for="(project, index) of projects"
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
  import { Course, Project } from 'ag-client-typescript';
  import { AxiosResponse } from 'axios';

  import SingleProject from '@/components/manage_projects/single_project.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';


  import { handle_400_errors_async } from '@/utils';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      SingleProject,
      Tooltip,
      ValidatedForm,
      ValidatedInput
    }
  })
  export default class ManageProjects extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    is_not_empty(value: string): ValidatorResponse {
      return {
        is_valid: value.trim() !== "",
        error_msg: "This field is required."
      };
    }

    saving = false;
    projects: Project[] = [];
    new_project_name = "";
    new_project_name_is_valid = false;
    new_project_api_errors: string[] = [];
    d_course!: Course;

    async created() {
      this.d_course = this.course;
      this.projects = await Project.get_all_from_course(this.d_course.pk);
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

    @handle_400_errors_async(handle_add_project_error)
    async add_project() {
      this.new_project_api_errors = [];
      try {
        this.new_project_name.trim();
        this.saving = true;
        let new_project: Project = await Project.create(
          {name: this.new_project_name, course: this.d_course.pk}
        );
        this.projects.push(new_project);
        this.sort_projects();
        (<ValidatedInput> this.$refs.new_project_name).clear();
      }
      finally {
        this.saving = false;
      }
    }
  }

  export function handle_add_project_error(component: ManageProjects, response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors.length > 0) {
      component.new_project_api_errors = [errors[0]];
    }
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');
$current-lang-choice: "Quicksand";
$github-black-color: #24292e;

/* ---------------- Projects Styling ---------------- */
/*if you press the x, you should also get rid of the error - in the modal only*/

.manage-projects-component {
  font-family: $current-lang-choice;
}

.new-project-validation-wrapper {
  max-width: 400px;
}

.dismiss-error-button {
  font-family: $current-lang-choice;
  font-size: 15px;
  position: absolute;
  right: 5px;
  top: 5px;
  padding: 4px 10px;
  background-color: white;
  border-radius: .25rem;
  cursor: pointer;
  border: 1px solid #f5c6cb;
}

.api-error-container {
  box-sizing: border-box;
  width: 100%;
  max-width: 400px;
  position: relative;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px 90px 10px 10px;
  border-radius: .25rem;
  margin-top: 11px;
}

#new-project-space {
  width: 90%;
  margin: 0 5%;
}

#new-project-label {
  font-size: 17px;
  margin: 0 0 11px 0;
  padding: 6px 0 0 0;
  font-weight: 600;
  color: $github-black-color;
}

.existing-projects-label {
  font-size: 17px;
  margin: 40px 0 11px 0;
  padding: 6px 0 0 0;
  font-weight: 600;
  color: $github-black-color;
}

#existing-projects-side {
  width: 90%;
  margin: 0 5% 0 5%;
}

.add-project-button {
  @extend .green-button;
}

.add-project-button:disabled {
  @extend .gray-button;
}

.add-project-button, .add-project-button:disabled {
  font-family: $current-lang-choice;
  text-align: center;
  display: block;
  font-size: 16px;
  padding: 10px 15px;
  margin: 10px 0 20px 0;
}

@media only screen and (min-width: 481px) {
  .add-project-button, .add-project-button:disabled {
    font-family: $current-lang-choice;
    margin: 10px 15px 12px 0;
    display: inline-block;
  }
}

@media only screen and (min-width: 960px) {
  #existing-projects-side {
    width: 60%;
    margin: 0;
    padding-bottom: 50px;
    display: inline-block;
    vertical-align: top;
  }

  #new-project-space {
    text-align: left;
    width: 80%;
    margin: 0 10% 0 10%;
  }

  .existing-projects-label {
    margin: 0 0 11px 0;
    padding: 6px 0 0 0;
    text-align: left;
  }

  #new-project-side {
    width: 40%;
    display: inline-block;
  }
}
</style>
