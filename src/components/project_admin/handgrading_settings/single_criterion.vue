<template>
  <div class="rubric-item">
    <template v-if="!d_edit_mode">
      <div class="header row">
        <span class="short-description">{{
          d_criterion.short_description
        }}</span>
        <span class="header-icons">
          <i class="fas fa-arrows-alt handle" aria-hidden="true"></i>
          <MoveButtons
            :index="index"
            :count="count"
            @move_up="emit('move_up')"
            @move_down="emit('move_down')"
          />
          <button
            type="button"
            class="edit-criterion-button"
            aria-label="Edit criterion"
            @click="d_edit_mode = true"
          >
            <i class="edit-icon fas fa-pencil-alt" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="delete-criterion-button"
            aria-label="Delete criterion"
            @click="d_delete_modal_is_open = true"
          >
            <i class="delete-icon fas fa-trash-alt" aria-hidden="true"></i>
          </button>
        </span>
      </div>
      <div class="points row">
        {{ d_criterion.points }}
        {{ Math.abs(d_criterion.points) === 1 ? "point" : "points" }}
      </div>
      <div class="long-description" v-if="d_criterion.long_description !== ''">
        {{ d_criterion.long_description }}
      </div>
    </template>
    <criterion-form
      v-else
      ref="criterion_form"
      :criterion="d_criterion"
      @form_validity_changed="d_criterion_form_is_valid = $event"
      @submit="save"
    >
      <APIErrors ref="save_criterion_errors"></APIErrors>
      <div class="button-footer">
        <button
          type="submit"
          class="save-button"
          :disabled="d_saving || !d_criterion_form_is_valid"
        >
          Save
        </button>
        <button type="button" class="white-button" @click="d_edit_mode = false">
          Cancel
        </button>
      </div>
    </criterion-form>

    <modal
      ref="delete_criterion_modal"
      size="large"
      click_outside_to_close
      aria_label="Confirm delete criterion"
      v-if="d_delete_modal_is_open"
      @close="d_delete_modal_is_open = false"
    >
      <div class="modal-header">Confirm Delete</div>
      Are you sure you want to delete the checkbox "<b>{{
        d_criterion.short_description
      }}</b
      >"? <br /><br />
      This will delete all associated results. <br />
      <b>THIS ACTION CANNOT BE UNDONE.</b>
      <APIErrors ref="delete_criterion_errors"></APIErrors>
      <div class="modal-button-footer button-footer-right">
        <button
          type="button"
          class="delete-button red-button"
          @click="delete_criterion"
          :disabled="d_deleting"
        >
          Delete
        </button>
        <button
          type="button"
          class="cancel-delete-button white-button"
          @click="d_delete_modal_is_open = false"
        >
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import { Criterion } from "ag-client-typescript";

import APIErrors from "@/components/api_errors.vue";
import { APIErrorsExposed } from "@/exposed_component_types/api_errors_exposed";
import Modal from "@/components/modal.vue";
import MoveButtons from "@/components/MoveButtons.vue";
import CriterionForm, {
  CriterionFormData,
} from "@/components/project_admin/handgrading_settings/criterion_form.vue";
import { deep_copy, new_toggle, safe_assign } from "@/utils";

type PropTypes = {
  criterion?: Criterion;
  index: number;
  count: number;
};

const props = defineProps<PropTypes>();

const emit = defineEmits<{
  move_up: [];
  move_down: [];
}>();

const save_criterion_errors = ref<APIErrorsExposed>();
const delete_criterion_errors = ref<APIErrorsExposed>();

const d_criterion = ref(deep_copy(props.criterion!, Criterion));
const d_deleting = ref(false);
const d_delete_modal_is_open = ref(false);
const d_edit_mode = ref(false);
const d_saving = ref(false);
const d_criterion_form_is_valid = ref(false);

watch(
  () => props.criterion,
  (new_val) => {
    d_criterion.value = deep_copy(new_val!, Criterion);
  },
);

function save(form_data: CriterionFormData) {
  return new_toggle(d_saving, async () => {
    try {
      safe_assign(d_criterion.value, form_data);
      await d_criterion.value.save();
      d_edit_mode.value = false;
    } catch (error: unknown) {
      save_criterion_errors.value?.show_errors_from_response(error);
    }
  });
}

function delete_criterion() {
  return new_toggle(d_deleting, async () => {
    try {
      await d_criterion.value.delete();
      d_delete_modal_is_open.value = false;
    } catch (error: unknown) {
      delete_criterion_errors.value?.show_errors_from_response(error);
    }
  });
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/button_styles.scss";
@import "@/styles/forms.scss";
@import "@/styles/modal.scss";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.rubric-item {
  padding: 0.625rem 0.875rem;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.short-description {
  font-weight: bold;
}

.header-icons {
  display: flex;
  align-items: center;

  .handle {
    cursor: grabbing;
    padding: 0 0.25rem;
  }

  .edit-criterion-button,
  .delete-criterion-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: inherit;
    padding: 0 0.25rem;
  }

  .edit-icon {
    color: darken($gray-blue-2, 15%);
  }

  .edit-criterion-button:hover .edit-icon {
    color: darken($gray-blue-2, 8%);
  }

  .delete-icon {
    color: lighten($cherry, 10%);
  }

  .delete-criterion-button:hover .delete-icon {
    color: lighten($cherry, 17%);
  }
}

.points,
.long-description {
  font-size: 0.875rem;
}

.points {
  color: $navy-blue;
}

.long-description {
  padding-top: 0.25rem;
  white-space: pre-wrap;
}
</style>
