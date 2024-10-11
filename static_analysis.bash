set -e

npx eslint \
    'cypress/**/*.ts' \
    '**/*.cy.ts'

npx prettier --check \
    './*.js' \
    'cypress/**/*.ts' \
    '**/*.cy.ts'

./check_line_length.py -i 'import' -i '} from' 100 'src/**/*.*' 'tests/**/*.ts'
./check_subscribe_unsubscribe.py 'src/**/*.vue'
