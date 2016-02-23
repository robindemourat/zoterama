'use strict';

angular.module('zoteramaApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'angulike',
  'angularytics'
])
  .config(function ($routeProvider, $locationProvider, AngularyticsProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);

    // AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
    AngularyticsProvider.setEventHandlers(['GoogleUniversal']);

  }).run(function(Angularytics) {
    Angularytics.init();
  });
