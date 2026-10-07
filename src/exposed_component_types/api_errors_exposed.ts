import { Ref } from "vue";

export interface APIErrorsExposed extends Vue {
  show_errors_from_response(response: unknown): void;
  clear(): void;
  state: unknown;
  has_errors: Ref<boolean>;
}
