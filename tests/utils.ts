import ValidatedInput from "@/components/validated_input.vue";
import { Wrapper } from "@vue/test-utils";
import { Vue } from "vue-property-decorator";

export function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Sets the text for the given validaded input wrapper and triggers an update.
// Prefer calling this function rather than inlining its definition so that our tests
// are more robust against changes to the ValidatedInput implementation.
export function set_validated_input_text(wrapper: Wrapper<ValidatedInput>, value: string) {
    wrapper.find('#input').setValue(value);
}

// Gets the text that is currentli entered in the validadet input.
// Prefer calling this function rather than inlining its definition so that our tests
// are more robust against changes to the ValidatedInput implementation.
export function get_validated_input_text(wrapper: Wrapper<ValidatedInput>): string {
    return wrapper.find('#input').element.value;
}

export function checkbox_is_checked(wrapper: Wrapper<Vue>): boolean {
    return wrapper.element.checked;
}
