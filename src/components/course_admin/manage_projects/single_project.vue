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

    <modal v-if="d_show_clone_project_modal"
           @close="d_show_clone_project_modal = false"
           ref="clone_project_modal"
           size="large"
           click_outside_to_close>
      <span class="modal-container">
        <p class="modal-header"> Project to clone:
          <span class="project-to-clone">{{project.name}}</span>
        </p>
        <hr>
        <div>
          <div class="cloned-project-name">
            <label class="text-label"> New project name </label>
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
            <label class="text-label"> Clone project to course: </label>
            <div>
              <dropdown ref="cloning_destinations_dropdown"
                        :items="cloning_destinations"
                        :initial_highlighted_index="course_index"
                        dropdown_height="150px"
                        @update_item_selected="course_to_clone_to = $event">
                <template slot="header">
                <div tabindex="0" class="dropdown-header-wrapper">
                  <div id="input-course-to-copy-to" class="dropdown-header">
                    {{format_course_name(course_to_clone_to)}}
                    <i class="fas fa-caret-down dropdown-caret"></i>
                  </div>
                </div>
                </template>
                <div slot-scope="{item}">
                  <span>
                    {{format_course_name(item)}}
                  </span>
                </div>
              </dropdown>
            </div>
          </div>

          <APIErrors ref="api_errors"></APIErrors>

          <button @click="add_cloned_project"
                  class="clone-project-button"
                  :disabled="!cloned_project_name_is_valid">Create Project</button>
        </div>
      </span>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { Course, Project, User } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import APIErrors from "@/components/api_errors.vue";
import Dropdown from '@/components/dropdown.vue';
import Modal from '@/components/modal.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { format_course_name, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    Dropdown,
    Modal,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class SingleProject extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: false, default: false})
  odd_index!: boolean;

  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;
  readonly format_course_name = format_course_name;

  cloning_destinations: Course[] = [];
  api_errors: string[] = [];
  course_to_clone_to: Course | null = null;
  cloned_project_name: string = "";
  cloned_project_name_is_valid = false;
  d_show_clone_project_modal = false;
  course_index: number = 0;

  async created() {
    this.course_to_clone_to = this.course;
    this.cloning_destinations = await this.d_globals.current_user.courses_is_admin_for();
    this.course_index = this.cloning_destinations.findIndex(
      course => course.pk === this.course.pk);
  }

  async clone_project() {
    this.api_errors = [];
    this.cloned_project_name = "";
    this.course_to_clone_to = this.course;
    this.d_show_clone_project_modal = true;
  }

  @handle_api_errors_async(handle_add_cloned_project_error)
  async add_cloned_project() {
    this.api_errors = [];
    let new_project = await this.project.copy_to_course(
      this.course_to_clone_to!.pk, this.cloned_project_name
    );
    (<ValidatedInput> this.$refs.cloned_project_name).reset_warning_state();
    this.d_show_clone_project_modal = false;
    if (this.course_to_clone_to!.pk === this.course.pk) {
      this.$emit('add_cloned_project', new_project);
    }
  }
}

export function handle_add_cloned_project_error(component: SingleProject, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/button_styles.scss';

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
  letter-spacing: 1px;
  margin-left: 5px;
  color: $ocean-blue;
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

.clone-project-button {
  margin: 30px 0 10px 0;
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
