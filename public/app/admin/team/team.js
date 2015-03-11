(function(){
    angular.module('dribble')
        .controller('TeamController',
		    ['$scope', 'toaster', 'tournamentService', '$modalInstance', 'tournament', 'group',
		     function($scope, toaster, tournamentService, $modalInstance, tournament, group) {
			    //All the initialization should go inside init function
			    $scope.team = {
				name: ''
			    };

			    $scope.submitted = false;

			    $scope.submit = function(form) {
				$scope.submitted = true;
				if (form.$valid) {
				    tournamentService.addTeam(tournament, group, $scope.team.name)
					.success(function(data, status) {
						toaster.pop('success', 'Team added successfully!');
						$modalInstance.close(data.result);
					    })
					.error(function(data, status) {
						toaster.pop('error', data.error);
						$modalInstance.dismiss('cancel');
					    });
				}
			    };

			    $scope.showValidationMessage = function(form, field) {
				if (form && field) {
				    return ($scope.submitted || field.$dirty) && field.$invalid;
				}
				return false;
			    };

			    $scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			    };
			}]);
})();