import { mount, Wrapper } from '@vue/test-utils';

import StickySidebar from '@/components/sticky_sidebar.vue';

let wrapper: Wrapper<StickySidebar>;

afterEach(() => {
    if (wrapper.exists()) {
        wrapper.destroy();
    }
});

test('Sidebar height calculation', () => {
    wrapper = mount(StickySidebar);
    expect(wrapper.vm.d_height).toEqual('calc(100vh - 0px)');

    // Workaround: vue-test-utils doesn't seem to support getBoundingClientRect
    (<HTMLElement> wrapper.vm.$refs.sidebar).getBoundingClientRect = () => {
        return {
            top: 10,
            bottom: 0,
            left: 0,
            right: 0,
            height: 0,
            width: 0,
        };
    };

    // tslint:disable-next-line: no-any
    (<any> wrapper.vm).scroll_handler();
    expect(wrapper.vm.d_height).toEqual('calc(100vh - 10px)');
});
