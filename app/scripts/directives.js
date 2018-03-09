'use strict';

var angular = angular || {};
navigator.getUserMedia = (
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);

angular.module('dr.imageCapture', [])
  .config(['$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(
      /^\s*(https?|ftp|file|blob):|data:image\//
    );
  }])
  .directive('drMarkersConfig', function () {
    return {
      restrict: 'E',
      require: '^ngModel',
      templateUrl: 'partials/dr-markers-config.html',
      scope: {
        ngModel: '='
      },

      link: function ($scope, element, attrs) {
        $scope.bgImage = attrs.bg;

        var grabbed;

        var canvas = element.find('canvas');
        var context = canvas[0].getContext('2d');

        var width = 320;
        var height = 240;

        var drawBars = function () {
          canvas[0].width = canvas[0].width;

          context.lineWidth = 3;

          // eyes ruler
          context.beginPath();
          context.moveTo(0, $scope.ngModel.eyesBar);
          context.lineTo(width, $scope.ngModel.eyesBar);
          context.stroke();

          // mouth ruler
          context.beginPath();
          context.moveTo(0, $scope.ngModel.mouthBar);
          context.lineTo(width, $scope.ngModel.mouthBar);
          context.stroke();

          // middle ruler
          context.beginPath();
          context.moveTo($scope.ngModel.verticalBar, 0);
          context.lineTo($scope.ngModel.verticalBar, height);
          context.stroke();
        };

        drawBars();

        var mousemove = function (event) {
          $scope.$apply(function () {
            switch (grabbed) {
            case 'eyes':
              $scope.ngModel.eyesBar = event.clientY;
              break;

            case 'mouth':
              $scope.ngModel.mouthBar = event.clientY;
              break;

            case 'vertical':
              $scope.ngModel.verticalBar = event.clientX;
              break;
            }
          });

          drawBars();
        };

        var mouseup = function () {
          canvas.off('mousemove', mousemove);
          canvas.off('mouseup', mouseup);
          grabbed = null;
        };

        var mousedown = function (event) {

          if (event.clientY < $scope.ngModel.eyesBar + 5 &&
          event.clientY > $scope.ngModel.eyesBar - 5) {
            grabbed = 'eyes';
          }

          if (event.clientY < $scope.ngModel.mouthBar + 5 &&
          event.clientY > $scope.ngModel.mouthBar - 5) {
            grabbed = 'mouth';
          }

          if (event.clientX < $scope.ngModel.verticalBar + 5 &&
          event.clientX > $scope.ngModel.verticalBar - 5) {
            grabbed = 'vertical';
          }

          if (grabbed) {
            canvas.on('mousemove', mousemove);
            canvas.on('mouseup', mouseup);
          }
        };

        canvas.on('mousedown', mousedown);
      }
    };
  })
  .directive('drImageCapture', function () {
    return {
      restrict: 'E',
      require: '^ngModel',
      templateUrl: 'partials/dr-image-capture.html',
      scope: {
        ngModel: '='
      },

      link: function ($scope, element/*, attrs*/) {
        $scope.isPlaying = false;
        $scope.preview = false;

        var videoStream, width, height;

        var videoElement = element.find('video');
        var canvasElement = element.find('canvas');
        var input = element.find('input');

        input.on('change', function () {
          if (this.files.length > 0) {
            $scope.$apply(function () {
              $scope.ngModel = input[0].files[0];
            });
          }
        });

        var onStream = function (stream) {

          videoStream = stream;
          videoElement[0].srcObject = videoStream;
          $scope.isPlaying = false;

          videoElement[0].addEventListener('canplay', function () {
            if (!$scope.isPlaying && videoElement[0].videoWidth > 0) {
              width = videoElement[0].videoWidth;
              height = videoElement[0].videoHeight;

              videoElement.attr('width', width);
              videoElement.attr('height', height);

              canvasElement.attr('width', width);
              canvasElement.attr('height', height);

              $scope.$apply(function () {
                $scope.isPlaying = true;
              });
            }
          });

          videoElement[0].play();
        };

        var onStreamError = function (error) {
          $scope.isPlaying = false;
          /*
          videoContainer.addClass('hidden');
          input.removeClass('hidden');
          */
          console.log(error);
        };

        var stopStream = function () {
          //videoElement.src = null;
          videoElement.srcObject = null;

          if (videoStream) {
            for (var track in videoStream.getTracks()) {
              videoStream.getTracks()[track].stop();
            }
            //videoStream.stop();
            videoStream = null;
            $scope.isPlaying = false;
          }
        };

        $scope.$on('$destroy', stopStream);

        $scope.takeSnapshot = function () {
          canvasElement[0].getContext('2d').drawImage(
            videoElement[0],
            0, 0,
            width, height
          );

          // Convert image to file.
          var dataURI = canvasElement[0].toDataURL();
          var binary = atob(dataURI.split(',')[1]);
          var array = [];
          for (var i = 0, length = binary.length; i < length; i++) {
            array.push(binary.charCodeAt(i));
          }
          $scope.ngModel = new Blob(
            [new Uint8Array(array)],
            {type: 'image/png'}
          );

          $scope.preview = true;
        };

        $scope.retake = function () {
          $scope.preview = false;
        };

        var constraints = {
            video: true,
            audio: false
          };

        navigator.mediaDevices.getUserMedia(constraints)
          .then(onStream)
          .catch(onStreamError);
      }
    };
  });