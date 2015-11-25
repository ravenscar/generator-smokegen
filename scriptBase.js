'use strict';
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var yeoman = require('yeoman-generator');
var smokegenPath = path.join(process.cwd(),'smokegen.js');

if (fs.existsSync(smokegenPath)) {
  var config = require(smokegenPath);
} else {
  var config = require(path.join(__dirname,'default-smokegen.js'));
}
var webRoot = config.webRoot;

module.exports = yeoman.generators.Base.extend({
  /**
   * Do the default initialization for the sub-generators, grabbing the name from the commandline or using a default,
   * setting the bower.json params, and setting a context.
   *
   * @param generatorName the name of the calling sub generator.
   * @param defaultName the default name if none found on the command line.
   * @private
   */
  _initializing: function (generatorName, defaultName) {
    this.context = this.context || {};
    this._findBower(this.context); // find bower.json and populate context with values
    this.argument('name', {
      required: false,
      type: String,
      desc: 'The subgenerator name'
    });

    this.log('You called the Smokegen:%s subgenerator with the argument: %s', generatorName, this.name);

    this.name = this.name || defaultName;
  },

  /**
   * Scans up the directory hierarchy looking for a bower.json and places the following variables within the context:
   *
   * bowerJson: bower.json parsed as an object
   * appPath: the path from the current directory to bower.json
   * ngModule: the module value from bower.json
   * ngPrefix: the angularPrefix value from bower.json
   *
   * @param context you can pass in a context object to be populated in-place with these values, if you don't one will
   * be created and returned.
   * @returns {*|{}} an object (or the passed in context) filled with the values
   * @Error will throw an error if it cannot find bower.json, or if it does not find an app path as a sibling to the
   * bower.json it finds.
   * @private
   */
  _findBower: function (context) {
    var bowerPath = ['.'];
    var derivedPath;
    var bowerJson;
    var maxDepth;

    context = context || {};

    maxDepth = 100;

    while (!bowerJson && maxDepth > 0) {
      try {
        derivedPath = path.join(process.cwd(), bowerPath.concat('bower.json').join(path.sep));
        bowerJson = require(derivedPath);
      } catch (e) {
        maxDepth = maxDepth - 1;
        bowerPath.unshift('..');
      }
    }


    if (bowerJson) {
      context.bowerJson = bowerJson;
      context.appPath = path.join(process.cwd(), bowerPath.join(path.sep), webRoot);
      context.ngModule = bowerJson.module || _.kebabCase(bowerJson.name).replace(/-/g, '.');
      context.ngPrefix = bowerJson.angularPrefix || "";
    } else {
      throw new Error("could not locate bower.json for this project")
    }

    if (!fs.existsSync(context.appPath)) {
      throw new Error("could not locate app directory")
    }

    return context;
  },

  /**
   *  Call this from another generator to get sensible angular/bower/html names from an input name and prefix.
   *
   *  E.g. with {name: someName, prefix: xx}
   *
   *  projectNamespace: xx
   *  projectName:      xx-some-name
   *  moduleName:       xx.some.name (!only if moduleName not already defined in the context!)
   *  readableName:     some-name
   *  presentationName: Some Name
   *
   *  serviceName:            XxSomeNameService
   *  controllerName:         XxSomeNameController
   *  demoControllerName:     XxSomeNameDemoController
   *  controllerInstanceName: someName
   *  directiveName:          xxSomeName
   *  directiveTag:           xx-some-name
   *
   * @param context object to place the names in, if not present then it will create one and return it.
   * @param name the base name to derive the other names
   * @param prefix the base prefix to derive the other names
   * @returns Object containing the names (or context if passed in).
   * @private
   */
  _nameify: function (context, name, prefix) {
    var prefixedName;

    context = context || {};

    function dotCase(str) {
      return _.kebabCase(str).replace(/-/g, '.');
    }


    prefixedName = prefix ? prefix + "-" + name : name;
    context.projectNamespace = dotCase(prefix);

    context.projectName = _.kebabCase(prefixedName);
    if (!context.moduleName) {
      context.moduleName = dotCase(context.projectName);
    }
    context.readableName = _.kebabCase(name);
    context.presentationName = _.startCase(name);

    context.controllerInstanceName = _.camelCase(name);
    context.controllerName = _.capitalize(_.camelCase(prefixedName + "-controller"));
    context.controllerPartialName = _.capitalize(_.camelCase(prefixedName + "-partial-controller"));
    context.demoControllerName = _.capitalize(_.camelCase(prefixedName + "-demo-controller"));
    context.serviceName = _.camelCase(prefixedName + "-service");

    context.directiveName = _.camelCase(prefixedName);
    context.directiveTag = _.kebabCase(context.directiveName);

    return context;
  },

  /**
   * Copy files from a source to a destination, processing them as templates.
   *
   * @param files the zipped src dest files: e.g. [[src1, dst1], [src2, dst2], [src3, dst3]]
   * @param destPathArray an array (or single string) of directories to transfer the files to, e.g. ['app', 'service', 'xyz']
   * @param vars an object to use for template substitutions within the files.
   * @private
   */
  _copyTemplates: function (files, destPathArray, vars) {
    var that = this;

    destPathArray = destPathArray || [];
    if (!_.isArray(destPathArray)) {
      destPathArray = [destPathArray];
    }

    _.each(files, function (srcDst) {
      that.fs.copyTpl(
        that.templatePath(srcDst[0]),
        that.destinationPath.apply(that, destPathArray.concat(srcDst[1])),
        vars
      );
    });
  }
});
