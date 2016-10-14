#!/bin/bash

echo "Transpiling ./lib"
node_modules/.bin/babel ./src --out-dir=./dist --source-maps $@
