set -e

npx eslint 'cypress/**/*.ts'
./check_line_length.py -i 'import' -i '} from' 100 'src/**/*.*' 'tests/**/*.ts'
./check_subscribe_unsubscribe.py 'src/**/*.vue'
