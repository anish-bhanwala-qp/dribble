(function(){
    angular.module('dribble.utility')
        .directive('saButton', ['APP_CONSTANTS', function (APP_CONSTANTS) {
            function getSizeClass(size) {
                if (size) {
                    switch(size) {
                        case 'small':
                            return 'btn-sm';
                        case 'large':
                            return 'btn-lg';
                        case 'extraSmall':
                            return 'btn-xs';
                    }
                }
                return 'btn-sm';
            }
            function getStyleClass(styleClass) {
                if (styleClass) {
                    switch(styleClass) {
                        case 'primary':
                            return 'btn-primary';
                        case 'success':
                            return 'btn-success';
                        case 'info':
                            return 'btn-info';
                        case 'default':
                            return 'btn-default';
                        case 'danger':
                            return 'btn-danger';
                        case 'warning':
                            return 'btn-warning';
                    }
                }
                return 'btn-primary';
            }

            return {
                restrict: 'E',
                scope: {
                    size: '@',
                    type: '@',
                    text: '@',
                    iconType: '@'
                },
                templateUrl: APP_CONSTANTS.path + 'common/utility/button/button-tpl.html',

                link: function ($scope, $element, $attrs, ctrls) {
                    $scope.mySize = getSizeClass($attrs.size);
                    $scope.myType = getStyleClass($attrs.type);
                }
            };
        }]);
})();