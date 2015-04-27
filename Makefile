#!/bin/bash
BIN			     	:= ./node_modules/.bin
MOCHA		     	:= ${BIN}/mocha
LINTER		     	:= eslint
MOCHA_OPTS	     	:= --recursive
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

test: lint test-server test-web

test-server: lint
	@set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./test/server | bunyan

test-web: lint
	@set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./test/selenium | bunyan

test-web-%: lint
	@set -o pipefail\
		&& NODE_ENV=test SEL_BROWSER=$*\
		${MOCHA} ${MOCHA_OPTS} ./test/selenium | bunyan

test-%: lint test-server
	make test-web-$*

_test-server: lint
	-@set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./test/server | bunyan

autotest:
	@nodemon ${AUTOTEST_IGNORES} --exec "make _test-server"

lint: noTodosOrFixmes
	@${LINTER} ./index.js ./config/*.js\
		./test/server/*.js ./test/selenium/*.js\
		./models/*.js ./rest/*.js ./db/*.js\
		./lib/adds/*.js ./lib/requires/*.js

noTodosOrFixmes:
	-@git grep -n 'TODO\|FIXME' --\
		`git ls-files\
		| grep -v '^Makefile\|^public/\|^lib/'`\
		> .todos
	@[ ! "$$(cat .todos)" ]\
	   	|| [ "$${SKIPTODOS=n}" != "n" ]\
	   	|| (echo "$$(cat .todos)"\
			&& echo "Use 'SKIPTODOS= make ...' to skip this check"\
			&& exit 1)

clean:
	-rm ./tmp/**/* ./public/js/*-bundle.js\
		./*.err ./*.log ./*.log.lck 2> /dev/null

.PHONY: start install lint test test-server test-selenium autotest clean
