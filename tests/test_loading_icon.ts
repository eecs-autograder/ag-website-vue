import LoadingIcon from '@/components/loading_icon.vue';
import { config, mount, Wrapper } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('LoadingIcon.vue', () => {
    let wrapper: Wrapper<LoadingIcon>;
    let loading_icon: LoadingIcon;
    let loading_value = true;

    test('Custom loading icon size', () => {
        wrapper = mount(LoadingIcon, {
            propsData: {
                loading: loading_value,
                size: "30px"
            }
        });

        loading_icon = wrapper.vm;
        expect(loading_icon.size).toBe("30px");
    });

    beforeEach(() => {
        wrapper = mount(LoadingIcon, {
            propsData: {
                loading: loading_value
            }
        });

        loading_icon = wrapper.vm;
    });

    test('Default loading icon size', () => {
        expect(loading_icon.size).toBe("inherit");
    });


    test('When loading evaluates to true, the spinner is displayed', () => {
        expect(loading_icon.loading).toBe(true);
        expect(wrapper.findAll('.loading-spinner').length).toEqual(1);
    });

    test('The loading value can be toggled', () => {
        expect(loading_icon.loading).toBe(true);
        expect(wrapper.findAll('.loading-spinner').length).toEqual(1);
        wrapper.setProps({loading: false});
        expect(loading_icon.loading).toBe(false);
        expect(wrapper.findAll('.loading-spinner').length).toEqual(0);
    });
});
