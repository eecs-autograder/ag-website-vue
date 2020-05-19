import { config, Wrapper } from '@vue/test-utils';

import { Course, HttpError, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import Roster from '@/components/course_admin/roster/roster.vue';
import StaffRoster from '@/components/course_admin/roster/staff_roster.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { find_by_name, wait_for_load } from '@/tests/utils';


describe('StaffRoster tests', () => {
    let wrapper: Wrapper<StaffRoster>;
    let course: Course;
    let staff: User[];

    let get_staff_stub: sinon.SinonStub;

    beforeEach(async () => {
        course = data_ut.make_course();
        staff = [
            data_ut.make_user(),
            data_ut.make_user(),
            data_ut.make_user(),
        ];

        get_staff_stub = sinon.stub(course, 'get_staff');
        get_staff_stub.onFirstCall().resolves(staff);

        wrapper = managed_mount(StaffRoster, {
            propsData: {
                course: course
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Staff passed to roster component', async () => {
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        expect(roster.vm.roster).toEqual(staff);
    });

    test('Staff added from add_users event', async () => {
        let new_users = [data_ut.make_user(), data_ut.make_user()];
        let new_usernames = new_users.map(user => user.username);
        let updated_staff = staff.concat(new_users);
        get_staff_stub.onSecondCall().resolves(updated_staff);

        let add_staff_stub = sinon.stub(course, 'add_staff');

        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', new_usernames);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(add_staff_stub.calledOnceWith(new_usernames)).toBe(true);
        expect(wrapper.vm.staff).toEqual(updated_staff);
    });

    test('Add staff API error handled', async () => {
        sinon.stub(course, 'add_staff').rejects(new HttpError(403, 'Nope'));
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', []);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(find_by_name<APIErrors>(wrapper, 'APIErrors').vm.d_api_errors.length).toBe(1);
    });

    test('Staff removed after remove_user event', async () => {
        get_staff_stub.onSecondCall().resolves([staff[0], staff[1]]);

        let remove_staff_stub = sinon.stub(course, 'remove_staff');

        wrapper.find({ref: 'staff_roster'}).vm.$emit('remove_user', [staff[2]]);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(remove_staff_stub.calledOnceWith([staff[2]])).toBe(true);
        expect(wrapper.vm.staff).toEqual([staff[0], staff[1]]);
    });
});
