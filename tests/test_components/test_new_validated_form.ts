import { mount } from "@vue/test-utils";
import { defineComponent, DefineComponent, h, VNode } from "vue";

import NewValidatedForm from "@/components/validated_input/NewValidatedForm.vue";
import ValidatedTextInput from "@/components/validated_input/ValidatedTextInput.vue";
import { make_min_length_validator } from "@/new_validators";

describe("NewValidatedForm", () => {
  test("emits initial valid value when there are no validated input children", () => {
    const wrapper = make_form_wrapper(make_simple_slot_component(0));
    expect(wrapper.emitted("validity_changed")?.[0]).toEqual([true]);
  });

  test("emits valid value only when all validated input children are valid", async () => {
    const wrapper = make_form_wrapper(make_simple_slot_component(3));
    expect(wrapper.emitted("validity_changed")?.[0]).toEqual([false]);

    const inputs = wrapper.findAll("input");
    expect(inputs.length).toBe(3);

    await inputs.at(0).setValue("valid");
    expect(wrapper.emitted("validity_changed")?.length).toBe(1);

    await inputs.at(1).setValue("valid");
    expect(wrapper.emitted("validity_changed")?.length).toBe(1);

    await inputs.at(2).setValue("valid");
    expect(wrapper.emitted("validity_changed")?.length).toBe(2);
    expect(wrapper.emitted("validity_changed")?.[1]).toEqual([true]);
  });

  test("emits submit_invalid when form is submitted with an invalid input", async () => {
    const wrapper = make_form_wrapper(make_simple_slot_component(1));
    await wrapper.find('button[type="submit"]').trigger("submit");

    expect(wrapper.emitted("submit"))?.toBeFalsy();
    expect(wrapper.emitted("submit_invalid"))?.toBeTruthy();
  });

  test("emits valid value when only invalid child input is destroyed", () => {
    const wrapper = make_form_wrapper(make_simple_slot_component(1));
    expect(wrapper.emitted("validity_changed")?.[0]).toEqual([false]);

    wrapper.findComponent(ValidatedTextInput).destroy();
    expect(wrapper.emitted("validity_changed")?.[1]).toEqual([true]);
  });

  test("emits correct validity with deeply nested validated input components", async () => {
    const wrapper = make_form_wrapper(make_nested_slot_component());
    expect(wrapper.emitted("validity_changed")?.[0]).toEqual([false]);

    const inputs = wrapper.findAll("input");
    expect(inputs.length).toBe(3);

    await inputs.at(0).setValue("valid");
    expect(wrapper.emitted("validity_changed")?.length).toBe(1);

    await inputs.at(1).setValue("valid");
    expect(wrapper.emitted("validity_changed")?.length).toBe(1);

    await inputs.at(2).setValue("valid");
    expect(wrapper.emitted("validity_changed")?.length).toBe(2);
    expect(wrapper.emitted("validity_changed")?.[1]).toEqual([true]);
  });
});

/**
 * Return a VNode instance of a ValidatedTextInput component that starts with
 * an empty string as the value, and a single validator that requires the value
 * to be a non-empty string.
 */
function make_validated_input_VNode() {
  return h(ValidatedTextInput, {
    props: {
      value: "",
      validators: [make_min_length_validator(1)],
    },
  });
}

/**
 * Define a slot component with a submit button and `num_inputs` number of
 * ValidatedTextInputs. Each input component will start with an empty string,
 * and will be valid when the input is a non-empty string.
 */
function make_simple_slot_component(num_inputs: number) {
  return defineComponent({
    setup() {
      const inputs: VNode[] = Array(num_inputs).fill(
        make_validated_input_VNode(),
      ) as VNode[];
      return () =>
        h("div", [...inputs, h("button", { attrs: { type: "submit" } })]);
    },
  });
}

/**
 * Define a slot component three ValidatedTextInput components, each subsequent
 * component nested in an additional div. Each input component will start with an
 * empty string, and will be valid when the input is a non-empty string.
 */
function make_nested_slot_component() {
  return defineComponent({
    setup() {
      return () =>
        h("div", [
          make_validated_input_VNode(),
          h("div", [
            make_validated_input_VNode(),
            h("div", [make_validated_input_VNode()]),
          ]),
        ]);
    },
  });
}

/**
 * Mount a NewValidatedForm component, with a component `slot_wrapper` passed
 * as a slot
 */
function make_form_wrapper(slot_wrapper: DefineComponent) {
  return mount(NewValidatedForm, {
    slots: {
      default: slot_wrapper,
    },
    global: {
      components: {
        ValidatedTextInput,
      },
    },
  });
}
