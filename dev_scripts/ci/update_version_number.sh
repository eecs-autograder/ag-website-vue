#! /bin/bash

set -e

if test "$GITHUB_EVENT_NAME" != "workflow_dispatch"; then
    echo "Not a workflow dispatch. Skipping version update."
    exit 0
fi

base_dir=$(dirname $(realpath "$0"))/../..

if test "$#" -ne 1; then
    echo "Usage: $0 version"
    exit 1
fi
version=$1

echo "Setting version to $version"

# npm_version=$(echo "$version" | sed "s/\d+/wee/")
npm_version=$(echo "$version" | sed -E "s/([0-9]+\.[0-9]+\.[0-9]+)\.(.*)/\1-\2/")
echo "$npm_version"

npm version "$npm_version" --no-git-tag-version
