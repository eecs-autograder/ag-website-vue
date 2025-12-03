<template>
  <new-validated-form
    ref="group_members_form"
    @submit="submit"
    @update:is_valid="$emit('form_validity_changed', $event)"
  >
    <slot name="header"></slot>
    <div class="group-members-container">
      <div
        class="username-container"
        v-for="(member, index) of state.usernames"
      >
        <validated-text-input
          v-model="state.usernames[index]"
          :validators="[is_email]"
          ref="username_input"
          @input="$emit('input', state.usernames)"
        >
          <button
            slot="suffix"
            class="remove-member-button"
            :disabled="state.usernames.length <= min_num_inputs"
            :title="`Remove ${member} from group`"
            type="button"
            @click="
              state.usernames.splice(index, 1);
              $emit('input', state.usernames);
            "
          >
            <i class="fas fa-times"></i>
          </button>
        </validated-text-input>
      </div>
      <div class="add-member-container">
        <button
          class="add-member-button"
          type="button"
          :disabled="
            max_num_inputs != null && state.usernames.length >= max_num_inputs
          "
          @click="add_member"
        >
          <i class="fas fa-plus"></i>
          Add Member
        </button>
      </div>
    </div>
    <slot name="footer"></slot>
  </new-validated-form>
</template>

<script setup lang="ts">
import { Course } from "ag-client-typescript";
import { reactive, watch, onMounted, nextTick, ref } from "vue";
import NewValidatedForm from "./validated_input/NewValidatedForm.vue";
import ValidatedTextInput from "./validated_input/ValidatedTextInput.vue";
import { is_email } from "@/new_validators";

// Props
type PropTypes = {
  course: Course;
  max_num_inputs: Number;
  min_num_inputs: Number;
  value?: String[];
};

const props = withDefaults(defineProps<PropTypes>(), {
  value: () => [],
});

// Emits
const emit = defineEmits<{
  form_validity_changed: [is_valid: boolean];
  input: [usernames: string[]];
  submit: [usernames: string[]];
}>();

// Template refs
const group_members_form = ref<InstanceType<typeof NewValidatedForm>>();
const username_input = ref<InstanceType<typeof ValidatedTextInput>[]>([]);

// Reactive state object
const state = reactive({
  usernames: [] as string[],
});

// Methods
const initialize = (value: string[]) => {
  console.log("initialize called");
  if (value.length === 0) {
    state.usernames = Array(props.min_num_inputs).fill(
      props.course.allowed_guest_domain,
    );
  } else {
    state.usernames = value.slice();
  }
};

const add_member = () => {
  state.usernames.push(props.course.allowed_guest_domain);
  nextTick(() => {
    const inputs = username_input.value;
    if (inputs && inputs[state.usernames.length - 1]) {
      inputs[state.usernames.length - 1].focus({ cursor_to_front: true });
    }
  });
};

const submit = () => {
  emit("submit", state.usernames);
};

const reset = () => {
  initialize(props.value);
};

// Watch for value prop changes
watch(
  () => props.value,
  (new_value: string[], old_value: string[]) => {
    initialize(new_value);
  },
  { deep: true },
);

// Lifecycle - equivalent to created()
initialize(props.value);

// Lifecycle - equivalent to mounted()
onMounted(() => {
  const inputs = username_input.value;
  if (inputs && inputs[0]) {
    inputs[0].focus({ cursor_to_front: true });
  }
});

// Expose state and methods for external access (tests, parent components)
defineExpose({
  state,
  submit,
  reset,
});
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/button_styles.scss";

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
  padding-bottom: 0.625rem;
}

.remove-member-button {
  @extend .light-gray-button;
  margin-left: 0.5rem;
}

.add-member-button {
  @extend .flat-white-button;
}
</style>
