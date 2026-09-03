<template>
  <div class="single-course-component" aria-label="course">
    <div class="entity">
      <router-link
        :to="`/web/course/${course.pk}`"
        class="info course-info"
        :class="{ 'round-bottom-corners': !is_admin }"
      >
        <div class="course-name name">{{ course.name }}</div>
        <div class="course-subtitle">{{ course.subtitle }}</div>
      </router-link>

      <div class="toolbox" v-if="is_admin">
        <div
          class="clone-course tool-icon"
          role="button"
          @click="open_clone_course_modal"
          @keydown.enter="open_clone_course_modal"
          @keydown.space.prevent="open_clone_course_modal"
          :title="'Clone ' + course.name"
          tabindex="0"
        >
          <i class="fas fa-copy" aria-hidden="true"> </i>
        </div>
        <router-link
          :to="`/web/course_admin/${course.pk}`"
          :title="'Edit ' + course.name"
        >
          <div class="edit-course-settings tool-icon">
            <i class="fas fa-cog" aria-hidden="true"></i>
          </div>
        </router-link>
      </div>
    </div>

    <modal
      v-if="show_clone_course_modal"
      @close="show_clone_course_modal = false"
      aria_label="Clone course"
      :include_closing_x="!cloning"
      :click_outside_to_close="!cloning"
      size="large"
    >
      <div class="modal-header" role="heading" aria-level="1">
        Clone <span class="course-to-copy">"{{ course_to_copy_display }}"</span>
      </div>
      <new-validated-form
        autocomplete="off"
        @submit="make_copy_of_course"
        @update:is_valid="clone_course_form_is_valid = $event"
      >
        <div class="cloned-course-name form-field-wrapper">
          <validated-text-input
            ref="copy_of_course_name"
            v-model="new_course_name"
            input_style="width: 100%; max-width: 500px;"
            :validators="[is_not_empty]"
          >
            <template #label>Name</template>
          </validated-text-input>
        </div>

        <div class="form-field-wrapper">
          <label for="clone-course-semester" class="label"> Semester </label>
          <div class="dropdown">
            <select
              data-testid="semester"
              v-model="new_course_semester"
              id="clone-course-semester"
              class="select"
            >
              <option
                v-for="semester of semesters"
                :key="semester"
                :value="semester"
              >
                {{ semester }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-field-wrapper">
          <validated-int-input
            v-model="new_course_year"
            input_style="width: 65px;"
            :validators="[make_min_validator(2000)]"
          >
            <template #label>Year</template>
          </validated-int-input>
        </div>

        <APIErrors ref="api_errors"></APIErrors>

        <div class="button-footer modal-button-footer">
          <button
            type="submit"
            class="create-clone-button"
            :disabled="!clone_course_form_is_valid || cloning"
          >
            Clone Course
          </button>
          <div class="loading-vertically-centered" role="status" v-if="cloning">
            <i
              class="fa fa-spinner fa-pulse"
              role="img"
              aria-label="Loading"
            ></i>
          </div>
        </div>
      </new-validated-form>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";

import { Course, Semester } from "ag-client-typescript";

import APIErrors from "@/components/api_errors.vue";
import { APIErrorsExposed } from "@/exposed_component_types/api_errors_exposed";
import { ValidatedTextInputExposed } from "@/exposed_component_types/validated_text_input_exposed";
import Modal from "@/components/modal.vue";
import NewValidatedForm from "@/components/validated_input/NewValidatedForm.vue";
import ValidatedIntInput from "@/components/validated_input/ValidatedIntInput.vue";
import ValidatedTextInput from "@/components/validated_input/ValidatedTextInput.vue";
import { format_course_name, new_toggle } from "@/utils";
import { is_not_empty, make_min_validator } from "@/new_validators";

type PropTypes = {
  course: Course;
  is_admin?: boolean;
};
const props = withDefaults(defineProps<PropTypes>(), {
  is_admin: false,
});

const api_errors = ref<APIErrorsExposed>();
const copy_of_course_name = ref<ValidatedTextInputExposed>();

const new_course_name = ref(props.course.name);
const new_course_semester = ref<Semester>(
  props.course.semester !== null ? props.course.semester : Semester.fall,
);
const new_course_year = ref(
  props.course.year !== null ? props.course.year : new Date().getFullYear(),
);

const semesters = [
  Semester.fall,
  Semester.winter,
  Semester.spring,
  Semester.summer,
];
const clone_course_form_is_valid = ref(false);

const course_to_copy_display = computed(() => format_course_name(props.course));

const cloning = ref(false);
const show_clone_course_modal = ref(false);

function open_clone_course_modal() {
  show_clone_course_modal.value = true;
  nextTick(() => {
    copy_of_course_name.value?.focus();
  });
}

async function make_copy_of_course() {
  await new_toggle(cloning, async () => {
    try {
      await props.course.copy(
        new_course_name.value,
        new_course_semester.value,
        new_course_year.value,
      );
      show_clone_course_modal.value = false;
    } catch (error: unknown) {
      api_errors.value?.show_errors_from_response(error);
    }
  });
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/components/entity_with_toolbox.scss";
@import "@/styles/button_styles.scss";
@import "@/styles/forms.scss";
@import "@/styles/loading.scss";
@import "@/styles/modal.scss";

* {
  box-sizing: border-box;
}

.course-subtitle {
  color: darken($stormy-gray-dark, 15%);

  font-size: 1rem;
  padding-top: 0.25rem;
  min-height: 1.25rem;

  line-height: 1;
}

/**** Modal *******************************************************************/

.course-to-copy {
  color: $ocean-blue;
  margin-left: 0.125rem;
}

.cloned-course-name {
  margin-top: 0.5rem;
}

.create-clone-button {
  @extend .green-button;
}
</style>
