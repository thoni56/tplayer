#!/bin/bash
. ~/.nvm/nvm.sh
nvm use 18.17.0
./node_modules/.bin/electron --trace-deprecation "$@"
