#!/bin/bash
BIN			     	:= ./node_modules/.bin
MOCHA		     	:= ${BIN}/mocha
BUNYAN				:= ${BIN}/bunyan
LINTER		     	:= eslint
MOCHA_OPTS	     	:= --recursive
AUTOTEST_IGNORES 	:= --ignore ./public/ --ignore ./logs/ --ignore '.[!.]*'

start:
	nodemon ${AUTOTEST_IGNORES} | ${BUNYAN}

start-selenium:
	@ java -jar ./selenium-server-standalone-2.45.0.jar\
		-log ./logs/selenium.log 2> ./logs/selenium.err &

start-phantomjs:
	@ ./phantomjs --webdriver=4445\
		--webdriver-logfile=./logs/phantomjs-wd.log\
		> ./logs/phantomjs.log\
		2> ./logs/phantomjs.err &

install:
	npm prune
	npm install

run-heroku:
	@ echo "WARNING: don't use this manually, use make start instead"
	NODE_ENV=production node ./index.js | ${BUNYAN}

test: lint test-server test-web

test-server: lint
	@ set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./tests/server | ${BUNYAN}

test-web: lint
	@ set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./tests/web* | ${BUNYAN}

test-web-%: lint
	@ set -o pipefail\
		&& NODE_ENV=test SEL_BROWSER=$*\
		${MOCHA} ${MOCHA_OPTS} ./tests/web* | ${BUNYAN}

test-%: lint test-server
	make test-web-$*

autotest:
	@ nodemon ${AUTOTEST_IGNORES} --exec "make _test-server"
_test-server: lint
	-@ set -o pipefail\
		&& NODE_ENV=test ${MOCHA} ${MOCHA_OPTS} ./tests/server | ${BUNYAN}

lint: noTodosOrFixmes
	@ ${LINTER} ./index.js ./config/*.js\
		./tests/server/*.js ./tests/web*/*.js\
		./models/*.js ./app/*.js ./app/**/*.js ./db/*.js\
		./src/**/*.js

noTodosOrFixmes:
	-@ git grep -n 'TODO\|FIXME' --\
		`git ls-files\
		| grep -v '^Makefile\|^public/\|^lib/'`\
		> .todos
	@ [ ! "$$(cat .todos)" ]\
		|| [ "$${SKIPTODOS=n}" != "n" ]\
		|| (echo "$$(cat .todos)"\
			&& echo "Use 'SKIPTODOS= make ...' to skip this check"\
			&& exit 1)

clean:
	-rm ./tmp/**/* ./logs/*\
		./public/js/*-bundle.js 2> /dev/null

.PHONY: start install lint test test-server test-web autotest clean
