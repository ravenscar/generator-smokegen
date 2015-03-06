'use strict';
var path = require('path');
var os = require('os');
var fs = require('fs');
var _ = require('lodash');
var chalk = require('chalk');

var scriptBase = require('../scriptBase');

module.exports = scriptBase.extend({
  initializing: function () {
    this._initializing('component', 'my-component');
  },

  prompting: function () {
    var done = this.async();

    var prompts = [
      {
        type: 'checkbox',
        name: 'directiveFlags',
        message: os.EOL + os.EOL + 'Choose the options for the directive',
        choices: [
          {value: 'DTST', name: chalk.green('Unit test:') + ' generate a unit test skeleton for the directive.'},
          {value: 'LINK', name: chalk.green('Link function:') + ' include a link function if the directive manipulates the DOM'},
          {value: 'HTML', name: chalk.green('HTML partial:') + ' include an html partial template for element directives.'},
          {value: 'CONT', name: chalk.green('Controller:') + ' include a controller if the directive has logic.'},
          {value: 'CTST', name: chalk.green('Controller unit test:') + ' include a separate unit test for the controller.'},
          {value: 'SRVC', name: chalk.green('Service:') + ' include a service if the controller needs to assemble a complex model from other services.'},
          {value: 'STST', name: chalk.green('Service unit test:') + ' include a separate unit test for the service.'},
          {value: 'SCSS', name: chalk.green('Scss:') + ' include an scss file for html styling.'},
          {value: 'DEMO', name: chalk.green('Demo:') + ' include a demo controller and partial.'}
        ],
        default: ['DTST', 'LINK', 'HTML', 'CONT', 'CTST', 'SRVC', 'STST', 'SCSS', 'DEMO']
      },
      {
        type: 'input',
        name: 'name',
        message: os.EOL + os.EOL + 'Confirm the name for this component',
        default: this.name
      },
      {
        type: 'input',
        name: 'module',
        message: os.EOL + os.EOL + 'Confirm the angular module for this controller',
        default: this.context.ngModule
      },
      {
        type: 'input',
        name: 'prefix',
        message: os.EOL + os.EOL + 'Confirm the angular prefix to namespace this controller',
        default: this.context.ngPrefix
      },
      {
        type: 'input',
        name: 'path',
        message: os.EOL + os.EOL + 'Confirm the path to create this controller in',
        default: function (props) {
          var componentPath, kebab =  _.kebabCase(props.name);

          if (path.basename(process.cwd()) === "components") {
            componentPath = kebab;
          } else if (fs.existsSync(path.join(process.cwd(), 'app'))) {
            componentPath = path.join('app', 'components', kebab);
          } else {
            componentPath = path.join('components', kebab);
          }

          return componentPath;
        }
      }
    ];

    this.prompt(prompts, function (props) {
      this.context.directiveFlags = props.directiveFlags;
      this.context.appType = props.appType;
      this.context.path = props.path || "";
      this.context.fullPath = path.join(process.cwd(), this.context.path);
      this.context.templateDir = path.posix.join.apply(undefined, path.relative(this.context.appPath, this.context.fullPath).split(path.sep));

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
      flags = _.zipObject(this.context.directiveFlags, this.context.directiveFlags),
      dstFiles, srcFiles = [],
      directive = Object.create(null),
      directiveTemplate;

    directive.restrict = 'E';
    directive.replace = true;
    directive.scope = {};

    srcFiles.push('component.js');// directive base file

    if (flags.DTST) {// directive base file unit test
      srcFiles.push('component-spec.js');
    }

    if (flags.LINK) {// directive link function
      directive.link = "LINKFUNCTION"
    }

    if (flags.CONT) {// directive has a controller
      directive.controller = '<%= controllerName %>';
      directive.controllerAs = '<%= controllerInstanceName %>';
      srcFiles.push('component-controller.js');
      if (flags.CTST) {// directive controller has a unit test
        srcFiles.push('component-controller-spec.js');
      }
    }

    if (flags.SRVC) {// directive has a service
      this.context.injectedService = this.context.serviceName;
      srcFiles.push('component-service.js');
      if (flags.STST) {// directive service has a unit test
        srcFiles.push('component-service-spec.js');
      }
    } else {
      this.context.injectedService = '';
    }

    if (flags.HTML) {// directive partial
      directive.templateUrl = '<%= templateDir %>/<%= readableName %>.html';
      srcFiles.push('component.html');
    }

    if (flags.SCSS) {// directive partial
      srcFiles.push('_component.scss');
    }

    if (flags.DEMO) {// directive partial
      srcFiles.push('component-demo.html');
      srcFiles.push('component-demo-controller.js');
    }

    directive = JSON.stringify(directive, null, 2);
    // need to replace link function placeholder (if any) as JSON doesn't support functions
    directive = directive.replace('"LINKFUNCTION"', 'function link(scope, element, attrs, ctrl) {' + os.EOL + '  }');
    directive = directive.replace(/^/mg, '  ');// indent template
    directive = directive.replace(/^  /, '');// unindent first line
    directive = directive.replace(/"/g, '\'');// nasty way to convert all double quotes to single
    // need to do templating here, or it won't be done
    directiveTemplate = _.template(directive);
    this.context.directive = directiveTemplate(this.context);

    dstFiles = _.map(srcFiles, function (filename) {
      return filename.replace('component', that.context.readableName);
    });

    this._copyTemplates(_.zip(srcFiles, dstFiles), [this.context.path], this.context);
  }
});
