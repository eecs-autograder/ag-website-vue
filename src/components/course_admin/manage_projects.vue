<template>
  <div class="projects-container">
    <div id="project-body-container">
      <div id="new-project-side">
        <div id="new-project-space">
          <ValidatedForm id="new-project-form"
                         autocomplete="off"
                         @submit.native.prevent="add_project"
                         @form_validity_changed="project_form_is_valid = $event">
            <p id="new-project-label"> Create a New Project</p>

            <ValidatedInput ref="new_project"
                            v-model="new_project_name"
                            :validators="[is_not_empty]"
                            :num_rows="1"
                            input_style="width: 100%;
                                         max-width: 400px;
                                         border: 2px solid #ced4da;">
            </ValidatedInput>

            <!--the validated input width is off-->

            <div v-for="error of new_project_api_errors"
                 class="api-error-container">
              <div class="api-error"> {{error}} </div>
              <div class="x-box">
                  <span @click="dismiss_new_project_error"
                        class="dismiss-error">
                    Dismiss
                  </span>
              </div>
            </div>

            <input type="submit"
                   :disabled="!project_form_is_valid"
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
          <div class="copier" @click="clone_project(project)">
            <i class="far fa-copy copy-icon"></i>
            <span class="icon-label"> Clone </span>
          </div>
        </router-link>

        <modal ref="clone_project_modal"
               size="large"
               click_outside_to_close>

          <ValidatedForm id="cloning-project-form"
                         @submit.native.prevent="add_cloned_project"
                         autocomplete="off"
                         @form_validity_changed="cloning_project_form_is_valid = $event">

            <h2 v-if="project_to_copy !== null"> Project to clone: {{project_to_copy.name}} </h2>
            <hr>
            <div>
              <div v-if="project_to_copy !== null">
                <div class="cloned-project-name">
                  <label class="input-label"> New project name </label>
                  <validated-input ref="cloned_project_name_input"
                                   v-model="cloned_project_name"
                                   :validators="[is_not_empty]"
                                   :num_rows="1"
                                   input_style="width: 100%; border: 2px solid #ced4da;">
                  </validated-input>
                </div>

                <div class="cloned-project-destination">
                  <label class="input-label"> Clone project to course: </label>
                  <div class="copy-course-dropdown-wrapper">
                    <dropdown ref="copy_course_dropdown"
                              :items="cloning_destinations"
                              @update_item_selected="course_to_clone_to = $event"
                              dropdown_height="200px">
                      <template slot="header">
                        <div tabindex="1" class="input-wrapper">
                          <div id="input-course-to-copy-to"
                               class="settings-input">
                            {{course_to_clone_to.name ? course_to_clone_to.name : ""}}
                            {{course_to_clone_to.semester ? course_to_clone_to.semester : ""}}
                            {{course_to_clone_to.year ? course_to_clone_to.year : ""}}
                            <i class="fas fa-caret-down dropdown-caret"></i>
                          </div>
                        </div>
                      </template>
                      <div slot-scope="{item}">
                        <span class="course-to-copy-name">
                          {{item.name ? item.name : ""}}
                          {{item.semester ? item.semester : ""}}
                          {{item.year ? item.year : ""}}
                        </span>
                      </div>
                    </dropdown>
                  </div>
                </div>
              </div>

              <div v-for="error of api_cloning_errors"
                   class="api-error-container">
                <div class="api-error"> {{error}} </div>
                <div class="x-box">
                  <span @click="dismiss_cloning_project_error"
                        class="dismiss-error">
                    Dismiss
                  </span>
                </div>
              </div>

              <input type="submit"
                     class="clone-project-button"
                     value="Create Project"
                     :disabled="!cloning_project_form_is_valid">
            </div>

          </ValidatedForm>
        </modal>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Course, Project, User } from 'ag-client-typescript';

  import { AxiosResponse } from 'axios';

  import Dropdown from '@/components/dropdown.vue';
  import Modal from '@/components/modal.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
  import { handle_400_errors_async } from '@/utils';
  import { is_not_empty } from '@/validators';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
   components: {
     Dropdown,
     Modal,
     Tooltip,
     ValidatedForm,
     ValidatedInput
   }
  })
  export default class ManageProjects extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    private readonly _is_not_empty = is_not_empty;

    user: User | null = null;
    saving = false;
    projects: Project[] | null = null;
    new_project_name = "";
    project_form_is_valid = false;
    project_400_error_present = false;
    new_project_api_errors: string[] = [];
    api_cloning_errors: string[] = [];
    d_course!: Course;

    project_to_copy: Project | null = null;
    cloning_destinations: Course[] = [];
    course_to_clone_to: Course | null = null;
    cloned_project_name: string = "";
    cloning_project_form_is_valid = false;
    cloning_api_error_present = false;


    readonly is_not_empty = is_not_empty;

    async created() {
      this.d_course = this.course;
      this.projects = await Project.get_all_from_course(this.d_course.pk);
    }

    dismiss_new_project_error() {
      this.new_project_api_errors = [];
    }

    dismiss_cloning_project_error() {
      this.api_cloning_errors = [];
    }

    async clone_project(project: Project) {
      this.project_to_copy = project;
      if (this.user === null) {
        this.user = await User.get_current();
      }
      this.cloning_destinations = await this.user.courses_is_admin_for();
      this.course_to_clone_to = this.d_course;
      let clone_project_modal = <Modal> this.$refs.clone_project_modal;
      clone_project_modal.open();
    }

    @handle_400_errors_async(handle_add_project_error)
    async add_project() {
      this.new_project_api_errors = [];
      if (this.new_project_name === "") {
        this.new_project_api_errors.push("New project name cannot be an empty string.");
        return;
      }
      try {
        this.new_project_name.trim();
        this.saving = true;
        let new_project: Project = await Project.create(
          {name: this.new_project_name, course: this.course.pk}
        );
        let new_project_name_input = <ValidatedInput> this.$refs.new_project;
        new_project_name_input.clear();
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

    @handle_400_errors_async(handle_add_cloned_project_error)
    async add_cloned_project() {
      this.api_cloning_errors = [];
      this.cloning_api_error_present = false;
      if (this.cloned_project_name === "") {
        this.api_cloning_errors.push("Cloned project name cannot be an empty string.");
        return;
      }
      try {
        let new_project = await this.project_to_copy!.copy_to_course(
          this.course_to_clone_to!.pk, this.cloned_project_name
        );
        let clone_project_modal = <Modal> this.$refs.clone_project_modal;
        clone_project_modal.close();
        let cloned_project_name_input = <ValidatedInput> this.$refs.cloned_project_name_input;
        cloned_project_name_input.clear();
        if (this.course_to_clone_to!.pk === this.course!.pk) {
          this.projects.push(new_project);
          this.projects.sort((project_a: Project, project_b: Project) => {
            if (project_a.name <= project_b.name) {
              return -1;
            }
            return 1;
          });
        }
      }
      finally { }
    }
  }

  function handle_add_project_error(component: ManageProjects, response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors !== undefined && errors.length > 0) {
      component.new_project_api_errors = [errors[0]];
    }
  }

  function handle_add_cloned_project_error(component: ManageProjects, response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors !== undefined && errors.length > 0) {
      component.api_cloning_errors = [errors[0]];
      component.cloning_api_error_present = true;
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

  /*if you press the x, you should also get rid of the error - in the modal only*/

.x-box {
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
  max-width: 500px;
  position: relative;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px 90px 10px 10px;
  border-radius: .25rem;
  margin-top: 18px;
}

.cloned-project-name {
  padding-bottom: 16px;
  position: relative;
  display: block;
  max-width: 500px;
}

.cloned-project-destination  {
  position: relative;
  display: block;
  max-width: 500px;
}

.cloned-project-name {
  padding-top: 15px;
}

.dropdown-caret {
  position: absolute;
  right: 18px;
  top: 4px;
  font-size: 30px;
  cursor: pointer;
}

.settings-input {
  box-sizing: border-box;
  position: relative;
  display: block;
  padding: .375rem .75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.clone-project-name-input {
  width: 100%;
}

#input-course-to-copy-to {
  width: 100%;
  min-width: 250px;
}

.settings-input:focus {
  border-color: $ocean-blue;
}

.input-wrapper {
  position: relative;
  display: inline-block;
  margin: 0;
}

.input-label {
  text-align: right;
  font-size: 17px;
  margin: 5px 15px 7px 0;
  display: inline-block;
  color: $github-black-color;
  font-weight: 600;
}

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
  font-weight: 600;
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
  font-weight: 600;
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

.add-project-button, .clone-project-button {
  @extend .green-button;
  font-family: $current-lang-choice;
  text-align: center;
  display: block;
  font-size: 16px;
  padding: 20px 15px;
  margin: 10px 0 20px 0;
}

.add-project-button:disabled, .clone-project-button:disabled {
  @extend .gray-button;
}

@media only screen and (min-width: 481px) {
  .add-project-button, .add-project-button:disabled,
  .clone-project-button, .clone-project-button:disabled {
    padding: 10px 15px;
    font-family: $current-lang-choice;
    font-size: 16px;
    margin: 20px 15px 12px 0;
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
