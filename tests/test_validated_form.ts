import ValidatedForm from '@/components/validated_form.vue';
import { zip } from '@/utils';
import { config, mount } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

const IS_NUMBER = (value: string): [boolean, string] => {
    const valid = value !== "" && !isNaN(Number(value));
    return [valid, "Invalid number!"];
};

describe('ValidatedForm.vue', () => {
    test('', () => {
        return;
    });
});
