angular.module('starter.services', [])
.factory('Routes', ['$filter', '$http', '$ionicLoading', function($filter, $http, $ionicLoading) {
	var routes = [];
	
	var getRoutes = function (callback) {
		    var req = {
		      method: 'GET',
		      url: 'https://transloc-api-1-2.p.mashape.com/routes.json?agencies=20',
		      headers: {
		        'X-Mashape-Key': 'QcvihLtHdgmshtY0Yjsg7nytW4Iqp1MEy05jsnSqvl1Lqjt9eW'
		      }
		    };
		    $ionicLoading.show();
		    $http(req).success(function (data) {
		      routes = data.data[20];
		      callback(routes);
		      $ionicLoading.hide();
		    });	
	};

	var getRouteByName = function (routeId, callback) {
		var match = $filter('filter')(routes, {long_name: routeId});
		if (match.length > 0) {
			callback(match[0]);
		} else {
			return callback({});
		}
	};
	return {
		getRoutes: getRoutes,
		getRouteByName: getRouteByName
	}
}])
.factory('Stops', ['$filter', '$http', '$ionicLoading', function($filter, $http, $ionicLoading){

	var stops = [];
	
	var getStops = function (callback) {
		    var req = {
		      method: 'GET',
		      url: 'https://transloc-api-1-2.p.mashape.com/stops.json?agencies=20',
		      headers: {
		        'X-Mashape-Key': 'QcvihLtHdgmshtY0Yjsg7nytW4Iqp1MEy05jsnSqvl1Lqjt9eW'
		      }
		    };
		    $ionicLoading.show();
		    $http(req).success(function (data) {
		      stops = data.data;
		      callback(stops);
		      $ionicLoading.hide();
		    });
	};

	var getStopsByRoute = function (routeId, callback) {
		var matches = [];
		for (var i = 0;i < stops.length; i++) {
			var match = $filter('filter')(stops[i].routes, routeId);
			if (match.length > 0) {
				matches.push(stops[i]);
			}
		}
		callback(matches);
	};
	return {
		getStops: getStops,
		getStopsByRoute: getStopsByRoute
	}
}])
.factory('Segments', ['$http', function ($http) {
	var segments = [];
	var getSegmentsByRoute = function (routeId, callback) {
	    var req = {
	      method: 'GET',
	      url: 'https://transloc-api-1-2.p.mashape.com/segments.json?agencies=20&routes='+routeId,
	      headers: {
	        'X-Mashape-Key': 'QcvihLtHdgmshtY0Yjsg7nytW4Iqp1MEy05jsnSqvl1Lqjt9eW'
	      }
	    };
	    $http(req).success(function (data) {
	    	segments = data.data;
	    	callback(segments);
	    });
	};
	return {
		getSegmentsByRoute: getSegmentsByRoute
	}	
}])
.factory('Vehicles', ['$http', function ($http) {
	var vehicles = [];
	var getVehiclesByRoute = function (routeId, callback) {
	    var req = {
	      method: 'GET',
	      url: 'https://transloc-api-1-2.p.mashape.com/vehicles.json?agencies=20&routes='+routeId,
	      headers: {
	        'X-Mashape-Key': 'QcvihLtHdgmshtY0Yjsg7nytW4Iqp1MEy05jsnSqvl1Lqjt9eW'
	      }
	    };
	    $http(req).success(function (data) {
	    	vehicles = data.data[20];
	    	callback(vehicles);
	    });
	};


	return {
		getVehiclesByRoute: getVehiclesByRoute
	}	
}])
.factory('Polyline', ['$http',
	function ($http) {
		return {
			decodeLine: function (encoded) {
		        var len = encoded.length;
		        var index = 0;
		        var array = [];
		        var lat = 0;
		        var lng = 0;
		        while (index < len) {
		            var b;
		            var shift = 0;
		            var result = 0;
		            do {
		                b = encoded.charCodeAt(index++) - 63;
		                result |= (b & 0x1f) << shift;
		                shift += 5;
		            } while (b >= 0x20);
		            var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
		            lat += dlat;

		            shift = 0;
		            result = 0;
		            do {
		                b = encoded.charCodeAt(index++) - 63;
		                result |= (b & 0x1f) << shift;
		                shift += 5;
		            } while (b >= 0x20);
		            var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
		            lng += dlng;

		            array.push([lng * 1e-5, lat * 1e-5]);
		        }
		        return array;
			}
		}
	}
	])
;