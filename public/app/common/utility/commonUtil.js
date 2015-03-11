(function(){
    angular.module('dribble.utility', [])
        .constant('APP_CONSTANTS', {
            path: 'app/',
            appId: 'HTc4fliX5AyxrtKmc27WHrWrSnlWWKlUBB2yRY41',
	    restApiKey: 'rjAQT5wU6NTp0C9BVnjcQCTtC9E2vnhdX1HKOgpA',
	    apiUrl: 'https://api.parse.com/1/'
        })
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.headers.get = {
                'X-Parse-Application-Id' : 'HTc4fliX5AyxrtKmc27WHrWrSnlWWKlUBB2yRY41',
		'X-Parse-REST-API-Key': 'rjAQT5wU6NTp0C9BVnjcQCTtC9E2vnhdX1HKOgpA',
                'Content-Type': 'application/json; charset=utf-8'
            },
		$httpProvider.defaults.headers.post = {
                    'X-Parse-Application-Id' : 'HTc4fliX5AyxrtKmc27WHrWrSnlWWKlUBB2yRY41',
                    'X-Parse-REST-API-Key': 'rjAQT5wU6NTp0C9BVnjcQCTtC9E2vnhdX1HKOgpA',
                    'Content-Type': 'application/json; charset=utf-8'
                }
        }])
	.filter("formatParseDate", function() {
		function formatNumber(myNumber) {
		    return ("0" + myNumber).slice(-2);
		}
		return function(input){
		    var date = new Date(input.iso);
		    var hours = (date.getHours() + 24 - 2)%24;
		    var mid = 'am';
		    if (hours == 0) {
			hours = 12;
		    } else if(hours > 12){
			hours = hours%12;
			mid = 'pm';
		    }
		    return formatNumber(date.getHours()) + ':' +
			formatNumber(date.getMinutes()) + ' ' + mid;
		}
	    })
	.filter('dateFilter', function () {
		return function (items, date) {
		    var filtered = [];
		    for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.dateOnly.getTime() == date.getTime()) {
			    filtered.push(item);
			}
		    }
		    return filtered;
		};
	    });
})();