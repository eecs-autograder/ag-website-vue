import { config, Wrapper } from '@vue/test-utils';

import { Course, HttpError, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import HandgraderRoster from '@/components/course_admin/roster/handgrader_roster.vue';
import Roster from '@/components/course_admin/roster/roster.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { find_by_name, wait_for_load } from '@/tests/utils';


describe('HandgraderRoster tests', () => {
    let wrapper: Wrapper<HandgraderRoster>;
    let course: Course;
    let handgraders: User[];

    let get_handgraders_stub: sinon.SinonStub;

    beforeEach(async () => {
        course = data_ut.make_course();
        handgraders = [
            data_ut.make_user(),
            data_ut.make_user(),
            data_ut.make_user(),
        ];

        get_handgraders_stub = sinon.stub(course, 'get_handgraders');
        get_handgraders_stub.onFirstCall().resolves(handgraders);

        wrapper = managed_mount(HandgraderRoster, {
            propsData: {
                course: course
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Handgraders passed to roster component', async () => {
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        expect(roster.vm.roster).toEqual(handgraders);
    });

    test('Handgraders added from add_users event', async () => {
        let new_users = [data_ut.make_user(), data_ut.make_user()];
        let new_usernames = new_users.map(user => user.username);
        let updated_handgraders = handgraders.concat(new_users);
        get_handgraders_stub.onSecondCall().resolves(updated_handgraders);

        let add_handgraders_stub = sinon.stub(course, 'add_handgraders');

        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', new_usernames);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(add_handgraders_stub.calledOnceWith(new_usernames)).toBe(true);
        expect(wrapper.vm.handgraders).toEqual(updated_handgraders);
    });

    test('Add handgraders API error handled', async () => {
        sinon.stub(course, 'add_handgraders').rejects(new HttpError(403, 'Nope'));
        let roster = find_by_name<Roster>(wrapper, 'Roster');
        roster.vm.$emit('add_users', []);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(find_by_name<APIErrors>(wrapper, 'APIErrors').vm.d_api_errors.length).toBe(1);
    });

    test('Handgraders removed after remove_user event', async () => {
        get_handgraders_stub.onSecondCall().resolves([handgraders[0], handgraders[1]]);

        let remove_handgraders_stub = sinon.stub(course, 'remove_handgraders');

        wrapper.find({ref: 'handgrader_roster'}).vm.$emit('remove_user', [handgraders[2]]);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(remove_handgraders_stub.calledOnceWith([handgraders[2]])).toBe(true);
        expect(wrapper.vm.handgraders).toEqual([handgraders[0], handgraders[1]]);
    });
});
