import { ArraySet, ArraySetElementNotFoundError } from '@/array_set';

describe('ArraySet default comparator tests', () => {
    test('sort_initial', () => {
        let set = new ArraySet([4, 7, 8, 3, 2, 0, 6], {sort_initial: true});
        expect(set.data).toEqual([0, 2, 3, 4, 6, 7, 8]);
    });

    test('insert new elements', () => {
        let set = new ArraySet<string>();
        set.insert("spam");
        expect(set.data).toEqual(["spam"]);
        set.insert("egg");
        expect(set.data).toEqual(["egg", "spam"]);
        set.insert("zebra");
        expect(set.data).toEqual(["egg", "spam", "zebra"]);
        set.insert("weasel");
        expect(set.data).toEqual(["egg", "spam", "weasel", "zebra"]);
    });

    test('insert existing element', () => {
        let set = new ArraySet<string>();
        let inserted = set.insert("spam");
        expect(set.data).toEqual(["spam"]);
        expect(inserted).toBe(true);

        inserted = set.insert("spam");
        expect(set.data).toEqual(["spam"]);
        expect(inserted).toBe(false);
    });

    test('has element', () => {
        let set = new ArraySet([1, 3, 5, 6, 8, 9]);
        expect(set.has(6)).toBe(true);
        expect(set.has(0)).toBe(false);
    });

    test('get existing element', () => {
        let set = new ArraySet([1, 3, 5]);
        expect(set.get(5)).toEqual(5);
    });

    test('get missing element, throw_if_not_found true, exception thrown', () => {
        let set = new ArraySet([1, 3, 5]);
        expect(() => set.get(42)).toThrow(ArraySetElementNotFoundError);
    });

    test('get missing element, throw_if_not_found false, null returned', () => {
        let set = new ArraySet([1, 3, 5]);
        expect(set.get(42, false)).toBeNull();
    });

    test('remove existing element', () => {
        let set = new ArraySet([1, 3, 5]);
        expect(set.remove(3)).toBe(true);
        expect(set.data).toEqual([1, 5]);

        set = new ArraySet([1, 3, 5]);
        set.remove(1);
        expect(set.data).toEqual([3, 5]);

        set = new ArraySet([1, 3, 5]);
        set.remove(5);
        expect(set.data).toEqual([1, 3]);
        set.remove(3);
        expect(set.data).toEqual([1]);
        set.remove(1);
        expect(set.data).toEqual([]);
    });

    test('remove missing element, throw_if_not_found true, exception thrown', () => {
        let set = new ArraySet([1, 3, 5]);
        expect(() => set.remove(42)).toThrow(ArraySetElementNotFoundError);
    });

    test('remove missing element, throw_if_not_found false, false returned', () => {
        let set = new ArraySet([1, 3, 5]);
        expect(set.remove(42, false)).toBe(false);
    });
});

describe('ArraySet custom comparator tests', () => {
    class Custom {
        constructor(public id: number, public is_spam: boolean = true) {}
    }

    type SentinalType = {id: number};
    function custom_less(first: SentinalType, second: SentinalType) {
        return first.id < second.id;
    }

    test('sort_initial', () => {
        let set = new ArraySet(
            [new Custom(42), new Custom(20), new Custom(25)],
            {less_func: custom_less, sort_initial: true});
        expect(set.data).toEqual([new Custom(20), new Custom(25), new Custom(42)]);
    });

    test('insert new elements', () => {
        let set = new ArraySet<Custom>([], {less_func: custom_less});
        set.insert(new Custom(10));
        expect(set.data).toEqual([new Custom(10)]);
        set.insert(new Custom(5));
        expect(set.data).toEqual([new Custom(5), new Custom(10)]);
    });

    test('insert existing element', () => {
        let set = new ArraySet<Custom>([], {less_func: custom_less});
        let inserted = set.insert(new Custom(42));
        expect(set.data).toEqual([new Custom(42)]);
        expect(inserted).toBe(true);

        inserted = set.insert(new Custom(42));
        expect(set.data).toEqual([new Custom(42)]);
        expect(inserted).toBe(false);
    });

    test('has element', () => {
        let set = new ArraySet([new Custom(6)], {less_func: custom_less});
        expect(set.has({id: 6})).toBe(true);
        expect(set.has({id: 0})).toBe(false);
    });

    test('get existing element', () => {
        let set = new ArraySet(
            [new Custom(1), new Custom(3), new Custom(5)], {less_func: custom_less});
        expect(set.get({id: 5})).toEqual(new Custom(5));
        expect(set.get(new Custom(5))).toEqual(new Custom(5));
    });

    test('get missing element, throw_if_not_found true, exception thrown', () => {
        let set = new ArraySet<Custom, SentinalType>([], {less_func: custom_less});
        expect(() => set.get({id: 42})).toThrow(ArraySetElementNotFoundError);
        expect(() => set.get(new Custom(42))).toThrow(ArraySetElementNotFoundError);
    });

    test('get missing element, throw_if_not_found false, null returned', () => {
        let set = new ArraySet<Custom, SentinalType>([], {less_func: custom_less});
        expect(set.get({id: 42}, false)).toBeNull();
    });

    test('remove existing element', () => {
        let set = new ArraySet([new Custom(1)], {less_func: custom_less});
        expect(set.remove({id: 1})).toBe(true);
        expect(set.data).toEqual([]);
    });

    test('remove missing element, throw_if_not_found true, exception thrown', () => {
        let set = new ArraySet([new Custom(1)], {less_func: custom_less});
        expect(() => set.remove({id: 42})).toThrow(ArraySetElementNotFoundError);

        let other_set = new ArraySet<Custom, SentinalType>([], {less_func: custom_less});
        expect(() => other_set.remove({id: 42})).toThrow(ArraySetElementNotFoundError);
    });

    test('remove missing element, throw_if_not_found false, false returned', () => {
        let set = new ArraySet([new Custom(1)], {less_func: custom_less});
        expect(set.remove({id: 42}, false)).toBe(false);
    });
});
