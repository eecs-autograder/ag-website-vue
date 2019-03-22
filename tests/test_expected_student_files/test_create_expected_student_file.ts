import CreateExpectedStudentFile, { CreateExpectedStudentFileData } from '@/components/expected_student_files/create_expected_student_file.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import {
    ExpectedStudentFile, ExpectedStudentFileData,
    NewExpectedStudentFileData,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
   sinon.restore();
});

describe('CreateExpectedStudentFile tests', () => {

});
