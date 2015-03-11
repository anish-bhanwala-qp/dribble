(function(){
    angular.module('dribble')
        .controller('AddTournamentController', ['$scope', function($scope) {
                    //All the initialization should go inside init function
                    $scope.tournament = {
                        name: 'Dribble',
                        startDate: new Date()
                    }

                    $scope.submit = function(form) {
                        if (form.$valid) {
                            alert('valid');
                        } else {
                            alert('invalid');
                        }

                        return;
                    };

                    $scope.showValidationMessage = function(form, field) {
                        return (form.$submitted || field.$touched) && field.$error;
                    };
                }]);
})();