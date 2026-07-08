import Vue from "vue";

export interface ValidatedTextInputExposed extends Vue {
  focus(options?: { cursor_to_front?: boolean; select?: boolean }): void;
}
