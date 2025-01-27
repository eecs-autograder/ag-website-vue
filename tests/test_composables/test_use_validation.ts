import { mount } from "@vue/test-utils";
import { vi } from "vitest";
import Vue, { ComponentPublicInstance, h, ref } from "vue";

import {
  use_validation,
  UseValidationParams,
  ValidatorFuncType,
} from "@/composables/use_validation";

describe("use_validation", () => {
  test("registers and unregisters with parent component", () => {
    const uid = 1;
    const register = vi.fn((_) => uid);
    const unregister = vi.fn((_) => undefined);

    make_use_validation_comp({
      input: ref(""),
      validators: [],
    });

    const wrapper = mount(
      make_use_validation_parent({
        register,
        unregister,
      }),
    );

    expect(register).toHaveBeenCalledTimes(1);

    wrapper.destroy();
    expect(unregister).toHaveBeenCalledWith(uid);
  });

  test("emits initial valid input value", () => {
    const child = make_use_validation_comp({
      input: ref(""),
      validators: [],
    });

    const wrapper = mount(child);
    expect(wrapper.emitted("input")?.[0]).toEqual([""]);
  });

  test("does not emit initial invalid input value", () => {
    const child = make_use_validation_comp({
      input: ref(""),
      validators: [(_) => ({ is_valid: false, error_msg: "invalid" })],
    });

    const wrapper = mount(child);
    expect(wrapper.emitted()).not.toHaveProperty("input");
  });

  test("emits input value when changed to a valid value", async () => {
    const input = ref("");
    const child = make_use_validation_comp({
      input: input,
      validators: [],
    });

    const wrapper = mount(child);
    input.value = "valid!";

    await Vue.nextTick();
    expect(wrapper.emitted("input")).toEqual(
      expect.arrayContaining([["valid!"]]),
    );
  });

  test("does not emit input value when changed to an invalid value", async () => {
    const input = ref("");
    const child = make_use_validation_comp({
      input: input,
      validators: [default_validator],
    });

    const wrapper = mount(child);
    input.value = "invalid!";

    await Vue.nextTick();
    expect(
      (wrapper.emitted("input") as Array<[string]>).some(
        (event) => event[0] === "invalid!",
      ),
    ).toBeFalsy();
  });

  test("updates return values when input is changed to an invalid value", async () => {
    const input = ref("");
    const child = make_use_validation_comp({
      input: input,
      validators: [default_validator],
    });

    const wrapper = mount(child);
    const vm = wrapper.vm as unknown as ComponentInstance;

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);

    input.value = "invalid!";
    await Vue.nextTick();

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["invalid!"]);
  });

  test("updates return values when input is changed to a valid value", async () => {
    const input = ref("invalid!");
    const child = make_use_validation_comp({
      input: input,
      validators: [default_validator],
    });

    const wrapper = mount(child);
    const vm = wrapper.vm as unknown as ComponentInstance;

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["invalid!"]);

    input.value = "";
    await Vue.nextTick();

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);
  });

  test("updates return values correctly with multiple validators", async () => {
    const input = ref("");
    const child = make_use_validation_comp({
      input: input,
      validators: [
        default_validator,
        (value) => {
          // non-empty string validator
          if (value.length === 0) {
            return {
              is_valid: false,
              error_msg: "empty string",
            };
          }
          return { is_valid: true };
        },
        (value) => {
          // does not contain ! validator
          if (value.includes("!")) {
            return {
              is_valid: false,
              error_msg: "includes !",
            };
          }
          return { is_valid: true };
        },
      ],
    });

    const wrapper = mount(child);
    const vm = wrapper.vm as unknown as ComponentInstance;

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["empty string"]);

    input.value = "invalid!";
    await Vue.nextTick();

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(
      expect.arrayContaining(["includes !", "invalid!"]),
    );

    input.value = "!";
    await Vue.nextTick();

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["includes !"]);

    input.value = "valid";
    await Vue.nextTick();

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);
  });

  test("updates return values when parsing fails", async () => {
    const input = ref(["hello", "world"]);
    const child = make_use_validation_comp<string[]>({
      input: input,
      validators: [],
      parser: (value) => {
        if (value.length > 2) {
          return {
            is_valid: false,
            error_msg: "more than 2",
          };
        }
        return {
          is_valid: true,
          output: value.join(" "),
        };
      },
    });

    const wrapper = mount(child);
    const vm = wrapper.vm as unknown as ComponentInstance;

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);

    input.value = ["hello", "beautiful", "world"];
    await Vue.nextTick();

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["more than 2"]);
  });

  test("updates return values when parsing succeeds", async () => {
    const input = ref(["hello", "world"]);
    const child = make_use_validation_comp<string[]>({
      input: input,
      validators: [],
      parser: (value) => {
        if (value.length < 3) {
          return {
            is_valid: false,
            error_msg: "less than 3",
          };
        }
        return {
          is_valid: true,
          output: value.join(" "),
        };
      },
    });

    const wrapper = mount(child);
    const vm = wrapper.vm as unknown as ComponentInstance;

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["less than 3"]);

    input.value = ["hello", "beautiful", "world"];
    await Vue.nextTick();

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);
  });
});

type LifecycleFuncs = {
  register?: (is_valid: boolean) => number;
  unregister?: (uid: number) => void;
};
function make_use_validation_parent(lifecycle_funcs?: LifecycleFuncs) {
  const provided_funcs: Partial<LifecycleFuncs> = {};

  // If register or unregister is not provided, we expect default
  // implementations to be used in use_validation
  if (lifecycle_funcs?.register) {
    provided_funcs.register = lifecycle_funcs.register;
  }
  if (lifecycle_funcs?.unregister) {
    provided_funcs.unregister = lifecycle_funcs.unregister;
  }

  return Vue.extend({
    provide: provided_funcs,
    render() {
      return h("div", [h("Child")]);
    },
  });
}

function make_use_validation_comp<Input = string>(
  params: Omit<UseValidationParams<Input, string>, "emit">,
) {
  const child = Vue.extend({
    name: "Child",
    setup(_, { emit }) {
      const { is_valid, errors } = use_validation<Input, string>({
        ...params,
        emit,
      } as UseValidationParams<Input, string>);
      return { is_valid, errors };
    },
    render() {
      return h("div");
    },
  });

  // register Child component
  Vue.component("Child", child);
  return child;
}

type ComponentInstance = ComponentPublicInstance & {
  is_valid: boolean;
  errors: string[];
};

/**
 * Simple validator that returns invalid iff `value` === 'invalid!'
 */
const default_validator: ValidatorFuncType<string> = (value: string) => {
  if (value === "invalid!") {
    return {
      is_valid: false,
      error_msg: "invalid!",
    };
  }
  return { is_valid: true };
};
