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

    $scope.clickMarker = function(card) {
        alert("card");
        var map = mapInstance;
        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
            map.getBounds().getNorthEast().lat(),
            map.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
        
        var worldCoordinate = map.getProjection().fromLatLngToPoint(card.location);
        var pixelOffset = new google.maps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
        $("#map-popup").show();
        $("#map-popup").css("position", "absolute");
        var y = Number(pixelOffset.y );
        var x = Number(pixelOffset.x + 20);
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        $("#map-popup").css("top", y + "px");
        $("#map-popup").css("left", x + "px");
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


    /* FILTERS */
    // fill on start
    var tagsRef = Ref.child('thecareworld/config/tags');
    tagsRef.once("value", function(snapshot) {
        var tags = snapshot.val();
        var filtersFirst = {};
        var filtersSecond = {};
        var filtersThird = {};
        for (var x = 0; x < tags.length; x++) {
            if (!tags[x])
                continue;
            console.log(tags[x]);
            var split = tags[x].split("/");
            // if (filtersFirst.[split[0]])
            filtersFirst[split[0]] = {checked: false};
            // filtersFirst.push({label: split[0], checked: false});
            filtersSecond[split[1]] = {checked: false};
            if (split[2])
                filtersThird[tags[x]] = {checked: false}
        }

        $scope.$apply(function() {
            $scope.filtersFirst = filtersFirst;
            $scope.filtersSecond = filtersSecond;
            $scope.filtersThird = filtersThird;
        });

        console.log();
    });

    $scope.activeFilters = [];

    var matchFilters = function(card) {
        console.log("MATCH ", $scope.activeFilters);
        for (var x = 0; x < $scope.activeFilters.length; x++) {
            var f = $scope.activeFilters[x];
            var tags = card.tags.split(",");
            if (tags.indexOf(f) == -1)
                continue;
            return true;
        }
        return false;
    }


    $scope.filter = function (card) { 
        if ($scope.activeFilters.length == 0)
            return true;
        
        return matchFilters(card);    
        
    };

    var computeActiveFilter = function() {
        var activeFilters = [];
        var firstActive = [];
        var secondActive = [];

        for (var k in $scope.filtersFirst) {
            if ($scope.filtersFirst[k].checked) {
                firstActive.push(k);
            }
        }

        for (var k in $scope.filtersSecond) {
            if ($scope.filtersSecond[k].checked) {
                secondActive.push(k);
            }
        }


        for (var k in $scope.filtersFirst) {
            if (firstActive.length == 0 || $scope.filtersFirst[k].checked) {
                console.log("first ", k);
                for (var k2 in $scope.filtersSecond) {
                    if (secondActive.length == 0 || $scope.filtersSecond[k2].checked) {
                        activeFilters.push(k + "/" + k2);    
                    }
                }
            }
        }
        // for (var x = 0; x < firstActive.length; x++) {
        //     for (var k2 in $scope.filtersSecond) {
        //         if ($scope.filtersSecond.length == 0 || $scope.filtersSecond[k2].checked)
        //             activeFilters.push(k + "/" + k2);
        //     }    
        // }
        
        $scope.activeFilters = activeFilters;
        console.log("filter " , activeFilters);
    };

    $scope.setFirstFilter = function(key, e) {
        for (var k in $scope.filtersFirst) {
            $scope.filtersFirst[k].checked = false;
        }

        // bad to use event... should use angular logic instead
        if (e.target.checked)
            $scope.filtersFirst[key].checked = true;

        computeActiveFilter();
    }


    $scope.setSecondFilter = function(key, e) {
        for (var k in $scope.filtersSecond) {
            $scope.filtersSecond[k].checked = false;
        }
        // bad to use event... should use angular logic instead
        if(e.target.checked)
            $scope.filtersSecond[key].checked = true;

        computeActiveFilter();
    }   


    $scope.moreFilters = function() {
        $scope.showFilter = true;
    }

    $scope.applyFilters = function() {
        $scope.showFilter = false;
    }

  });
