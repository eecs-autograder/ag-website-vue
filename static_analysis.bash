#!/usr/bin/env bash
set -ex

# Files checked by both eslint and prettier. This list grows as components are
# ported to <script setup> during the Vue 3 migration. Keep it sorted and insert
# new entries in place. Note that we are not linting or formatting test files
# for ported components to keep diffs small.
lint_paths=(
    '*.ts'
    'src/components/api_errors.vue'
    'src/components/api_token.vue'
    'src/components/CollapsibleContent.vue'
    'src/components/CollapsibleSection.vue'
    'src/components/context_menu/context_menu.vue'
    'src/components/context_menu/context_menu_item.vue'
    'src/components/dropdown.vue'
    'src/components/group_members_form.vue'
    'src/components/last_saved.vue'
    'src/components/modal.vue'
    'src/components/MoveButtons.vue'
    'src/components/project_admin/ag_tests/ag_test_command_panel.vue'
    'src/components/project_admin/edit_groups/edit_single_group.vue'
    'src/components/project_admin/project_settings.vue'
    'src/components/project_admin/project_stats/score_table.vue'
    'src/components/project_admin/rerun_submissions/rerun_select_suite.vue'
    'src/components/toggle.vue'
    'src/components/tooltip.vue'
    'src/components/validated_input/**/*.vue'
    'src/components/view_file/*'
    'src/composables/**/*.ts'
    'src/demos/new_validated_form_demo/**/*.vue'
    'src/demos/new_validated_input_demo/**/*.vue'
    'src/order_syncer.ts'
    'tests/e2e/**/*.ts'
    'tests/test_components/test_collapsible_section.ts'
    'tests/test_components/test_new_validated_form.ts'
    'tests/test_components/test_new_validated_input.ts'
    'tests/test_components/test_project_admin/test_project_stats/test_score_table.ts'
    'tests/test_composables/**/*.ts'
    'tests/test_order_syncer.ts'
)

# The root CommonJS config files are not part of tsconfig.json, so the
# type-aware eslint config cannot parse them.
prettier_only_paths=(
    '*.js'
)

npx eslint "${lint_paths[@]}"

npx prettier --check --no-editorconfig "${lint_paths[@]}" "${prettier_only_paths[@]}"

./check_subscribe_unsubscribe.py 'src/**/*.vue'
