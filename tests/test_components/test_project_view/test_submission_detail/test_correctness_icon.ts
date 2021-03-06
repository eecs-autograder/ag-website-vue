import { mount, Wrapper } from '@vue/test-utils';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import CorrectnessIcon from '@/components/project_view/submission_detail/correctness_icon.vue';

describe('CorrectnessIcon tests', () => {
    let wrapper: Wrapper<CorrectnessIcon>;

    test('Correctness_level = all_correct', async () => {
        wrapper = mount(CorrectnessIcon, {
            propsData: {
                correctness_level: CorrectnessLevel.all_correct
            }
        });
        expect(wrapper.find('.correctness-level').classes()).toContain(
            'all-correct'
        );
    });

    test('Correctness_level = some_correct', async () => {
        wrapper = mount(CorrectnessIcon, {
            propsData: {
                correctness_level: CorrectnessLevel.some_correct
            }
        });

        expect(wrapper.find('.correctness-level').classes()).toContain(
            'some-correct'
        );
    });

    test('Correctness_level = none_correct', async () => {
        wrapper = mount(CorrectnessIcon, {
            propsData: {
                correctness_level: CorrectnessLevel.none_correct
            }
        });

        expect(wrapper.find('.correctness-level').classes()).toContain(
            'none-correct'
        );
    });

    test('Correctness_level = not_available', async () => {
        wrapper = mount(CorrectnessIcon, {
            propsData: {
                correctness_level: CorrectnessLevel.not_available
            }
        });

        expect(wrapper.find('.correctness-level').classes()).toContain(
            'not-available'
        );
    });

    test('Correctness_level = info_only', async () => {
        wrapper = mount(CorrectnessIcon, {
            propsData: {
                correctness_level: CorrectnessLevel.info_only
            }
        });

        expect(wrapper.find('.correctness-level').classes()).toContain(
            'info-only'
        );
    });

    test('Change value assigned to correctness_level prop', async () => {
        wrapper = mount(CorrectnessIcon, {
            propsData: {
                correctness_level: CorrectnessLevel.not_available
            }
        });

        expect(wrapper.find(
            '.correctness-level'
        ).classes()).toContain('not-available');

        wrapper.setProps({correctness_level: CorrectnessLevel.some_correct});
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.correctness-level').classes()).toContain(
            'some-correct'
        );
    });
});
