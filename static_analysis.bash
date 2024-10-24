set -ex

npx eslint \
    'cypress/**/*.ts' \
    'src/**/*.cy.ts' \
    'tests/e2e/**/*.ts'

npx prettier --check \
    './*.js' \
    './*.ts' \
    'cypress/**/*.ts' \
    'src/**/*.cy.ts'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
