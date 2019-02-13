import InstructorFiles from '@/components/instructor_files.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('InstructorFiles.vue', () => {
    let project: Project;
    let wrapper: Wrapper<InstructorFiles>;
    let instructor_files_component: InstructorFiles;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        project = new Project({
            pk: 10,
            name: "Project 1 - Statistics",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test.skip('InstructorFile data set to values passed in by parent', () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });

        instructor_files_component = wrapper.vm;
        // expect(instructor_files_component.project).toEqual(project);
    });

    test.skip("It's possible to add distinctly named files to the instructor_files " +
              "component",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });

    test.skip("Uploading a file with the same name as a file already in the instructor_files " +
              "component triggers an update of the file's contents instead of a creating a " +
              "new file entry",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });

    test.skip("A filename with spaces is equivalent to a filename with underscores in " +
              "place of the spaces",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });

    test.skip("Clicking on a filename will allow a user to view the file's contents in the" +
              " multi_file_viewer",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });

    test.skip("A file can be deleted from the instructor_files component", () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });

    test.skip("Its possible to cancel the process of deleting a file once you've begun it",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });


    test.skip("A file's name can be updated in the instructor_files component",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });

    test.skip("When a file name is updated and it was already being viewed in the" +
              "multi_file_viewer component, the tab gets updated to reflect the new name",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });

    test.skip("You can download a file in the instructor_files component",
              () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
    });
});
