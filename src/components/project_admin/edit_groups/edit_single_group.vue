<template>
  <div id="edit-single-group-component">
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
        <div id="datetime-picker-container" class="clearable-datetime-picker">
          <div class="label">Extension</div>
          <div id="extension" class="datetime-input"
              @click="$refs.extension_datetime_picker.toggle_visibility()">
            {{format_datetime(d_group.extended_due_date)}}
            <i class="far fa-calendar-alt"></i>
          </div>
          <button type="button" id="revoke-extension"
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
              ref="show_delete_modal_button">
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
                ref="delete_group_button">
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

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { Course, Group, Project } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import GroupMembersForm from '@/components/group_members_form.vue';
import LastSaved from '@/components/last_saved.vue';
import Modal from '@/components/modal.vue';
import Toggle from '@/components/toggle.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { make_error_handler_func } from '@/error_handling';
import { deep_copy, format_datetime, handle_api_errors_async, toggle } from '@/utils';
import { is_integer, is_non_negative, is_not_empty, string_to_num } from '@/validators';

@Component({
  components: {
    APIErrors,
    DatetimePicker,
    GroupMembersForm,
    LastSaved,
    Modal,
    Toggle,
    ValidatedForm,
    ValidatedInput,
  }
})
export default class EditSingleGroup extends Vue {

  readonly is_not_empty = is_not_empty;
  readonly is_non_negative = is_non_negative;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;

  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Group})
  group!: Group;

  @Prop({required: true, type: Project})
  project!: Project;

  d_group: Group = new Group({
    pk: 0,
    project: 0,
    extended_due_date: null,
    member_names: [],
    bonus_submissions_remaining: 0,
    late_days_used: {},
    num_submissions: 0,
    num_submits_towards_limit: 0,
    created_at: "",
    last_modified: ""
  });

  d_saving = false;
  d_edit_group_form_is_valid = true;

  d_show_delete_group_modal = false;
  d_deleting = false;

  @Watch('group')
  on_group_selected_changed(new_group: Group, old_group: Group) {
    this.d_group = deep_copy(new_group, Group);
  }

  created() {
    this.d_group = deep_copy(this.group, Group);
  }

  @handle_api_errors_async(handle_save_group_error)
  async update_group() {
    try {
      this.d_saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_group.save();
    }
    finally {
      this.d_saving = false;
    }
  }

  @handle_api_errors_async(make_error_handler_func('delete_group_api_errors'))
  async delete_group() {
    return toggle(this, 'd_deleting', async () => {
        await this.d_group.pseudo_delete();
        this.d_show_delete_group_modal = false;
    });
  }

  get format_datetime() {
    return format_datetime;
  }
}

function handle_save_group_error(component: EditSingleGroup, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';
@import '@/styles/components/datetime.scss';

#edit-single-group-component {
  padding-top: 1rem;
}

.created-at {
  margin-bottom: .375rem;

  .timestamp-label {
    font-weight: bold;

  }
}

#datetime-picker-container {
  padding-top: 1rem;
}

.update-group-button {
  @extend .green-button;
}
</style>
