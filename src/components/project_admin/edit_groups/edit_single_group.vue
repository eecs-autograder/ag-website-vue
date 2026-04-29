<template>
  <div class="edit-single-group-component">
    <div class="created-at">
      <span class="timestamp-label">Created: </span>
      <span class="timestamp">{{
        format_datetime(state.group.created_at)
      }}</span>
    </div>

    <group-members-form
      v-model="state.group.member_names"
      ref="edit_group_form"
      :min_num_inputs="1"
      :max_num_inputs="null"
      :course="course"
      @submit="update_group"
      @form_validity_changed="state.edit_group_form_is_valid = $event"
      :ignore_group_size_limits="true"
    >
      <template v-slot:footer>
        <div class="extension-container clearable-datetime-picker">
          <div class="label">Extension</div>
          <div>
            <input
              type="datetime-local"
              data-testid="extension"
              v-model="extension_model"
            />
            <button
              type="button"
              data-testid="revoke_extension"
              class="clear-button"
              @click.stop="state.group.extended_due_date = null"
              :disabled="state.group.extended_due_date === null"
            >
              <i class="fas fa-times"></i>
              <span class="clear-text">Revoke</span>
            </button>
          </div>
        </div>

        <div
          id="bonus-submissions-container"
          class="form-field-wrapper extra-space"
        >
          <label id="bonus-submissions-label" class="label">
            Bonus Submissions
          </label>
          <validated-int-input
            ref="bonus_submissions_remaining_input"
            v-model="state.group.bonus_submissions_remaining"
            :validators="[make_min_validator(0)]"
            input_style="width: 80px"
          >
          </validated-int-input>
        </div>
        <APIErrors ref="api_errors"></APIErrors>

        <div class="button-footer">
          <button
            class="update-group-button"
            type="submit"
            :disabled="state.saving || !state.edit_group_form_is_valid"
          >
            Update Group
          </button>

          <last-saved
            :saving="state.saving"
            :last_modified="group.last_modified"
          ></last-saved>
        </div>
      </template>
    </group-members-form>

    <div class="danger-zone-container">
      <div class="danger-text">Delete Group</div>
      <button
        type="button"
        class="delete-button"
        @click="state.show_delete_group_modal = true"
        data-testid="show_delete_modal_button"
      >
        Delete
      </button>
    </div>

    <modal
      v-if="state.show_delete_group_modal"
      @close="state.show_delete_group_modal = false"
      :include_closing_x="!state.deleting"
      :click_outside_to_close="!state.deleting"
      ref="delete_group_modal"
    >
      <div class="modal-header">Confirm Delete</div>

      NOTE: This will remove all members from the group, but will preserve the
      database entry and all submissions associated with the group.

      <APIErrors ref="delete_group_api_errors"></APIErrors>

      <div class="modal-button-footer">
        <button
          type="button"
          class="red-button"
          :disabled="state.deleting"
          @click="delete_group"
          data-testid="delete_group_button"
        >
          Delete
        </button>
        <button
          type="button"
          class="white-button"
          @click="state.show_delete_group_modal = false"
          :disabled="state.deleting"
        >
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { Course, Group, Project } from "ag-client-typescript";
import { reactive, watch, ref, computed } from "vue";
import moment from "moment-timezone";
import APIErrors from "@/components/api_errors.vue";
import { APIErrorsExposed } from "@/exposed_component_types/api_errors_exposed";
import GroupMembersForm from "@/components/group_members_form.vue";
import LastSaved from "@/components/last_saved.vue";
import Modal from "@/components/modal.vue";
import ValidatedIntInput from "@/components/validated_input/ValidatedIntInput.vue";
import { assert_not_null, deep_copy, format_datetime, toggle } from "@/utils";
import { make_min_validator } from "@/new_validators";

type PropTypes = {
  course: Course;
  group: Group;
  project: Project;
};

const props = defineProps<PropTypes>();

const api_errors = ref<APIErrorsExposed>();
const delete_group_api_errors = ref<APIErrorsExposed>();

const state = reactive({
  group: null as Group | null,
  saving: false,
  edit_group_form_is_valid: true,
  show_delete_group_modal: false,
  deleting: false,
});

const WALL_TIME_FORMAT = "YYYY-MM-DD[T]HH:mm";

const extension_model = computed({
  get(): string {
    return state.group?.extended_due_date != null
      ? moment
          .parseZone(state.group.extended_due_date)
          .tz(props.project.timezone)
          .format(WALL_TIME_FORMAT)
      : "";
  },
  set(wall_time: string) {
    if (state.group) {
      state.group.extended_due_date =
        wall_time !== ""
          ? moment
              .tz(wall_time, WALL_TIME_FORMAT, props.project.timezone)
              .format()
          : null;
    }
  },
});

const update_group = () => {
  return toggle(state, "saving", async () => {
    assert_not_null(state.group);
    try {
      api_errors.value?.clear();
      await state.group.save();
    } catch (error: unknown) {
      api_errors.value?.show_errors_from_response(error);
    }
  });
};

const delete_group = () => {
  return toggle(state, "deleting", async () => {
    assert_not_null(state.group);
    try {
      await state.group.pseudo_delete();
      state.show_delete_group_modal = false;
    } catch (error: unknown) {
      delete_group_api_errors.value?.show_errors_from_response(error);
    }
  });
};

watch(
  () => props.group,
  (new_group: Group, old_group: Group) => {
    state.group = deep_copy(new_group, Group);
  },
);
state.group = deep_copy(props.group, Group);

defineExpose({
  state,
});
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";
@import "@/styles/forms.scss";
@import "@/styles/modal.scss";
@import "@/styles/components/datetime.scss";

.edit-single-group-component {
  padding-top: 1rem;
}

.created-at {
  margin-bottom: 0.375rem;

  .timestamp-label {
    font-weight: bold;
  }
}

.extension-container {
  padding-top: 1rem;
}

.update-group-button {
  @extend .green-button;
}
</style>
