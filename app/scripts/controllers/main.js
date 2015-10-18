'use strict';

/**
 * @ngdoc function
 * @name geosApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the geosApp
 */
angular.module('geosApp')
  .controller('MainCtrl', function ($scope, Ref, $geofire) {
    
  	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    // var cards = $firebaseObject(Ref.child('thecareworld/cards'));
    // console.log("cards ", cards);
    // cards.$bindTo($scope, 'cards');



     $scope.searchResults = [];

    var $geo = $geofire(new Firebase('https://skeleton-firebase.firebaseio.com/thecareworld/cards'));

    // Trivial example of inserting some data and querying data
    // $geo.$set("some_key", [37.771393,-122.447104])
    //     .catch(function(err) {
    //         $log.error(err);
    //     });

    // // Get some_key's location, place it on $scope
    // $geo.$get("some_key")
    //     .then(function (location) {
    //         $scope.objLocation = location;
    //     });

    // // Remove "some_key" location from forge
    // $geo.$remove("some_key")
    //     .catch(function (err) {
    //         $log.error(err);
    //     });


    // Setup a GeoQuery
    var query = $geo.$query({
        center: [37.77, -122.447],
        radius: 2000
    }, function(err,data) {
    	alert(data);
    });

    // // Setup Angular Broadcast event for when an object enters our query
    var geoQueryCallback = query.on("key_entered", "SEARCH:KEY_ENTERED");

    // // Listen for Angular Broadcast
    $scope.$on("SEARCH:KEY_ENTERED", function (event, key, location, distance) {
    	alert("jkj");
        // Do something interesting with object
        $scope.searchResults.push({key: key, location: location, distance: distance});

        // Cancel the query if the distance is > 5 km
        if(distance > 5) {
            geoQueryCallback.cancel();
        }
    });


  });



// angular.module('geosApp')
//   .controller('AccountCtrl', function ($scope, user, Auth, Ref, $firebaseObject) {
//     $scope.user = user;
//     $scope.logout = function() { Auth.$unauth(); };
//     $scope.messages = [];
//     var profile = $firebaseObject(Ref.child('users/'+user.uid));
//     profile.$bindTo($scope, 'profile');
    

//   });
