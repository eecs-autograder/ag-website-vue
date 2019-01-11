import { ValidatorResponse } from '@/components/validated_input.vue';

function is_valid_year(value: string): ValidatorResponse {
    return {
        is_valid: Number(value) >= 2000,
        error_msg: "Please enter a valid year"
    };
}

export function is_number(value: string): ValidatorResponse {
    return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg:  "You must enter a number",
    };
}

export function is_not_empty(value: string): ValidatorResponse {
    return {
        is_valid: value !== "",
        error_msg: "This field is required"
    };
}

export function is_not_null(value: string): ValidatorResponse {
    return {
        is_valid: value !== null,
        error_msg: "This field is required"
    };
}

export function is_non_negative(value: string): ValidatorResponse {
    return {
        is_valid: is_number(value).is_valid && value[0] !== "-",
        error_msg: "The number of late days cannot be negative."
    };
}
