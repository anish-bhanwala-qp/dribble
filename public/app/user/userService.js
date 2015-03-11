(function(){
    angular.module('dribble')
        .service('userService', ['$http', 'APP_CONSTANTS', 'toaster', '$timeout', '$window',
				 function($http, APP_CONSTANTS, toaster, $timeout, $window) {
			 var user = {};
			 var sessionToken;
			 function login(username, password) {
			     var promise = $http({
				     method: "post",
				     url: APP_CONSTANTS.apiUrl + 'functions/myLogin',
				     data: {
					 username: username,
					 password: password
				     }
				 });

			     return promise;
			 }

			 function getAuthenticatedUser(token) {
			     if (token) {
				 sessionToken = token;
				 $http({
					 method: "post",
					     url: APP_CONSTANTS.apiUrl + 'functions/authenticatedUser',
					     data: {},
					     headers: {
					     'X-Parse-Session-Token' : token
						 }
				     }).success(function(data) {
					     console.log(data);
					     angular.extend(user, data.result);
					 }).error(function(data) {
						 console.log(data);
						 $window.location.href = 'index.html';
					     });
			     } else {
				 toaster.pop('warning', 'Session Expired!');
				 $timeout(function() {
					 $window.location.href = 'index.html';
				     }, 500);
			     }

			     return user;
			 }

			 function token() {
			     return sessionToken;
			 }

			 return {
			     login: login,
				 getAuthenticatedUser: getAuthenticatedUser,
				 token: token
				 };
		     }]);
})();