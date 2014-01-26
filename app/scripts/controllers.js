'use strict';

var angular = angular || {};

var myDailyFaceControllers = angular.module(
  'myDailyFaceControllers',
  ['myDailyFaceServices']
);

myDailyFaceControllers.run(function (facesRepository) {
  facesRepository.init();
});

myDailyFaceControllers.controller(
  'PictureListController', ['$scope', 'facesRepository', '$q',
  function ($scope, facesRepository, $q) {

    /*facesRepository.getAll().then(function (faces) {
      $scope.pictures = faces;
    });*/

    $q.when(facesRepository.getAll()).then(function (result) {
      $scope.pictures = result;
    });

    $scope.delete = function (index) {
      facesRepository.delete(index);
    };
  }
]);

myDailyFaceControllers.controller(
  'PictureDetailController',
  ['$scope', '$routeParams', 'facesRepository', '$q', '$location',
  function ($scope, $routeParams, facesRepository, $q, $location) {
    $scope.pictureIndex = $routeParams.pictureIndex;
    $q.when(facesRepository.get($routeParams.pictureIndex))
      .then(function (result) {
        $scope.picture = result;
      });

    $scope.delete = function (index) {
      facesRepository.delete(index);
      $location.path('/');
    };

    $scope.back = function () {
      $location.path('/');
    };
  }
]);

myDailyFaceControllers.controller(
  'CameraController',
  ['$scope', '$location', 'facesRepository',
  function ($scope, $location, facesRepository) {

    $scope.add = function (picture) {
      picture.date = new Date();
      picture.collection = 'me';
      picture.objectUrl = window.URL.createObjectURL(picture.file);

      facesRepository.add(picture).then(function () {
        $location.path('/');
      });
    };

  }
]);

myDailyFaceControllers.controller(
  'ConfigController',
  ['$scope', '$location', 'configRepository', '$q',
  function ($scope, $location, configRepository, $q) {
    $q.when(configRepository.get('markers')).then(function (result) {
      $scope.markers = result;
    });

    $q.when(configRepository.get('transparency')).then(function (result) {
      $scope.transparency = result;
    });

    $q.when(configRepository.get('previous')).then(function (result) {
      $scope.previous = result;
    });

    $scope.$watch('markers', function () {
      configRepository.set('markers', $scope.markers);
    });

    $scope.$watch('transparency', function () {
      configRepository.set('transparency', $scope.transparency);
    });

    $scope.$watch('previous', function () {
      configRepository.set('previous', $scope.previous);
    });
  }]);

myDailyFaceControllers.controller(
  'MarkersController',
  ['$scope', 'facesRepository', 'configRepository', '$q',
  function ($scope, facesRepository, configRepository, $q) {
    $q.when(facesRepository.get(0)).then(function (result) {
      $scope.bgPicture = window.URL.createObjectURL(result.file);
    });

    $q.when(configRepository.get('markersCoordinates')).then(function (result) {
      $scope.markersCoordinates = result;
    });
  }]);