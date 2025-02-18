import {
  provide,
  ref,
  computed,
  inject,
  Ref,
  ComputedRef,
  onMounted,
  onBeforeUnmount,
  watch,
  watchEffect,
} from "vue";

import { generate_uid } from "@/utils";

function default_register(..._: unknown[]): number {
  return 0;
}
function default_unregister(..._: unknown[]): void {}

class ValidatorComponentListener {
  private _uid: number;
  private _is_valid: boolean;

  constructor(
    is_valid: Ref<boolean> | ComputedRef<boolean>,
    notify_validity_changed: () => void,
  ) {
    this._uid = generate_uid();
    this._is_valid = is_valid.value;

    watch(is_valid, (new_value) => {
      this._is_valid = new_value;
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
  (e: "input", value: Output): void;
  (e: "update:is_valid", value: boolean): void;
};

// Utility class that checks for type equality at compile time.
// source: https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

export type UseValidationParams<Input, Output = Input> =
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

export function use_validation<Input, Output = Input>(
  params: UseValidationParams<Input, Output>,
) {
  const { input, validators, emit } = params;

  const register = inject("register", default_register);
  const unregister = inject("unregister", default_unregister);
  let uid: number;

  // Note that the second branch of this conditional can only be reached when
  // Input == Output. See UseValidationParams type definition above.
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

  // eagerly emit validity-changed whenever a dependency changes
  // (the non-computed dependencies are input, parser, and validators)
  watchEffect(() => {
    emit("update:is_valid", is_valid.value);
  });

  onMounted(() => {
    uid = register(is_valid);
  });

  onBeforeUnmount(() => {
    unregister(uid);
  });

  return { is_valid, errors };
}

export type ValidationGroupEmitTypes = {
  (e: "update:is_valid", value: boolean): void;
};

export function use_validation_group<T extends ValidationGroupEmitTypes>(
  emit: T,
) {
  const is_valid = ref<boolean>();
  const validators = ref<ValidatorComponentListener[]>([]);

  function make_validator_component_listener(
    is_valid: Ref<boolean> | ComputedRef<boolean>,
  ) {
    return new ValidatorComponentListener(is_valid, update_group_validity);
  }

  provide(
    "register",
    function (is_valid: Ref<boolean> | ComputedRef<boolean>): number {
      const validator = make_validator_component_listener(is_valid);
      validators.value.push(validator);
      update_group_validity();
      return validator.uid;
    },
  );

  provide("unregister", function (uid: number) {
    const index = validators.value.findIndex((elem) => elem.uid === uid);
    validators.value.splice(index, 1);
    update_group_validity();
  });

  // called by component listeners themselves when the validity of the component
  // they're listening to changes
  function update_group_validity() {
    const new_validity = validators.value.every(
      (validator) => validator.is_valid,
    );
    if (new_validity !== is_valid.value) {
      is_valid.value = new_validity;
      emit("update:is_valid", is_valid.value);
    }
  }

  onMounted(() => {
    // This should only be the case if no validators registered, and
    // we still want an initial validity in this case.
    if (is_valid.value === undefined) {
      update_group_validity();
    }
  });

  return is_valid;
}
