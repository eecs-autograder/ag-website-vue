<template>
  <div id="edit-single-group-component" v-if="d_group !== null">
    <group-members-form v-model="d_group.member_names"
                        ref="edit_group_form"
                        :project="project"
                        :course="course"
                        @submit="update_group"
                        @form_validity_changed="edit_group_form_is_valid = $event"
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

        <div id="bonus-submissions-container">
          <div id="bonus-submissions-label"> Bonus Submissions </div>
          <validated-input ref="bonus_submissions_remaining_input"
                          v-model="d_group.bonus_submissions_remaining"
                          :validators="[is_integer, is_non_negative, is_not_empty]"
                          :num_rows="1"
                          input_style="width: 80px;
                                        border: 1px solid #ced4da;"
                          :from_string_fn="string_to_num">
          </validated-input>
        </div>
        <APIErrors ref="api_errors"></APIErrors>

        <button class="update-group-button"
                type="submit"
                :disabled="d_saving"> Update Group </button>
        <div v-show="d_saving" class="saving-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>
      </template>
    </group-members-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { Course, Group, Project } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import GroupMembersForm from '@/components/group_members_form.vue';
import Toggle from '@/components/toggle.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, format_datetime, handle_api_errors_async } from '@/utils';
import { is_integer, is_non_negative, is_not_empty, string_to_num } from '@/validators';

@Component({
  components: {
    APIErrors,
    DatetimePicker,
    GroupMembersForm,
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

  edit_group_form_is_valid = true;

  @Watch('group')
  on_group_selected_changed(new_group: Group, old_group: Group) {
    this.d_group = deep_copy(new_group, Group);
  }

  async created() {
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

  get format_datetime() {
    return format_datetime;
  }
}

function handle_save_group_error(component: EditSingleGroup, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/edit_groups.scss';
@import '@/styles/components/datetime.scss';

#edit-single-group-component {
  font-size: 15px;
  padding-top: 16px;
}

#datetime-picker-container {
  padding: 16px 0 0 0;
}

#bonus-submissions-container {
  padding: 16px 0 5px 0;
}

#bonus-submissions-label {
  padding-bottom: 6px;
}

.saving-spinner {
  color: $ocean-blue;
  display: inline-block;
  padding-left: 10px;
  font-size: 18px;
}

.update-group-button {
  @extend .green-button;
  margin-top: 15px;
}

</style>
