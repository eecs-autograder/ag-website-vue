import { ValidatorResponse } from '@/components/validated_input.vue';
import * as utils from '@/utils';

export function is_non_negative(value: string): ValidatorResponse {
    return {
        is_valid: is_number(value).is_valid && string_to_num(value) >= 0,
        error_msg: "Please enter a number >= zero."
    };
}

export function make_num_decimal_places_validator(num_decimals: number) {
    return (value: string) => {
        return {
            is_valid: !value.includes('.') || value.split('.')[1].length <= num_decimals,
            error_msg: `Please enter a number with no more than ${num_decimals} decimal places.`
        };
    };
}

export function make_max_num_digits_validator(num_digits: number) {
    return (value: string) => {
        return {
            is_valid: is_not_empty(value) && (value.includes("."))
                      ? value.split('.')[0].length
                        + value.split('.')[1].length <= num_digits
                      : value.length <= num_digits,
            error_msg: `Please enter a number with no more than ${num_digits} digits in total.`
        };
    };
}

export function is_not_empty(value: string): ValidatorResponse {
    return {
        is_valid: value.trim() !== "",
        error_msg: "This field is required."
    };
}

export function is_number(value: string): ValidatorResponse {
    return {
        is_valid: !isNaN(string_to_num(value)),
        error_msg:  "Please enter a number.",
    };
}

export function is_integer(value: string): ValidatorResponse {
    return {
        is_valid: !isNaN(string_to_num(value)) && Number.isInteger(string_to_num(value)),
        error_msg:  "Please enter an integer.",
    };
}

export function make_min_value_validator(min_value: number) {
    return (value: string) => {
        return {
            is_valid: string_to_num(value) >= min_value,
            error_msg: `Please enter a number >= ${min_value}`
        };
    };
}

export function make_max_value_validator(max_value: number) {
    return (value: string) => {
        return {
            is_valid: string_to_num(value) <= max_value,
            error_msg: `Please enter a number <= ${max_value}`
        };
    };
}

export function is_email(value: string): ValidatorResponse {
    return {
        is_valid: utils.is_email(value),
        error_msg: "Please enter an email address"
    };
}

export function string_to_num(value: string): number {
    if (value.trim() === '') {
        return NaN;
    }
    return Number(value);
}
