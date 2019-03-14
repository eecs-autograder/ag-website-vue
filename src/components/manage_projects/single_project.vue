<template>
  <div id="single-project-component">
    <router-link tag="div"
                 :to="`/web/project/${project.pk}`"
                 class="project-div">
      <a>
        <div :class="[odd_index ? 'odd-row' : 'even-row', 'project-submission-div']">
          <p class="project-name">{{project.name}}</p>
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

      <div class="copier"
           @click="clone_project">
        <i class="far fa-copy copy-icon"></i>
        <span class="icon-label"> Clone </span>
      </div>
    </router-link>

    <modal ref="clone_project_modal"
           size="large"
           click_outside_to_close>
      <span class="modal-container">
        <p class="modal-header"> Project to clone:
          <span class="project-to-clone">{{project.name}}</span>
        </p>
        <hr>
        <div>
          <div class="cloned-project-name">
            <label class="input-label"> New project name </label>
            <validated-input ref="cloned_project_name"
                             v-model="cloned_project_name"
                             :validators="[is_not_empty]"
                             :num_rows="1"
                             input_style="width: 100%;
                                          border: 1px solid #ced4da;"
                             @input_validity_changed="cloned_project_name_is_valid = $event">
            </validated-input>
          </div>

          <div class="cloned-project-destination">
            <label class="input-label"> Clone project to course: </label>
            <div>
              <dropdown ref="copy_course_dropdown"
                        :items="cloning_destinations"
                        @update_item_selected="course_to_clone_to = $event"
                        :initial_highlighted_index="course_index">
                <template slot="header">
                <div tabindex="1" class="dropdown-header-wrapper">
                  <div id="input-course-to-copy-to" class="dropdown-header">
                    {{course_to_clone_to.name ? course_to_clone_to.name : ""}}
                    {{course_to_clone_to.semester ? course_to_clone_to.semester : ""}}
                    {{course_to_clone_to.year ? course_to_clone_to.year : ""}}
                    <i class="fas fa-caret-down dropdown-caret"></i>
                  </div>
                </div>
                </template>
                <div slot-scope="{item}">
                  <span>
                    {{item.name ? item.name : ""}}
                    {{item.semester ? item.semester : ""}}
                    {{item.year ? item.year : ""}}
                  </span>
                </div>
              </dropdown>
            </div>
          </div>

          <div v-for="error of api_errors" class="api-error-container">
            <div class="api-error">{{error}}</div>
            <button class="dismiss-error-button"
                    type="button"
                    @click="api_errors = []">
              <span class="dismiss-error"> Dismiss
              </span>
            </button>
          </div>

          <button @click="add_cloned_project"
                  class="clone-project-button"
                  :disabled="!cloned_project_name_is_valid">Create Project</button>
        </div>
      </span>
    </modal>
  </div>
</template>

<script lang="ts">
  import { Course, Project, User } from 'ag-client-typescript';

  import { AxiosResponse } from 'axios';

  import Dropdown from '@/components/dropdown.vue';
  import Modal from '@/components/modal.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput from '@/components/validated_input.vue';
  import { handle_400_errors_async } from '@/utils';
  import { is_not_empty } from '@/validators';
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component({
    components: {
      Dropdown,
      Modal,
      Tooltip,
      ValidatedForm,
      ValidatedInput
    }
  })
  export default class SingleProject extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    @Prop({required: true, type: Array})
    existing_projects!: Project[];

    @Prop({required: false, default: false})
    odd_index!: boolean;

    @Prop({required: true, type: Project})
    project!: Project;

    @Watch('existing_projects')
    on_existing_projects_changed(new_list: Project[], old_list: Project[]) {
      this.d_projects = new_list.slice(0);
    }

    readonly is_not_empty = is_not_empty;

    d_projects: Project[] = [];
    cloning_destinations: Course[] = [];
    api_errors: string[] = [];
    course_to_clone_to: Course | null = null;
    cloned_project_name: string = "";
    cloned_project_name_is_valid = false;
    cloning_api_error_present = false;

    course_index: number = 0;

    async created() {
      this.course_to_clone_to = this.course;
      this.d_projects = this.existing_projects.slice(0);

      let user = await User.get_current();
      this.cloning_destinations = await user.courses_is_admin_for();
      this.course_index = this.cloning_destinations.findIndex(
        course => course.pk === this.course.pk);
    }

    async clone_project() {
      this.api_errors = [];
      this.cloned_project_name = "";
      this.cloning_api_error_present = false;
      this.course_to_clone_to = this.course;
      (<Modal> this.$refs.clone_project_modal).open();
    }

    @handle_400_errors_async(handle_add_cloned_project_error)
    async add_cloned_project() {
      this.api_errors = [];
      this.cloning_api_error_present = false;
      let new_project = await this.project.copy_to_course(
        this.course_to_clone_to!.pk, this.cloned_project_name
      );
      (<ValidatedInput> this.$refs.cloned_project_name).clear();
      let clone_project_modal = <Modal> this.$refs.clone_project_modal;
      clone_project_modal.close();
      if (this.course_to_clone_to!.pk === this.course.pk) {
        this.$emit('add_cloned_project', new_project);
      }
    }
  }

  export function handle_add_cloned_project_error(component: SingleProject,
                                                  response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors.length > 0) {
      component.api_errors = [errors[0]];
      component.cloning_api_error_present = true;
    }
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/course_admin.scss';

.project-div {
  display: block;
  margin: 11px 0;
  min-width: 350px;
  position: relative;
  width: 100%;
}

.project-submission-div {
  border: 2px solid lighten($pebble-dark, 10);
  border-radius: 2px;
  display: inline-block;
  min-width: 200px;
  width: 70%;
}

.project-name {
  display: inline-block;
  font-size: 17px;
  margin: 0;
  padding: 15px;
}

.project-edit-div {
  display: inline-block;
  margin-left: 10px;
  vertical-align: top;
}

.cog, .copy-icon{
  font-size: 25px;
}

.copier {
  background-color: white;
  border: 2px solid $pebble-light;
  border-radius: 2px;
  box-sizing: border-box;
  color: black;
  display: inline-block;
  height: 55px;
  margin-left: 10px;
  padding: 12px 8px;
  vertical-align: top;
}

.copier:hover {
  background-color: $ocean-blue;
  color: white;
  cursor: pointer;
}

.editor {
  background-color: white;
  border: 2px solid $pebble-light;
  border-radius: 2px;
  box-sizing: border-box;
  color: black;
  display: block;
  height: 55px;
  padding: 12px 8px;
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
    border: 2px solid $ocean-blue;
  }
}

.project-submission-div:hover {
  background-image: linear-gradient(
      to right, darken($ocean-blue, 4), $ocean-blue,
      darken($ocean-blue, 4), $ocean-blue
  );
  border: 2px solid $ocean-blue;
  color: white;
}

.icon-label {
  display: none;
}

a {
  color: black;
  text-decoration: none;
}

/* ---------------- MODAL ---------------- */

.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.project-to-clone {
  background-color: hsl(220, 20%, 85%);
  letter-spacing: 1px;
  margin-left: 5px;
}

.cloned-project-name {
  display: block;
  max-width: 500px;
  padding: 10px 0 15px 0;
  position: relative;
}

.cloned-project-destination  {
  display: block;
  max-width: 800px;
  position: relative;
}

#input-course-to-copy-to {
  min-width: 250px;
  width: 100%;
}

.api-error-container {
  width: 75%;
}

.clone-project-button {
  @extend .green-button;
}

.clone-project-button:disabled {
  @extend .gray-button;
}

.clone-project-button, .clone-project-button:disabled {
  font-size: 16px;
  margin: 32px 0 20px 0;
  padding: 10px 15px;
}

@media only screen and (min-width: 960px) {

  .project-div {
    background-color: white;
    border-radius: 2px;
    margin: 0 0 8px 0;
  }

  .project-submission-div {
    position: relative;
    max-width: 60%;
  }

  .cog, .copy-icon {
    font-size: 26px;
    margin-right: 10px;
  }

  .copier {
    margin-left: 10px;
  }

  .icon-label {
    display: inline;
  }
}
</style>
