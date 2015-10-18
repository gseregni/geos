'use strict';

/**
 * @ngdoc function
 * @name geosApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the geosApp
 */
angular.module('geosApp')
  .controller('MainCtrl', function ($scope) {
    
  	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

  });
