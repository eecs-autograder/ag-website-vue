<template>
  <div id="edit-single-group-component" v-if="d_group !== null">
    <validated-form ref="edit_group_form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit.native.prevent="update_group"
                    @form_validity_changed="edit_group_form_is_valid = $event">
      <div class="edit-group-members-container">
        <p class="group-members-label"> Group members: </p>
        <div v-for="(member, index) of d_group.member_names">
          <div class="group-member-editing">
            <div class="username-container">
              <input :class="['member-name-input',
                              {'error-input': incomplete_input_present
                                              && member === course.allowed_guest_domain}]"
                     type="text"
                     v-model="d_group.member_names[index]"/>
              <button slot="suffix"
                      class="remove-member-button"
                      :title="`Remove ${member} from group`"
                      :disabled="d_group.member_names.length === 1"
                      type="button"
                      @click="remove_group_member(index)">
                <i class="fas fa-times"></i>
              </button>
              <div>
                <div v-if="incomplete_input_present
                            && member === course.allowed_guest_domain"
                     class="incomplete-input-msg">
                  Incomplete member name
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="add-member-container">
          <button class="add-member-button"
                  :disabled="d_group.member_names.length >= project.max_group_size"
                  type="button"
                  @click="add_group_member">
            <i class="fas fa-plus"></i>
            Add Another Member
          </button>
        </div>
      </div>

      <div id="datetime-picker-container">
        <div class="extension-label">Extension</div>
        <span id="extension" class="datetime-input"
             @click="$refs.extension_datetime_picker.toggle_visibility()">
          {{format_datetime(d_group.extended_due_date)}}
          <i class="far fa-calendar-alt calender-icon"></i>
        </span>
        <button type="button" id="revoke-extension"
                class="flat-white-button"
                @click.stop="d_group.extended_due_date = null"
                :disabled="d_group.extended_due_date === null">
          <i class="fas fa-times"></i>
          Revoke
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
              :disabled="d_saving || !edit_group_form_is_valid"> Update Group </button>
      <div v-show="d_saving" class="saving-spinner">
        <i class="fa fa-spinner fa-pulse"></i>
      </div>
    </validated-form>
  </div>
</template>

<script lang="ts">
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';
import Toggle from '@/components/toggle.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, format_datetime, handle_api_errors_async } from '@/utils';

import { Course, Group, Project } from 'ag-client-typescript';

import { is_integer, is_non_negative, is_not_empty, string_to_num } from '@/validators';

@Component({
  components: {
    APIErrors,
    Toggle,
    ValidatedForm,
    ValidatedInput,
    DatetimePicker
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
  incomplete_input_present = false;

  @Watch('group')
  on_group_selected_changed(new_group: Group, old_group: Group) {
    this.incomplete_input_present = false;
    this.d_group = deep_copy(new_group, Group);
  }

  async created() {
    this.d_group = deep_copy(this.group, Group);
  }

  remove_group_member(index: number) {
    this.d_group.member_names.splice(index, 1);
  }

  add_group_member() {
    this.d_group.member_names.push(this.course.allowed_guest_domain);
  }

  @handle_api_errors_async(handle_save_group_error)
  async update_group() {
    try {
      this.d_saving = true;
      this.incomplete_input_present = false;
      (<APIErrors> this.$refs.api_errors).clear();

      this.d_group.member_names = this.d_group.member_names.filter(
        name => name.trim() !== ""
      );

      if (this.d_group.member_names.length === 0) {
        this.add_group_member();
      }

      for (let i = 0; i < this.d_group.member_names.length; ++i) {
        if (this.d_group.member_names[i] === this.course.allowed_guest_domain) {
          this.incomplete_input_present = true;
          return;
        }
        Vue.set(this.d_group.member_names, i, this.d_group.member_names[i].trim());
      }

      await this.d_group.save();
      (<ValidatedForm> this.$refs.edit_group_form).reset_warning_state();
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

#edit-single-group-component {
  font-size: 15px;
}

.edit-group-members-container {
  padding-top: 16px;
}

/*FIXME*/
.username-container {
  min-width: 400px;
}

.member-name-input {
  width: 240px;
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

.extension-label {
  color: lighten(black, 25);
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  padding: 0;
  vertical-align: top;
}

#extension:hover {
  cursor: pointer;
}

.datetime-input {
  margin: 10px 0 10px 0;
  background-color: $white-gray;
  border: 1px solid darken($white-gray, 2);
  border-radius: 4px;
  padding: 8px;
  display: inline-block;
}

.datetime-input i {
  padding: 0 4px;
}

#revoke-extension {
  padding-top: 8px;
  padding-bottom: 8px;
}

.flat-white-button {
  @extend .button;

  box-shadow: none;
  margin-left: 3px;

  color: black;
  background: white;
}

.flat-white-button:hover:enabled {
  @include hover_state($pebble-medium, $pebble-medium);
}

</style>
