(function(){
    angular.module('dribble')
        .service('teamService', ['$http', '$q', '$timeout', function($http, $q, $timeout) {


            function get() {
                var deferred = $q.defer();
                $('#requestInProgressID').show();
                $timeout(function() {
                    $('#requestInProgressID').hide();
                    deferred.resolve(settings);
                }, 2000);

                /*var request = $http({
                 method: "post",
                 url: "api/index.cfm",
                 params: {
                 action: "add"
                 },
                 data: {
                 name: name
                 }
                 });*/

                return deferred.promise;
            }

            // I get all of the friends in the remote collection.
            function save() {
                /*var request = $http({
                 method: "get",
                 url: "api/index.cfm",
                 params: {
                 action: "get"
                 }
                 });*/

                return( request.then( handleSuccess, handleError ) );
            }

            function handleError( response ) {
                if (! angular.isObject(response.data) || !response.data.message) {
                    return $q.reject('An unknown error occurred.');
                }

                // Otherwise, use expected error message.
                return( $q.reject( response.data.message ) );
            }

            function handleSuccess( response ) {
                return response.data;
            }

            // Return public API.
            return {
                get: get,
                save: save
            };
        }]);
})();