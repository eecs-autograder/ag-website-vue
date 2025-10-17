<template>
  <validated-form ref="group_members_form"
                  autocomplete="off"
                  spellcheck="false"
                  @submit="submit"
                  @form_validity_changed="$emit('form_validity_changed', $event)">
    <slot name="header"></slot>
    <div class="group-members-container">
      <div class="username-container"
            v-for="(member, index) of d_usernames">
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
      <div class="add-member-container">
        <button class="add-member-button"
                type="button"
                :disabled="max_num_inputs != null && d_usernames.length >= max_num_inputs"
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

import { Course } from 'ag-client-typescript';

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
  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({
    required: true,
    type: Number,
    validator: (value: number | null) => value === null || value > 0
  })
  max_num_inputs!: number | null;

  @Prop({
    required: true,
    type: Number,
    validator: (value: number) => value > 0
  })
  min_num_inputs!: number;

  @Prop({default: () => [], type: Array})
  value!: string[];

  d_usernames: string[] = [];

  readonly is_email = is_email;

  created() {
    this.initialize(this.value);
  }

  mounted() {
    (<ValidatedInput> (<Vue[]> this.$refs.username_input)[0]).focus({cursor_to_front: true});
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

  private add_member() {
    this.d_usernames.push(this.course.allowed_guest_domain);
    Vue.nextTick(() => {
      (<ValidatedInput>
        (<Vue[]> this.$refs.username_input)[this.d_usernames.length - 1]
      ).focus({cursor_to_front: true});
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

$purple: hsl(275, 48%, 56%);
$teal: hsl(180, 100%, 24%);

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.group-members-container {
  max-width: 500px;
}

.username-container {
    padding-bottom: .625rem;
}

.remove-member-button {
    @extend .light-gray-button;
    margin-left: .5rem;
}

.add-member-button {
    @extend .flat-white-button;
}
</style>
}
