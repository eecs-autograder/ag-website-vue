import LoadingIcon from '@/components/loading_icon.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('LoadingIcon.vue', () => {
    let wrapper: Wrapper<LoadingIcon>;
    let loading_icon: LoadingIcon;
    let loading_value = true;
    let loading_spinner: Wrapper<Vue>;

    beforeEach(() => {
        wrapper = mount(LoadingIcon, {
            propsData: {
                loading: loading_value
            }
        });

        loading_icon = wrapper.vm;
    });

    test('Custom loading icon size', () => {
        wrapper.setProps({size: '30px'});
        expect(loading_icon.size).toBe("30px");
        loading_spinner = wrapper.find('.loading-spinner');
        expect(loading_spinner.element.style.fontSize).toEqual('30px');
    });

    test('Default loading icon size', () => {
        expect(loading_icon.size).toBe("inherit");
        loading_spinner = wrapper.find('.loading-spinner');
        expect(loading_spinner.element.style.fontSize).toEqual('inherit');
    });

    test('When loading evaluates to true, the spinner is displayed', () => {
        expect(loading_icon.loading).toBe(true);
        expect(wrapper.findAll('.loading-spinner').length).toEqual(1);
    });

    test('The loading value can be toggled', () => {
        expect(loading_icon.d_loading).toBe(true);
        expect(wrapper.findAll('.loading-spinner').length).toEqual(1);
        wrapper.setProps({loading: false});
        expect(loading_icon.d_loading).toBe(false);
        expect(wrapper.findAll('.loading-spinner').length).toEqual(0);
    });
});
