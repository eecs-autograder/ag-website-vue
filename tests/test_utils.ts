import { safe_assign, zip } from '@/utils';


test('Safe assign', () => {
    let assign_to = {spam: '', egg: 42};
    safe_assign(assign_to, {spam: 'spam', egg: 43});

    expect(assign_to.spam).toBe('spam');
    expect(assign_to.egg).toBe(43);
});


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
