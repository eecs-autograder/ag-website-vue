import {
    is_non_negative, is_not_empty, is_number
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

    test('is_number - violates condition', () => {
         expect(is_number("three").is_valid).toBe(false);
    });

    test('is_number - meets condition', () => {
        expect(is_number("3").is_valid).toBe(true);
    });
});
