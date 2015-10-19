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
    
    var mapInstance = null;
    $scope.coords = {
            latitude: 45,
            longitude: -73
          }

    var mapChanged = function() {
        if(!mapInstance) return;
        var center  = mapInstance.getCenter();
       

        var bounds = mapInstance.getBounds();

        var center = bounds.getCenter();
        var ne = bounds.getNorthEast();

        // r = radius of the earth in statute miles
        var r = 3963.0;  

        // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
        var lat1 = center.lat() / 57.2958; 
        var lon1 = center.lng() / 57.2958;
        var lat2 = ne.lat() / 57.2958;
        var lon2 = ne.lng() / 57.2958;

        // distance = circle radius from center to Northeast corner of bounds
        var dis = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + 
          Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
        console.log(dis);
         query.updateCriteria({
          center: [center.G, center.K],
          radius: dis
        });
    };

  	$scope.map = { 
		center: { latitude: 45, longitude: -73 }, 
		zoom: 8,
		events: {
            tilesloaded: function(map) {
            	// here we can get the map instance
            	mapInstance = map;
            },
            zoom_changed : mapChanged,
            dragend : mapChanged
        }
  	};

    $scope.searchResults = [];

    var $geo = $geofire(new Firebase('https://skeleton-firebase.firebaseio.com/thecareworld/geos'));

    // // Trivial example of inserting some data and querying data
    // $geo.$set("6", [45,-72])
    //     .catch(function(err) {
    //         $log.error(err);
    //     });

    // Setup a GeoQuery
    var query = $geo.$query({
        center: [45, -73],
        radius: 100
    });

    // // Setup Angular Broadcast event for when an object enters our query
    var geoQueryCallback = query.on("key_entered", "SEARCH:KEY_ENTERED");
    var geoQueryCallback = query.on("key_exited", "SEARCH:KEY_EXITED");

    // // Listen for Angular Broadcast
    $scope.$on("SEARCH:KEY_ENTERED", function (event, key, location, distance) {
        // Do something interesting with object
        console.log("key entered", key);
        // convert geo format from geofire to angular google maps
        var latlang = {latitude: location[0], longitude: location[1]};
        $scope.searchResults.push({key: key, location: latlang, distance: distance});
        console.log("ADD ", $scope.searchResults);
        $scope.$digest();
    });


    $scope.$on("SEARCH:KEY_EXITED", function (event, key, location, distance) {
        // Do something interesting with object
        console.log("key exited", key);
        for (var x = 0; x < $scope.searchResults.length; x++) {
        	if ($scope.searchResults[x].key == key) {
        		$scope.searchResults.splice(x, 1);
        	}	
        }
    });




  });
