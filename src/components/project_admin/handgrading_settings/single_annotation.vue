<template>
  <div class="single-annotation">
    <template v-if="!d_edit_mode">
      <div class="header row">
        <span class="short-description">{{d_annotation.short_description}}</span>
        <span class="header-icons">
          <i class="fas fa-arrows-alt handle"></i>
          <i class="edit-icon fas fa-pencil-alt"
             @click="d_edit_mode = true"></i>
          <i class="delete-icon fas fa-trash-alt"
             @click="d_delete_modal_is_open = true"></i>
        </span>
      </div>
      <div class="deduction row">
        {{d_annotation.deduction}} {{d_annotation.deduction === -1 ? 'point' : 'points'}}
        <template v-if="d_annotation.max_deduction !== null">
          ({{d_annotation.max_deduction}} max)
        </template>
      </div>
      <div class="long-description"
           v-if="d_annotation.long_description !== ''">{{d_annotation.long_description}}</div>
    </template>
    <annotation-form v-else
                     ref="annotation_form"
                     :annotation="d_annotation"
                     @form_validity_changed="d_annotation_form_is_valid = $event"
                     @submit="save">
      <APIErrors ref="save_annotation_errors"></APIErrors>
      <div class="button-footer">
        <button type="submit" class="save-button"
                :disabled="d_saving || !d_annotation_form_is_valid">Save</button>
        <button type="button" class="white-button"
                @click="d_edit_mode = false">Cancel</button>
      </div>
    </annotation-form>

    <modal ref="delete_annotation_modal" size="large" click_outside_to_close
           v-if="d_delete_modal_is_open"
           @close="d_delete_modal_is_open = false">
      <div class="modal-header">Confirm Delete</div>
      Are you sure you want to delete the annotation
      "<b>{{this.d_annotation.short_description}}</b>"? <br><br>
      This will delete all associated results. <br>
      <b>THIS ACTION CANNOT BE UNDONE.</b>

      <APIErrors ref="delete_annotation_errors"></APIErrors>
      <div class="modal-button-footer button-footer-right">
        <button type="button" class="delete-button red-button"
                @click="delete_annotation"
                :disabled="d_deleting">Delete</button>
        <button type="button" class="cancel-delete-button white-button"
                @click="d_delete_modal_is_open = false">Cancel</button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { Annotation } from "ag-client-typescript";

import APIErrors from "@/components/api_errors.vue";
import Modal from "@/components/modal.vue";
import AnnotationForm, { AnnotationFormData } from "@/components/project_admin/handgrading_settings/annotation_form.vue";
import { handle_api_errors_async } from '@/error_handling';
import { deep_copy, format_datetime, safe_assign } from "@/utils";

@Component({
  components: {
    APIErrors,
    AnnotationForm,
    Modal
  }
})
export default class SingleAnnotation extends Vue {
  @Prop({type: Annotation})
  annotation!: Annotation;

  d_annotation: Annotation = new Annotation({
    pk: 0,
    handgrading_rubric: 0,
    last_modified: '',
    short_description: '',
    long_description: '',
    deduction: 0,
    max_deduction: null
  });

  d_deleting = false;
  d_delete_modal_is_open = false;

  d_edit_mode = false;
  d_saving = false;
  d_annotation_form_is_valid = false;

  readonly format_datetime = format_datetime;

  created() {
    this.d_annotation = deep_copy(this.annotation, Annotation);
  }

  @Watch('annotation')
  on_annotation_changed(new_val: Annotation, old_val: Annotation) {
    this.d_annotation = deep_copy(new_val, Annotation);
  }

  @handle_api_errors_async(handle_save_annotation_error)
  async save(form_data: AnnotationFormData) {
    try {
      this.d_saving = true;
      safe_assign(this.d_annotation, form_data);
      await this.d_annotation.save();
      this.d_edit_mode = false;
    }
    finally {
      this.d_saving = false;
    }
  }

  @handle_api_errors_async(handle_delete_annotation_error)
  async delete_annotation() {
    try {
      this.d_deleting = true;
      await this.d_annotation.delete();
      this.d_delete_modal_is_open = false;
    }
    finally {
      this.d_deleting = false;
    }
  }
}

export function handle_save_annotation_error(component: SingleAnnotation, error: unknown) {
  (<APIErrors> component.$refs.save_annotation_errors).show_errors_from_response(error);
}

export function handle_delete_annotation_error(component: SingleAnnotation, error: unknown) {
  (<APIErrors> component.$refs.delete_annotation_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.single-annotation {
  padding: .625rem .875rem;
}

.short-description {
  font-weight: bold;
}

.header-icons {
  display: flex;

  .edit-icon {
    color: darken($gray-blue-2, 15%);
  }

  .delete-icon {
    color: lighten($cherry, 10%);
  }

  .handle, .edit-icon, .delete-icon {
    padding: 0 .25rem;
  }

  .edit-icon:hover {
    color: darken($gray-blue-2, 8%);
    cursor: pointer;
  }

  .delete-icon:hover {
    color: lighten($cherry, 17%);
    cursor: pointer;
  }
}

.deduction, .long-description {
  font-size: .875rem;
}

.deduction {
  color: $navy-blue;
}

.long-description {
  padding-top: .25rem;
  white-space: pre-wrap;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: .25rem 0;
}
</style>

