'use strict';
var path = require('path');
var os = require('os');
var fs = require('fs');
var _ = require('lodash');
var chalk = require('chalk');

var scriptBase = require('../scriptBase');

module.exports = scriptBase.extend({
  initializing: function () {
    this._initializing('service', 'my-service');
  },

  prompting: function () {
    var done = this.async();

    var prompts = [
      {
        type: 'input',
        name: 'name',
        message: os.EOL + os.EOL + 'Confirm the name for this service',
        default: this.name
      },
      {
        type: 'input',
        name: 'module',
        message: os.EOL + os.EOL + 'Confirm the angular module for this service',
        default: this.context.ngModule
      },
      {
        type: 'input',
        name: 'prefix',
        message: os.EOL + os.EOL + 'Confirm the angular prefix to namespace this service',
        default: this.context.ngPrefix
      },
      {
        type: 'input',
        name: 'path',
        message: os.EOL + os.EOL + 'Confirm the path to create this service in',
        default: function (props) {
          var servicesPath, kebab =  _.kebabCase(props.name);

          if (path.basename(process.cwd()) === "services") {
            servicesPath = kebab;
          } else if (fs.existsSync(path.join(process.cwd(), 'app'))) {
            servicesPath = path.join('app', 'services', kebab);
          } else {
            servicesPath = path.join('services', kebab);
          }

          return servicesPath;
        }
      }
    ];

    this.prompt(prompts, function (props) {
      this.context.path = props.path || "";

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
      dstFiles, srcFiles = [
        'service.js',
        'service-spec.js',
      ];

    dstFiles = _.map(srcFiles, function (filename) {
      return filename.replace('service', that.context.readableName + "-service");
    });

    this._copyTemplates(_.zip(srcFiles, dstFiles), [this.context.path], this.context);
  }
});
