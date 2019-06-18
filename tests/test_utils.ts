import { Course, Semester } from 'ag-client-typescript';

import {
    array_add_unique,
    array_get_unique,
    array_has_unique,
    array_remove_unique, format_datetime, format_time, get_course_info,
    safe_assign,
    UniqueArrayError,
    zip
} from '@/utils';


test('Safe assign', () => {
    let assign_to = {spam: '', egg: 42};
    safe_assign(assign_to, {spam: 'spam', egg: 43});

    expect(assign_to.spam).toBe('spam');
    expect(assign_to.egg).toBe(43);
});

describe('zip function tests', () => {
    test('Zip iterables of equal length', () => {
        let zipped = zip([1, 2, 3], [4, 5, 6]);

        expect(zipped.next().value).toEqual([1, 4]);
        expect(zipped.next().value).toEqual([2, 5]);
        expect(zipped.next().value).toEqual([3, 6]);

        expect(zipped.next().done).toBe(true);
    });

    test('Zip first iterable shorter', () => {
        let zipped = zip([1, 2], [3, 4, 5]);

        expect(zipped.next().value).toEqual([1, 3]);
        expect(zipped.next().value).toEqual([2, 4]);

        expect(zipped.next().done).toBe(true);
    });

    test('Zip second iterable shorter', () => {
        let zipped = zip([1, 2, 3], [4, 5]);

        expect(zipped.next().value).toEqual([1, 4]);
        expect(zipped.next().value).toEqual([2, 5]);

        expect(zipped.next().done).toBe(true);
    });

    test('Zip iterables that are themselves iterators', () => {
        let zipped = zip([1, 2][Symbol.iterator](), [3, 4][Symbol.iterator]());

        expect(zipped.next().value).toEqual([1, 3]);
        expect(zipped.next().value).toEqual([2, 4]);

        expect(zipped.next().done).toBe(true);
    });

    test('Zip preserves type info', () => {
        let zipped = zip([{spam: 42}, {spam: 42}], [{egg: 43}, {egg: 43}]);

        for (let [spam, egg] of zipped) {
            expect(spam.spam).toEqual(42);
            expect(egg.egg).toEqual(43);
        }
    });
});

describe('Datetime format tests', () => {
    test('format_datetime null', () => {
        expect(format_datetime(null)).toEqual('--- --, ----, --:-- --');
    });

    test('format_datetime non-null', () => {
        let datetime = new Date(2020, 3, 28, 17, 42).toISOString();
        expect(format_datetime(datetime)).toEqual('April 28, 2020, 05:42 PM');
    });

    test('format_time null', () => {
        expect(format_time(null)).toEqual('--:-- --');
    });

    test('format_time non-null', () => {
        expect(format_time('15:32')).toEqual('03:32 PM');
        expect(format_time('15:32:00')).toEqual('03:32 PM');
    });
});

describe('get_course_info function tests', () => {
    let course: Course;

    beforeEach(() => {
        course = new Course(
            {pk: 11, name: "EECS 388", semester: Semester.fall, year: 2048, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});
    });

    test('Course has name, semester, and year', () => {
       expect(get_course_info(course)).toEqual("EECS 388 Fall 2048");
    });

    test('Course semester is null', () => {
        course.semester = null;
        expect(get_course_info(course)).toEqual("EECS 388  2048");
   });

    test('Course year is null', () => {
        course.year = null;
        expect(get_course_info(course)).toEqual("EECS 388 Fall ");
    });
});

describe('array_XXX_unique function tests', () => {
    type CustomType = {id: number};
    let custom_type_eq_func = (first: CustomType, second: CustomType) => {
        return first.id === second.id;
    };

    test('array_add_unique default equality func', () => {
        let array: string[] = [];

        array_add_unique(array, "spam");
        expect(array).toEqual(["spam"]);

        array_add_unique(array, "egg");
        expect(array).toEqual(["spam", "egg"]);

        array_add_unique(array, "egg");
        expect(array).toEqual(["spam", "egg"]);
    });

    test('array_add_unique custom equality func', () => {
        let array: CustomType[] = [];
        array_add_unique(array, {id: 1}, custom_type_eq_func);
        expect(array).toEqual([{id: 1}]);

        array_add_unique(array, {id: 2}, custom_type_eq_func);
        expect(array).toEqual([{id: 1}, {id: 2}]);

        array_add_unique(array, {id: 1}, custom_type_eq_func);
        expect(array).toEqual([{id: 1}, {id: 2}]);
    });

    test('array_has_unique default equality func', () => {
        let array: number[] = [1, 2, 3, 4, 5];
        expect(array_has_unique(array, 3)).toBe(true);
        expect(array_has_unique(array, 10)).toBe(false);
    });

    test('array_has_unique custom equality func', () => {
        let array: CustomType[] = [{id: 1}, {id: 2}, {id: 3}, {id: 4}];
        expect(array_has_unique(array, {id: 2}, custom_type_eq_func)).toBe(true);
        expect(array_has_unique(array, {id: 5}, custom_type_eq_func)).toBe(false);
    });

    test('array get unique item found default equality func', () => {
       let array: number[] = [1, 2, 3];
       expect(array_get_unique(array, 3)).toEqual(3);
    });

    test('array get unique item not found default equality func', () => {
       let array: number[] = [4, 5, 6];
       expect(() => {
           array_get_unique(array, 3);
       }).toThrow("Item not found in array: 3");
    });

    test('array get unique item found custom equality func', () => {
        let array: CustomType[] = [{id: 7}];
        expect(array_get_unique(array, {id: 7}, custom_type_eq_func)).toEqual({id: 7});
        expect(array_get_unique(array, 7, (item: CustomType , id: number) => {
            return item.id === id;
        })).toEqual(array[0]);

    });

    test('array_get_unique item not found custom equality func', () => {
        let array: CustomType[] = [{id: 7}];
        try {
            array_get_unique(array, {id: 21}, custom_type_eq_func);
        }
        catch (e) {
            expect(e instanceof UniqueArrayError);
            expect(e.message).toEqual("Item not found in array: [object Object]");
        }
    });

    test('array_remove_unique custom default func', () => {
        let array: number[] = [1, 2, 3, 4, 5];
        let removed = array_remove_unique(array, 3);
        expect(removed).toBe(true);
        expect(array).toEqual([1, 2, 4, 5]);

        removed = array_remove_unique(array, 10);
        expect(removed).toBe(false);
        expect(array).toEqual([1, 2, 4, 5]);
    });


    test('array_remove_unique custom equality func', () => {
        let array: CustomType[] = [{id: 1}, {id: 2}, {id: 3}, {id: 4}];
        let removed = array_remove_unique(array, {id: 1}, custom_type_eq_func);
        expect(removed).toBe(true);
        expect(array).toEqual([{id: 2}, {id: 3}, {id: 4}]);

        removed = array_remove_unique(array, {id: 1}, custom_type_eq_func);
        expect(removed).toBe(false);
        expect(array).toEqual([{id: 2}, {id: 3}, {id: 4}]);
    });
});
