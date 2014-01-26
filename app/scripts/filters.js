'use strict';

var angular = angular || {};

angular.module('myDailyFaceFilters', [])
  .filter('objectUrl', function () {
    return function (input) {
      if (input instanceof Object) {
        return window.URL.createObjectURL(input);
      }
      else {
        return input;
      }
    };
  });