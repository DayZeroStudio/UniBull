#UniBull

[GitHub Page](https://github.com/Pancia/UniBull)

[GitHub Wiki](https://github.com/Pancia/UniBull/wiki)

###Intro:
Welcome to the github page for our UCSC Independent Study project, UniBull!

The idea is for UniBull to be an online hub local to your university, where you can
create forums for your school's classes and clubs to discuss homework problems,
create group study guides, find partners for group projects,
or just talk about similar interests.

There will also be an online bulletin board where
you can view flyers and ads that other students have posted, whether they are
flyers for upcoming guest speakers and lectures, local concerts and shows, ads
for tutoring or job opportunities, and more. For UCSC specifically, we have also
added a place to view the dining hall menus for each day, where you can rate and
comment on different items at specific dining halls.


###Approach
We spent the first couple weeks just designing and coming up with ideas on how we thought
we might approach doing this projects. You can view our planning documents for use cases and
sprint plans on the wiki. This was a quarter (10 weeks) long project.

###Table of Contents
* [app](https://github.com/Pancia/UniBull/tree/master/app) - Contains server routing code for the http endpoints
* [bin](https://github.com/Pancia/UniBull/tree/master/bin) - Folder to contain the selenium webdriver exe
* [config](https://github.com/Pancia/UniBull/tree/master/config) - Contains configuration and helper functions
* [db](https://github.com/Pancia/UniBull/tree/master/db) - Defines all of the db schema and initializes some dummy data
* [lib](https://github.com/Pancia/UniBull/tree/master/lib) - Contains some helper files, mainly reloadify which reloads the webpage on any server changes
* [logs](https://github.com/Pancia/UniBull/tree/master/logs) - Folder to dump data
* [public](https://github.com/Pancia/UniBull/tree/master/public) - Public facing folder, ie anything in here is served to the client's webpage
* [src](https://github.com/Pancia/UniBull/tree/master/src) - Contains front end javascript source code 
* [tests](https://github.com/Pancia/UniBull/tree/master/tests) - Contains tests, divided into a server, web, and utils folder
* [tmp/screenshots](https://github.com/Pancia/UniBull/tree/master/tmp/screenshots) - Contains screenshots from when testing the front-end using selenium
* [views](https://github.com/Pancia/UniBull/tree/master/views) - Holds HTML and templates
* [.eslintrc](https://github.com/Pancia/UniBull/tree/master/.eslintrc) - Contains configuration for our linter (statically checks code for style and syntax)
* [Makefile](https://github.com/Pancia/UniBull/tree/master/Makefile) - A Makefile! has targets for installing, running, testing and more!
* [index.js](https://github.com/Pancia/UniBull/tree/master/index.js) - Entry point for application
* [package.json](https://github.com/Pancia/UniBull/tree/master/package.json) - Contains list of all dependencies

##WARNING:
* Our application and numerous tools are not windows compatible, please use a unix based system (eg: linux or OSX)

##Installation:
* Clone repo using `git clone ${url}`
* Install [node.js and npm](https://nodejs.org/download/)
* Install [postgres](http://postgresapp.com/)
* Run `sudo npm i -g nodemon`
* Run `sudo npm i -g eslint`
* Install [Selenium Standalone Server](http://www.seleniumhq.org/download/)

#Running:
* Run `make install`
* Run `make`

##Announcements:
* **`5/7`** I've synced the prod branch with heroku, so deploys will automagically happen!
* **`4/27`** I've successfully uploaded the app to [heroku!](https://unibull.herokuapp.com/)

##Authors:
* Anthony D'Ambrosio
* Evan Hughes
* Neeraj Mallampet
