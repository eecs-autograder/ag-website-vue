<template>
  <validated-form ref="group_members_form"
                  autocomplete="off"
                  spellcheck="false"
                  @submit="submit"
                  @form_validity_changed="$emit('form_validity_changed', $event)">
    <slot name="header"></slot>
    <div class="add-group-members-container">
      <div v-for="(member, index) of d_usernames">
        <div class="group-member-editing">
          <div class="username-container">
            <validated-input v-model="d_usernames[index]" :validators="[is_email]"
                             ref="username_input"
                             @input="$emit('input', d_usernames)">
              <button slot="suffix"
                      class="remove-member-button"
                      :disabled="d_usernames.length <= min_num_inputs"
                      :title="`Remove ${member} from group`"
                      type="button"
                      @click="d_usernames.splice(index, 1); $emit('input', d_usernames)">
                <i class="fas fa-times"></i>
              </button>
            </validated-input>
          </div>
        </div>
      </div>
      <div class="add-member-container">
        <button class="add-member-button"
                type="button"
                :disabled="d_usernames.length >= max_num_inputs && !ignore_group_size_limits"
                @click="add_member">
          <i class="fas fa-plus"></i>
          Add Member
        </button>
      </div>
    </div>
    <slot name="footer"></slot>
  </validated-form>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { Course, Project } from 'ag-client-typescript';

import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { is_email } from '@/validators';

@Component({
  components: {
    ValidatedForm,
    ValidatedInput
  }
})
export default class GroupMembersForm extends Vue {
  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Course})
  course!: Course;

  // In some cases, the maximum number of members will be less
  // than the Project's max_group_size (group invitations, for example).
  // When provided, this field be used to determine the maximum number
  // of text inputs.
  @Prop({default: null, type: Number})
  max_num_members!: number | null;

  @Prop({default: false, type: Boolean})
  ignore_group_size_limits!: boolean;

  @Prop({default: () => [], type: Array})
  value!: string[];

  d_usernames: string[] = [];

  readonly is_email = is_email;

  created() {
    this.initialize(this.value);
    Vue.nextTick(() => {
      (<ValidatedInput> (<Vue[]> this.$refs.username_input)[0]).focus();
    });
  }

  @Watch('value', {deep: true})
  on_value_changed(new_value: string[], old_value: string[]) {
    this.initialize(new_value);
  }

  submit() {
    this.$emit('submit', this.d_usernames);
  }

  reset() {
    (<ValidatedForm> this.$refs.group_members_form).reset_warning_state();
    this.initialize(this.value);
  }

  get max_num_inputs() {
    return this.max_num_members !== null ? this.max_num_members : this.project.max_group_size;
  }

  get min_num_inputs() {
    if (this.ignore_group_size_limits) {
      return 1;
    }
    return Math.min(this.project.min_group_size, this.max_num_inputs);
  }

  private add_member() {
    this.d_usernames.push(this.course.allowed_guest_domain);
    Vue.nextTick(() => {
      (<ValidatedInput> (<Vue[]> this.$refs.username_input)[this.d_usernames.length - 1]).focus();
    });
  }

  private initialize(value: string[]) {
    if (value.length === 0) {
      this.d_usernames = Array(this.min_num_inputs).fill(this.course.allowed_guest_domain);
    }
    else {
      this.d_usernames = value.slice();
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
// @import '@/styles/components/group_registration.scss';

$purple: hsl(275, 48%, 56%);
$teal: hsl(180, 100%, 24%);

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@import '@/styles/colors.scss';

// group member input related ******************************************************
.group-members-label {
    color: lighten(black, 25);
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    padding: 0 10px 10px 0;
    vertical-align: top;
}

.member-name-input {
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: .25rem;
    box-sizing: border-box;
    color: #495057;
    display: inline-block;
    font-size: 1rem;
    line-height: 1.5;
    position: relative;
    padding: .375rem .75rem;
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.group-member-editing {
    padding-bottom: 10px;
}

.remove-member-button {
    @extend .light-gray-button;
    font-size: 16px;
    cursor: pointer;
    display: inline-block;
    padding: 7px 12px;
    border-radius: 6px;
    margin-left: 8px;
    color: hsl(220, 30%, 25%);
}

.remove-member-button:disabled {
    color: hsl(220, 30%, 70%);
}

.add-member-container {
    margin-bottom: 8px;
}

.add-member-button {
    @extend .white-button;
    box-shadow: none;
    margin-bottom: 15px;
}

.error-input {
    outline: none;
    box-shadow: 0 0 10px $warning-red;
    border: 1px solid $warning-red;
    border-radius: .25rem;
}

.error-input:focus, .error-input:active {
    outline: none;
    box-shadow: 0 0 10px $warning-red;
    border: 1px solid $warning-red;
    border-radius: .25rem;
}

.incomplete-input-msg {
    box-sizing: border-box;
    color: #721c24;
    display: inline-block;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px;
    border-radius: .25rem;
    margin-top: 11px;
}

// section title related ***********************************************************
.section-title {
    color: lighten(black, 25);
    font-size: 19px;
    font-weight: bold;
    margin: 0;
}

</style>
}
