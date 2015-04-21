#!/bin/bash
BIN			     	:= ./node_modules/.bin
MOCHA		     	:= $(BIN)/mocha
LINTER		     	:= eslint
MOCHA_OPTS	     	:= --recursive --bail
SELENIUM_SERVER  	:= ./test/selenium/selenium-server-standalone-2.45.0.jar
AUTOTEST_IGNORES    := --ignore ./public/ --ignore '*.log' --ignore '.[!.]*'

start:
	nodemon --ignore public/ | bunyan

install:
	npm prune
	npm install

lint:
	@$(LINTER) ./index.js ./test/**/*.js ./views/*.js ./models/*.js ./rest/*.js

test: lint test-server test-selenium

test-server: lint
	@set -o pipefail\
		&& NODE_ENV=test $(MOCHA) ${MOCHA_OPTS} ./test/server | bunyan

test-selenium: lint
	@java -jar ${SELENIUM_SERVER} -log selenium.log &\
		echo $$! > .SEL_PID
	@set -o pipefail && NODE_ENV=test $(MOCHA) ${MOCHA_OPTS} ./test/selenium | bunyan
	@kill $$(cat .SEL_PID)

autotest:
	@nodemon ${AUTOTEST_IGNORES} --exec "make test-server"

clean:
	rm ./public/js/*-bundle.js

.PHONY: start install lint test test-server test-selenium autotest clean
