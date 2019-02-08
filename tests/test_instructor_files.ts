import InstructorFiles from '@/components/instructor_files.vue';
import { config, mount } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('InstructorFiles.vue', () => {
    test('InstructorFile data set to values passed in by parent', () => {
        const wrapper = mount(InstructorFiles);
        const instructor_files_component = wrapper.vm;
    });
});
