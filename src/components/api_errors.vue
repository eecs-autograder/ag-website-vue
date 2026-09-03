<template>
  <div role="alert" aria-atomic="true">
    <div
      v-for="(error, index) of state.api_errors"
      :key="index"
      class="error-msg-container"
    >
      <div class="error-msg">{{ error }}</div>
      <button
        class="dismiss-error-button"
        type="button"
        @click="
          state.api_errors.splice(index, 1);
          $emit('num_errors_changed', state.api_errors.length);
        "
      >
        <span class="dismiss-error">Dismiss</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { HttpError } from "ag-client-typescript";
import { SYSADMIN_CONTACT } from "@/constants";

// Emits
const emit = defineEmits<{
  num_errors_changed: [count: number];
}>();

// Reactive state object
const state = reactive({
  api_errors: [] as string[],
});

// Methods
const show_errors_from_response = (
  error_response: unknown,
  clear_current_errors = true,
) => {
  if (clear_current_errors) {
    state.api_errors = [];
  }

  // There isn't a great way to detect network errors, but we know
  // that the message will be "Network Error".
  // https://github.com/axios/axios/issues/383
  if ((<Error>error_response).message.includes("Network")) {
    state.api_errors.push(
      "Network error detected. Please check your connection and try again",
    );
    console.error(error_response);
  } else if (!(error_response instanceof HttpError)) {
    state.api_errors.push(
      "An unexpected error occurred. If the problem persists, please contact " +
        SYSADMIN_CONTACT +
        " and include the version number of your browser and " +
        "output of the JavaScript console " +
        "(https://webmasters.stackexchange.com/questions/8525/" +
        "how-do-i-open-the-javascript-console-in-different-browsers).",
    );
    console.error(error_response);
  } else if (error_response.status === 413) {
    state.api_errors.push(
      "Error: Request too large. If you are uploading files, please reduce their size.",
    );
  } else if (error_response.status === 400) {
    show_400_error_data(error_response);
  } else if (error_response.status === 401) {
    state.api_errors.push(
      "You are not signed in. Please sign in and try again.",
    );
  } else {
    let error_detail = JSON.stringify(error_response.data);
    if (error_response.status === 504) {
      error_detail = "The request timed out. Please try again later.";
    } else if (error_response.status === 502) {
      error_detail = "Bad gateway";
    }

    state.api_errors.push(
      `Error occurred requesting "${error_response.url}": ` +
        `${error_response.status} ${error_detail}`,
    );
  }

  emit("num_errors_changed", state.api_errors.length);
};

const show_400_error_data = (error: HttpError) => {
  if (typeof error.data === "string") {
    state.api_errors.push(error.data);
  } else {
    for (let [field_name, message] of Object.entries(error.data)) {
      if (field_name === "__all__") {
        if (Array.isArray(message)) {
          state.api_errors.push(String(message[0]));
        } else if (typeof message === "string") {
          state.api_errors.push(message);
        }
      } else {
        state.api_errors.push(`Error in "${field_name}": ${message}`);
      }
    }
  }
};

const clear = () => {
  state.api_errors = [];
  emit("num_errors_changed", 0);
};

// Expose state and methods for external access (tests, parent components)
defineExpose({
  state,
  show_errors_from_response,
  clear,
});
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.error-msg-container {
  width: 100%;
  display: flex;
  align-items: center;

  background-color: #f8d7da;
  border: 1px solid #f5c6cb;

  padding: 0.5rem;
  border-radius: 2px;
  margin: 0.25rem 0;
}

.error-msg {
  margin-right: 1rem;
}

.dismiss-error-button {
  @extend .flat-white-button;
  font-size: 0.875rem;
  padding: 0.25rem 0.625rem;

  margin-left: auto;
  border: 1px solid #f5c6cb;
}
</style>
