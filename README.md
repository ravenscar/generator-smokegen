# common module

This project uses bower (via node, git) gulp (via node), compass (via ruby), and karma (via node) for building and testing.

Ensure git is installed and git is in your path, to test 'git --version' in a terminal.
Ensure node and npm are installed (http://nodejs.org/), to test 'node -v', 'npm -v' in a terminal.
Ensure ruby 1.9.x is installed (http://rubyinstaller.org/downloads/), make sure you choose the option to add to the path.
Ensure ruby and gem are in your path env variable (probably C:\Ruby193\bin), to test 'ruby -v', 'gem -v' in a terminal.
Ensure compass is installed (http://compass-style.org/install/), to test 'compass -v' in a terminal.

If you are behind a firewall and can't access git:// urls you may need to run the following command:
git config --global url.https://github.com/.insteadOf git://github.com/

Ensure gulp, bower, karma-cli are installed globally.
npm install -g bower gulp karma-cli

Install the project (probably done by yeoman):
npm install
bower install

Build the project:
gulp build
(or)
gulp

Run the tests:
gulp test

Serve the project locally (http:\\localhost:9001\):
gulp serve

Build the distribution:
gulp dist

Serve the distribution locally (http:\\localhost:9001\):
gulp serve-dist

To autowire in new bower components
> gulp wiredep

To autowire in YOUR js and scss files
> gulp wireapp

The distribution contains (at least):
index.html      : for the demo
scripts/        : for the project and vendor scripts
styles/         : for the project and vendor css
sass/           : for the project sass
fonts/          : for the fontawesome fonts

All these need to be present for the the distribution to be demo'ed in a browser, but it is suggested that not all these
be included in projects which use this as a module. The vendor.js, vendor.css, and main.css files will be quite large
and often will repeat dependencies present in your main projects which includes this module e.g. bootstrap, angular,
angular-bootstrap and font-awesome.

It is strongly suggested that you make the bower dependencies of this project dependencies of the parent project, and
only include scripts/scripts.js and the sass/ folder. Include the scripts/scripts.js as part of your index.html and
process the sass/ folder along with your own sass, note that it expects bower_components to be in the path.
