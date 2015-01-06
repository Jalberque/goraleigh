angular.module('starter.controllers', ['ionic'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('RoutesCtrl', function($scope, $http, $ionicLoading, Routes, Stops) {
    //Routes.set();
    Routes.getRoutes(function (routes) {
      $scope.routes = routes;
    });
    Stops.getStops(function (stops) {

    });

})

.controller('RouteCtrl', function($scope, $stateParams, $http, $filter, $ionicLoading, $ionicScrollDelegate, $interval, Routes, Stops, Segments, Vehicles, Polyline, leafletData) {

    angular.extend($scope, {
        center: {
            lat: 35.8830,
            lng: -78.2166,
            zoom: 10
        },
        tiles: {
            url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            options: {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            }
        },
        defaults: {
            scrollWheelZoom: false
        }
    });
  Routes.getRouteByName($stateParams.routeId, function (route) {
    $scope.route = route;
  });
/*  $scope.stops = Stops.get($scope.route.route_id);
*/

  Stops.getStopsByRoute($scope.route.route_id, function (stops) {
    $scope.stops = stops;
    leafletData.getMap().then(function(map) { 
      angular.forEach($scope.stops, function (stop) {
        map.addLayer(L.circleMarker([stop.location.lat, stop.location.lng], {radius: 5}));
      })
    });    
  });
  leafletData.getMap().then(function(map) { 
    $scope.segments = L.geoJson().addTo(map);
    $scope.buses = L.geoJson().addTo(map);
  });


  $scope.addBus = function (vehicle, bus) {

      bus.geometry = {type: 'Point', coordinates: [vehicle.location.lng, vehicle.location.lat]};
      bus.type = 'Feature';
      bus.properties = {id: vehicle.vehicle_id, speed: vehicle.speed, heading: vehicle.heading, location: vehicle.location};
      $scope.buses.addData(bus);
  };

  $scope.moveBus = function (l, map) {
    $scope.buses.removeLayer(l);
    var R = 3958.76,
      d = l.feature.properties.speed/3600,
      brng = l.feature.properties.heading,
      lat1 = l.feature.geometry.coordinates[1] * Math.PI / 180,
      lng1 = l.feature.geometry.coordinates[0] * Math.PI / 180;
    var lat2 = Math.asin( (Math.sin(lat1)*Math.cos(d/R)) +
                          (Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng)) );
    var lng2 = lng1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),
                         Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
    lat2 = lat2*57.2957795;
    lng2 = lng2*57.2957795;
    //l.setLatLng(L.latLng(lat2, lng2));
    l.feature.geometry.coordinates = [lng2, lat2];
    $scope.buses.addData(l.feature);
    //console.log(d);
  };

  $interval(function (){
  Vehicles.getVehiclesByRoute($scope.route.route_id, function (vehicles) {
    $scope.vehicles = vehicles;
    leafletData.getMap().then(function(map) { 
    var bus = {}
      angular.forEach($scope.vehicles, function (vehicle) {
        //$scope.buses.addLayer(L.marker([vehicle.location.lat, vehicle.location.lng]));
        //console.log(vehicle);
        var cnt = 0,
          f = null;


        $scope.buses.eachLayer(function (l) {
          cnt += 1;
          f = l.feature;
          if (f.properties.id === vehicle.vehicle_id) {
            if (f.properties.location.lat != vehicle.location.lat && f.properties.location.lng != vehicle.location.lng) {
              $scope.buses.removeLayer(l);
              $scope.addBus(vehicle, bus);
            } else {
              $scope.moveBus(l, map);
            }
          }

        });
          if (cnt === 0) {
            $scope.addBus(vehicle, bus);
          }

      })
    });    
  })}, 1000);

  Segments.getSegmentsByRoute($scope.route.route_id, function (segments) {
      leafletData.getMap().then(function(map) {
          var pl = L.polyline([], {opacity: 1}),
            decode = [],
            latlngs = [],
            lls = [],
            gj = {};
          angular.forEach(segments, function (segment, key) {
            decode = Polyline.decodeLine(segment);
            lls = [];
            for (var i = 0; i < decode.length; i++) {
              lls.push(decode[i].reverse());
            }
            pl.setLatLngs(lls);
            gj = pl.toGeoJSON();
            gj.type = 'Feature';
            gj.properties = {'id': key};
            $scope.segments.addData(gj);
          });
          map.fitBounds($scope.segments.getBounds());
        });  
  });

    $scope.stopClicked = function () {
      var location = this.stop.location;
      leafletData.getMap().then(function(map) {
        map.setView([location.lat, location.lng], 16);
        $ionicScrollDelegate.scrollTop(true);
      });
    };
});
