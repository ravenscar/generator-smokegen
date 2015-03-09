angular.module('<%= moduleName %>', ['ui.bootstrap', 'ui.utils', 'ui.router']);

angular.module('<%= moduleName %>').config(function($stateProvider, $urlRouterProvider) {
  'use strict';

  /** example ui router states

  $stateProvider.state('home', {
    url: '/home',
    templateUrl: 'partials/home/home.html',
    controller: 'HomeController',
    controllerAs: 'home',
    data: {
      authorized: true
    }
  }).state('login', {
    url: '/login',
    templateUrl: 'partials/login/login.html',
    controller: 'LoginController',
    controllerAs: 'login',
    data: {
      authorized: false
    }
  });
   *
   */

  /* Add New States Above */
  $urlRouterProvider.otherwise('home');
});

/**
 * Very basic auth helper. If you tag the data.authorized of a route with a truthy value, then it will check if the
 * user is authorized. If not it will save the state and return to login, after a successful login you can use the
 * saved state and params (on $rootScope) to return to where the user was.
 *
 * It it up to you to implement both the authService and the login component.

angular.module('<%= moduleName %>').run(function($rootScope, $state, $stateParams, authService) {
  'use strict';
  $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
    if (toState.data && toState.data.authorized) {
      authService.isAuthorizedPromise().
        then(function (auth) {
          if (!auth) {
            $rootScope.returnToState = toState;
            $rootScope.returnToStateParams  = toStateParams;
            $state.go('login');
          }
        });
    }
  });
});

*/
