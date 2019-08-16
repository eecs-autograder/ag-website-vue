import { Vue } from "vue-property-decorator";

import { RefSelector, Wrapper } from "@vue/test-utils";

import ValidatedInput from "@/components/validated_input.vue";

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
    wrapper.find('.input').setValue(value);
}

// Gets the text that is currently entered in the validated input.
// Prefer calling this function rather than inlining its definition so that our tests
// are more robust against changes to the ValidatedInput implementation.
export function get_validated_input_text(wrapper: Wrapper<Vue>): string {
    if (!is_validated_input(wrapper)) {
        throw new TypeError(`Expected ValidatedInput, but got "${wrapper.name()}"`);
    }
    return (<HTMLInputElement> wrapper.find('.input').element).value;
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

export async function do_invalid_text_input_test_without_save_button(
        component_wrapper: Wrapper<Vue>,
        input_selector: string | RefSelector,
        invalid_text: string) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    expect(validated_input_is_valid(input_wrapper)).toEqual(true);

    set_validated_input_text(input_wrapper, invalid_text);
    await component_wrapper.vm.$nextTick();

    expect(validated_input_is_valid(input_wrapper)).toEqual(false);
}

export async function do_input_blank_or_not_integer_test_without_save_button(
        component_wrapper: Wrapper<Vue>,
        input_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    let original_text = get_validated_input_text(input_wrapper);

    await do_invalid_text_input_test_without_save_button(
        component_wrapper, input_selector, ' '
    );
    set_validated_input_text(input_wrapper, original_text);
    return do_invalid_text_input_test_without_save_button(
        component_wrapper, input_selector, 'not num'
    );
}

export async function do_invalid_text_input_test(component_wrapper: Wrapper<Vue>,
                                                 input_selector: string | RefSelector,
                                                 invalid_text: string,
                                                 save_button_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    expect(validated_input_is_valid(input_wrapper)).toEqual(true);
    // tslint:disable-next-line
    expect(component_wrapper.find(<any> save_button_selector).is('[disabled]')).toBe(false);

    set_validated_input_text(input_wrapper, invalid_text);
    await component_wrapper.vm.$nextTick();

    expect(validated_input_is_valid(input_wrapper)).toEqual(false);
    // tslint:disable-next-line
    let save_button_wrapper = component_wrapper.find(<any> save_button_selector);
    expect(save_button_wrapper.is('[disabled]')).toBe(true);
}

export async function do_input_blank_or_not_integer_test(
        component_wrapper: Wrapper<Vue>,
        input_selector: string | RefSelector,
        save_button_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    let original_text = get_validated_input_text(input_wrapper);

    await do_invalid_text_input_test(component_wrapper, input_selector, ' ', save_button_selector);
    set_validated_input_text(input_wrapper, original_text);
    return do_invalid_text_input_test(
        component_wrapper, input_selector, 'not num', save_button_selector);
}
