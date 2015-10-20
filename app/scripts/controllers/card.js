'use strict';

/**
 * @ngdoc function
 * @name geosApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the geosApp
 */
angular.module('geosApp')
  .controller('CardCtrl', function ($scope, $routeParams, Ref) {

    var cardRef = Ref.child('thecareworld/cards/' + $routeParams.cardId);
    cardRef.once("value", function(snapshot) {
        var m = snapshot.val();

        if(!m)
            return;
        $scope.card = m;
        $scope.$digest();
    });



  });
