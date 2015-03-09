'use strict';
var path = require('path');
var os = require('os');
var _ = require('lodash');
var chalk = require('chalk');
var yosay = require('yosay');
var context = {};

var scriptBase = require('../scriptBase');

module.exports = scriptBase.extend({
  initializing: function () {
    context.appName = _.kebabCase(path.basename(process.cwd()));
  },

  prompting: function () {
    var done = this.async();

    this.log(yosay('Welcome to the ' + chalk.red('Smokegen') + ' generator!'));
    this.log('This generator automatically includes Angular, Bootstrap (with angular directives), Font-Awesome and ' +
      'lo-dash (underscore replacement) via Bower.');
    this.log();
    this.log();
    this.log('We use ' + chalk.green('gulp') + ' to build and ' + chalk.green('karma') + ' to test.');

    var prompts = [
      {
        type: 'list',
        name: 'isPrivate',
        message: os.EOL + os.EOL + 'Is this a private project?',
        choices: [
          {value: true, name: chalk.green('Yes:') + ' this project is stored privately.'},
          {value: false, name: chalk.green('No') + ' this project will be published publicly on github.'},
        ],
        default: true
      },
      {
        type: 'list',
        name: 'appType',
        message: os.EOL + os.EOL + 'Which type of project is this?',
        choices: [
          {value: 'SUB', name: chalk.green('Sub-project:') + ' (e.g. auth module) to be used by a top level project, ' +
          'or another sub-project.'},
          {value: 'TOP', name: chalk.green('Top-level project') + ' a top level project (e.g. phone app) that uses ' +
          'other modules but is used by no others.'},
        ],
        default: 'SUB'
      },
      {
        type: 'input',
        name: 'prefix',
        message: os.EOL + os.EOL + 'Choose an angular prefix to namespace this module\'s functions. E.g. (my, xx, xyz)',
        default: 'my'
      },
      {
        type: 'input',
        name: 'appName',
        message: os.EOL + os.EOL + 'What is the name for this module (without a prefix)? Use any "case" you want, the angular module name will be ' +
        chalk.green('dot.case') + ', the css classes and package/bower names will be ' + chalk.green('kebab-case') +
        ' and the title will be ' + chalk.green('Start Case\n'),
        default: context.appName
      }
    ];

    this.prompt(prompts, function (props) {
      context.appType = props.appType;
      context.isPrivate = props.isPrivate;

      this._nameify(context, props.appName, props.prefix);

      done();
    }.bind(this));

  },

  scaffold: function () {
    this.mkdir('app');
  },

  writing: function () {
    var that = this, dstFiles, srcFiles, commonFiles = [
      ['_.editorconfig', '.editorconfig', []],
      ['_.jshintrc', '.jshintrc', []],
      ['_karma.conf.js', 'karma.conf.js', []],
      ['_package.json', 'package.json', []],
      ['_README.md', 'README.md', []]
    ], topFiles = [
      ['_top_gulpfile.js', 'gulpfile.js', []],
      ['_top_bower.json', 'bower.json', []],

      ['_top_app.js', 'app.js', ['app']],
      ['_top_index.html', 'index.html', ['app']],
      ['_top_main.scss', 'main.scss', ['app']],
    ], subFiles = [
      ['_sub_gulpfile.js', 'gulpfile.js', []],
      ['_sub_bower.json', 'bower.json', []],

      ['_sub_demo.js', 'demo.js', ['app']],
      ['_sub_app.js', 'app.js', ['app']],
      ['_sub_index.html', 'index.html', ['app']],
      ['_sub_main.scss', 'main.scss', ['app']],
    ];

    if (context.appType === 'TOP') {
      srcFiles = commonFiles.concat(topFiles);
    } else {
      srcFiles = commonFiles.concat(subFiles);
    }

    _.each(srcFiles, function (src) {
      that._copyTemplates([[src[0], src[1]]], src[2], context);
    });
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});
