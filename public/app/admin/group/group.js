(function(){
    angular.module('dribble')
        .controller('GroupController', ['$scope', 'toaster', 'tournamentService', '$modalInstance', 'tournament',
					function($scope, toaster, tournamentService, $modalInstance, tournament) {
			    //All the initialization should go inside init function
			    $scope.group = {
				name: ''
			    };

			    $scope.submitted = false;

			    $scope.submit = function(form) {
				$scope.submitted = true;
				if (form.$valid) {
				    tournamentService.addGroup(tournament, $scope.group.name)
					.success(function(data, status) {
						toaster.pop('success', 'Group added successfully!');
						$modalInstance.close(data.result);
					    })
					.error(function(data, status) {
						$modalInstance.dismiss('cancel');
						toaster.pop('error', data.error);
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