set -ex

npx eslint \
    'cypress/**/*.ts' \
    '**/*.cy.ts'

# hack because .prettierignore doesn't work as expected.
# See https://github.com/prettier/prettier/issues/16744
# There are files with restricted privileges in test_stack that will
# cause prettier to fail unless we move it.
mv cypress/e2e/test_stack /tmp/
npx prettier --check \
    './*.js' \
    'cypress/**/*.ts' \
    '**/*.cy.ts'
mv /tmp/test_stack cypress/e2e/

./check_subscribe_unsubscribe.py 'src/**/*.vue'
