'use strict';

/**
 * @ngdoc function
 * @name geosApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the geosApp
 */
angular.module('geosApp')
  .controller('MainCtrl', function ($scope, $routeParams, Ref, uiGmapGoogleMapApi) {
    console.log("mainctrl");
    var query = null;
    var mapInstance = null;
    // $scope.coords = {
    //         latitude: 45,
    //         longitude: -73
    //       }

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

         if (query) {
            query.updateCriteria({
              center: [center.lat(), center.lng()],
              radius: dis
            });   
         }
         
    };

  	$scope.map = { 
		center: { latitude: 45, longitude: -73 }, 
		zoom: 8,
		events: {
            tilesloaded: function(map) {
            	// here we can get the map instance
                if ($scope.map._ready)
                    return;
                $scope.map._ready = true;
                mapInstance = map;
                // bad, geocode can come before of this map
                if ($routeParams.location) {
                    // geocoder load async and notify using global callback functions. bad
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'address': $routeParams.location}, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {

                            mapInstance.setCenter(results[0].geometry.location);
                            mapInstance.fitBounds(results[0].geometry.viewport);
                            mapChanged();
                            // var ne = results[0].geometry.viewport.getNorthEast();
                            var ne = mapInstance.getBounds().getNorthEast();
                            var r = 3963.0;

                            // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
                            var lat1 = mapInstance.center.lat() / 57.2958;
                            var lon1 = mapInstance.center.lng() / 57.2958;
                            var lat2 = ne.lat() / 57.2958;
                            var lon2 = ne.lng() / 57.2958;

                            var dis = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + 
                              Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));

                            setupGeo([mapInstance.center.lat(), mapInstance.center.lng()], dis);


                        } else {
                          alert('Geocode was not successful.' + status);
                        }
                      });
                }
            },
            zoom_changed : mapChanged,
            dragend : mapChanged
        }
  	};

    $scope.doSearch = function() {
        window.location.hash = "#/search/" + $scope.search;
    }

    $scope.highlightMarker = function(card) {
        card.options = { animation: 1 };
    }

    $scope.unhighlightMarker = function(card) {
        card.options = { animation: 0 };
    }
    

    $scope.searchResults = [];

    var setupGeo = function(center, dist) {

        var geo = new GeoFire(new Firebase('https://skeleton-firebase.firebaseio.com/thecareworld/geos'));
        console.log("SETUP GEO " , center , " " , dist);
        query = geo.query({
            center: center,
            radius: dist
        });


        query.on("key_entered", function (key, location, distance) {
            // search card corresponding to just entered geo        
            var fredRef = Ref.child('thecareworld/cards/' + key);
            console.log("query", 'thecareworld/cards/' + key);
            fredRef.once("value", function(snapshot) {
                
                var m = snapshot.val();

                if(!m)
                    return;
                var latlang = {latitude: location[0], longitude: location[1]};
                m.location = latlang;
                m.key = key;
                $scope.$apply(function() {
                    $scope.searchResults.push(m);
                });
                
            });
        });


        query.on("key_exited",function (key, location, distance) {
            for (var x = 0; x < $scope.searchResults.length; x++) {
            	if ($scope.searchResults[x].key == key) {
            		$scope.searchResults.splice(x, 1);
            	}	
            }
        });
    }



  });
