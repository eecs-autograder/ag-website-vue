import {
    is_integer,
    is_non_negative,
    is_not_empty,
    is_number,
    make_max_value_validator,
    make_min_value_validator, string_to_num
} from '@/validators';

describe('Validators.ts', () => {
    test('is_non_negative validator - violates condition (negative number)', () => {
        expect(is_non_negative("-2").is_valid).toBe(false);
    });

    test('is_non_negative validator - meets condition (zero)', () => {
        expect(is_non_negative("0").is_valid).toBe(true);
    });

    test('is_non_negative validator - meets condition (positive number)', () => {
        expect(is_non_negative("5").is_valid).toBe(true);
    });

    test('is_not_empty validator - violates condition (multiple whitespace)', () => {
        expect(is_not_empty("   ").is_valid).toBe(false);
    });

    test('is_not_empty validator - violates condition (empty string)', () => {
        expect(is_not_empty("").is_valid).toBe(false);
    });

    test('is_not_empty validator - meets condition (word with no whitespace)', () => {
        expect(is_not_empty("hello").is_valid).toBe(true);
    });

    test('is_not_empty validator - meets condition (word with whitespace on both left ' +
         'and right sides',
         () => {
        expect(is_not_empty("  hello   ").is_valid).toBe(true);
    });

    test('is_number - violates condition (spelled out number)', () => {
         expect(is_number("three").is_valid).toBe(false);
    });

    test('is_number - meets condition (is a positive number)', () => {
        expect(is_number("3").is_valid).toBe(true);
    });

    test('is_number - meets condition (is a negative number)', () => {
        expect(is_number("-3").is_valid).toBe(true);
    });

    test('is_number - meets condition (negative number with a space between - and ' +
         'number)',
         () => {
        expect(is_number("- 3").is_valid).toBe(false);
    });

    test('is_integer', () => {
        expect(is_integer("42").is_valid).toBe(true);
        expect(is_integer("1.5").is_valid).toBe(false);
    });

    test('make_min_value_validator', () => {
        let min_10 = make_min_value_validator(10);
        expect(min_10("10").is_valid).toBe(true);
        expect(min_10("11").is_valid).toBe(true);
        expect(min_10("9").is_valid).toBe(false);
    });

    test('make_max_value_validator', () => {
        let max_4 = make_max_value_validator(4);
        expect(max_4("4").is_valid).toBe(true);
        expect(max_4("3").is_valid).toBe(true);
        expect(max_4("5").is_valid).toBe(false);
    });

    test('string_to_num', () => {
        expect(string_to_num('   ')).toBeNaN();
        expect(string_to_num('  42  ')).toBe(42);
        expect(string_to_num('spam')).toBeNaN();
    });
});
