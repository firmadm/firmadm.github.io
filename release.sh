#!/usr/bin/env bash

git rm -rf .\ngit clean -fxd
cp -r ../mobile/build/esm-bundled/* .
git add . && git commit -m "release ;)" && git push

