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
    'tests/test_components/test_collapsible_section.ts' \
    'src/components/modal.vue' \
    'src/components/toggle.vue' \
    'src/components/toggle.vue' \
    'src/components/view_file/code_theme_toggle.vue' \
    'src/components/tooltip.vue' \
    'src/components/dropdown.vue' \
    'src/components/api_token.vue' \
    'src/components/last_saved.vue' \
    'src/components/api_errors.vue' \
    'src/components/group_members_form.vue' \
    'src/components/project_admin/edit_groups/edit_single_group.vue'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
