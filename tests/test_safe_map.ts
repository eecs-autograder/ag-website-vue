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
        console.log(wrapper.html());

        expect(wrapper.vm.$data.my_map.get("Blue")).toEqual("Jay");
        expect(wrapper.vm.$data.my_map.get("Green")).toThrow('Key is not in map!');
    });

});
