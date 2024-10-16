set -ex

npx eslint \
    'cypress/**/*.ts' \
    'src/**/*.cy.ts'

npx prettier --check \
    './*.js' \
    'cypress/**/*.ts' \
    'src/**/*.cy.ts'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
