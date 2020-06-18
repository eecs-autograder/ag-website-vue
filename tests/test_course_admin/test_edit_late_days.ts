import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import EditLateDays from '@/components/course_admin/edit_late_days.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    find_by_name,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid,
    wait_for_load,
    wait_until,
} from '@/tests/utils';

let wrapper: Wrapper<EditLateDays>;
let course: ag_cli.Course;
let users: ag_cli.User[];

beforeEach(async () => {
    users = [
        data_ut.make_user(),
        data_ut.make_user(),
        data_ut.make_user(),
    ];
    course = data_ut.make_course();
    sinon.stub(course, 'get_students').resolves(users);

    wrapper = managed_mount(EditLateDays, {propsData: {course: course}});
    expect(await wait_for_load(wrapper)).toBe(true);
});

test('Select and edit student from list', async () => {
    sinon.stub(ag_cli.User, 'get_num_late_days').withArgs(
        course.pk, users[1].username).resolves({late_days_remaining: 3});
    wrapper.findComponent({ref: 'lookup'}).vm.$emit('item_selected', users[1].username);
    await wrapper.vm.$nextTick();

    expect(get_validated_input_text(wrapper.findComponent({ref: 'late_days_input'}))).toEqual('3');
    expect(validated_input_is_valid(wrapper.findComponent({ref: 'late_days_input'}))).toBe(true);
    expect(wrapper.find('[data-testid=save_button]').element).not.toBeDisabled();

    await set_validated_input_text(wrapper.findComponent({ref: 'late_days_input'}), '  ');
    expect(validated_input_is_valid(wrapper.findComponent({ref: 'late_days_input'}))).toBe(false);
    expect(wrapper.find('[data-testid=save_button]').element).toBeDisabled();

    await set_validated_input_text(wrapper.findComponent({ref: 'late_days_input'}), '0');
    expect(validated_input_is_valid(wrapper.findComponent({ref: 'late_days_input'}))).toBe(true);
    expect(wrapper.find('[data-testid=save_button]').element).not.toBeDisabled();

    await set_validated_input_text(wrapper.findComponent({ref: 'late_days_input'}), '-1');
    expect(validated_input_is_valid(wrapper.findComponent({ref: 'late_days_input'}))).toBe(false);
    expect(wrapper.find('[data-testid=save_button]').element).toBeDisabled();

    await set_validated_input_text(wrapper.findComponent({ref: 'late_days_input'}), '1');
    expect(validated_input_is_valid(wrapper.findComponent({ref: 'late_days_input'}))).toBe(true);
    expect(wrapper.find('[data-testid=save_button]').element).not.toBeDisabled();

    let set_late_days_stub = sinon.stub(ag_cli.User, 'set_num_late_days');
    await wrapper.findComponent({ref: 'late_day_form'}).trigger('submit');

    expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);
    expect(set_late_days_stub.calledOnceWith(course.pk, users[1].username, 1));
});

test('Search for student', async () => {
    let other_username = 'usery';
    sinon.stub(ag_cli.User, 'get_num_late_days').withArgs(
        course.pk, other_username).resolves({late_days_remaining: 2});
    find_by_name<DropdownTypeahead>(
        wrapper, 'DropdownTypeahead').vm.filter_text = '  ' + other_username + '   ';
    await wrapper.find('[data-testid=search_button]').trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

    expect(get_validated_input_text(wrapper.findComponent({ref: 'late_days_input'}))).toEqual('2');
});

test('Search for empty string does nothing', async () => {
    let stub = sinon.stub(ag_cli.User, 'get_num_late_days');
    await wrapper.find('[data-testid=search_button]').trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

    expect(stub.callCount).toEqual(0);
});

test('404 handled on search', async () => {
    let stub = sinon.stub(ag_cli.User, 'get_num_late_days').withArgs(
        course.pk, 'steve').rejects(new ag_cli.HttpError(404, ''));
    find_by_name<DropdownTypeahead>(wrapper, 'DropdownTypeahead').vm.filter_text = 'steve';
    wrapper.find('[data-testid=search_button]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

    expect(wrapper.find('.user-not-found').exists()).toBe(true);

    stub.withArgs(
        course.pk, 'stove').resolves({late_days_remaining: 2});
    find_by_name<DropdownTypeahead>(wrapper, 'DropdownTypeahead').vm.filter_text = 'stove';
    await wrapper.find('[data-testid=search_button]').trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

    expect(wrapper.find('.user-not-found').exists()).toBe(false);
});

test('API Errors handled on save', async () => {
    sinon.stub(ag_cli.User, 'get_num_late_days').withArgs(
        course.pk, users[1].username).resolves({late_days_remaining: 3});
    wrapper.findComponent({ref: 'lookup'}).vm.$emit('item_selected', users[1].username);
    await wrapper.vm.$nextTick();

    sinon.stub(ag_cli.User, 'set_num_late_days').rejects(new ag_cli.HttpError(403, ''));
    await wrapper.findComponent({ref: 'late_day_form'}).trigger('submit');
    expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

    expect(find_by_name<APIErrors>(wrapper, 'APIErrors').vm.d_api_errors.length).toEqual(1);
});
