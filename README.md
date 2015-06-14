#UniBull

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

###Table of Contents
???

##Announcements:
* **`5/7`** I've synced the prod branch with heroku, so deploys will automagically happen!
* **`4/27`** I've successfully uploaded the app to [heroku!](https://unibull.herokuapp.com/)
* **`4/21`** I've added two downloads, get them, make sure that you `chmod u+x phantomjs`, and then you can run selenium tests after you either `make start-selenium` or `make start-phantomjs`, using `SEL_BROWSER=firefox make test...` to specify the browser name (phantomjs is by default, firefox should work out of the box, for others you will need to download the drivers yourself). To kill the servers, do `ps -e | grep ${pattern}` to get its PID, then do `kill PID`.
* **`4/13`** I've changed the db config, so go to your .bashrc or .bash_profile so you should add `export DB_NAME="dbname"` and `DB_USERNAME="username"`
* **`4/12`** The Wiki is now full with links and installation instructions

##Authors:
* Anthony D'Ambrosio
* Evan Hughes
* Neeraj Mallampet
