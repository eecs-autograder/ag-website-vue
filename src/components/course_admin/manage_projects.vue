<template>
  <div class="projects-container">
    <div id="project-body-container">

      <div id="new-project-side">
        <div id="new-project-space">
          <ValidatedForm id="new-project-form"
                         @submit.prevent="add_project"
                         autocomplete="off"
                         @submit.native.prevent="add_project"
                         @form_validity_changed="project_form_is_valid = $event">
            <p id="new-project-label"> Create a New Project</p>

            <ValidatedInput ref="new_project"
                            v-model="new_project_name"
                            :validators="[]"
                            :num_rows="1"
                            input_style="width: 100%; max-width: 400px;">
            </ValidatedInput>

            <ul class="error-ul">
              <li v-for="error of api_errors" class="error-li">{{error}}</li>
            </ul>

            <input type="submit"
                   :disabled="!project_form_is_valid || project_400_error_present"
                   value="Add Project"
                   class="add-project-button">
          </ValidatedForm>
        </div>
      </div>

      <div id="existing-projects-side">
        <p class="existing-projects-label"> Existing Projects </p>

        <router-link tag="div"
                     :to="`/web/project/${project.pk}`"
                     v-for="(project, index) of projects"
                     class="project-div">
          <a>
            <div :class="[index % 2 ? 'odd-row' : 'even-row', 'project-submission-div']">
              <p class="project-name"> {{project.name}} </p>
            </div>
          </a>
          <router-link tag="div"
                       :to="`/web/project_admin/${project.pk}`"
                       class="project-edit-div">
            <a>
              <div class="edit-project-settings-button"> Edit Project Settings </div>
            </a>
          </router-link>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
  import { Course, Project } from 'ag-client-typescript';

  import { AxiosResponse } from 'axios';

  import Dropdown from '@/components/dropdown.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
  import { handle_400_errors_async } from '@/utils';
  import { is_not_empty } from '@/validators';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
   components: {
     Dropdown,
     Tooltip,
     ValidatedForm,
     ValidatedInput
   }
  })
  export default class ManageProjects extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    private readonly _is_not_empty = is_not_empty;

    saving = false;
    projects: Project[] | null = null;
    new_project_name = "";
    project_form_is_valid = false;
    project_400_error_present = false;
    api_errors: string[] = [];
    d_course!: Course;

    async created() {
      this.projects = await Project.get_all_from_course(this.course.pk);
      this.d_course = this.course;
    }

    @handle_400_errors_async(handle_add_project_error)
    async add_project() {
      if (this.new_project_name === "") {
        this.api_errors.push("New project name cannot be an empty string.");
        this.project_form_is_valid = false;
        return;
      }
      try {
        this.new_project_name.trim();
        this.saving = true;
        this.api_errors = [];
        let new_project: Project = await Project.create(
          {name: this.new_project_name, course: this.course.pk}
        );
        this.new_project_name = "";
        this.projects!.push(new_project);
        this.projects!.sort((project_a: Project, project_b: Project) => {
          if (project_a.name <= project_b.name) {
            return -1;
          }
          return 1;
        });
      }
      finally {
        this.saving = false;
      }
    }
  }

  function handle_add_project_error(component: ManageProjects, response: AxiosResponse) {
    let errors = response.data["__all__"];

    if (errors !== undefined && errors.length > 0) {
      component.api_errors = [errors[0]];
    }
  }

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import '@/styles/button_styles.scss';
  @import url('https://fonts.googleapis.com/css?family=Montserrat');
  @import url('https://fonts.googleapis.com/css?family=Muli');

  $current-lang-choice: "Muli";
  //$current-lang-choice: "Montserrat";

  /* ---------------- Projects Styling ---------------- */

  #project-body-container {
    /*margin: 10px 0;*/
  }

  #new-project-space {
    width: 80%;
    margin: 0 10%;
  }

  #new-project-label {
    font-size: 20px;
    margin: 0 0 12px 0;
    padding: 0 0 0 0;
    font-weight: 800;
  }

  #new-project-input {
    width: 70.5%;
  }

  .add-project-button {
    @extend .green-button;
    font-family: $current-lang-choice;
  }

  .add-project-button:disabled {
    @extend .gray-button;
  }

  #existing-projects-side {
    width: 80%;
    margin: 0 10% 0 10%;
  }

  .existing-projects-label {
    font-size: 20px;
    margin: 40px 0 20px 0;
    padding: 6px 0 0 0;
    font-weight: 800;
  }

  .project-div {
    background-color: white;
    border-radius: 2px;
    width: 100%;
    max-width: 590px;
    display: block;
    margin: 10px 0;
  }

  .project-submission-div {
    width: 100%;
    position: relative;
    border-radius: 2px;
    display: inline-block;
  }

  .project-name {
    padding: 15px;
    margin: 0;
    display: inline-block;
  }

  .project-edit-div {
    display: block;
    vertical-align: top;
    width: 100%;
    background-color: white;
  }

  .edit-project-settings-button {
    background-color: hotpink;
    padding: 15px;
    text-align: center;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    color: black;
    display: none;
    box-sizing: border-box;
  }

  .edit-project-settings-button:hover {
    background-color: darken(hotpink, 4);
  }

  .project-div:hover {
    .edit-project-settings-button {
      display: block;
      margin-bottom: 20px;
    }
    .project-submission-div {
    }
  }

  a {
    text-decoration: none;
    color: black;
  }

  @media only screen and (min-width: 960px) {

    #existing-projects-side {
      width: 60%;
      margin: 0;
      display: inline-block;
      vertical-align: top;
    }

    #new-project-space {
      text-align: left;
    }

    .existing-projects-label {
      font-size: 20px;
      margin: 0 0 12px 0;
      padding: 0 0 0 0;
      text-align: left;
    }

    #new-project-side {
      width: 40%;
      display: inline-block;
    }

    .project-div {
      background-color: white;
      border-radius: 2px;
      width: 100%;
      max-width: 590px;
      display: block;
      margin: 5px 0;
    }

    .project-submission-div {
      width: 100%;
      max-width: 350px;
      position: relative;
      border-radius: 2px;
      display: inline-block;
      border: 2px solid lighten($pebble-dark, 10);
    }

    .project-name {
      padding: 15px;
      margin: 0;
      display: inline-block;
    }

    .project-edit-div {
      display: inline-block;
      vertical-align: top;
      width: 220px;
    }

    .edit-project-settings-button {
      padding: 15px;
      margin-left: 15px;
      border-radius: 3px;
      color: black;
      display: none;
      background-color: white;
    }

    .edit-project-settings-button:hover {
      background-color: $pebble-light;
    }

    .project-div:hover {
      .edit-project-settings-button {
        display: block;
        border: 2px solid hotpink;
        margin-bottom: 0;
      }

      .project-submission-div {
        background-image: linear-gradient(
            to right, darken(hotpink, 2), hotpink, darken(hotpink, 2), hotpink
        );
        border: 2px solid hotpink;
        color: white;
      }
    }
  }
</style>
