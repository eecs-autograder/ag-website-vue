set -ex

npx eslint \
    'cypress/**/*.ts' \
    '**/*.cy.ts'

npx prettier --check \
    './*.js' \
    'cypress/**/*.ts' \
    '**/*.cy.ts'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
