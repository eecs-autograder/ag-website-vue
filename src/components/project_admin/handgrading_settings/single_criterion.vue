<template>
  <div class="single-criterion">
    <template v-if="!d_edit_mode">
      <div class="header row">
        <span class="short-description">{{d_criterion.short_description}}</span>
        <span class="header-icons">
          <i class="edit-icon fas fa-pencil-alt"
             @click="d_edit_mode = true"></i>
          <i class="delete-icon fas fa-trash-alt"
             @click="d_delete_modal_is_open = true"></i>
        </span>
      </div>
      <div class="points row">
        {{d_criterion.points}} {{Math.abs(d_criterion.points) === 1 ? 'point' : 'points'}}
      </div>
      <div class="long-description"
           v-if="d_criterion.long_description !== ''">{{d_criterion.long_description}}</div>
    </template>
    <criterion-form v-else
                    ref="criterion_form"
                    :criterion="d_criterion"
                    @form_validity_changed="d_criterion_form_is_valid = $event"
                    @submit="save">
      <APIErrors ref="save_criterion_errors"></APIErrors>
      <div class="edit-criterion-form-footer">
        <button type="submit" class="save-button"
                :disabled="d_saving || !d_criterion_form_is_valid">Save</button>
        <button type="button" class="white-button"
                @click="d_edit_mode = false">Cancel</button>
      </div>
    </criterion-form>

    <modal ref="delete_criterion_modal" size="large" click_outside_to_close
           v-if="d_delete_modal_is_open"
           @close="d_delete_modal_is_open = false">
      <h2>Confirm Delete</h2>
      <div class="confirm-delete-msg">
        Are you sure you want to delete the checkbox
        <b>{{this.d_criterion.short_description}}</b>? <br>
        This will delete all associated results. <br>
        THIS ACTION CANNOT BE UNDONE.
      </div>
      <APIErrors ref="delete_criterion_errors"></APIErrors>
      <div class="delete-modal-footer">
        <button type="button" class="delete-button red-button"
                @click="delete_criterion"
                :disabled="d_deleting">Delete</button>
        <button type="button" class="cancel-delete-button white-button"
                @click="d_delete_modal_is_open = false">Cancel</button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { Criterion } from "ag-client-typescript";

import APIErrors from "@/components/api_errors.vue";
import Modal from "@/components/modal.vue";
import CriterionForm, { CriterionFormData } from "@/components/project_admin/handgrading_settings/criterion_form.vue";
import { deep_copy, format_datetime, handle_api_errors_async, safe_assign } from "@/utils";

@Component({
  components: {
    APIErrors,
    CriterionForm,
    Modal
  }
})
export default class SingleCriterion extends Vue {
  @Prop({type: Criterion})
  criterion!: Criterion;

  d_criterion: Criterion = new Criterion({
    pk: 0,
    handgrading_rubric: 0,
    last_modified: '',
    short_description: '',
    long_description: '',
    points: 0
  });

  d_deleting = false;
  d_delete_modal_is_open = false;

  d_edit_mode = false;
  d_saving = false;
  d_criterion_form_is_valid = false;

  readonly format_datetime = format_datetime;

  created() {
    this.d_criterion = deep_copy(this.criterion, Criterion);
  }

  @Watch('criterion')
  on_criterion_changed(new_val: Criterion, old_val: Criterion) {
    this.d_criterion = deep_copy(new_val, Criterion);
  }

  @handle_api_errors_async(handle_save_criterion_error)
  async save(form_data: CriterionFormData) {
    try {
      this.d_saving = true;
      safe_assign(this.d_criterion, form_data);
      await this.d_criterion.save();
      this.d_edit_mode = false;
    }
    finally {
      this.d_saving = false;
    }
  }

  @handle_api_errors_async(handle_delete_criterion_error)
  async delete_criterion() {
    try {
      this.d_deleting = true;
      await this.d_criterion.delete();
      this.d_delete_modal_is_open = false;
    }
    finally {
      this.d_deleting = false;
    }
  }
}

export function handle_save_criterion_error(component: SingleCriterion, error: unknown) {
  (<APIErrors> component.$refs.save_criterion_errors).show_errors_from_response(error);
}

export function handle_delete_criterion_error(component: SingleCriterion, error: unknown) {
  (<APIErrors> component.$refs.delete_criterion_errors).show_errors_from_response(error);
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

.single-criterion {
  padding: 10px 15px;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
}

.short-description {
  font-weight: bold;
}

.header-icons {
  display: flex;

  .edit-icon {
    margin-right: 15px;
    color: darken($gray-blue-2, 15%);
  }

  .delete-icon {
    color: lighten($cherry, 10%);
  }

  .edit-icon, .delete-icon {
    padding: 0 4px;
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

.points, .long-description {
  font-size: 14px;
}

.long-description {
  padding-top: 5px;
  white-space: pre-wrap;
}

.confirm-delete-msg {
  padding: 15px 0;
}

.delete-modal-footer {
  float: right;
}

.delete-button {
  margin-right: 8px;
}

.edit-criterion-form-footer .button {
  display: inline-block;
}

</style>

