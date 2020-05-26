import { Vue } from "vue-property-decorator";

import { RefSelector, Wrapper } from "@vue/test-utils";

import SelectObject from '@/components/select_object.vue';
import ValidatedInput from "@/components/validated_input.vue";
import { assert_not_null } from '@/utils';

export { sleep } from '@/utils';

type DonePredicateFunc<T extends Vue> = (wrapper: Wrapper<T>) => boolean;

// Awaits wrapper.vm.$nextTick() until done_predicate returns true or
// max_awaits is reached.
// Returns the final value of done_predicate.
export async function wait_until<T extends Vue>(
    wrapper: Wrapper<T>, done_predicate: DonePredicateFunc<T>, max_awaits = 10
): Promise<boolean> {
    await wrapper.vm.$nextTick();
    for (let i = 0; i < max_awaits && !done_predicate(wrapper); ++i) {
        await wrapper.vm.$nextTick();
    }

    return done_predicate(wrapper);
}

// Like wait_until(), but always awaits wrapper.vm.$nextTick() num_waits times.
export async function wait_fixed<T extends Vue>(wrapper: Wrapper<T>, num_waits: number) {
    for (let i = 0; i < num_waits; ++i) {
        await wrapper.vm.$nextTick();
    }
}

// A specialized version of wait_until() that waits until wrapper.vm.d_loading is false.
export async function wait_for_load<T extends (Wrapper<Vue> & {vm: {d_loading: boolean}})>(
    wrapper: T, max_awaits = 10
) {
    return wait_until(wrapper, wrap => !wrap.vm.d_loading, max_awaits);
}

// Sets the text for the given validaded input wrapper and triggers an update.
// Prefer calling this function rather than inlining its definition so that our tests
// are more robust against changes to the ValidatedInput implementation.
export function set_validated_input_text(wrapper: Wrapper<Vue>, value: string) {
    if (!is_validated_input(wrapper)) {
        throw new TypeError(`Expected ValidatedInput, but got "${wrapper.name()}"`);
    }
    return wrapper.find('.input').setValue(value);
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
// Also verifies that the input tag is a checkbox or radio button.
export function checkbox_is_checked(wrapper: Wrapper<Vue>): boolean {
    if (!is_html_input_or_select(wrapper)) {
        throw new TypeError(
            `Expected an input, select, or option element, but got "${wrapper.name()}"`);
    }

    if (wrapper.element.type !== 'checkbox' && wrapper.element.type !== 'radio') {
        throw new TypeError(
            `Expected a checkbox or radio button, but got "${wrapper.element.type }"`);
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

// Like expect_html_element_has_value, but works only on SelectObject components.
export function expect_select_object_has_value(wrapper: Wrapper<Vue>, expected: unknown) {
    if (wrapper.name() !== 'SelectObject') {
        throw new TypeError(`Expected a SelectObject element, but got "${wrapper.name()}"`);
    }
    expect_html_element_has_value(wrapper.find('.select'), expected);
}

type InputOrSelect = Wrapper<Vue>
                     & {element: HTMLInputElement & HTMLSelectElement & HTMLOptionElement};
function is_html_input_or_select(wrapper: Wrapper<Vue>): wrapper is InputOrSelect {
    let name = wrapper.name().toLowerCase();
    return name === 'input'
           || name === 'select'
           || name === 'option';
}

// Sets the selected item of a select-object tag.
// Note that select_value should be the value used to identify the object, not
// the object itself.
export function set_select_object_value(select_object_wrapper: Wrapper<Vue>,
                                        select_value: unknown) {
    if (!is<SelectObject>(select_object_wrapper.vm,
                          select_object_wrapper.name() === 'SelectObject')) {
        throw new TypeError(
            `Expected a select-option element, but got "${select_object_wrapper.name()}"`);
    }

    return select_object_wrapper.find('.select').setValue(select_value);
}

function is<T>(obj: unknown, condition: boolean): obj is T {
    return condition;
}

export function compress_whitespace(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
}

export async function do_invalid_text_input_test(
    component_wrapper: Wrapper<Vue>,
    input_selector: string | RefSelector,
    invalid_text: string,
    save_button_selector: string | RefSelector | null
) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    expect(validated_input_is_valid(input_wrapper)).toEqual(true);
    if (save_button_selector !== null) {
        // tslint:disable-next-line
        expect(component_wrapper.find(<any> save_button_selector).is('[disabled]')).toBe(false);
    }

    await set_validated_input_text(input_wrapper, invalid_text);

    expect(validated_input_is_valid(input_wrapper)).toEqual(false);

    if (save_button_selector !== null)  {
        // tslint:disable-next-line
        let save_button_wrapper = component_wrapper.find(<any> save_button_selector);
        expect(save_button_wrapper.is('[disabled]')).toBe(true);
    }
}

export async function do_input_blank_or_not_integer_test(
    component_wrapper: Wrapper<Vue>,
    input_selector: string | RefSelector,
    save_button_selector: string | RefSelector | null
) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    let original_text = get_validated_input_text(input_wrapper);

    await do_invalid_text_input_test(component_wrapper, input_selector, ' ', save_button_selector);
    await set_validated_input_text(input_wrapper, original_text);
    return do_invalid_text_input_test(
        component_wrapper, input_selector, 'not num', save_button_selector);
}

export function find_by_name<T extends Vue>(wrapper: Wrapper<Vue>, name: string): Wrapper<T> {
    return <Wrapper<T>> wrapper.find({name: name});
}

// Thin wrapper function around the vue-test-utils Wrapper.emitted('string') method.
// Asserts that the result of wrapper.emitted(event_name) is not undefined
// and returns that result with a narrowed type.
export function emitted(wrapper: Wrapper<Vue>, event_name: string) {
    let result = wrapper.emitted(event_name);
    assert_not_null(result);
    return result;
}

// A type-checked version of wrapper.setProps()
// Note that type checking does not cover whether the items in "props"
// are input properties (as opposed to data members) for the component.
export function set_props<T extends Vue>(wrapper: Wrapper<T>, props: Partial<T>) {
    return wrapper.setProps(props);
}

// A type-checked version of wrapper.setData(). This function also introduces
// an optional "recursive" flag (defaults to true to match wrapper.setData()).
// When set to false, this function will only set the top-level keys rather
// than recursing when the value is an object.
//
// Note that type checking does not cover whether the items in "data"
// are data members (as opposed to input properties) for the component.
export function set_data<T extends Vue>(
    wrapper: Wrapper<T>, data: Partial<T>, recursive?: false): Promise<void>;
export function set_data<T extends Vue>(
    wrapper: Wrapper<T>, data: SetDataInputPartial<T>, recursive?: true): Promise<void>;
export function set_data<T extends Vue>(
    wrapper: Wrapper<T>, data: object, recursive = true
) {
    if (recursive) {
        return wrapper.setData(data);
    }

    for (let [key, value] of Object.entries(data)) {
        Vue.set(wrapper.vm, key, value);
    }
    return wrapper.vm.$nextTick();
}

// A (mostly) recursive version of Partial. Note that it does not recursively
// apply to array elements.
type SetDataInputPartial<T> = {
    // tslint:disable-next-line
    [Key in keyof T]?: T[Key] extends Array<infer U> ? Array<U> : SetDataInputPartial<T[Key]>
};
