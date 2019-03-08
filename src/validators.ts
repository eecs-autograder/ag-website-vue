import { ValidatorResponse } from '@/components/validated_input.vue';

export function is_number(value: string): ValidatorResponse {
    return {
        is_valid: is_not_empty(value).is_valid && !isNaN(Number(value)),
        error_msg:  "You must enter a number.",
    };
}

export function is_not_empty(value: string): ValidatorResponse {
    return {
        is_valid: value.trim() !== "",
        error_msg: "This field is required."
    };
}

export function is_non_negative(value: string): ValidatorResponse {
    return {
        is_valid: is_number(value).is_valid && value[0] !== "-",
        error_msg: "The number entered must be greater than or equal to zero."
    };
}

export function make_max_value_validator(max_value: number) {
    return (value: number) => value <= max_value;
}
