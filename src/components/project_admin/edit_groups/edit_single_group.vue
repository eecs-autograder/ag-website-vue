<template>
  <div id="edit-single-group-component" v-if="d_group !== null">
    <validated-form ref="edit_group_form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit.native.prevent="update_group">
      <div class="edit-group-members-container">
        <p class="group-members-label"> Group members: </p>
        <div v-for="(member, index) of d_group.member_names">
          <div class="group-member-editing">
            <div class="username-validated-container">
              <validated-input ref="member_name_input"
                               v-model="d_group.member_names[index]"
                               :validators="[is_not_empty]"
                               :num_rows="1"
                               input_style="width: 280px;
                                            border: 1px solid #ced4da;">
                <div slot="suffix" class="remove-member-button"
                       :title="`Remove ${member} from group`"
                       @click="remove_group_member(index)">
                    <i class="fas fa-times"></i>
                </div>
              </validated-input>
            </div>
          </div>
        </div>
        <div class="add-member-container">
          <button class="add-member-button"
                  :disabled="d_group.member_names.length >= max_group_size"
                  @click="add_group_member">
            {{d_group.member_names.length === 0 ? "Add A member" : "Add Another Member"}}
          </button>
        </div>

        <div id="extension-toggle">
          <toggle v-model="has_extension"
                  :active_background_color="toggle_color">
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
<!--        <datetime v-model="some_date"> </datetime>-->
        <flat-pickr v-model="d_group.extended_due_date"
                    :config="datetime_config"></flat-pickr>
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
      <div v-if="successful_update"
           :class="d_saving ? 'successful-group-update' : 'done-updating-group'">
        <i class="fas fa-check"></i>
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

import { Course, Group, Project } from 'ag-client-typescript';

import { is_integer, is_non_negative, is_not_empty, string_to_num } from '@/validators';

// import Datetime from 'vue-datetime';
// import 'vue-datetime/dist/vue-datetime.css';

import flatPickr from 'vue-flatpickr-component';
// import 'flatpickr/dist/flatpickr.css';
// import 'flatpickr/dist/themes/airbnb.css';

@Component({
  components: {
    APIErrors,
    flatPickr,
    Toggle,
    ValidatedForm,
    ValidatedInput
  }
})
export default class EditSingleGroup extends Vue {

  readonly is_not_empty = is_not_empty;
  readonly is_non_negative = is_non_negative;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;

  datetime_config = {
    enableTime: true,
    dateFormat: "Y-m-d H:i"
  };

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
  successful_update = false;
  toggle_color = "orange";

  some_date = "";

  @Watch('group')
  on_group_selected_changed(new_group: Group, old_group: Group) {
    this.d_group = new Group({
      pk: new_group.pk,
      project: new_group.project,
      extended_due_date: new_group.extended_due_date,
      member_names: [],
      bonus_submissions_remaining: new_group.bonus_submissions_remaining,
      late_days_used: new_group.late_days_used,
      num_submissions: new_group.num_submissions,
      num_submits_towards_limit: new_group.num_submits_towards_limit,
      created_at: new_group.created_at,
      last_modified: new_group.last_modified
    });

    for (let i = 0; i < new_group.member_names.length; ++i) {
      this.d_group.member_names.push(deep_copy(new_group.member_names[i]));
    }
    this.has_extension = this.d_group.extended_due_date !== null;
  }

  async created() {
    this.d_group = new Group({
      pk: this.group.pk,
      project: this.group.project,
      extended_due_date: this.group.extended_due_date,
      member_names: [],
      bonus_submissions_remaining: this.group.bonus_submissions_remaining,
      late_days_used: this.group.late_days_used,
      num_submissions: this.group.num_submissions,
      num_submits_towards_limit: this.group.num_submits_towards_limit,
      created_at: this.group.created_at,
      last_modified: this.group.last_modified
    });
    for (let i = 0; i < this.group.member_names.length; ++i) {
      this.d_group.member_names.push(deep_copy(this.group.member_names[i]));
    }
    let course = await Course.get_by_pk(this.project.course);
    this.allowed_guest_domain = course.allowed_guest_domain;
    this.min_group_size = this.project.min_group_size;
    this.max_group_size = this.project.max_group_size;
    this.has_extension = this.d_group.extended_due_date !== null;
  }

  remove_group_member(index: number) {
    if (this.d_group!.member_names.length !== 1) {
      this.d_group!.member_names.splice(index, 1);
    }
  }

  add_group_member() {
    this.d_group!.member_names.push('@umich.edu');
  }

  @handle_api_errors_async(handle_save_group_error)
  async update_group() {
    try {
      this.d_saving = true;
      this.d_group!.extended_due_date = this.has_extension
                                        ? "2019-08-18T15:25:06.965696Z" : null;
      await this.d_group!.save();
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
  @import url('https://fonts.googleapis.com/css?family=Quicksand');
  $current-lang-choice: 'Quicksand';

  .suffix-element {
    display: inline-block;
    vertical-align: top;
  }

  #edit-single-group-component {
    font-family: Quicksand;
    font-size: 15px;
  }

  .edit-group-members-container {
    padding-top: 16px;
  }

  .group-members-label {
    color: lighten(black, 25);
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    padding: 0 10px 10px 0;
    display: inline-block;
    vertical-align: top;
  }

  .group-member {
    font-size: 16px;
    margin: 0 0 10px 0;
    padding: 3px 8px;
    background-color: hsl(212, 70%, 95%);
    display: inline-block;
    border-radius: 5px;
    color: hsl(212, 50%, 20%);
  }

  .remove-member-button {
    cursor: pointer;
    display: inline-block;
    padding: 9px 16px;
    border-radius: 3px;
    margin-left: 8px;
    background-color: hsl(220, 30%, 90%);
    color: black;
    vertical-align: top;
  }

  .remove-member-button:hover {
    background-color: hsl(220, 30%, 30%);
    color: white;
  }

  .username-validated-container {
    display: inline-block;
  }

  .group-member-editing {
    padding-bottom: 10px;
  }

  .add-member {
    color: white;
  }

  .update-group-button {
    margin-top: 15px;
    @extend .teal-button;
  }

  .add-member-button {
    @extend .dark-purple-button;
  }

  .add-member-button:disabled, .update-group-button:disabled {
    @extend .gray-button;
  }

  .add-member-container {
    padding: 8px 0 15px 0;
    cursor: pointer;
    display: block;
  }

  @keyframes fadeIn {
    from { opacity: 0;}
    to { opacity: 1;}
  }

  @keyframes fadeOut {
    from { opacity: 1;}
    to { opacity: 0;}
  }

  #extension-toggle {
    padding-top: 3px;
  }

  .successful-group-creation {
    animation-duration: 0.5s;
    animation-name: fadeIn;
    color: $save-green;
    display: inline-block;
    padding-left: 15px;
  }

  .done-adding-group {
    animation-duration: 1s;
    animation-name: fadeOut;
    color: $save-green;
    display: inline-block;
    padding-left: 15px;
  }

  .toggle-on, .toggle-off {
    font-size: 15px;
    color: black;
  }

  #bonus-submissions-container {
    padding: 16px 0 5px 0;
  }

  #bonus-submissions-label {
    padding-bottom: 6px;
  }

  #datetime-picker-container {
    padding: 16px 0 0 0;
  }

  .successful-group-update {
    animation-duration: 0.5s;
    animation-name: fadeIn;
    color: $save-green;
    display: inline-block;
    padding-left: 15px;
  }

  .done-updating-group {
    animation-duration: 1s;
    animation-name: fadeOut;
    color: $save-green;
    display: inline-block;
    padding-left: 15px;
  }

  .datetime-picker {
    margin-top: 5px;
    width: 250px;
    height: 200px;
    background-color: hsl(210, 20%, 90%);
  }

</style>
