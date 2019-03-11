import {
    is_non_negative, is_not_empty, is_number, is_valid_course_year
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

    test('is_valid_course_year - violates condition (year < 2000)', () => {
        expect(is_valid_course_year("900").is_valid).toBe(false);
    });

    test('is_valid_course_year - meets condition (year === 2000)', () => {
        expect(is_valid_course_year("2000").is_valid).toBe(true);
    });

    test('is_valid_course_year - meets condition (year > 2000)', () => {
        expect(is_valid_course_year("2002").is_valid).toBe(true);
    });
});
