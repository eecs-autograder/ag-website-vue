import { ValidatorFuncType, ValidatorResponse } from "@/composables/use_validation";
import * as utils from '@/utils';

export type NumberValidator = ValidatorFuncType<number>;
export type TextValidator = ValidatorFuncType<string>;

export function make_min_length_validator(num_chars: number): TextValidator {
  return (input) => {
    const is_valid = input.length >= num_chars;
    if (is_valid) {
      return { is_valid };
    } else {
      return {
        is_valid,
        error_msg: `Input must contain at least ${num_chars} character${
          num_chars === 1 ? "" : "s"
        }`,
      };
    }
  };
}

export function make_max_length_validator(num_chars: number): TextValidator {
  return (input) => {
    const is_valid = input.length <= num_chars;
    if (is_valid) {
      return { is_valid };
    } else {
      return {
        is_valid,
        error_msg: `Input must contain no more than ${num_chars} character${
          num_chars ===  1 ? "" : "s"
        }`,
      };
    }
  };
}

export function make_min_validator(min: number): NumberValidator {
  return (input) => {
    const is_valid = input >= min;
    if (is_valid) {
      return { is_valid };
    } else {
      return {
        is_valid,
        error_msg: `Input must be greater than or equal to ${min}`,
      };
    }
  };
}

export function make_max_validator(max: number): NumberValidator {
  return (input) => {
    const is_valid = input <= max;
    if (is_valid) {
      return { is_valid };
    } else {
      return {
        is_valid,
        error_msg: `Input must be less than or equal to ${max}`,
      };
    }
  };
}

export function is_email(value: string) : ValidatorResponse {
    if (utils.is_email(value)) {
        return {
            is_valid: true,
        };
    } else {
        return {
            is_valid: false,
            error_msg: "Please enter an email address"
        }
    }
}
