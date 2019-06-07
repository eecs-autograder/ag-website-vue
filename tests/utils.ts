import ValidatedInput from "@/components/validated_input.vue";
import { Wrapper } from "@vue/test-utils";
import { Vue } from "vue-property-decorator";

export function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Sets the text for the given validaded input wrapper and triggers an update.
// Prefer calling this function rather than inlining its definition so that our tests
// are more robust against changes to the ValidatedInput implementation.
export function set_validated_input_text(wrapper: Wrapper<Vue>, value: string) {
    if (!is_validated_input(wrapper)) {
        throw new TypeError(`Expected ValidatedInput, but got "${wrapper.name()}"`);
    }
    wrapper.find('#input').setValue(value);
}

// Gets the text that is currently entered in the validated input.
// Prefer calling this function rather than inlining its definition so that our tests
// are more robust against changes to the ValidatedInput implementation.
export function get_validated_input_text(wrapper: Wrapper<Vue>): string {
    if (!is_validated_input(wrapper)) {
        throw new TypeError(`Expected ValidatedInput, but got "${wrapper.name()}"`);
    }
    return (<HTMLInputElement> wrapper.find('#input').element).value;
}

// Verifies that the given wrapper holds a ValidatedInput and returns whether it is valid.
export function validated_input_is_valid(wrapper: Wrapper<Vue>): boolean {
    if (!is_validated_input(wrapper)) {
        throw new TypeError(`Expected ValidatedInput, but got "${wrapper.name()}"`);
    }
    return wrapper.vm.is_valid;
}

function is_validated_input(wrapper: Wrapper<Vue>): wrapper is Wrapper<ValidatedInput> {
    return wrapper.name() === 'ValidatedInput';
}

// Verifies that the given wrapper holds an input tag and returns whether it is checked.
// Also verifies that the input tag is a checkbox.
export function checkbox_is_checked(wrapper: Wrapper<Vue>): boolean {
    if (!is_html_input_or_select(wrapper)) {
        throw new TypeError(
            `Expected an input, select, or option element, but got "${wrapper.name()}"`);
    }

    if (wrapper.element.type !== 'checkbox') {
        throw new TypeError(`Expected a checkbox, but got "${wrapper.element.type }"`);
    }

    return wrapper.element.checked;
}

// Verifies that the given wrapper holds either an input, select, or option tag,
// and checks whether that element has the expected value, failing the current test
// if it does not.
export function expect_html_element_has_value(wrapper: Wrapper<Vue>, expected: unknown) {
    if (!is_html_input_or_select(wrapper)) {
        throw new TypeError(
            `Expected an input, select, or option element, but got "${wrapper.name()}"`);
    }
    expect(wrapper.element.value).toEqual(expected);
}

type InputOrSelect = Wrapper<Vue>
                     & {element: HTMLInputElement & HTMLSelectElement & HTMLOptionElement};
function is_html_input_or_select(wrapper: Wrapper<Vue>): wrapper is InputOrSelect {
    return wrapper.name() === 'input'
           || wrapper.name() === 'select'
           || wrapper.name() === 'option';
}
