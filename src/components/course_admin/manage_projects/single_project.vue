<template>
  <div id="single-project-component">
    <div class="project-wrapper entity">
      <router-link :to="`/web/project/${project.pk}`" class="project-name name info">
        {{project.name}}
      </router-link>

      <div class="toolbox">
        <div class="copy-project tool-icon" @click="clone_project">
          <i class="fas fa-copy"></i>
        </div>

        <router-link :to="`/web/project_admin/${project.pk}`" class="edit-project tool-icon">
          <i class="fas fa-cog"></i>
        </router-link>
      </div>
    </div>

    <modal v-if="d_show_clone_project_modal"
           @close="d_show_clone_project_modal = false"
           ref="clone_project_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header">
        Clone <span class="project-to-clone">"{{project.name}}"</span>
      </div>
      <div>
        <div class="cloned-project-name form-field-wrapper">
          <label class="text-label"> Name </label>
          <validated-input ref="cloned_project_name"
                           v-model="cloned_project_name"
                           :validators="[is_not_empty]"
                           :num_rows="1"
                           input_style="width: 100%"
                           @input_validity_changed="cloned_project_name_is_valid = $event">
          </validated-input>
        </div>

        <div class="form-field-wrapper">
          <label class="text-label"> Add to course: </label>
          <select-object ref="cloning_destinations_dropdown"
                         :items="cloning_destinations"
                         v-model="course_to_clone_to"
                         id_field="pk">
            <template v-slot:option-text="{item}">
              {{item.name}} {{item.semester}} {{item.year}}
            </template>
          </select-object>
        </div>

        <APIErrors ref="api_errors"></APIErrors>

        <div class="button-footer modal-button-footer">
          <button @click="add_cloned_project"
                  class="clone-project-button"
                  :disabled="!cloned_project_name_is_valid">Clone Project</button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { Course, Project, User } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import APIErrors from "@/components/api_errors.vue";
import Modal from '@/components/modal.vue';
import SelectObject from '@/components/select_object.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { format_course_name, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    Modal,
    SelectObject,
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

  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;
  readonly format_course_name = format_course_name;

  cloning_destinations: Course[] = [];
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
    this.cloned_project_name = "";
    this.course_to_clone_to = this.course;
    this.d_show_clone_project_modal = true;
  }

  @handle_api_errors_async(handle_add_cloned_project_error)
  async add_cloned_project() {
    let new_project = await this.project.copy_to_course(
      this.course_to_clone_to!.pk, this.cloned_project_name
    );
    (<ValidatedInput> this.$refs.cloned_project_name).reset_warning_state();
    this.d_show_clone_project_modal = false;
  }
}

export function handle_add_cloned_project_error(component: SingleProject, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/components/entity_with_toolbox.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ---------------- MODAL ---------------- */

.project-to-clone {
  color: $ocean-blue;
}

.cloned-project-name {
  max-width: 500px;
  margin-top: .5rem;
}

.clone-project-button {
  @extend .save-button;
}

</style>
