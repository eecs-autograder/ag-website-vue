import { Course, Semester } from 'ag-client-typescript';

import { patch_async_class_method } from "./mocking";

test('Can import and use classes from typescript client', async () => {
    let course = new Course(
        {pk: 42, name: 'spam', semester: Semester.fall, year: 2020, subtitle: '',
         num_late_days: 0, last_modified: ''});
    console.log(course);

    await patch_async_class_method(
            Course, 'save', () =>  Promise.resolve(42), async () => {
       let mock_result = await course.save();
       expect(mock_result).toEqual(42);
       console.log(Course.prototype['save']);
    });
});
