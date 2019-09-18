import { config, mount, Wrapper } from '@vue/test-utils';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';
import SubmissionDetailPanel from '@/components/project_view/submission_detail/submission_detail_panel.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('SubmissionDetailPanel tests', () => {
    let wrapper: Wrapper<SubmissionDetailPanel>;

    test('all correct panel', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.all_correct,
                points_awarded: 1,
                points_possible: 1
            }
        });
        expect(wrapper.find('.all-correct-panel-header').exists()).toBe(true);
        expect(wrapper.find('.correctness').find(
            '.all-correct'
        ).exists()).toBe(true);
    });

    test('none correct panel', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.none_correct,
                points_awarded: 1,
                points_possible: 1
            }
        });
        expect(wrapper.find('.none-correct-panel-header').exists()).toBe(true);
        expect(wrapper.find('.correctness').find(
            '.none-correct'
        ).exists()).toBe(true);
    });

    test('some correct', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.some_correct,
                points_awarded: 1,
                points_possible: 1
            }
        });
        expect(wrapper.find('.some-correct-panel-header').exists()).toBe(true);
        expect(wrapper.find('.correctness').find(
            '.some-correct'
        ).exists()).toBe(true);
        expect(wrapper.vm.points_awarded).toEqual(wrapper.vm.points_possible);
    });

    test('not available panel', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.not_available,
                points_awarded: 1,
                points_possible: 1
            }
        });
        expect(wrapper.find('.not-available-panel-header').exists()).toBe(true);
        expect(wrapper.find('.correctness').find(
            '.not-available'
        ).exists()).toBe(true);
    });

    test('points possible === 0 - score is not displayed', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.all_correct,
                points_awarded: 0,
                points_possible: 0
            }
        });
        expect(wrapper.findAll('.display-points').exists()).toBe(false);
    });

    test('points possible !== 0 - score is displayed', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.some_correct,
                points_awarded: 0,
                points_possible: 1
            }
        });
        expect(wrapper.find('.display-points').exists()).toBe(true);
    });

    test('toggle_d_is_open - correctness_level !== CorrectnessLevel.not_available', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.some_correct,
                points_awarded: 0,
                points_possible: 1
            }
        });
        expect(wrapper.vm.d_is_open).toBe(false);

        wrapper.find('.panel-header-closed').trigger('click');

        expect(wrapper.vm.d_is_open).toBe(true);

        wrapper.find('.panel-header-open').trigger('click');

        expect(wrapper.vm.d_is_open).toBe(false);
    });

    test('toggle_d_is_open - correctness_level === CorrectnessLevel.not_available', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.not_available,
                points_awarded: 0,
                points_possible: 1
            }
        });
        expect(wrapper.vm.d_is_open).toBe(false);

        wrapper.find('.panel-header-closed').trigger('click');

        expect(wrapper.vm.d_is_open).toBe(false);
    });

    test('panel_is_active', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.some_correct,
                points_awarded: 0,
                points_possible: 1,
                panel_is_active: true
            }
        });
        expect(wrapper.vm.d_is_open).toBe(true);
    });

    test('is_command is true', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.some_correct,
                points_awarded: 0,
                points_possible: 1,
                is_command: true
            }
        });
        expect(wrapper.find('.command-name').exists()).toBe(true);
        expect(wrapper.find('.command-correctness').exists()).toBe(true);
        expect(wrapper.find('.name').exists()).toBe(false);
        expect(wrapper.find('.correctness').exists()).toBe(false);
        expect(wrapper.find('.points').exists()).toBe(false);
    });

    test('is_command is false', async () => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.some_correct,
                points_awarded: 0,
                points_possible: 1
            }
        });
        expect(wrapper.find('.command-name').exists()).toBe(false);
        expect(wrapper.find('.command-correctness').exists()).toBe(false);

        expect(wrapper.find('.name').exists()).toBe(true);
        expect(wrapper.find('.correctness').exists()).toBe(true);
        expect(wrapper.find('.points').exists()).toBe(true);
    });
});
