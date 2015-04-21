#!/bin/bash
BIN			:= ./node_modules/.bin
MOCHA		:= $(BIN)/mocha
LINTER		:= eslint
MOCHA_OPTS	:= --recursive --check-leaks

start:
	nodemon --ignore public/ | bunyan

install:
	npm install

lint:
	@ $(LINTER) ./index.js ./test/*.js ./views/*.js ./models/*.js ./rest/*.js

test: lint
	@ set -o pipefail\
		&& NODE_ENV=test $(MOCHA) ${MOCHA_OPTS} ./test/ | bunyan

autotest:
	nodemon --exec "make test"

clean:
	rm ./public/js/*-bundle.js

.PHONY: start install lint test autotest clean
