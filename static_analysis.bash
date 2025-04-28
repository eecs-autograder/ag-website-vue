set -ex

npx eslint \
    'tests/e2e/**/*.ts' \
    'src/composables/**/*.ts' \
    'src/components/validated_input/**/*.vue' \
    'src/demos/new_validated_input_demo/**/*.vue' \
    'src/demos/new_validated_form_demo/**/*.vue' \
    'tests/test_composables/**/*.ts' \
    'tests/test_components/test_new_validated_input.ts' \
    'tests/test_components/test_new_validated_form.ts' \
    'src/components/CollapsibleSection.vue' \
    'tests/test_components/test_collapsible_section.ts'

npx prettier --check --no-editorconfig \
    '*.js' \
    '*.ts' \
    'tests/e2e/**/*.ts' \
    'src/composables/**/*.ts' \
    'src/components/validated_input/**/*.vue' \
    'src/demos/new_validated_input_demo/**/*.vue' \
    'src/demos/new_validated_form_demo/**/*.vue' \
    'tests/test_composables/**/*.ts' \
    'tests/test_components/test_new_validated_input.ts' \
    'tests/test_components/test_new_validated_form.ts' \
    'src/components/CollapsibleSection.vue' \
    'tests/test_components/test_collapsible_section.ts'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
