import { SafeMap } from '@/safe_map';
import { config, mount } from '@vue/test-utils';
import { Component, Vue } from 'vue-property-decorator';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('SafeMap', () => {

    test('If item is not in the map, throw error', () => {
        @Component({
            template: `<div>
                     <p v-for="[key, val] of Array.from(my_map)">
                       {{val}}
                     </p>
                   </div>`,
            components: {}
        })

        class WrapperComponent extends Vue {
            my_map = new SafeMap<string, string>();

            created() {
                this.my_map.set("Blue", "Jay");
                this.my_map.set("Yellow", "Submarine");
                this.my_map.set("Red", "Sea");
            }
        }

        const wrapper = mount(WrapperComponent);
        expect(wrapper.vm.$data.my_map.get("Blue")).toEqual("Jay");

        try {
            wrapper.vm.$data.my_map.get('Green');
        }
        catch (error_in) {
             expect(error_in.message).toBe('Key: Green, is not in the map!');
        }
    });

    test('SafeMap get and set', () => {
        let map = new SafeMap<string, number>();
        map.set('spam', 44);
        expect(map.get('spam')).toBe(44);
    });

    test('SafeMap get undefined', () => {
        let map = new SafeMap<string, number>();
        map.set('spam', 44);

        try {
            map.get('tofu');
        }
        catch (error_in) {
            expect(error_in.message).toBe("Key: tofu, is not in the map!");
        }
    });

    test('SafeMap clear', () => {
        let safer_map = new SafeMap<string, string>();
        safer_map.set("Blue", "Jay");

        expect(safer_map.size).toEqual(1);
        safer_map.set("Yellow", "Submarine");
        expect(safer_map.size).toEqual(2);
        safer_map.set("Red", "Sea");
        expect(safer_map.size).toEqual(3);
        safer_map.clear();
        expect(safer_map.size).toEqual(0);
    });

    test('SafeMap delete', () => {
        let safer_map = new SafeMap<string, string>();
        safer_map.set("Blue", "Jay");
        safer_map.set("Yellow", "Submarine");
        safer_map.set("Red", "Sea");

        safer_map.delete("Yellow");

        expect(safer_map.size).toEqual(2);
        expect(safer_map.get("Blue")).toEqual("Jay");
        expect(safer_map.get("Red")).toEqual("Sea");
        try {
            safer_map.get('Yellow');
        }
        catch (error_in) {
            expect(error_in.message).toBe("Key: Yellow, is not in the map!");
        }
    });

    test('SafeMap for_each', () => {

        let safer_map = new SafeMap<string, string>();

        let key_collab = "";

        safer_map.set("Blue", "Jay");
        safer_map.set("Yellow", "Submarine");
        safer_map.set("Red", "Sea");

        function print_key_and_value(value: string, key: string, map: Map<string, string>) {
            key_collab += value;
        }

        safer_map.for_each(print_key_and_value);

        expect(key_collab).toContain('JaySubmarineSea');

    });

    test('SafeMap has', () => {

        let safer_map = new SafeMap<string, string>();

        safer_map.set("Blue", "Jay");
        safer_map.set("Yellow", "Submarine");
        safer_map.set("Red", "Sea");

        expect(safer_map.has("Blue")).toBe(true);
        expect(safer_map.has("Blues")).toBe(false);
        expect(safer_map.has("Purple")).toBe(false);
        expect(safer_map.has("Yellow")).toBe(true);
        expect(safer_map.has("Orange")).toBe(false);
        expect(safer_map.has("Red")).toBe(true);
    });

    test('SafeMap has', () => {

        let safer_map = new SafeMap<string, string>();

        safer_map.set("Blue", "Jay");
        safer_map.set("Yellow", "Submarine");
        safer_map.set("Red", "Sea");

        expect(safer_map.has("Blue")).toBe(true);
        expect(safer_map.has("Blues")).toBe(false);
        expect(safer_map.has("Purple")).toBe(false);
        expect(safer_map.has("Yellow")).toBe(true);
        expect(safer_map.has("Orange")).toBe(false);
        expect(safer_map.has("Red")).toBe(true);
    });

    test('SafeMap entries', () => {

        let safer_map = new SafeMap<string, string>();

        safer_map.set("Blue", "Jay");
        safer_map.set("Yellow", "Submarine");
        safer_map.set("Red", "Sea");

        let iter = safer_map.entries();

        expect(iter.next().value).toEqual(["Blue" , "Jay"]);
        expect(iter.next().value).toEqual(["Yellow", "Submarine"]);
        expect(iter.next().value).toEqual(["Red", "Sea"]);
    });

    test('SafeMap keys', () => {

        let safer_map = new SafeMap<string, string>();

        safer_map.set("Blue", "Jay");
        safer_map.set("Yellow", "Submarine");
        safer_map.set("Red", "Sea");

        let iter = safer_map.keys();

        expect(iter.next().value).toEqual("Blue");
        expect(iter.next().value).toEqual("Yellow");
        expect(iter.next().value).toEqual("Red");
    });

    test('SafeMap values', () => {

        let safer_map = new SafeMap<string, number>();

        safer_map.set("Blue", 21);
        safer_map.set("Yellow", 7);
        safer_map.set("Red", 3);

        let iter = safer_map.values();

        expect(iter.next().value).toEqual(21);
        expect(iter.next().value).toEqual(7);
        expect(iter.next().value).toEqual(3);
    });

    test('SafeMap size', () => {
        let safer_map = new SafeMap<string, number>();
        expect(safer_map.my_map.size === 0);
        safer_map.set("Blue", 21);
        expect(safer_map.size === 1);
        safer_map.set("Yellow", 7);
        expect(safer_map.size === 2);
        safer_map.set("Red", 3);
        expect(safer_map.size === 3);
        safer_map.delete("Red");
        expect(safer_map.size === 2);
        safer_map.delete("Yellow");
        expect(safer_map.size === 1);
        safer_map.delete("Blue");
        expect(safer_map.size === 0);
    });
});
