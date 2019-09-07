import { config, mount, Wrapper } from '@vue/test-utils';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';
import SubmissionDetailPanel from '@/components/project_view/submission_detail/submission_detail_panel.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('SubmissionDetailPanel tests', () => {
    let wrapper: Wrapper<SubmissionDetailPanel>;

    beforeEach(() => {
        wrapper = mount(SubmissionDetailPanel, {
            propsData: {
                name: "Case Name",
                correctness_level: CorrectnessLevel.all_correct,
                points_awarded: 0,
                points_possible: 1
            }
        });
    });

    test('all correct panel', async () => {

    });

    test('none correct panel', async () => {

    });

    test('some correct panel', async () => {

    });

    test('not available panel', async () => {

    });

    test('points possible is 0', async () => {

    });

    test('toggle_d_is_open', async () => {

    });

    test('panel_is_active', async () => {

    });
});
