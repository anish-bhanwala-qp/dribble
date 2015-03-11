(function(){
    angular.module('dribble.utility')
        .service('dbAlertMessageService', ['$rootScope', '$timeout', function($rootScope, $timeout) {

            $rootScope.alertMessageText = '';
            $rootScope.alertMessageClass = 'alert-success';
            $rootScope.alertMessageShow = false;
            var timeout;

            return {
                successAlert: function(message) {
                    $rootScope.alertMessageText = message;
                    $rootScope.alertMessageShow = true;
                    $rootScope.alertMessageClass = 'alert-success';
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    timeout = $timeout(function() {
                        $rootScope.alertMessageShow = false;
                    }, 10000);
                },
                errorAlert: function(message) {
                    $rootScope.alertMessageText = message;
                    $rootScope.alertMessageShow = true;
                    $rootScope.alertMessageClass = 'alert-success';
                    $timeout(function() {
                        $rootScope.alertMessageShow = false;
                    }, 3000);
                }
            };
        }]);
})();