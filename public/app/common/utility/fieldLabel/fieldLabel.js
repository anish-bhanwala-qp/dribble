(function(){
    angular.module('dribble.utility')
        .directive('dbFieldLabel', ['APP_CONSTANTS', function (APP_CONSTANTS) {
            function resolveOrientation(orientation) {
                switch(orientation) {
                    case 'vertical':
                        return 'vertical';
                    default :
                        return 'horizontal';
                }
            }
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    labelFor: '@',
                    label: '@',
                    fieldType: '@',
                    orientation: '@',
                    field: '='
                },
                templateUrl: APP_CONSTANTS.path + 'common/utility/fieldLabel/field-label-tpl.html',
                link: function ($scope, $element, $attrs, ctrls) {
                    $scope.orientation = resolveOrientation($attrs.orientation);
                },
                controller: function($scope) {
                    $scope.getCssClasses = function(field) {
                        if (field) {
                            return {
                                'has-error': field.$invalid && field.$dirty
                            };
                        } else {
                            return {};
                        }
                    };

                    $scope.showError = function(field, error) {
                        return field.$error[error];
                    };
                }
            };
        }]);
})();