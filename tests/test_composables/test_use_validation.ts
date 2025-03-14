import { mount } from "@vue/test-utils";
import { vi } from "vitest";
import Vue, {
  ComponentPublicInstance,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  Ref,
} from "vue";

import {
  use_validation,
  use_validation_group,
  UseValidationParams,
  ValidatorFuncType,
} from "@/composables/use_validation";

describe("use_validation", () => {
  test("registers and unregisters with parent component", () => {
    const uid = 1;
    const register = vi.fn((_) => uid);
    const unregister = vi.fn((_) => undefined);

    const comp = make_use_validation_comp({
      input: ref(""),
      validators: [],
    });

    const wrapper = mount(
      make_use_validation_parent(comp, {
        register,
        unregister,
      }),
    );

    expect(register).toHaveBeenCalledTimes(1);

    wrapper.destroy();
    expect(unregister).toHaveBeenCalledWith(uid);
  });

  test("emits initial valid input value", () => {
    const comp = make_use_validation_comp({
      input: ref(""),
      validators: [],
    });

    const wrapper = mount(comp);
    expect(wrapper.emitted("input")?.[0]).toEqual([""]);
  });

  test("does not emit initial invalid input value", () => {
    const comp = make_use_validation_comp({
      input: ref(""),
      validators: [(_) => ({ is_valid: false, error_msg: "invalid" })],
    });

    const wrapper = mount(comp);
    expect(wrapper.emitted()).not.toHaveProperty("input");
  });

  test("emits input value when changed to a valid value", async () => {
    const input = ref("");
    const comp = make_use_validation_comp({
      input: input,
      validators: [],
    });

    const wrapper = mount(comp);
    input.value = "valid!";

    await Vue.nextTick();
    expect(wrapper.emitted("input")).toEqual(
      expect.arrayContaining([["valid!"]]),
    );
  });

  test("does not emit input value when changed to an invalid value", async () => {
    const input = ref("");
    const comp = make_use_validation_comp({
      input: input,
      validators: [default_validator],
    });

    const wrapper = mount(comp);
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
    const comp = make_use_validation_comp({
      input: input,
      validators: [default_validator],
    });

    const wrapper = mount(comp);
    const vm = wrapper.vm as unknown as UseValidationCompInstance;

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);

    input.value = "invalid!";
    await Vue.nextTick();

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["invalid!"]);
  });

  test("updates return values when input is changed to a valid value", async () => {
    const input = ref("invalid!");
    const comp = make_use_validation_comp({
      input: input,
      validators: [default_validator],
    });

    const wrapper = mount(comp);
    const vm = wrapper.vm as unknown as UseValidationCompInstance;

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["invalid!"]);

    input.value = "";
    await Vue.nextTick();

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);
  });

  test("updates return values correctly with multiple validators", async () => {
    const input = ref("");
    const comp = make_use_validation_comp({
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

    const wrapper = mount(comp);
    const vm = wrapper.vm as unknown as UseValidationCompInstance;

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
    const comp = make_use_validation_comp<string[]>({
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

    const wrapper = mount(comp);
    const vm = wrapper.vm as unknown as UseValidationCompInstance;

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);

    input.value = ["hello", "beautiful", "world"];
    await Vue.nextTick();

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["more than 2"]);
  });

  test("updates return values when parsing succeeds", async () => {
    const input = ref(["hello", "world"]);
    const comp = make_use_validation_comp<string[]>({
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

    const wrapper = mount(comp);
    const vm = wrapper.vm as unknown as UseValidationCompInstance;

    expect(vm.is_valid).toBe(false);
    expect(vm.errors).toEqual(["less than 3"]);

    input.value = ["hello", "beautiful", "world"];
    await Vue.nextTick();

    expect(vm.is_valid).toBe(true);
    expect(vm.errors).toEqual([]);
  });
});

describe("use_validation_group", () => {
  test("provides register and unregister functions", () => {
    const child = make_use_validation_group_child(ref(true));

    // sanity check -- we expect mounting the child without a parent that uses
    // use_validation_group to throw an error when injecting
    expect(() => {
      mount(child);
    }).toThrow();

    // this should throw if use_validation_group doesn't provide register/unregister
    const wrapper = mount(make_use_validation_group_comp(child));

    // sanity check -- make sure the child actually mounted
    expect(wrapper.findComponent(child).exists()).toBe(true);

    wrapper.destroy();
  });

  test("emits update:is_valid with initial validity", () => {
    let child_is_valid = ref(true);
    let child = make_use_validation_group_child(child_is_valid);
    let wrapper = mount(make_use_validation_group_comp(child));
    expect(wrapper.emitted("update:is_valid")?.[0]).toEqual([true]);

    child_is_valid = ref(false);
    child = make_use_validation_group_child(child_is_valid);
    wrapper = mount(make_use_validation_group_comp(child));
    expect(wrapper.emitted("update:is_valid")?.[0]).toEqual([false]);
  });

  test("emits update:is_valid with changes in validity", async () => {
    const child_is_valid = ref(true);
    const child = make_use_validation_group_child(child_is_valid);
    const wrapper = mount(make_use_validation_group_comp(child));

    child_is_valid.value = false;
    await Vue.nextTick();
    expect(wrapper.emitted("update:is_valid")?.[1]).toEqual([false]);

    child_is_valid.value = true;
    await Vue.nextTick();
    expect(wrapper.emitted("update:is_valid")?.[2]).toEqual([true]);
  });

  test("does not emit update:is_valid when group validity doesn't change", async () => {
    const child_1_is_valid = ref(false);
    const child_2_is_valid = ref(false);
    const child_1 = make_use_validation_group_child(child_1_is_valid);
    const child_2 = make_use_validation_group_child(child_2_is_valid);
    const wrapper = mount(make_use_validation_group_comp(child_1, child_2));

    child_1_is_valid.value = true;
    await Vue.nextTick();
    expect(wrapper.emitted("update:is_valid")?.length).toEqual(1);

    child_1_is_valid.value = false;
    await Vue.nextTick();
    expect(wrapper.emitted("update:is_valid")?.length).toEqual(1);
  });

  test("returns correct initial value", () => {
    let wrapper = mount(make_use_validation_group_comp());
    let vm = wrapper.vm as unknown as UseValidationGroupCompInstance;
    expect(vm.all_valid).toBe(true);

    wrapper = mount(
      make_use_validation_group_comp(
        make_use_validation_group_child(ref(true)),
      ),
    );
    vm = wrapper.vm as unknown as UseValidationGroupCompInstance;
    expect(vm.all_valid).toBe(true);

    wrapper = mount(
      make_use_validation_group_comp(
        make_use_validation_group_child(ref(false)),
      ),
    );
    vm = wrapper.vm as unknown as UseValidationGroupCompInstance;
    expect(vm.all_valid).toBe(false);
  });

  test("updates return value when a child becomes invalid", async () => {
    const child_is_valid = ref(true);
    const child = make_use_validation_group_child(child_is_valid);
    const wrapper = mount(make_use_validation_group_comp(child));

    child_is_valid.value = false;
    await Vue.nextTick();
    const vm = wrapper.vm as unknown as UseValidationGroupCompInstance;
    expect(vm.all_valid).toBe(false);
  });

  test("updates return value when a child becomes valid", async () => {
    const child_is_valid = ref(false);
    const child = make_use_validation_group_child(child_is_valid);
    const wrapper = mount(make_use_validation_group_comp(child));

    child_is_valid.value = true;
    await Vue.nextTick();
    const vm = wrapper.vm as unknown as UseValidationGroupCompInstance;
    expect(vm.all_valid).toBe(true);
  });

  test("updates return value correctly with multiple children", async () => {
    const child_1_is_valid = ref(true);
    const child_2_is_valid = ref(false);
    const child_3_is_valid = ref(true);
    const child_1 = make_use_validation_group_child(child_1_is_valid);
    const child_2 = make_use_validation_group_child(child_2_is_valid);
    const child_3 = make_use_validation_group_child(child_3_is_valid);

    const wrapper = mount(
      make_use_validation_group_comp(child_1, child_2, child_3),
    );
    const vm = wrapper.vm as unknown as UseValidationGroupCompInstance;
    expect(vm.all_valid).toBe(false); // true, false, true

    child_2_is_valid.value = true; // true, true, true
    await Vue.nextTick();
    expect(vm.all_valid).toBe(true);

    child_1_is_valid.value = false;
    child_3_is_valid.value = false; // false, true, false
    await Vue.nextTick();
    expect(vm.all_valid).toBe(false);

    child_1_is_valid.value = true; // true, true, false
    await Vue.nextTick();
    expect(vm.all_valid).toBe(false);
  });

  test("isn't affected by unregistered children", async () => {
    const child_is_valid = ref(false);
    const child = make_use_validation_group_child(child_is_valid);
    const wrapper = mount(make_use_validation_group_comp(child));
    const vm = wrapper.vm as unknown as UseValidationGroupCompInstance;

    // destroy child, which should unregister
    wrapper.findComponent(child).destroy();
    await Vue.nextTick();
    expect(vm.all_valid).toBe(true);
  });
});

/*******************************************************************************
 * use_validation test helpers
 *******************************************************************************
 */

type LifecycleFuncs = {
  register?: (is_valid: boolean) => number;
  unregister?: (uid: number) => void;
};
function make_use_validation_parent(
  use_validation_comp: ReturnType<typeof make_use_validation_group_child>,
  lifecycle_funcs?: LifecycleFuncs,
) {
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
      return h("div", [h(use_validation_comp)]);
    },
  });
}

function make_use_validation_comp<Input = string>(
  params: Omit<UseValidationParams<Input, string>, "emit">,
) {
  return Vue.extend({
    name: "UseValidationComp",
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
}

type UseValidationCompInstance = ComponentPublicInstance & {
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

/*******************************************************************************
 * use_validation_group test helpers
 *******************************************************************************
 */
type UseValidationGroupCompInstance = ComponentPublicInstance & {
  all_valid: boolean;
};

function make_use_validation_group_comp(
  ...children: ReturnType<typeof make_use_validation_group_child>[]
) {
  return Vue.extend({
    setup(_, { emit }) {
      const all_valid = use_validation_group(emit);
      return { all_valid };
    },
    render() {
      return h(
        "div",
        {}, // Props for the parent container if needed
        children.map((ChildComp) => h(ChildComp)), // Dynamically render all children
      );
    },
  });
}

function make_use_validation_group_child(is_valid?: Ref) {
  return Vue.extend({
    name: "ValidationChild",
    setup() {
      // Inject `register` and `unregister`. If they're not provided, it should throw.
      const register: ((is_valid: Ref) => number) | undefined =
        inject("register");
      const unregister: ((uid: number) => void) | undefined =
        inject("unregister");

      if (!register || !unregister) {
        throw new Error("inject called but register/unregister is undefined");
      }

      let uid: number | undefined;

      onMounted(() => {
        uid = register(is_valid ? is_valid : ref(true));
      });

      onBeforeUnmount(() => {
        if (uid !== undefined) {
          unregister(uid);
        }
      });

      return {};
    },
    render() {
      return h("div");
    },
  });
}
