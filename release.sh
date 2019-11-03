#!/usr/bin/env bash

git rm -rf .
git checkout HEAD -- release.sh
git clean -fxd
(cd ../mobile && npm run build:static)
cp -r ../mobile/build/esm-bundled/* .
git add . && git commit -m "release ;)" && git push

