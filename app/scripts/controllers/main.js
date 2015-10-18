'use strict';

/**
 * @ngdoc function
 * @name geosApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the geosApp
 */
angular.module('geosApp')
  .controller('MainCtrl', function ($scope, $geofire, uiGmapGoogleMapApi) {
    
  	$scope.map = { 
		center: { latitude: 45, longitude: -73 }, 
		zoom: 8,
		events: {
            tilesloaded: function (map) {
            	var center  = map.getCenter();
            	console.log(center.G," - ", center.K);
            	query.updateCriteria({
				  center: [center.G, center.K],
				  radius: 5
				});
                // $scope.$apply(function () {
                // 	console.log("map ", map.getCenter());
                //     $scope.mapInstance = map;

                // });
            }
        }
  	};

     $scope.searchResults = [];

    var $geo = $geofire(new Firebase('https://skeleton-firebase.firebaseio.com/thecareworld/geos'));

    // Trivial example of inserting some data and querying data
    $geo.$set("tre", [45,-73])
        .catch(function(err) {
            $log.error(err);
        });

    // Setup a GeoQuery
    var query = $geo.$query({
        center: [45, -73],
        radius: 2000
    });

    // // Setup Angular Broadcast event for when an object enters our query
    var geoQueryCallback = query.on("key_entered", "SEARCH:KEY_ENTERED");
    var geoQueryCallback = query.on("key_exited", "SEARCH:KEY_EXITED");

    // // Listen for Angular Broadcast
    $scope.$on("SEARCH:KEY_ENTERED", function (event, key, location, distance) {
        // Do something interesting with object
        console.log("key entered", key);
        $scope.searchResults.push({key: key, location: location, distance: distance});

        // Cancel the query if the distance is > 5 km
        if(distance > 5) {
            geoQueryCallback.cancel();
        }
    });


    $scope.$on("SEARCH:KEY_EXITED", function (event, key, location, distance) {
        // Do something interesting with object
        console.log("key exited", key);
        // $scope.searchResults.push({key: key, location: location, distance: distance});

        // Cancel the query if the distance is > 5 km
        // if(distance > 5) {
        //     geoQueryCallback.cancel();
        // }
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
