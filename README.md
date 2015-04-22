#UniBull
##Authors:
* Anthony D'Ambrosio
* Evan Hughes
* Neeraj Mallampet

##Announcements:
* **`4/21` ** I've added two downloads, get them, make sure that you `chmod u+x phantomjs`, and then you can run selenium tests after you either `make start-selenium` or `make start-phantomjs`, using `SEL_BROWSER=... make ...` to specify the browser name (phantomjs is by default, firefox should work out of the box, for others you will need to download the drivers yourself. To kill the servers, do `ps` and then `kill $PID` where $PID is the number of the process you want to kill.
* **`4/13`** I've changed the db config, so go to your .bashrc or .bash_profile so you should add `export DB_NAME="dbname"` and `DB_USERNAME="username"`
* **`4/12`** The Wiki is now full with links and installation instructions