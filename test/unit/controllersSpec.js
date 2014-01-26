'use strict';

describe('MyDailyFace controllers', function () {
  beforeEach(module('myDailyFace'));

  describe('PictureListController', function () {
    beforeEach(module('myDailyFace'));

    it('should create "pictures" with 2 elements', inject(function ($controller) {
      var scope = {},
        ctrl = $controller('PictureListController', { $scope: scope });

      expect(scope.pictures.length).toBe(2);
    }));
  });
});
