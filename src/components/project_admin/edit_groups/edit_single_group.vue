<template>
  <div class="edit-single-group-component">
    <div class="created-at">
      <span class="timestamp-label">Created: </span>
      <span class="timestamp">{{format_datetime(d_group.created_at)}}</span>
    </div>

    <group-members-form v-model="d_group.member_names"
                        ref="edit_group_form"
                        :project="project"
                        :course="course"
                        @submit="update_group"
                        @form_validity_changed="d_edit_group_form_is_valid = $event"
                        :ignore_group_size_limits="true">
      <template v-slot:footer>
        <div class="datetime-picker-container clearable-datetime-picker">
          <div class="label">Extension</div>
          <div data-testid="extension" class="datetime-input"
              @click="$refs.extension_datetime_picker.toggle_visibility()">
            {{format_datetime(d_group.extended_due_date)}}
            <i class="far fa-calendar-alt"></i>
          </div>
          <button type="button" data-testid="revoke_extension"
                  class="clear-button"
                  @click.stop="d_group.extended_due_date = null"
                  :disabled="d_group.extended_due_date === null">
            <i class="fas fa-times"></i>
            <span class="clear-text">Revoke</span>
          </button>

          <datetime-picker v-model="d_group.extended_due_date"
                          ref="extension_datetime_picker">
          </datetime-picker>
        </div>

        <div id="bonus-submissions-container" class="form-field-wrapper extra-space">
          <label id="bonus-submissions-label" class="label"> Bonus Submissions </label>
          <validated-input ref="bonus_submissions_remaining_input"
                          v-model="d_group.bonus_submissions_remaining"
                          :validators="[is_integer, is_non_negative, is_not_empty]"
                          :num_rows="1"
                          input_style="width: 80px"
                          :from_string_fn="string_to_num">
          </validated-input>
        </div>
        <APIErrors ref="api_errors"></APIErrors>

        <div class="button-footer">
          <button class="update-group-button"
                  type="submit"
                  :disabled="d_saving"> Update Group </button>

          <last-saved :saving="d_saving" :last_modified="group.last_modified"></last-saved>
        </div>
      </template>
    </group-members-form>

    <div class="danger-zone-container">
      <div class="danger-text">Delete Group</div>
      <button type="button"
              class="delete-button"
              @click="d_show_delete_group_modal = true"
              data-testid="show_delete_modal_button">
        Delete
      </button>
    </div>

    <modal v-if="d_show_delete_group_modal"
           @close="d_show_delete_group_modal = false"
           :include_closing_x="!d_deleting"
           :click_outside_to_close="!d_deleting"
           ref="delete_group_modal">
      <div class="modal-header">Confirm Delete</div>

      NOTE: This will remove all members from the group, but will preserve
      the database entry and all submissions associated with the group.

      <APIErrors ref="delete_group_api_errors"></APIErrors>

      <div class="modal-button-footer">
        <button type="button"
                class="red-button"
                :disabled="d_deleting"
                @click="delete_group"
                data-testid="delete_group_button">
          Delete
        </button>
        <button type="button"
                class="white-button"
                @click="d_show_delete_group_modal = false"
                :disabled="d_deleting">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, toRaw } from 'vue';

import { Course, Group, Project } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import GroupMembersForm from '@/components/group_members_form.vue';
import LastSaved from '@/components/last_saved.vue';
import Modal from '@/components/modal.vue';
import Toggle from '@/components/toggle.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async, make_error_handler_func } from '@/error_handling';
import { assert_not_null, deep_copy, format_datetime, toggle_ref } from '@/utils';
import { is_integer, is_non_negative, is_not_empty, string_to_num } from '@/validators';

const props = defineProps({
  course: Course,
  group: Group,
  project: Project,
})

const d_group = ref(deep_copy(toRaw(props.group), Group))
const d_saving = ref(false);
const d_edit_group_form_is_valid = ref(true);

const d_show_delete_group_modal = ref(false);
const d_deleting = ref(false);

watch(
  () => props.group,
  (group: Group) => {
    d_group.value = ref(deep_copy(toRaw(group), Group))
  }
)

@handle_api_errors_async(handle_save_group_error)
const update_group = async () => {
  assert_not_null(d_group.val);
  try {
    d_saving.val = true;
    (<APIErrors> $refs.api_errors).clear();
    await d_group.value.save();
  }
  finally {
    d_saving.value = false;
  }
}

@handle_api_errors_async(make_error_handler_func('delete_group_api_errors'))
const delete_group = async () => {
  return toggle_ref(d_deleting, async () => {
      assert_not_null(d_group.value);
      await d_group.value.pseudo_delete();
      d_show_delete_group_modal.value = false;
  });
}

const format_datetime = () => {
  return format_datetime;
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';
@import '@/styles/components/datetime.scss';

.edit-single-group-component {
  padding-top: 1rem;
}

.created-at {
  margin-bottom: .375rem;

  .timestamp-label {
    font-weight: bold;

  }
}

.datetime-picker-container {
  padding-top: 1rem;
}

.update-group-button {
  @extend .green-button;
}
</style>
