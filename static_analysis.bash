set -ex

npx eslint \
    'tests/e2e/**/*.ts' \
    'src/composables/**/*.ts' \
    'src/components/validated_input/**/*.vue' \
    'src/demos/new_validated_input_demo/**/*.vue' \
    'tests/test_components/test_new_validated_input.ts'

npx prettier --check \
    './*.js' \
    './*.ts' \
    'tests/e2e/**/*.ts' \
    './src/composables/**/*.ts' \
    './src/components/validated_input/**/*.vue' \
    'src/demos/new_validated_input_demo/**/*.vue' \
    'tests/test_composables/**/*.ts' \
    'tests/test_components/test_new_validated_input.ts'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
