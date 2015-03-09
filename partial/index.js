'use strict';
var path = require('path');
var os = require('os');
var fs = require('fs');
var _ = require('lodash');
var chalk = require('chalk');

var scriptBase = require('../scriptBase');

module.exports = scriptBase.extend({
  initializing: function () {
    this._initializing('partial', 'my-partial');
  },

  prompting: function () {
    var done = this.async();

    var prompts = [
      {
        type: 'checkbox',
        name: 'partialFlags',
        message: os.EOL + os.EOL + 'Choose the options for the partial',
        choices: [
          {value: 'SCSS', name: chalk.green('Scss:') + ' include an scss file for html styling.'},
          {value: 'CONT', name: chalk.green('Controller:') + ' include a controller if the partial has logic.'},
          {value: 'CTST', name: chalk.green('Controller unit test:') + ' include a separate unit test for the controller.'},
        ],
        default: ['SCSS', 'CONT', 'CTST']
      },
      {
        type: 'input',
        name: 'name',
        message: os.EOL + os.EOL + 'Confirm the name for this partial',
        default: this.name
      },
      {
        type: 'input',
        name: 'module',
        message: os.EOL + os.EOL + 'Confirm the angular module for this partial',
        default: this.context.ngModule
      },
      {
        type: 'input',
        name: 'prefix',
        message: os.EOL + os.EOL + 'Confirm the angular prefix to namespace this partial',
        default: this.context.ngPrefix
      },
      {
        type: 'input',
        name: 'path',
        message: os.EOL + os.EOL + 'Confirm the path to create this partial in',
        default: function (props) {
          var partialPath, kebab =  _.kebabCase(props.name);

          if (path.basename(process.cwd()) === "partials") {
            partialPath = kebab;
          } else if (fs.existsSync(path.join(process.cwd(), 'app'))) {
            partialPath = path.join('app', 'partials', kebab);
          } else {
            partialPath = path.join('partials', kebab);
          }

          return partialPath;
        }
      }
    ];

    this.prompt(prompts, function (props) {
      this.context.partialFlags = props.partialFlags;
      this.context.path = props.path || "";
      this.context.fullPath = path.join(process.cwd(), this.context.path);

      this.context.moduleName = props.module;
      this._nameify(this.context, props.name, props.prefix || "");

      done();
    }.bind(this));

  },

  scaffold: function () {
    if (this.context.path) {
      this.mkdir(this.context.path);
    }
  },

  writing: function () {
    var that = this,
      flags = _.zipObject(this.context.partialFlags, this.context.partialFlags),
      dstFiles, srcFiles = [];

    srcFiles.push('partial.html');// partial html file

    if (flags.CONT) {// partial has a controller
      srcFiles.push('partial-controller.js');
      if (flags.CTST) {// partial controller has a unit test
        srcFiles.push('partial-controller-spec.js');
      }
    }

    if (flags.SCSS) {// partial partial
      srcFiles.push('_partial.scss');
    }

    dstFiles = _.map(srcFiles, function (filename) {
      return filename.replace('partial', that.context.readableName);
    });

    this._copyTemplates(_.zip(srcFiles, dstFiles), [this.context.path], this.context);
  }
});
