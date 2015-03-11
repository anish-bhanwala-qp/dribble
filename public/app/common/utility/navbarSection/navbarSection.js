(function(){
    angular.module('dribble.utility')

        .directive('dbNavbarSection', ['APP_CONSTANTS', function (APP_CONSTANTS) {
            var seqNumber = 1;
            function getSectionType(type) {
                if (type) {
                    switch(type) {
                        case 'default':
                            return 'navbar-default';
                    }
                }
                return 'navbar-inverse';
            }

            function getButtonType(type) {
                if (type) {
                    switch(type) {
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
                transclude: true,
                templateUrl: APP_CONSTANTS.path + 'common/utility/navbarSection/navbar-section-tpl.html',
                scope: {
                    headerText: '@',
                    type: '@',
                    helpId: '@',
                    iconType: '@'
                },
                controller: function($scope) {
                    var buttons = $scope.buttons = [];

                    this.addButton = function(text, type, url) {
                        buttons.push({text: text, type: getButtonType(type), url: url});
                    };
                },

                link: function (scope, element, attrs, ctrls) {
                    scope.toggleID += seqNumber++;
                    scope.myType = getSectionType(attrs.type);
                }
            };
        }])
        .directive('saNavbarButton', function () {
            return {
                require: '^saNavbarSection',
                restrict: 'E',
                scope: {
                    text: '@',
                    type: '@',
                    url: '@'
                },
                link: function(scope, element, attrs, navbarSectionCtrl) {
                    navbarSectionCtrl.addButton(attrs.text, attrs.type, attrs.url);
                },
                template: ''
            };
        });
})();