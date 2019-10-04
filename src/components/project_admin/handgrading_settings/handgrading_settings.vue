<template>
  <div v-if="d_loading"
       class="loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else
       id="handgrading-settings-component">
    <div v-if="d_handgrading_rubric === null"
         id="create-rubric">
      <div id="new-rubric-button-container" class="create-rubric-column">
        <h3>Start from scratch</h3>
        <button type="button"
                class="green-button"
                id="new-rubric-button"
                @click="create_new_rubric"
                :disabled="d_new_rubric_request_pending">
          <i v-if="d_new_rubric_request_pending" class="fa fa-spinner fa-pulse"></i>
          <template v-else>New Handgrading Rubric</template>
        </button>
      </div>
      <div id="import-rubric-container" class="create-rubric-column">
        <h3>Import a rubric</h3>
        <div id="import-flow-container">
          <div id="select-import-from-course" class="select-container">
            <div v-if="d_courses_is_admin_for === null" class="loading">
              <i class="fa fa-spinner fa-pulse"></i>
            </div>
            <template v-else>
              <div><label class="text-label">Course</label></div>
              <select-object :items="d_courses_is_admin_for"
                             ref="course_to_import_from"
                             v-model="d_course_to_import_from"
                             @change="load_projects_to_import_from"
                             id_field="pk">
                <template v-slot:option-text="{item}">
                  {{item.name}} {{item.semester}} {{item.year}}
                </template>
              </select-object>
            </template>
          </div>
          <div id="select-import-from-project" class="select-container">
            <div v-if="d_course_to_import_from !== null">
              <label class="text-label">Project</label>
            </div>
            <div v-if="d_loading_projects" class="loading">
              <i class="fa fa-spinner fa-pulse"></i>
            </div>
            <template v-else-if="d_selected_course_projects !== null">
              <select class="select"
                      ref="project_pk_to_import_from"
                      @change="d_project_pk_to_import_from = parseInt($event.target.value, 10)">
                <option selected disabled>-- Select a Project --</option>
                <option v-for="project of d_selected_course_projects"
                        :key="project.pk"
                        :value="project.pk">
                  {{project.name}}
                </option>
              </select>
            </template>
          </div>
          <div id="import-button-container">
            <button type="button"
                    class="green-button"
                    :disabled="d_project_pk_to_import_from === null"
                    @click="import_rubric">
              <i v-if="d_import_request_pending" class="fa fa-spinner fa-pulse"></i>
              <template v-else>Import</template>
            </button>
          </div>
        </div>
      </div>
    </div>
    <template v-else>
      <div id="rubric-columns-container">
        <div id="settings-column" class="edit-rubric-column">
          <div class="column-header">
            <div class="header-text">Settings</div>
          </div>
          <validated-form ref="handgrading_settings_form"
                          autocomplete="off"
                          spellcheck="false"
                          @submit="save_rubric_settings"
                          @form_validity_changed="d_settings_form_is_valid = $event">

            <div class="checkbox-input-container">
              <input id="publish-grades"
                     class="checkbox"
                     type="checkbox"
                     v-model="d_handgrading_rubric.show_grades_and_rubric_to_students"/>
              <label for="publish-grades" class="checkbox-label">Publish grades and rubric</label>
            </div>

            <div class="form-spacing">
              <label for="points-style" class="text-label">Points style</label> <br>
              <select v-model="d_handgrading_rubric.points_style"
                      id="points-style"
                      class="select">
                <option :value="PointsStyle.start_at_zero_and_add">
                  Start at 0 and add
                </option>
                <option :value="PointsStyle.start_at_max_and_subtract">
                  Start at max and subtract
                </option>
              </select>
            </div>

            <div id="max-points-container" class="form-spacing">
              <label class="text-label">
                {{d_handgrading_rubric.points_style === PointsStyle.start_at_max_and_subtract
                    ? 'Max points' : 'Override max points'}}
              </label>

              <validated-input
                id="max-points"
                ref="max_points"
                v-model="d_handgrading_rubric.max_points"
                input_style="width: 150px;"
                :validators="max_points_validators"
                :to_string_fn="(num) => num === null ? '' : num.toString()"
                :from_string_fn="(val) => val.trim() === '' ? null : Number(val)">
              </validated-input>
            </div>

            <div class="checkbox-input-container">
              <input id="handgraders-can-leave-comments"
                     class="checkbox"
                     type="checkbox"
                     v-model="d_handgrading_rubric.handgraders_can_leave_comments"/>
              <label for="handgraders-can-leave-comments"
                     class="checkbox-label">Handgraders can leave comments</label>
            </div>

            <div class="checkbox-input-container">
              <input id="handgraders-can-adjust-points"
                     class="checkbox"
                     type="checkbox"
                     v-model="d_handgrading_rubric.handgraders_can_adjust_points"/>
              <label for="handgraders-can-adjust-points"
                     class="checkbox-label">Handgraders can adjust_points</label>
            </div>

            <div class="footer">
              <APIErrors ref="settings_form_errors"></APIErrors>

              <button class="save-button"
                      ref="save_rubric_button"
                      type="submit"
                      :disabled="!d_settings_form_is_valid || d_saving">Save</button>
              <span v-if="d_saving" class="saving-spinner">
                <i class="fa fa-spinner fa-pulse"></i>
              </span>
              <div v-else class="last-saved-timestamp">
                <span> Last Saved: </span> {{format_datetime(d_handgrading_rubric.last_modified)}}
              </div>
            </div>
          </validated-form>
        </div>

        <div id="criteria-column" class="edit-rubric-column">
          <div class="column-header">
            <div class="header-text">Checkboxes</div>
            <button type="button" class="flat-white-button"
                    @click="d_create_criterion_modal_is_open = true">
              <i class="fas fa-plus"></i> New Checkbox
            </button>
          </div>
          <draggable v-model="d_handgrading_rubric.criteria"
                     @change="set_criteria_order"
                     handle=".handle" ghost-class="ghost">
            <single-criterion v-for="(criterion, index) of d_handgrading_rubric.criteria"
                              :key="criterion.pk"
                              :class="{'criterion-border': index !== 0}"
                              :criterion="criterion"></single-criterion>
          </draggable>
        </div>

        <div id="annotations-column" class="edit-rubric-column">
          <div class="column-header">
            <div class="header-text">Annotations</div>
            <button type="button" class="flat-white-button"
                    @click="d_create_annotation_modal_is_open = true">
              <i class="fas fa-plus"></i> New Annotation
            </button>
          </div>
          <draggable v-model="d_handgrading_rubric.annotations"
                     @change="set_annotations_order"
                     handle=".handle" ghost-class="ghost">
            <single-annotation v-for="(annotation, index) of d_handgrading_rubric.annotations"
                               :key="annotation.pk"
                               :class="{'criterion-border': index !== 0}"
                               :annotation="annotation"></single-annotation>
          </draggable>
        </div>
      </div>
    </template>

    <modal ref="create_criterion_modal" size="large" click_outside_to_close
           v-if="d_create_criterion_modal_is_open"
           @close="d_create_criterion_modal_is_open = false">
      <h2>New Checkbox</h2>
      <criterion-form @submit="create_criterion"
                      @form_validity_changed="d_create_criterion_form_is_valid = $event"
                      ref="create_criterion_form">
        <APIErrors ref="create_criterion_errors"></APIErrors>
        <div class="multi-button-form-footer">
          <button type="submit" class="save-button"
                  ref="create_criterion_button"
                  :disabled="d_creating_criterion
                             || !d_create_criterion_form_is_valid">Create</button>
          <button type="button" class="white-button"
                  @click="d_create_criterion_modal_is_open = false">Cancel</button>
        </div>
      </criterion-form>
    </modal>

    <modal ref="create_annotation_modal" size="large" click_outside_to_close
           v-if="d_create_annotation_modal_is_open"
           @close="d_create_annotation_modal_is_open = false">
      <h2>New Annotation</h2>
      <annotation-form @submit="create_annotation"
                       @form_validity_changed="d_create_annotation_form_is_valid = $event"
                       ref="create_annotation_form">
        <APIErrors ref="create_annotation_errors"></APIErrors>
        <div class="multi-button-form-footer">
          <button type="submit" class="save-button"
                  ref="create_annotation_button"
                  :disabled="d_creating_annotation
                             || !d_create_annotation_form_is_valid">Create</button>
          <button type="button" class="white-button"
                  @click="d_create_annotation_modal_is_open = false">Cancel</button>
        </div>
      </annotation-form>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

import {
  Annotation,
  AnnotationObserver,
  Course,
  Criterion,
  CriterionObserver,
  HandgradingRubric,
  PointsStyle,
  Project,
} from "ag-client-typescript";

import { GlobalData } from '@/app.vue';
import APIErrors from '@/components/api_errors.vue';
import Modal from "@/components/modal.vue";
import AnnotationForm, { AnnotationFormData } from "@/components/project_admin/handgrading_settings/annotation_form.vue";
import { CriterionFormData } from "@/components/project_admin/handgrading_settings/criterion_form.vue";
import SingleAnnotation from "@/components/project_admin/handgrading_settings/single_annotation.vue";
import SingleCriterion from "@/components/project_admin/handgrading_settings/single_criterion.vue";
import SelectObject from '@/components/select_object.vue';
import Toggle from '@/components/toggle.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { Created, Destroyed, Mounted } from "@/lifecycle";
import { assert_not_null, deep_copy, format_datetime, handle_api_errors_async } from "@/utils";
import {
  is_integer,
  is_not_empty,
  is_number,
  make_max_value_validator,
  make_min_value_validator,
  string_to_num,
} from '@/validators';

import CriterionForm from './criterion_form.vue';

@Component({
  components: {
    AnnotationForm,
    APIErrors,
    CriterionForm,
    Draggable,
    Modal,
    SelectObject,
    SingleAnnotation,
    SingleCriterion,
    Toggle,
    Tooltip,
    ValidatedForm,
    ValidatedInput,
  }
})
export default class HandgradingSettings extends Vue implements Created,
                                                                Destroyed,
                                                                AnnotationObserver,
                                                                CriterionObserver {
  @Inject({from: 'globals'})
  globals!: GlobalData;

  @Prop({required: true, type: Project})
  project!: Project;

  d_handgrading_rubric: HandgradingRubric | null = null;

  d_courses_is_admin_for: Course[] | null = null;
  d_course_to_import_from: Course | null = null;
  // When we select a course to import from, we'll load
  // that course's projects and store them here.
  d_selected_course_projects: Project[] | null = null;
  d_loading_projects: boolean = false;
  d_project_pk_to_import_from: number | null = null;
  d_new_rubric_request_pending = false;
  d_import_request_pending = false;

  d_override_max_points = false;

  private d_loading = true;
  private d_mounted = false;
  d_saving = false;
  d_settings_form_is_valid = false;
  d_creating_criterion = false;
  d_create_criterion_form_is_valid = false;
  d_create_criterion_modal_is_open = false;

  d_creating_annotation = false;
  d_create_annotation_form_is_valid = false;
  d_create_annotation_modal_is_open = false;

  readonly is_not_empty = is_not_empty;
  readonly is_number = is_number;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;
  readonly is_positive = make_min_value_validator(1);
  readonly is_non_positive = make_max_value_validator(0);
  readonly is_positive_or_empty = make_min_value_validator(1, true);

  get max_points_validators() {
    return [(value: string) => {
      assert_not_null(this.d_handgrading_rubric);

      let validators = [this.is_positive_or_empty];
      if (this.d_handgrading_rubric!.points_style === PointsStyle.start_at_max_and_subtract) {
        validators = [is_not_empty, is_integer, this.is_positive];
      }

      for (let validator of validators) {
        let result = validator(value);
        if (!result.is_valid) {
          return result;
        }
      }

      return {is_valid: true, error_msg: ''};
    }];
  }

  readonly format_datetime = format_datetime;

  readonly PointsStyle = PointsStyle;

  async created() {
    Criterion.subscribe(this);
    Annotation.subscribe(this);

    if (this.project.has_handgrading_rubric) {
      this.d_handgrading_rubric = await HandgradingRubric.get_from_project(this.project.pk);
    }
    else {
      this.d_courses_is_admin_for = await this.globals.current_user.courses_is_admin_for();
      let current_course = this.d_courses_is_admin_for.find(
        course => course.pk === this.project.course);
      assert_not_null(current_course);
      this.d_course_to_import_from = current_course!;
      await this.load_projects_to_import_from(this.d_course_to_import_from);
    }

    this.d_loading = false;
  }

  destroyed() {
    Annotation.unsubscribe(this);
    Criterion.unsubscribe(this);
  }

  @Watch('d_handgrading_rubric.points_style')
  on_points_style_changed() {
    let max_points_input = this.$refs.max_points;
    if (max_points_input !== undefined) {
      (<ValidatedInput> max_points_input).rerun_validators();
    }
  }

  async create_new_rubric() {
    try {
      this.d_new_rubric_request_pending = true;
      this.d_handgrading_rubric = await HandgradingRubric.create(this.project.pk, {});
    }
    finally {
      this.d_new_rubric_request_pending = false;
    }
  }

  async load_projects_to_import_from(course: Course) {
    this.d_project_pk_to_import_from = null;
    try {
      this.d_loading_projects = true;
      let projects = await Project.get_all_from_course(course.pk);
      this.d_selected_course_projects = projects.filter(
        (project) => project.has_handgrading_rubric);
    }
    finally {
      this.d_loading_projects = false;
    }
  }

  async import_rubric() {
    if (assert_not_null(this.d_project_pk_to_import_from)) {
      try {
        this.d_import_request_pending = true;
        this.d_handgrading_rubric = await HandgradingRubric.import_from_project(
          this.project.pk, this.d_project_pk_to_import_from);
      }
      finally {
        this.d_import_request_pending = false;
      }
    }
  }

  @handle_api_errors_async(handle_save_rubric_settings_error)
  async save_rubric_settings() {
    try {
      this.d_saving = true;
      (<APIErrors> this.$refs.settings_form_errors).clear();

      if (assert_not_null(this.d_handgrading_rubric)) {
        await this.d_handgrading_rubric.save();
      }
    }
    finally {
      this.d_saving = false;
    }
  }

  // ----------------------------------------------------------------------------------------------

  @handle_api_errors_async(handle_create_criterion_error)
  async create_criterion(form_data: CriterionFormData) {
    try {
      this.d_creating_criterion = true;
      (<APIErrors> this.$refs.create_criterion_errors).clear();

      assert_not_null(this.d_handgrading_rubric);
      await Criterion.create(this.d_handgrading_rubric!.pk, form_data);

      this.d_create_criterion_modal_is_open = false;
    }
    finally {
      this.d_creating_criterion = false;
    }
  }

  set_criteria_order() {
    return Criterion.update_order(
      this.d_handgrading_rubric!.pk,
      this.d_handgrading_rubric!.criteria.map(criterion => criterion.pk)
    );
  }

  update_criteria_order_changed(criterion_list: number[], handgrading_rubric_pk: number): void {
  }

  update_criterion_changed(criterion: Criterion): void {
    if (this.d_handgrading_rubric !== null) {
      let index = this.d_handgrading_rubric.criteria.findIndex((item) => item.pk === criterion.pk);
      if (index !== -1) {
        Vue.set(this.d_handgrading_rubric.criteria, index, deep_copy(criterion, Criterion));
      }
    }
  }

  update_criterion_created(criterion: Criterion): void {
    if (this.d_handgrading_rubric !== null) {
      this.d_handgrading_rubric.criteria.push(criterion);
    }
  }

  update_criterion_deleted(criterion: Criterion): void {
    if (this.d_handgrading_rubric !== null) {
      let index = this.d_handgrading_rubric.criteria.findIndex((item) => item.pk === criterion.pk);
      if (index !== -1) {
        this.d_handgrading_rubric.criteria.splice(index, 1);
      }
    }
  }

  // ----------------------------------------------------------------------------------------------

  @handle_api_errors_async(handle_create_annotation_error)
  async create_annotation(form_data: AnnotationFormData) {
    try {
      this.d_creating_annotation = true;
      (<APIErrors> this.$refs.create_annotation_errors).clear();

      assert_not_null(this.d_handgrading_rubric);
      await Annotation.create(this.d_handgrading_rubric!.pk, form_data);

      this.d_create_annotation_modal_is_open = false;
    }
    finally {
      this.d_creating_annotation = false;
    }
  }

  set_annotations_order() {
    return Annotation.update_order(
      this.d_handgrading_rubric!.pk,
      this.d_handgrading_rubric!.annotations.map(annotation => annotation.pk)
    );
  }

  update_annotations_order_changed(annotation_list: number[],
                                   handgrading_rubric_pk: number): void {
  }

  update_annotation_changed(annotation: Annotation): void {
    if (this.d_handgrading_rubric !== null) {
      let index = this.d_handgrading_rubric.annotations.findIndex(
        (item) => item.pk === annotation.pk);
      if (index !== -1) {
        Vue.set(this.d_handgrading_rubric.annotations, index, deep_copy(annotation, Annotation));
      }
    }
  }

  update_annotation_created(annotation: Annotation): void {
    if (this.d_handgrading_rubric !== null) {
      this.d_handgrading_rubric.annotations.push(annotation);
    }
  }

  update_annotation_deleted(annotation: Annotation): void {
    if (this.d_handgrading_rubric !== null) {
      let index = this.d_handgrading_rubric.annotations.findIndex(
        (item) => item.pk === annotation.pk);
      if (index !== -1) {
        this.d_handgrading_rubric.annotations.splice(index, 1);
      }
    }
  }
}

export function handle_save_rubric_settings_error(component: HandgradingSettings, error: unknown) {
  (<APIErrors> component.$refs.settings_form_errors).show_errors_from_response(error);
}

export function handle_create_criterion_error(component: HandgradingSettings, error: unknown) {
  (<APIErrors> component.$refs.create_criterion_errors).show_errors_from_response(error);
}

export function handle_create_annotation_error(component: HandgradingSettings, error: unknown) {
  (<APIErrors> component.$refs.create_annotation_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/global.scss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#handgrading-settings-component {
  height: 100%;
}

#create-rubric {
  display: flex;
  height: 100%;
  min-width: 460px;
  max-width: 750px;
}

.create-rubric-column {
  height: 100%;
  flex-grow: 1;
  padding-top: 25px;
  padding-left: 25px;

  h3 {
    margin-bottom: 15px;
  }
}

#select-import-from-project .loading {
  margin-top: 10px;
}

.select-container {
  margin: 10px 0;
  max-width: 200px;
}

// ------------------------------------------------------------------------------------------------

#rubric-columns-container {
  display: flex;
  padding: 0 10px;
  flex-wrap: wrap;
}

.edit-rubric-column {
  padding: 20px 10px;
  width: 100%;
  max-width: 600px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-text {
    margin: 0;
    display: inline-block;
    font-size: 18px;
    font-weight: bold;
    padding: 10px 0;
  }
}

#criteria-column {
  padding-right: 15px;
}

.form-spacing {
  margin: 15px 0;
}

.divider, .criterion-border {
  border-top: 1px solid $pebble-medium;
}

@media only screen and (min-width: 900px) {
  #rubric-columns-container {
      flex-wrap: nowrap;
  }

  .edit-rubric-column {
      flex-grow: 1;
      max-width: 400px;
  }

  #settings-column {
    max-width: 320px;
  }

  #criteria-column {
    border-left: 1px solid $pebble-dark;
    border-right: 1px solid $pebble-dark;
  }
}

.multi-button-form-footer button {
  display: inline-block;
}

.ghost {
  opacity: 0.5;
  background-color: #c8ebfb;
}

</style>
