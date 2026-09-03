<template>
  <div id="create-group-component">
    <group-members-form
      :project="project"
      :course="course"
      @submit="create_group"
      :ignore_group_size_limits="true"
    >
      <template v-slot:header>
        <div class="label">Group members</div>
      </template>
      <template v-slot:footer>
        <APIErrors ref="api_errors"> </APIErrors>
        <button
          class="create-group-button"
          type="submit"
          :disabled="creating_group"
        >
          Create Group
        </button>
      </template>
    </group-members-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { Course, Group, Project } from "ag-client-typescript";

import APIErrors from "@/components/api_errors.vue";
import { APIErrorsExposed } from "@/exposed_component_types/api_errors_exposed";
import GroupMembersForm from "@/components/group_members_form.vue";
import { new_toggle } from "@/utils";

type PropTypes = {
  course: Course;
  project: Project;
};

const props = defineProps<PropTypes>();

const api_errors = ref<APIErrorsExposed>();
const creating_group = ref(false);

const create_group = (usernames: string[]) => {
  return new_toggle(creating_group, async () => {
    try {
      api_errors.value?.clear();
      await Group.create(props.project.pk, { member_names: usernames });
    } catch (error: unknown) {
      api_errors.value?.show_errors_from_response(error);
    }
  });
};
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";
@import "@/styles/forms.scss";

.label {
  margin-top: 0.625rem;
}

.create-group-button {
  @extend .teal-button;
  margin-top: 0.875rem;
}
</style>
