import HelloWorld from '@/components/hello_world.vue';

import { Course, Semester } from 'ag-client-typescript';
import { mount } from '@vue/test-utils';

describe('HelloWorld.vue', () => {
    test('renders props.msg when passed', () => {
        let course = new Course('spam', Semester.fall, 2020, '', 0, '');
        console.log(course);
        // const msg = 'new message';
        const wrapper = mount(HelloWorld);

    });
});
