describe('<%= controllerName %>', function() {

  beforeEach(module('<%= moduleName %>'));

  var scope,ctrl;

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('<%= controllerName %>', {$scope: scope});
  }));

  it('should ...', inject(function() {

    expect(1).toEqual(1);

  }));

});
