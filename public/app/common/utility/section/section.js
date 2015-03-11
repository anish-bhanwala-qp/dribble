(function(){
    angular.module('dribble.utility')

        .directive('dbSection', ['APP_CONSTANTS', function (APP_CONSTANTS) {
            function getSectionType(type) {
                if (type) {
                    switch(type) {
                        case 'primary':
                            return 'panel-primary';
                        case 'success':
                            return 'panel-success';
                        case 'info':
                            return 'panel-info';
                        case 'default':
                            return 'panel-default';
                        case 'danger':
                            return 'panel-danger';
                        case 'warning':
                            return 'panel-warning';
                    }
                }
                return 'panel-primary';
            }

            return {
                restrict: 'E',
                scope: {
                    headerText: '@',
                    type: '@',
                    iconType: '@',
                    subSection: '@'
                },
                transclude: true,
                templateUrl: APP_CONSTANTS.path + 'common/utility/section/section-tpl.html',

                link: function ($scope, $element, $attrs) {
                    $scope.subSection = $attrs.subSection || false;
                    $scope.myType = getSectionType($attrs.type);
                }
            };
        }]);
})();