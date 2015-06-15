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
* app - Contains server routing code for the http endpoints
* bin - Folder to contain the selenium webdriver exe
* config - Contains configuration and helper functions
* db - Defines all of the db schema and initializes some dummy data
* lib - Contains some helper files, mainly reloadify which reloads the webpage on any server changes
* logs - Folder to dump data
* public - Public facing folder, ie anything in here is served to the client's webpage
* src - Contains front end javascript source code 
* tests - Contains tests, divided into a server, web, and utils folder
* tmp/screenshots - Contains screenshots from when testing the front-end using selenium
* views - Holds HTML and templates
* .eslintrc - Contains configuration for our linter (statically checks code for style and syntax)
* index.js - Entry point for application
* package.json - Contains list of all dependencies

##Announcements:
* **`5/7`** I've synced the prod branch with heroku, so deploys will automagically happen!
* **`4/27`** I've successfully uploaded the app to [heroku!](https://unibull.herokuapp.com/)

##Authors:
* Anthony D'Ambrosio
* Evan Hughes
* Neeraj Mallampet
