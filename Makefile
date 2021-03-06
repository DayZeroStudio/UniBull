#STUFF
SHELL 	       := /bin/bash
BIN		       := ./node_modules/.bin
LINTER	       := eslint
PORT		   := 8080

#MAIN
IGNORES        := --ignore client/templates.js --ignore ./node_modules --ignore '.[!.]*'
BUNYAN         := ${BIN}/bunyan
MAIN_FILE      := ./unibull.js

#TESTING
MOCHA          := ${BIN}/mocha
MOCHA_OPTS     := --compilers js:babel/register --recursive --colors
SEL_SERVER     := ./bin/selenium-server-standalone-2.45.0.jar
PHANTOMJS      := ./bin/phantomjs

start:
	nodemon ${IGNORES} --ext js,json,jade ${MAIN_FILE} | ${BUNYAN}

install:
	npm install

start-selenium:
	@ java -jar ${SEL_SERVER}\
		-log ./logs/selenium.log\
		2> ./logs/selenium.err &
	@ echo "Started selenium server"

start-phantomjs:
	@ #4445 because selenium uses 4444
	@ ${PHANTOMJS} --webdriver=4445\
		--webdriver-logfile=./logs/phantomjs-wd.log\
		> ./logs/phantomjs.log\
		2> ./logs/phantomjs.err &
	@ echo "Started phantomjs server"

run-heroku:
	@ echo "WARNING: don't use this manually, use make start instead"
	NODE_ENV=production node ./index.js | ${BUNYAN}

test: lint test-server test-client test-web test-monkey

test-server: lint
	@ set -o pipefail && NODE_ENV=test\
		${MOCHA} ${MOCHA_OPTS}\
		${MOCHA_ARGS} ./tests/server | tee logs/mocha-server.out | ${BUNYAN}

test-client: lint
	@ set -o pipefail && NODE_ENV=test\
		browserify ./tests/client | tape-run

test-monkey: lint
	@ MONKEY=${MONKEY} NODE_ENV=test node ${MAIN_FILE} | ${BUNYAN}

test-web: lint
	@ set -o pipefail && NODE_ENV=test\
		${MOCHA} ${MOCHA_OPTS}\
		${MOCHA_ARGS} ./tests/webdriver | tee logs/mocha-web.out | ${BUNYAN}

test-web-%: lint
	@ set -o pipefail && NODE_ENV=test SEL_BROWSER=$*\
		${MOCHA} ${MOCHA_OPTS} ${MOCHA_ARGS} ./tests/webdriver | tee logs/mocha-web.out | ${BUNYAN}

test-%: lint test-server
	make test-web-$*

lint: noTodosOrFixmes
	@ ${LINTER} ./client ./server
noTodosOrFixmes:
	-@ git grep -n 'TODO\|FIXME' --\
		`git ls-files | grep -v '^Makefile\|^public/\|^lib/'`\
		> .todos
	@ [ ! "$$(cat .todos)" ]\
		|| [ "$${SKIPTODOS=n}" != "n" ]\
		|| (echo "$$(cat .todos)"\
			&& echo "Use 'SKIPTODOS= make ...' to skip this check"\
			&& exit 1)

clean:
	-@ rm ./tmp/**/* ./logs/* .todos\
		2> /dev/null
spotless: clean
	-@ read -p "Are you sure you want rm node_modules? [y|N]" confirm;\
		echo $${confirm,,};\
		([[ $${confirm,,} =~ ^(yes|y)$$ ]]\
		&& mv ./node_modules ~/.Trash\
		|| echo "aborting...")

help:
	make -rpn | sed -n -e '/^$$/ { n ; /^[^ ]*:/p; }' | sort | egrep --color '^[^ ]*:'

.PHONY: start install lint test test-server test-web autotest clean
