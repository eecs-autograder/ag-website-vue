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
                            input_style="width: 100%;
                                         max-width: 400px;
                                         border: 2px solid #ced4da;">
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
              <div class="editor">
                <i class="fas fa-cog cog"></i>
                <span class="icon-label"> Edit </span>
              </div>
            </a>
          </router-link>
          <div class="copier">
            <i class="far fa-copy copy-icon"></i>
            <span class="icon-label"> Clone </span>
          </div>
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
      console.log("Add_project function called");
      console.log("Trying to add: " + this.new_project_name);
      if (this.new_project_name === "") {
        console.log("new project name is empty string");
        this.api_errors.push("New project name cannot be an empty string.");
        this.project_form_is_valid = false;
        return;
      }
      try {
        this.new_project_name.trim();
        this.saving = true;
        this.api_errors = [];
        console.log("API ERRORS: " + this.api_errors);
        let new_project: Project = await Project.create(
          {name: this.new_project_name, course: this.course.pk}
        );
        console.log("Finished creating");
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
      console.log("ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
    }
  }

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import '@/styles/button_styles.scss';
  @import url('https://fonts.googleapis.com/css?family=Montserrat');
  @import url('https://fonts.googleapis.com/css?family=Muli');

$current-lang-choice: "Muli";
$github-black-color: #24292e;

/* ---------------- Projects Styling ---------------- */

.error-ul {
  list-style-type: none; /* Remove bullets */
  padding-left: 0;
  max-width: 400px;
  width: 100%
}

.error-li:first-child {
  margin-top: -10px;
  border-top-left-radius: .25rem;
  border-top-right-radius: .25rem;
}

.error-li:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: .25rem;
  border-bottom-left-radius: .25rem;
}

.error-ul .error-li {
  box-sizing: border-box;
  word-wrap: break-word;
  position: relative;
  padding: 10px 15px;
  margin-bottom: -1px;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

#new-project-space {
  width: 90%;
  margin: 0 5%;
}

#new-project-label {
  font-size: 17px;
  margin: 0 0 12px 0;
  padding: 6px 0 0 0;
  font-weight: 800;
  color: $github-black-color;
}

#new-project-input {
  width: 70.5%;
}

#existing-projects-side {
  width: 90%;
  margin: 0 5% 0 5%;
}

.existing-projects-label {
  font-size: 17px;
  margin: 40px 0 20px 0;
  padding: 6px 0 0 0;
  font-weight: 800;
  color: $github-black-color;
}

.project-div {
  width: 100%;
  display: block;
  position: relative;
  margin: 15px 0;
  min-width: 350px;
  font-size: 16px;
}

.project-submission-div {
  border: 2px solid lighten($pebble-dark, 10);
  border-radius: 2px;
  width: 62%;
  min-width: 200px;
  display: inline-block;
  color: $github-black-color;
}

.project-name {
  display: inline-block;
  margin: 0;
  padding: 15px;
}

.project-edit-div {
  display: inline-block;
  margin-left: 2%;
  vertical-align: top;
}

.cog {
  font-size: 25px;
}

.copy-icon {
  font-size: 25px;
}

.copier {
  display: inline-block;
  padding: 10px 8px;
  color: $github-black-color;
  background-color: white;
  border: 2px solid $pebble-light;
  margin-left: 2%;
  vertical-align: top;
  border-radius: 2px;
}

.copier:hover {
  color: white;
  background-color: $ocean-blue;
  cursor: pointer;
}

.editor {
  background-color: white;
  border-radius: 2px;
  border: 2px solid $pebble-light;
  box-sizing: border-box;
  color: $github-black-color;
  display: block;
  padding: 10px 8px;
}

.editor:hover {
  background-color: darken($ocean-blue, 4);
  color: white;
}

.project-div:hover {
  .copier {
    border: 2px solid $ocean-blue;
  }
  .editor {
    border: 2px solid $ocean-blue;
  }
  .project-submission-div {
    background-image: linear-gradient(
        to right, darken($ocean-blue, 4), $ocean-blue,
        darken($ocean-blue, 4), $ocean-blue
    );
    border: 2px solid $ocean-blue;
    color: white;
  }
}

.icon-label {
  display: none;
}

a {
  text-decoration: none;
  color: black;
}

.add-project-button {
  @extend .green-button;
  font-family: $current-lang-choice;
  text-align: center;
  display: block;
  font-size: 16px;
  padding: 20px 15px;
  margin: 10px 0 20px 0;
}

.add-project-button:disabled {
  @extend .gray-button;
}

@media only screen and (min-width: 481px) {
  .add-project-button, .add-project-button:disabled {
    padding: 10px 15px;
    font-family: $current-lang-choice;
    font-size: 16px;
    margin: 0 15px 12px 0;
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
    font-size: 17px;
    margin: 0 0 12px 0;
    padding: 6px 0 0 0;
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
    display: block;
    margin: 5px 0;
  }

  .project-submission-div {
    position: relative;
    border-radius: 2px;
    display: inline-block;
    max-width: 50%;
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
    margin: 0 0 0 10px;
  }

  .editor {
    color: $github-black-color;
    display: block;
    padding: 10px 15px;
    background-color: white;
    border: 2px solid $pebble-light;
  }

  .cog {
    font-size: 26px;
    margin-right: 10px;
  }

  .copy-icon {
    font-size: 26px;
    margin-right: 10px;
  }

  .copier {
    display: inline-block;
    padding: 10px 15px;
    margin-left: 10px;
    border: 2px solid $pebble-light;
    background-color: white;
    color: $github-black-color;
  }

  .icon-label {
    display: inline;
  }
}
</style>
