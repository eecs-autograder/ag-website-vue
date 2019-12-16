<template>
  <div id="create-group-component">
    <group-members-form ref="create_group_form"
                        :project="project"
                        :course="course"
                        @submit="create_group"
                        :ignore_group_size_limits="true">
      <template v-slot:header>
        <div class="label">Group members</div>
      </template>
      <template v-slot:footer>
        <APIErrors ref="api_errors"> </APIErrors>
        <button class="create-group-button"
                type="submit"
                :disabled="d_creating_group">
          Create Group
        </button>
      </template>
    </group-members-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Group, NewGroupData, Project } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import GroupMembersForm from '@/components/group_members_form.vue';
import ValidatedForm from '@/components/validated_form.vue';
import { handle_api_errors_async } from '@/utils';

export interface GroupMember {
  id: number;
  username: string;
}

@Component({
  components: {
    APIErrors,
    GroupMembersForm,
    ValidatedForm,
  }
})
export default class CreateSingleGroup extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Project})
  project!: Project;

  d_creating_group = false;

  @handle_api_errors_async(handle_create_group_error)
  async create_group(usernames: string[]) {
    try {
      this.d_creating_group = true;
      (<APIErrors> this.$refs.api_errors).clear();

      await Group.create(this.project.pk, {member_names: usernames});
    }
    finally {
      this.d_creating_group = false;
    }
  }
}

function handle_create_group_error(component: CreateSingleGroup, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

.label {
  margin-top: .625rem;
}

.create-group-button {
  @extend .teal-button;
  margin-top: .875rem;
}
</style>
