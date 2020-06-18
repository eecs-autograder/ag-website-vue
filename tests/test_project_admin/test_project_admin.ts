import { Wrapper } from '@vue/test-utils';

import {
    Course,
    ExpectedStudentFile,
    InstructorFile,
    Project,
    User
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGSuites from '@/components/project_admin/ag_suites/ag_suites.vue';
import EditGroups from '@/components/project_admin/edit_groups/edit_groups.vue';
import ExpectedStudentFiles from '@/components/project_admin/expected_student_files/expected_student_files.vue';
import HandgradingSettings from '@/components/project_admin/handgrading_settings/handgrading_settings.vue';
import InstructorFiles from '@/components/project_admin/instructor_files/instructor_files.vue';
import MutationSuites from '@/components/project_admin/mutation_suites/mutation_suites.vue';
import ProjectAdmin from '@/components/project_admin/project_admin.vue';
import ProjectSettings from '@/components/project_admin/project_settings.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount, managed_shallow_mount } from '@/tests/setup';
import { wait_for_load, wait_until } from '@/tests/utils';


let course = data_ut.make_course();

beforeEach(() => {
    sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));
    sinon.stub(User, 'get_current_user_roles').returns(
        Promise.resolve(data_ut.make_user_roles()));

    data_ut.set_global_current_course(course);
});

// As child components of the ProjectAdmin component get merged, their methods that make api calls
// in created() will need to be stubbed in these tests.
describe('Changing tabs in project admin', () => {
    let wrapper: Wrapper<ProjectAdmin>;
    let project: Project;

    let router_replace: sinon.SinonStub;

    beforeEach(async () => {
        project = data_ut.make_project(course.pk);

        sinon.stub(Project, 'get_by_pk').withArgs(project.pk).returns(Promise.resolve(project));
        router_replace = sinon.stub();

        wrapper = managed_shallow_mount(ProjectAdmin, {
            mocks: {
                $route: {
                    params: {
                        project_id: project.pk.toString()
                    },
                    query: {}
                },
                $router: {
                    replace: router_replace
                }
            },
        });
        await wait_for_load(wrapper);

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'ProjectSettings'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'InstructorFiles'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'ExpectedStudentFiles'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'AGSuites'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'MutationSuites'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'EditGroups'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'HandgradingSettings'}).exists()).toBe(false);
    });

    test('Requested tab on load', async () => {
        wrapper = managed_shallow_mount(ProjectAdmin, {
            mocks: {
                $route: {
                    params: {
                        project_id: project.pk.toString()
                    },
                    query: {
                        current_tab: 'handgrading'
                    }
                },
                $router: {
                    replace: router_replace
                }
            }
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'HandgradingSettings'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'HandgradingSettings'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('handgrading');
        expect(wrapper.findComponent(HandgradingSettings).vm.$props.project).toEqual(project);
    });

    test('Settings loaded initially, select another tab and then settings again', async () => {
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'ProjectSettings'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent(ProjectSettings).vm.$props.project).toEqual(project);

        let tabs = wrapper.findAll('.nav-link');
        tabs.at(1).trigger('click');

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'InstructorFiles'}).exists())
        ).toBe(true);
        expect(wrapper.vm.current_tab).toEqual('instructor_files');
        expect(wrapper.findComponent({name: 'InstructorFiles'}).element).toBeVisible();
        expect(wrapper.findComponent({name: 'ProjectSettings'}).element).not.toBeVisible();
        expect(router_replace.calledOnce).toBe(true);

        await tabs.at(0).trigger('click');
        expect(wrapper.findComponent(ProjectSettings).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('settings');
        expect(router_replace.secondCall.calledWith(
            {query: {current_tab: 'settings'}})
        ).toBe(true);
        expect(wrapper.findComponent({name: 'InstructorFiles'}).element).not.toBeVisible();
    });

    test('Clicking on Instructor Files tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(1).trigger('click');
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'InstructorFiles'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'InstructorFiles'}).element).toBeVisible();

        expect(wrapper.vm.current_tab).toEqual('instructor_files');
        expect(router_replace.firstCall.calledWith(
            {query: {current_tab: 'instructor_files'}})
        ).toBe(true);
        expect(wrapper.findComponent(InstructorFiles).vm.$props.project).toEqual(project);
    });

    test('Clicking on Expected Student Files tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(2).trigger('click');
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'ExpectedStudentFiles'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'ExpectedStudentFiles'}).element).toBeVisible();

        expect(wrapper.vm.current_tab).toEqual('expected_student_files');
        expect(router_replace.firstCall.calledWith(
            {query: {current_tab: 'expected_student_files'}})
        ).toBe(true);
        expect(wrapper.findComponent(ExpectedStudentFiles).vm.$props.project).toEqual(project);
    });

    test('Clicking on Test Cases tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(3).trigger('click');
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'AGSuites'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'AGSuites'}).element).toBeVisible();

        expect(wrapper.vm.current_tab).toEqual('test_cases');
        expect(router_replace.firstCall.calledWith(
            {query: {current_tab: 'test_cases'}})
        ).toBe(true);
        expect(wrapper.findComponent(AGSuites).vm.$props.project).toEqual(project);
    });

    test('Clicking on Mutation Testing tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(4).trigger('click');
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'MutationSuites'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'MutationSuites'}).element).toBeVisible();

        expect(wrapper.vm.current_tab).toEqual('mutation_testing');
        expect(router_replace.firstCall.calledWith(
        {query: {current_tab: 'mutation_testing'}})
        ).toBe(true);
        expect(wrapper.findComponent(MutationSuites).vm.$props.project).toEqual(project);
    });

    test('Clicking on Edit Groups tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(5).trigger('click');
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'EditGroups'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'EditGroups'}).element).toBeVisible();

        expect(wrapper.vm.current_tab).toEqual('edit_groups');
        expect(router_replace.firstCall.calledWith(
            {query: {current_tab: 'edit_groups'}})
        ).toBe(true);
        expect(wrapper.findComponent(EditGroups).vm.$props.project).toEqual(project);
    });

    test('Clicking on Download Grades tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(6).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('download_grades');
        expect(router_replace.firstCall.calledWith(
            {query: {current_tab: 'download_grades'}})
        ).toBe(true);
    });

    test('Clicking on Rerun Tests tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(7).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('rerun_tests');
        expect(router_replace.firstCall.calledWith(
            {query: {current_tab: 'rerun_tests'}})
        ).toBe(true);
    });

    test('Clicking on Handgrading tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(8).trigger('click');
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'HandgradingSettings'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'HandgradingSettings'}).element).toBeVisible();

        expect(wrapper.vm.current_tab).toEqual('handgrading');
        expect(router_replace.firstCall.calledWith(
        {query: {current_tab: 'handgrading'}})
        ).toBe(true);
        expect(wrapper.findComponent(HandgradingSettings).vm.$props.project).toEqual(project);
    });
});

test('Project observer', async () => {
    let project = data_ut.make_project(course.pk);
    sinon.stub(Project, 'get_by_pk').withArgs(project.pk).returns(Promise.resolve(project));
    let wrapper = managed_mount(ProjectAdmin, {
        mocks: {
            $route: {
                params: {
                    project_id: project.pk.toString()
                },
                query: {}
            },
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);

    let updated = new Project(project);
    updated.name = 'A new name';
    expect(wrapper.vm.d_project!.name).not.toEqual(updated.name);
    Project.notify_project_changed(updated);
    expect(wrapper.vm.d_project!.name).toEqual(updated.name);

    let other_project = data_ut.make_project(course.pk);
    Project.notify_project_changed(other_project);
    expect(wrapper.vm.d_project).toEqual(updated);
});

describe('InstructorFileObserver tests', () => {
    let project: Project;
    let instructor_files: InstructorFile[];
    let wrapper: Wrapper<ProjectAdmin>;

    beforeEach(async () => {
        project = data_ut.make_project(course.pk);
        instructor_files = [
            data_ut.make_instructor_file(project.pk, 'file1'),
            data_ut.make_instructor_file(project.pk, 'file2'),
            data_ut.make_instructor_file(project.pk, 'file3'),
        ];
        project.instructor_files = instructor_files.map(
            file => deep_copy(file, InstructorFile));

        sinon.stub(Project, 'get_by_pk').withArgs(project.pk).resolves(project);
        wrapper = managed_mount(ProjectAdmin, {
            mocks: {
                $route: {
                    params: {
                        project_id: project.pk.toString()
                    },
                    query: {}
                },
            }
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
    });

    test('Instructor file created', () => {
        let new_file = data_ut.make_instructor_file(project.pk, 'file0');
        InstructorFile.notify_instructor_file_created(new_file);

        instructor_files.unshift(new_file);
        expect(wrapper.vm.d_project?.instructor_files).toEqual(instructor_files);
    });

    test('Instructor file deleted', () => {
        InstructorFile.notify_instructor_file_deleted(instructor_files[1]);
        instructor_files.splice(1, 1);
        expect(wrapper.vm.d_project?.instructor_files).toEqual(instructor_files);
    });

    test('Instructor file renamed', () => {
        let old_name = instructor_files[0].name;
        instructor_files[0].name = 'file4';
        InstructorFile.notify_instructor_file_renamed(instructor_files[0], old_name);
        expect(wrapper.vm.d_project?.instructor_files).toEqual([
            instructor_files[1],
            instructor_files[2],
            instructor_files[0],
        ]);
    });
});

describe('ExpectedStudentFileObserver tests', () => {
    let project: Project;
    let expected_student_files: ExpectedStudentFile[];
    let wrapper: Wrapper<ProjectAdmin>;

    beforeEach(async () => {
        project = data_ut.make_project(course.pk);
        expected_student_files = [
            data_ut.make_expected_student_file(project.pk, 'file1'),
            data_ut.make_expected_student_file(project.pk, 'file2'),
            data_ut.make_expected_student_file(project.pk, 'file3'),
        ];
        project.expected_student_files = expected_student_files.map(
            file => deep_copy(file, ExpectedStudentFile));

        sinon.stub(Project, 'get_by_pk').withArgs(project.pk).resolves(project);
        wrapper = managed_mount(ProjectAdmin, {
            mocks: {
                $route: {
                    params: {
                        project_id: project.pk.toString()
                    },
                    query: {}
                },
            }
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
    });

    test('Expected file created', () => {
        let new_file = data_ut.make_expected_student_file(project.pk, 'file0');
        ExpectedStudentFile.notify_expected_student_file_created(new_file);

        expected_student_files.unshift(new_file);
        expect(wrapper.vm.d_project?.expected_student_files).toEqual(expected_student_files);
    });

    test('Expected file changed', () => {
        expected_student_files[0].pattern = 'file4';
        ExpectedStudentFile.notify_expected_student_file_changed(expected_student_files[0]);
        expect(wrapper.vm.d_project?.expected_student_files).toEqual([
            expected_student_files[1],
            expected_student_files[2],
            expected_student_files[0],
        ]);
    });

    test('Expected file deleted', () => {
        ExpectedStudentFile.notify_expected_student_file_deleted(expected_student_files[1]);
        expected_student_files.splice(1, 1);
        expect(wrapper.vm.d_project?.expected_student_files).toEqual(expected_student_files);
    });
});

test('Observer updates from other project ignored', async () => {
    let project = data_ut.make_project(course.pk);
    let other_project = data_ut.make_project(course.pk);
    let instructor_file = data_ut.make_instructor_file(other_project.pk, 'filey');
    let expected_student_file = data_ut.make_expected_student_file(other_project.pk, 'files');

    sinon.stub(Project, 'get_by_pk').withArgs(project.pk).resolves(project);
    let wrapper = managed_mount(ProjectAdmin, {
        mocks: {
            $route: {
                params: {
                    project_id: project.pk.toString()
                },
                query: {}
            },
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);

    Project.notify_project_changed(other_project);

    InstructorFile.notify_instructor_file_created(instructor_file);
    InstructorFile.notify_instructor_file_deleted(instructor_file);
    InstructorFile.notify_instructor_file_renamed(instructor_file, 'name');

    ExpectedStudentFile.notify_expected_student_file_created(expected_student_file);
    ExpectedStudentFile.notify_expected_student_file_changed(expected_student_file);
    ExpectedStudentFile.notify_expected_student_file_deleted(expected_student_file);

    expect(wrapper.vm.d_project).toEqual(project);
});
