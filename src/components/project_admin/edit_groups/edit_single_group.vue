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
              <input class="member-name-input"
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
            </div>
          </div>
        </div>
        <div class="add-member-container">
          <button class="add-member-button"
                  type="button"
                  :disabled="d_group.member_names.length === max_group_size"
                  @click="add_group_member"> Add Another Member
          </button>
        </div>

        <div id="extension-toggle">
          <toggle v-model="has_extension">
            <div slot="on">
              <p class="toggle-on">
                {{has_extension !== null ? 'Has extension' : 'Grant extension'}}
              </p>
            </div>
            <div slot="off">
              <p class="toggle-off">
                {{has_extension !== null ? 'Revoke Extension' : 'No extension'}}
              </p>
            </div>
          </toggle>
        </div>
      </div>

      <div id="datetime-picker-container" v-if="has_extension">
        <div class="datetime-picker">
          <vue-ctk-date-time-picker v-model="extension_datetime"
                                    input-size="lg">
          </vue-ctk-date-time-picker>
        </div>
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';
import Toggle from '@/components/toggle.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';

import { Course, Group, Project } from 'ag-client-typescript';
import moment from 'moment';

import { is_integer, is_non_negative, is_not_empty, string_to_num } from '@/validators';

@Component({
  components: {
    APIErrors,
    Toggle,
    ValidatedForm,
    ValidatedInput,
    VueCtkDateTimePicker
  }
})
export default class EditSingleGroup extends Vue {

  readonly is_not_empty = is_not_empty;
  readonly is_non_negative = is_non_negative;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;

  @Prop({required: true, type: Group})
  group!: Group;

  @Prop({required: true, type: Project})
  project!: Project;

  allowed_guest_domain = "";
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
  has_extension = false;
  min_group_size = 1;
  max_group_size = 1;
  edit_group_form_is_valid = true;
  extension_datetime = "";

  @Watch('group')
  on_group_selected_changed(new_group: Group, old_group: Group) {
    this.d_group = deep_copy(new_group, Group);
    this.has_extension = this.d_group.extended_due_date !== null;
  }

  async created() {
    this.d_group = deep_copy(this.group, Group);
    let course = await Course.get_by_pk(this.project.course);
    this.allowed_guest_domain = course.allowed_guest_domain;
    this.min_group_size = this.project.min_group_size;
    this.max_group_size = this.project.max_group_size;
    this.has_extension = this.d_group.extended_due_date !== null;
    this.extension_datetime = this.has_extension
                              ? moment(this.d_group.extended_due_date).format("YYYY-MM-DD hh:mm a")
                              : moment().format("YYYY-MM-DD hh:mm a");
  }

  remove_group_member(index: number) {
    this.d_group.member_names.splice(index, 1);
  }

  add_group_member() {
    this.d_group.member_names.push(this.allowed_guest_domain);
  }

  @handle_api_errors_async(handle_save_group_error)
  async update_group() {
    try {
      this.d_saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      this.d_group.member_names = this.d_group.member_names.filter(
        name => name.trim() !== "" && name.trim() !== this.allowed_guest_domain
      );
      if (this.d_group.member_names.length === 0) {
        this.add_group_member();
      }
      else {
        for (let i = 0; i < this.d_group.member_names.length; ++i) {
          Vue.set(this.d_group.member_names, i, this.d_group.member_names[i].trim());
        }
      }
      this.d_group.extended_due_date = this.has_extension
                                       ? new Date(this.extension_datetime).toISOString() : null;
      await this.d_group.save();
      (<ValidatedForm> this.$refs.edit_group_form).reset_warning_state();
    }
    finally {
      this.d_saving = false;
    }
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
@import '~vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';

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
#extension-toggle {
  padding-top: 10px;
}

.toggle-on, .toggle-off {
  font-size: 15px;
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

.datetime-picker {
  margin-top: 5px;
  width: 50%;
  min-width: 260px;
}

.saving-spinner {
  color: $ocean-blue;
  display: inline-block;
  padding-left: 10px;
  font-size: 18px;
}

.update-group-button {
  @extend .teal-button;
  margin-top: 15px;
}

.update-group-button:disabled {
  @extend .gray-button;
}

</style>
