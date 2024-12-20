import Vue, {
  provide,
  getCurrentInstance,
  ref,
  computed,
  inject,
  Ref,
  ComputedRef,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";

import { generate_uid } from "@/utils";

function default_register(..._: unknown[]): number {
  return 0;
}
function default_unregister(..._: unknown[]): void {}

class ValidationObservable {
  private _uid: number;
  private _is_valid: boolean;

  constructor(observable_component: Vue, notify_validity_changed: () => void) {
    this._uid = generate_uid();
    this._is_valid = false;

    observable_component.$on("input_validity_changed", (value: boolean) => {
      this._is_valid = value;
      notify_validity_changed();
    });
  }

  get is_valid() {
    return this._is_valid;
  }
  get uid() {
    return this._uid;
  }
}

// Validator types
type Valid = {
  is_valid: true;
};
type Invalid = {
  is_valid: false;
  error_msg: string;
};
type ValidatorResponse = Valid | Invalid;
export type ValidatorFuncType<K> = (value: K) => ValidatorResponse;

// Parser types
type ValidParse<Output> = {
  is_valid: true;
  output: Output;
};
type InvalidParse = {
  is_valid: false;
  error_msg: string;
};
type ParserResponse<Output> = ValidParse<Output> | InvalidParse;
export type ParserFuncType<Input, Output> = (
  value: Input,
) => ParserResponse<Output>;

export type ValidatedInputEmitTypes<Output> = {
  (e: "validity_changed", value: boolean): void;
  (e: "input", value: Output): void;
};

// Utility class that checks for type equality at compile time.
// source: https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type UseValidationParams<
  Input,
  Output = Input,
> =
  IsEqual<Input, Output> extends true
    ? {
        input: Ref<Input> | ComputedRef<Input>;
        validators: ValidatorFuncType<Output>[];
        emit: ValidatedInputEmitTypes<Output>;

        // if Input == Output, emit_transform is optional and will default to the
        // identity function in use_validation
        parser?: ParserFuncType<Input, Output>;
      }
    : {
        input: Ref<Input> | ComputedRef<Input>;
        validators: ValidatorFuncType<Output>[];
        emit: ValidatedInputEmitTypes<Output>;

        // if Input != Output, it's required to provide the parser func
        parser: ParserFuncType<Input, Output>;
      };

export function use_validation<
  Input,
  Output = Input,
>(params: UseValidationParams<Input, Output>) {
  const { input, validators, emit } = params;

  const register = inject("register", default_register);
  const unregister = inject("unregister", default_unregister);
  let uid: number;

  // Note that the second branch of this conditional can only be reached when
  // J == K. See UseValidationParams type definition above.
  const parser: (input: Input) => ParserResponse<Output> = params.parser
    ? params.parser
    : (input: Input) => {
        return { is_valid: true, output: input as unknown as Output };
      };

  const parsed_value = computed(() => parser(input.value));

  const errors = computed(() => {
    const parsed = parsed_value.value;

    if (parsed.is_valid) {
      return validators.flatMap((fn) => {
        const result = fn(parsed.output);
        return result.is_valid ? [] : [result.error_msg];
      });
    } else {
      return [parsed.error_msg];
    }
  });
  const is_valid = computed(() => errors.value.length === 0);

  // note: errors is a computed value and the only reactive dependencies are
  // input, validators, and parser.
  watch(
    errors,
    (new_errors, old_errors) => {
      if (old_errors === undefined) {
        // emit initial validity, but don't show errors
        emit("validity_changed", is_valid.value);
        return;
      }

      if (new_errors.length > 0) {
        if (old_errors.length === 0) {
          emit("validity_changed", is_valid.value);
        }
      } else {
        if (old_errors.length > 0) {
          emit("validity_changed", is_valid.value);
        }
      }
    },
    { immediate: true },
  );

  // emit value only when there are no errors
  watch(
    parsed_value,
    (new_parsed_value) => {
      if (new_parsed_value.is_valid && is_valid.value) {
        emit("input", new_parsed_value.output);
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    uid = register(getCurrentInstance());
  });

  onBeforeUnmount(() => {
    unregister(uid);
  });

  return { is_valid, errors };
}

export type ObserverEmitTypes = {
  (e: "validity_changed", value: boolean): void;
};

export function use_validation_observer<T extends ObserverEmitTypes>(emit: T) {
  const all_valid = ref(false);
  const observables = ref<ValidationObservable[]>([]);

  function make_observable(observable_component: Vue) {
    return new ValidationObservable(observable_component, update_all_valid);
  }

  provide("register", function (observable_component: Vue): number {
    const obs = make_observable(observable_component);
    observables.value.push(obs);
    return obs.uid;
  });

  provide("unregister", function (uid: number) {
    const index = observables.value.findIndex((elem) => elem.uid === uid);
    observables.value.splice(index, 1);
    update_all_valid();
  });

  // called by the observable itself when the component being observed emits
  // an "input_validity_changed" event
  function update_all_valid() {
    const new_validity = observables.value.every((obs) => obs.is_valid);
    if (new_validity !== all_valid.value) {
      all_valid.value = new_validity;
      emit("validity_changed", all_valid.value);
    }
  }

  return all_valid;
}
