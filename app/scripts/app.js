'use strict';

var angular = angular || {};

var dailyFaceApp = angular.module('myDailyFaceApp', [
  'ngRoute',
  'myDailyFaceControllers',
  'myDailyFaceFilters',
  'dr.imageCapture'
]);

dailyFaceApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/list', {
        templateUrl: 'partials/picture-list.html',
        controller: 'PictureListController'
      })
      .when('/picture/:pictureIndex', {
        templateUrl: 'partials/picture-detail.html',
        controller: 'PictureDetailController'
      })
      .when('/camera', {
        templateUrl: 'partials/camera.html',
        controller: 'CameraController'
      })
      .when('/config', {
        templateUrl: 'partials/config.html',
        controller: 'ConfigController'
      })
      .when('/markers', {
        templateUrl: 'partials/markers.html',
        controller: 'MarkersController'
      })
      .otherwise({
        redirectTo: '/list'
      });
  }]);