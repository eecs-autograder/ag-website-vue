import { config, Wrapper } from '@vue/test-utils';

import { Course, HttpError, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import Roster from '@/components/course_admin/roster/roster.vue';
import StudentRoster from '@/components/course_admin/roster/student_roster.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { find_by_name, wait_for_load } from '@/tests/utils';


describe('StudentRoster tests', () => {
    let wrapper: Wrapper<StudentRoster>;
    let course: Course;
    let students: User[];

    let get_students_stub: sinon.SinonStub;

    beforeEach(async () => {
        course = data_ut.make_course();
        students = [
            data_ut.make_user(),
            data_ut.make_user(),
            data_ut.make_user(),
        ];

        get_students_stub = sinon.stub(course, 'get_students');
        get_students_stub.onFirstCall().resolves(students);

        wrapper = managed_mount(StudentRoster, {
            propsData: {
                course: course
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Students passed to roster component', async () => {
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        expect(roster.vm.roster).toEqual(students);
    });

    test('Students added from add_users event', async () => {
        let new_users = [data_ut.make_user(), data_ut.make_user()];
        let new_usernames = new_users.map(user => user.username);
        let updated_students = students.concat(new_users);
        get_students_stub.onSecondCall().resolves(updated_students);

        let add_students_stub = sinon.stub(course, 'add_students');

        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', new_usernames);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(add_students_stub.calledOnceWith(new_usernames)).toBe(true);
        expect(wrapper.vm.students).toEqual(updated_students);

        expect(roster.vm.d_form_text).toEqual('');
    });

    test('Add students API error handled', async () => {
        sinon.stub(course, 'add_students').rejects(new HttpError(403, 'Nope'));
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', []);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(find_by_name<APIErrors>(wrapper, 'APIErrors').vm.d_api_errors.length).toBe(1);
    });

    test('Students replaced from replace_users event', async () => {
        let new_users = [data_ut.make_user(), data_ut.make_user()];
        let new_usernames = new_users.map(user => user.username);
        get_students_stub.onSecondCall().resolves(new_users);

        let set_students_stub = sinon.stub(course, 'set_students');

        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('replace_users', new_usernames);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(set_students_stub.calledOnceWith(new_usernames)).toBe(true);
        expect(wrapper.vm.students).toEqual(new_users);

        expect(roster.vm.d_form_text).toEqual('');
    });

    test('Add students API error handled', async () => {
        sinon.stub(course, 'set_students').rejects(new HttpError(403, 'Nope'));
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('replace_users', []);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(find_by_name<APIErrors>(wrapper, 'APIErrors').vm.d_api_errors.length).toBe(1);
    });

    test('Students removed after remove_user event', async () => {
        get_students_stub.onSecondCall().resolves([students[0], students[1]]);

        let remove_stduents_stub = sinon.stub(course, 'remove_students');

        wrapper.find({ref: 'student_roster'}).vm.$emit('remove_user', [students[2]]);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(remove_stduents_stub.calledOnceWith([students[2]])).toBe(true);
        expect(wrapper.vm.students).toEqual([students[0], students[1]]);
    });
});
