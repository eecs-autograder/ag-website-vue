import { ValidatorResponse } from '@/components/validated_input.vue';

export function is_non_negative(value: string): ValidatorResponse {
    return {
        is_valid: is_number(value).is_valid && string_to_num(value) >= 0,
        error_msg: "Please enter a number >= zero."
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

export function string_to_num(value: string): number {
    if (value.trim() === '') {
        return NaN;
    }
    return Number(value);
}
