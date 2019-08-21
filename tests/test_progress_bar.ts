import { mount } from '@vue/test-utils';

import ProgressBar from '@/components/progress_bar.vue';

describe('Progress bar tests', () => {
    test('Progress 0', () => {
        const wrapper = mount(ProgressBar, {
            propsData: {
                progress: 0
            }
        });

        expect(wrapper.vm.$el).toMatchSnapshot();
    });

    test('Partial progress', () => {
        const wrapper = mount(ProgressBar, {
            propsData: {
                progress: 51
            }
        });

        expect(wrapper.vm.$el).toMatchSnapshot();
    });

    test('Progress 100% default slot', () => {
        const wrapper = mount(ProgressBar, {
            propsData: {
                progress: 100
            }
        });

        expect(wrapper.vm.$el).toMatchSnapshot();
    });

    test('Progress 100% custom slot', () => {
        const wrapper = mount(ProgressBar, {
            propsData: {
                progress: 100
            },
            slots: {
                default: 'Finishing request'
            }
        });

        expect(wrapper.vm.$el).toMatchSnapshot();
    });
});
