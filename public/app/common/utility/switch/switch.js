(function(){
    angular.module('dribble.utility')

        .directive('dbSwitch', function () {
            function getSwitchSize(type) {
                if (type) {
                    switch(type) {
                        case 'mini':
                            return 'mini';
                        case 'small':
                            return 'small';
                        case 'normal':
                            return 'normal';
                        case 'large':
                            return 'large';
                        default:
                            return 'mini';
                    }
                }
                return 'mini';
            }

            return {
                restrict: 'A',
                require: '?ngModel',

                link: function ($scope, $element, $attrs, ngModel) {
                    $element.bootstrapSwitch({size: getSwitchSize($attrs.size)});

                    $element.on('switchChange.bootstrapSwitch', function(event, state) {
                        if (ngModel) {
                            $scope.$apply(function() {
                                ngModel.$setViewValue(state);
                            });
                        }
                    });

                    $scope.$watch($attrs.ngModel, function(newValue, oldValue) {
                        if (newValue) {
                            $element.bootstrapSwitch('state', true, true);
                        } else {
                            $element.bootstrapSwitch('state', false, true);
                        }
                    });
                }
            };
        });
})();