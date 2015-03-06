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

  writing: {
    app: function () {
      var dstFiles, srcFiles = [
        '_index.html',
        '_app.js',
        '_demo.js',
        '_main.scss'
      ];

      dstFiles = _.map(srcFiles, function (filename) {
        return (filename[0] === '_') ? filename.replace(/_/, '') : '.' + filename;
      });

      this._copyTemplates(_.zip(srcFiles, dstFiles), 'app', context);
    },

    projectfiles: function () {
      var dstFiles, srcFiles = [
        'editorconfig',
        'jshintrc',
        '_gulpfile.js',
        '_karma.conf.js',
        '_karma.conf.js',
        '_package.json',
        '_bower.json',
        '_README.md'
      ];

      dstFiles = _.map(srcFiles, function (filename) {
        return (filename[0] === '_') ? filename.replace(/_/, '') : '.' + filename;
      });

      this._copyTemplates(_.zip(srcFiles, dstFiles), [], context);
    }
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});
