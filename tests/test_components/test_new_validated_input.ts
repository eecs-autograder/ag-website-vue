import { mount } from "@vue/test-utils";
import Vue, { ref, DefineComponent, CSSProperties } from "vue";
import { vi } from "vitest";

import { ValidatorFuncType } from "@/composables/use_validation";

import ValidatedIntInput from "@/components/validated_input/ValidatedIntInput.vue";
import ValidatedTextInput from "@/components/validated_input/ValidatedTextInput.vue";
import ValidatedTextAreaInput from "@/components/validated_input/ValidatedTextAreaInput.vue";
import {
  make_min_validator,
  make_min_length_validator,
} from "@/new_validators";

type CommonProps<T> = {
  value: T;
  validators: ValidatorFuncType<T>[];
  placeholder?: string;
  force_show_errors?: boolean;
  input_style?: CSSProperties;
};
type ComponentType<T> = DefineComponent<CommonProps<T>>;

// Driver code for common behavior between validated input components
runCommonTests<string>({
  Component: ValidatedTextInput,
  input_type: "input",
  validator: make_min_length_validator(2),
  valid_input: "OK",
  invalid_input: "",
  error_contains: "2",
});
runCommonTests<number>({
  Component: ValidatedIntInput,
  input_type: "input",
  validator: make_min_validator(2),
  valid_input: 2,
  invalid_input: 1,
  error_contains: "2",
});
runCommonTests<string>({
  Component: ValidatedTextAreaInput,
  input_type: "textarea",
  validator: make_min_length_validator(2),
  valid_input: "OK",
  invalid_input: "",
  error_contains: "2",
});

function runCommonTests<T>(params: {
  Component: ComponentType<T>;
  input_type: string;
  validator: ValidatorFuncType<T>;
  valid_input: T;
  invalid_input: T;
  error_contains: string;
}) {
  const {
    Component,
    input_type,
    validator,
    valid_input,
    invalid_input,
    error_contains,
  } = params;

  describe(Component.__name as string, () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("displays placeholder text if specified when input is empty", () => {
      const wrapper = mount(Component, {
        propsData: {
          value: ref(valid_input),
          validators: [],
          placeholder: "hello",
        },
      });
      expect(wrapper.find(input_type).attributes("placeholder")).toEqual(
        "hello",
      );
    });

    test("doesn't update v-model value when input is invalid", async () => {
      const input = ref(valid_input);
      const wrapper = mount(Component, {
        propsData: {
          value: input,
          validators: [validator],
        },
      });
      await Vue.nextTick();
      expect(input.value).toEqual(valid_input);

      await wrapper.find(input_type).setValue(invalid_input);
      await Vue.nextTick();
      expect(input.value).toEqual(valid_input);
    });

    test("does not display error messages initially", async () => {
      const wrapper = mount(Component, {
        propsData: {
          value: ref(invalid_input),
          validators: [validator],
        },
      });

      // wait for error to display (it shouldn't)
      vi.runAllTimers();
      await Vue.nextTick();
      expect(wrapper.text()).not.toContain(error_contains);
    });

    test("does display error messages initially if force_show_errors is provided ", async () => {
      const wrapper = mount(Component, {
        propsData: {
          value: ref(invalid_input),
          validators: [validator],
          force_show_errors: true,
        },
      });

      // wait for error to display (it should)
      vi.runAllTimers();
      await Vue.nextTick();
      expect(wrapper.text()).toContain(error_contains);
    });

    test("removes errors immediately as they are corrected", async () => {
      const wrapper = mount(Component, {
        propsData: {
          value: ref(invalid_input),
          validators: [validator],
          force_show_errors: true,
        },
      });

      // wait for initial error to render
      vi.runAllTimers();
      await Vue.nextTick();

      await wrapper.find(input_type).setValue(valid_input);
      await Vue.nextTick();
      expect(wrapper.text()).not.toContain(error_contains);
    });

    test("shows errors shortly after they are found", async () => {
      const wrapper = mount(Component, {
        propsData: {
          value: ref(valid_input),
          validators: [validator],
          force_show_errors: true,
        },
      });

      // don't show error immediately
      await wrapper.find(input_type).setValue(invalid_input);
      await Vue.nextTick();
      expect(wrapper.text()).not.toContain(error_contains);

      // show after debounce timer
      vi.runAllTimers();
      await Vue.nextTick();
      expect(wrapper.text()).toContain(error_contains);
    });

    test("uses modified input style when input_style prop is provided", () => {
      const wrapper = mount(Component, {
        propsData: {
          value: ref(valid_input),
          validators: [],
          input_style: { backgroundColor: "yellow" },
        },
      });
      const style = getComputedStyle(wrapper.find(input_type).element);
      expect(style.backgroundColor).toBe("yellow");
    });

    test("emits validity_changed event when validity changes", async () => {
      const wrapper = mount(Component, {
        propsData: {
          value: ref(invalid_input),
          validators: [validator],
          input_style: { backgroundColor: "yellow" },
        },
      });

      await Vue.nextTick();
      console.log(wrapper.emitted('validity_changed'))
      expect(wrapper.emitted('validity_changed')?.length).toBe(1);
      expect(wrapper.emitted('validity_changed')?.[0]).toStrictEqual([false]);

      await wrapper.find(input_type).setValue(valid_input);
      await Vue.nextTick();
      console.log(wrapper.emitted('validity_changed'))
      expect(wrapper.emitted('validity_changed')?.length).toBe(2);
      expect(wrapper.emitted('validity_changed')?.[1]).toStrictEqual([true]);

      await wrapper.find(input_type).setValue(invalid_input);
      await Vue.nextTick();
      console.log(wrapper.emitted('validity_changed'))
      expect(wrapper.emitted('validity_changed')?.length).toBe(3);
      expect(wrapper.emitted('validity_changed')?.[2]).toStrictEqual([false]);
    })
  });
}
