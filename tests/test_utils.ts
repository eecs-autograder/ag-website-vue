import { Course, Semester } from 'ag-client-typescript';
// @ts-ignore
import moment from 'moment';
import * as sinon from 'sinon';
// @ts-ignore
import * as timezone_mock from 'timezone-mock';

import {
    chain,
    format_course_name,
    format_datetime,
    format_datetime_short,
    format_mem_size,
    format_time,
    safe_assign,
    zip,
} from '@/utils';

// Arizona doesn't have DST, so we'll use their timezone to prevent our
// date formatting tests from failing for half the year.
let mock_timezone = 'America/Phoenix';
let mock_timezone_abbr = moment().tz(mock_timezone).format('z');

beforeEach(() => {
    sinon.stub(moment.tz, 'guess').returns(mock_timezone);
    // timezone_mock.register(mock_timezone);
});

// afterEach(() => {
//     timezone_mock.unregister();
// });

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

describe('chain() tests', () => {
    test('One iterable', () => {
        let actual = chain([1, 2, 3]);
        expect([...actual]).toEqual([1, 2, 3]);
    });

    test('Several iterables', () => {
        let actual = chain([1, 2, 3], [5, 4, 3]);
        expect([...actual]).toEqual([1, 2, 3, 5, 4, 3]);
    });
});

describe('Datetime format tests', () => {
    test('format_datetime null', () => {
        expect(format_datetime(null)).toEqual('--- --, ----, --:-- -- ---');
    });

    test('format_datetime non-null', () => {
        let datetime = '2020-04-28T21:42:00.000Z';
        expect(format_datetime(datetime)).toEqual(`April 28, 2020, 02:42 PM ${mock_timezone_abbr}`);
    });

    test('format_datetime_short', () => {
        let datetime = '2020-04-28T21:42:00.000Z';
        expect(
            format_datetime_short(datetime)
        ).toEqual(`Apr 28, '20, 02:42 PM ${mock_timezone_abbr}`);
    });

    test('format_time null', () => {
        expect(format_time(null)).toEqual('--:-- --');
    });

    test('format_time non-null', () => {
        expect(format_time('15:32')).toEqual('03:32 PM');
        expect(format_time('15:32:00')).toEqual('03:32 PM');
    });
});

describe('format_course_name tests', () => {
    let course: Course;

    beforeEach(() => {
        course = new Course(
            {pk: 11, name: "EECS 388", semester: Semester.fall, year: 2048, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});
    });

    test('Name, semester, and year non-null', () => {
       expect(format_course_name(course)).toEqual("EECS 388 Fall 2048");
    });

    test('Semester is null', () => {
        course.semester = null;
        expect(format_course_name(course)).toEqual("EECS 388 2048");
   });

    test('Year is null', () => {
        course.year = null;
        expect(format_course_name(course)).toEqual("EECS 388 Fall");
    });
});

describe('format_mem_size_tests', () => {
    test('format_mem_size', () => {
        expect(format_mem_size(2500000000)).toEqual('2.5 GB');
        expect(format_mem_size(1500000)).toEqual('1.5 MB');
        expect(format_mem_size(4250)).toEqual('4.25 KB');
        expect(format_mem_size(4255)).toEqual('4.25 KB');
        expect(format_mem_size(150)).toEqual('150 bytes');
    });
});
