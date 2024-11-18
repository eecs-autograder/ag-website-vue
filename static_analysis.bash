set -ex

npx prettier --check \
    './*.js'

./check_subscribe_unsubscribe.py 'src/**/*.vue'
