'use strict';

var angular = angular || {};
var Picture = Picture || {};

var myDailyFaceServices = angular.module(
  'myDailyFaceServices',
  ['xc.indexedDB']
);

myDailyFaceServices.config(function ($indexedDBProvider) {
  var currentVersion = 2;

  $indexedDBProvider
    .connection('myDailyFace')
    .upgradeDatabase(currentVersion, function (event, db/*, tx*/) {

      if (event.oldVersion < 1) {
        var facesStore = db.createObjectStore('faces', { keyPath: 'key' });
        facesStore.createIndex(
          'collection_idx',
          'collection',
          { unique: false }
        );
        facesStore.createIndex('date_idx', 'date', { unique: false });
      }

      if (event.oldVersion < 2) {
        db.createObjectStore('config', { keyPath: 'key' });
      }

    });
});

myDailyFaceServices.factory('facesRepository', ['$indexedDB',
  function ($indexedDB) {
    var pictureRepository = {};
    var facesStore = $indexedDB.objectStore('faces');
    var pictures = [];
    var picturesBuffer = [];
    var initialized = false;
    var loadAllPromise;

    pictureRepository.init = function () {
      return this.loadAll();
    };

    pictureRepository.add = function (picture) {
      picture.key = picture.collection + '_' + picture.date.getTime();
      pictures.push(picture);

      if (!initialized) {
        picturesBuffer.push(picture);
      }

      return facesStore.insert(picture);
    };

    pictureRepository.get = function (index) {
      if (initialized) {
        return pictures[index];
      }
      else {
        return this.init().then(function () {
          return pictureRepository.get(index);
        });
      }
    };

    pictureRepository.delete = function (index) {
      var deleted = pictures.splice(index, 1);
      return facesStore.delete(deleted[0].key);
    };

    pictureRepository.getAll = function () {
      if (initialized) {
        return pictures;
      }
      else {
        return this.loadAll();
      }
    };

    pictureRepository.loadAll = function () {
      if (!loadAllPromise)
      {
        loadAllPromise = facesStore.getAll().then(function (results) {
          pictures = results.map(function (element) {
            element.objectUrl = window.URL.createObjectURL(element.file);
            return angular.extend(new Picture(), element);
          });

          pictures = pictures.concat(picturesBuffer);
          picturesBuffer = [];

          initialized = true;

          return pictures;
        });
      }

      return loadAllPromise;
    };

    return pictureRepository;
  }
]);

myDailyFaceServices.factory('configRepository', ['$indexedDB',
  function ($indexedDB) {
    var configRepository = {};
    var configStore = $indexedDB.objectStore('config');
    var configValues = [];
    var defaultValues = {
      markers: true,
      transparency: true,
      previous: true,
      markersCoordinates: {
        verticalBar: 10,
        eyesBar: 10,
        mouthBar: 30
      }
    };

    var initialized = false;

    configRepository.init = function () {
      return configStore.getAll().then(function (results) {
        results.map(function (result) {
          configValues[result.key] = result.value;
        });

        initialized = true;
      });
    };

    configRepository.get = function (key) {
      if (initialized) {
        if (!configValues[key]) {
          configValues[key] = defaultValues[key];
        }
        return configValues[key];
      }
      else {
        return this.init().then(function () {
          return configRepository.get(key);
        });
      }
    };

    configRepository.set = function (key, value) {
      var param = {key: key, value: value};
      return configStore.upsert(param);
    };

    return configRepository;
  }]);