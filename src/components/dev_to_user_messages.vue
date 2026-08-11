<template>
  <div role="alert">
    <div id="global-dev-to-user-messages" v-if="state.to_display.length !== 0">
      <div
        v-for="(message, index) of state.to_display"
        :key="index"
        class="message-container"
      >
        <div class="message" v-html="as_markdown(message)"></div>
        <button
          class="dismiss-message-button"
          type="button"
          @click="dismiss_message(message)"
        >
          <span class="dismiss-message">Dismiss</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";

import DOMPurify from "dompurify";
import showdown from "showdown";
import { get_cookie } from "@/cookie";

const converter = new showdown.Converter();

type PropTypes = {
  messages?: ReadonlyArray<Readonly<Message>>;
};

interface Message {
  for_version: string;
  text: string;
}

const props = withDefaults(defineProps<PropTypes>(), {
  messages: [] as ReadonlyArray<Readonly<Message>>,
});

const state = reactive<{ to_display: Message[] }>({
  to_display: [],
});

onMounted(() => {
  // Display nothing if we're running e2e tests
  if (get_cookie('E2E_TEST_MODE') === 'true') {
    return;
  }

  for (const message of props.messages ?? []) {
    if (!was_dismissed(message)) {
      state.to_display.push(message);
    }
  }
});

function as_markdown(message: Message) {
  return DOMPurify.sanitize(<string>converter.makeHtml(message.text));
}

function dismiss_message(message: Message) {
  localStorage.setItem(get_message_id(message), "dismissed");
  state.to_display.splice(state.to_display.indexOf(message), 1);
}

function was_dismissed(message: Message) {
  return localStorage.getItem(get_message_id(message)) !== null;
}

function get_message_id(message: Message) {
  return message.for_version + " " + message.text;
}
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#global-dev-to-user-messages {
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: 90%;

  max-width: 700px;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 0.25rem 0.5rem;

  background-color: white;
  border: 1px solid $pebble-dark;
  border-top: none;
}

.message-container {
  width: 100%;
  display: flex;
  align-items: center;

  background-color: lighten($light-blue, 4%);
  border: 1px solid darken($light-blue, 10%);

  padding: 0.5rem;
  border-radius: 2px;
  margin: 0.25rem 0;
}

.message {
  margin-right: 1rem;
}

.dismiss-message-button {
  @extend .flat-white-button;
  font-size: 0.875rem;
  padding: 0.25rem 0.625rem;

  margin-left: auto;
  border: 1px solid #f5c6cb;
}
</style>
