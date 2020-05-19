import { config, Wrapper } from '@vue/test-utils';

import { Course, HttpError, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import AdminRoster from '@/components/course_admin/roster/admin_roster.vue';
import Roster from '@/components/course_admin/roster/roster.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { find_by_name, wait_for_load } from '@/tests/utils';


describe('AdminRoster tests', () => {
    let wrapper: Wrapper<AdminRoster>;
    let course: Course;
    let admins: User[];

    let get_admins_stub: sinon.SinonStub;

    beforeEach(async () => {
        course = data_ut.make_course();
        admins = [
            data_ut.make_user(),
            data_ut.make_user(),
            data_ut.make_user(),
        ];

        get_admins_stub = sinon.stub(course, 'get_admins');
        get_admins_stub.onFirstCall().resolves(admins);

        wrapper = managed_mount(AdminRoster, {
            propsData: {
                course: course
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Admins passed to roster component', async () => {
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        expect(roster.vm.roster).toEqual(admins);
    });

    test('Admins added from add_users event', async () => {
        let new_users = [data_ut.make_user(), data_ut.make_user()];
        let new_usernames = new_users.map(user => user.username);
        let updated_admins = admins.concat(new_users);
        get_admins_stub.onSecondCall().resolves(updated_admins);

        let add_admins_stub = sinon.stub(course, 'add_admins');

        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', new_usernames);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(add_admins_stub.calledOnceWith(new_usernames)).toBe(true);
        expect(wrapper.vm.admins).toEqual(updated_admins);
    });

    test('Add admins API error handled', async () => {
        sinon.stub(course, 'add_admins').rejects(new HttpError(403, 'Nope'));
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', []);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(find_by_name<APIErrors>(wrapper, 'APIErrors').vm.d_api_errors.length).toBe(1);
    });

    test('Admins removed after remove_user event', async () => {
        get_admins_stub.onSecondCall().resolves([admins[0], admins[1]]);

        let remove_admins_stub = sinon.stub(course, 'remove_admins');

        wrapper.find({ref: 'admin_roster'}).vm.$emit('remove_user', [admins[2]]);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(remove_admins_stub.calledOnceWith([admins[2]])).toBe(true);
        expect(wrapper.vm.admins).toEqual([admins[0], admins[1]]);
    });
});
