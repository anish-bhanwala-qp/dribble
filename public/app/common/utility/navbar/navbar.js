(function(){
    angular.module('dribble.utility')
        .directive('dbNavbar', ['APP_CONSTANTS', '$state', function (APP_CONSTANTS, $state) {
		    function getNavbarType(type) {
			switch(type) {
			case 'inverse':
			    return 'navbar-inverse';
			default:
			    return 'navbar-default';
			}
			return 'navbar-default';
		    }

		    return {
			restrict: 'E',
			    //transclude: true,
			    templateUrl: APP_CONSTANTS.path + 'common/utility/navbar/navbar-tpl.html',
			    scope: {
			    headerText: '@',
				type: '@',
				signInCallback: '&',
				isAdmin: '&',
				isCaptain: '@'
				},
			    link: function (scope, element, attrs, ctrls) {
			    scope.myType = getNavbarType(attrs.type);
			    scope.headerText = attrs.headerText || 'Dribble 2015';
			    scope.showSignIn = angular.isDefined(attrs.signInCallback);
			    scope.isAdmin = angular.isDefined(attrs.isAdmin);
			    scope.isCaptain = angular.isDefined(attrs.isCaptain) && attrs.isCaptain == 'true';
			    scope.selectedTab = scope.isAdmin ? 'admin' : 'matches';

			    scope.selectTab = function(tab) {
				scope.selectedTab = tab;
			    }

			    scope.getCssClass = function(tab) {
				return $state.current.name == tab ? 'active' : '';
			    }
			}
		    };
		}])
	})();
