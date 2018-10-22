import { Course, Semester } from 'ag-client-typescript';

test('Can import and use classes from typescript client', () => {
    let course = new Course(
        {pk: 42, name: 'spam', semester: Semester.fall, year: 2020, subtitle: '',
         num_late_days: 0, last_modified: ''});
    console.log(course);
});
