set -ex

npx eslint \
    'tests/e2e/**/*.ts'

npx prettier --check \
    './*.js' \
    './*.ts' \
    'tests/e2e/**/*.ts' \
    './src/composables/**/*.ts' \
    './src/components/validated_input/**/*.vue'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
