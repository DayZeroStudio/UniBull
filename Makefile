#!/bin/bash
BIN			     	:= ./node_modules/.bin
MOCHA		     	:= ${BIN}/mocha
LINTER		     	:= eslint
MOCHA_OPTS	     	:= --recursive --bail
AUTOTEST_IGNORES 	:= --ignore ./public/ --ignore '*.log' --ignore '.[!.]*'

start:
	nodemon --ignore public/ | bunyan

start-selenium:
	java -jar ./selenium-server-standalone-2.45.0.jar\
		-log selenium.log 2> selenium.err &

start-phantomjs:
	./phantomjs --webdriver=4445\
		--webdriver-logfile=phantomjs-wd.log\
		> phantomjs.log\
		2> phantomjs.err &

install:
	npm prune
	npm install

lint:
	@${LINTER} ./index.js ./test/**/*.js ./views/*.js ./models/*.js ./rest/*.js

test: lint test-server test-selenium

test-server: lint
	@set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./test/server | bunyan

test-selenium: lint
	@set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./test/selenium | bunyan

autotest:
	@nodemon ${AUTOTEST_IGNORES} --exec "make test-server"

clean:
	-@rm ./tmp/**/* ./public/js/*-bundle.js ./*.err ./*.log ./*.log.lck

.PHONY: start install lint test test-server test-selenium autotest clean
