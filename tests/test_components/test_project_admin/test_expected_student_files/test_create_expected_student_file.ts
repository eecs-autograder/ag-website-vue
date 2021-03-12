import { mount, Wrapper } from '@vue/test-utils';

import { ExpectedStudentFile, HttpError, Project } from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import CreateExpectedStudentFile from '@/components/project_admin/expected_student_files/create_expected_student_file.vue';
import ExpectedStudentFileForm from '@/components/project_admin/expected_student_files/expected_student_file_form.vue';

import { make_course, make_project } from '@/tests/data_utils';
import { wait_until } from '@/tests/utils';


describe('CreateExpectedStudentFile tests', () => {
    let wrapper: Wrapper<CreateExpectedStudentFile>;
    let component: CreateExpectedStudentFile;
    let project: Project;

    beforeEach(() => {
        project = make_project(make_course().pk);

        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;
    });

    test('Successful creation of a file', async () => {
        let create_stub = sinon.stub(ExpectedStudentFile, 'create');
        let form_wrapper = wrapper.findComponent({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "Giraffe.cpp";
        await component.$nextTick();

        await wrapper.findComponent({ref: 'form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_create_pending)).toBe(true);

        expect(create_stub.getCall(0).args[0]).toEqual(project.pk);
        expect(create_stub.getCall(0).args[1]
        ).toEqual({
            pattern: "Giraffe.cpp",
            min_num_matches: 1,
            max_num_matches: 1
        });
    });

    test('Unsuccessful creation of a file - name is not unique', async () => {
        let form_wrapper = wrapper.findComponent({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "Giraffe.cpp";
        await component.$nextTick();

        sinon.stub(ExpectedStudentFile, 'create').rejects(
            new HttpError(400, {__all__: "File with this name already exists in project"})
        );
        await wrapper.findComponent({ref: 'form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_create_pending)).toBe(true);
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBeGreaterThan(0);
    });

    test("The 'create' button is disabled when an input value is invalid", async () => {
        expect(component.project).toEqual(project);

        let form_wrapper = wrapper.findComponent({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "   ";
        await component.$nextTick();

        expect(wrapper.find('.add-file-button').element).toBeDisabled();
        expect(component.pattern_is_valid).toBe(false);
    });
});
