import { config, mount, Wrapper } from '@vue/test-utils';

import {
    Project
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as sinon from "sinon";

import MutationSuites from '@/components/project_admin/mutation_suite_editing/mutation_suites.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationSuites tests', () => {
    let wrapper: Wrapper<MutationSuites>;
    let component: MutationSuites;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(MutationSuites, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('', async () => {
    });
});
