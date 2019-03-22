import SingleExpectedStudentFile from
        '@/components/expected_student_files/single_expected_student_file.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile } from 'ag-client-typescript';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ExpectedStudentFiles tests', () => {
    let file_without_wildcard: ExpectedStudentFile;
    let file_with_wildcard: ExpectedStudentFile;
    let wrapper: Wrapper<SingleExpectedStudentFile>;
    let single_file: SingleExpectedStudentFile;
    let original_match_media: (query: string) => MediaQueryList;

});
