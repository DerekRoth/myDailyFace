'use strict';

function Picture(collection, date) {
  this.collection = collection;
  this.date = date;
}

Picture.prototype.setLocation = function (latitude, longitude) {
  this.location = [latitude, longitude];
};