(function(){
    angular.module('dribble', ['dribble.utility', 'toaster', 'cgBusy', 'ui.router', 'ngRoute'])
        .config(function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/matches');
            $stateProvider
                .state('about', {
                    url: '/about',
                    templateUrl: 'admin-tpl.html'
                })
                .state('matches', {
                    url: '/matches',
                    templateUrl: 'app/match/matches-tpl.html'
                })
                .state('table', {
                    url: '/table',
                    templateUrl: 'app/table/table-tpl.html'
                })
                .state('stats', {
                    url: '/stats',
                    templateUrl: 'app/stats/stats-tpl.html'
                });
        })
        .controller('MainController', ['$scope', '$modal', 'tournamentService', 'toaster', 'tableService',
            function($scope, $modal, tournamentService, toaster, tableService) {
                $scope.tournaments;
                $scope.data = {
                    matchDates: [],
                    tournament: {},
                    groups: [],
                    teams: [],
                    matches: [],
                    players: [],
                    table: [],
                    consolidatedMatchEvents: []
                };

                $scope.init = function() {
                    $scope.tournaments = tournamentService.getAll()
                        .success(function(data) {
                            console.log(data);
                            $scope.tournaments = data.result;
                            if ($scope.tournaments.length > 0) {
                                $scope.data.tournament = $scope.tournaments[0];
                                tournamentService.getData($scope.data.tournament)
                                    .success(function(data) {
                                        updateArray($scope.data.groups, data.result.groups);
                                        updateArray($scope.data.teams, data.result.teams);
                                        updateArray($scope.data.matches, data.result.matches);
                                        updateArray($scope.data.players, data.result.players);
                                        populateTeamNames($scope.data.matches, $scope.data.teams);
                                        updateArray($scope.data.table, tableService.calculateTable($scope.data));
                                        updateArray($scope.data.consolidatedMatchEvents,
                                            tableService.calculateStats(data.result.matchEvents, $scope.data));
                                    })
                                    .error(function(error) {
                                        toaster.put('error', 'Error occurred while loading data');
                                    });
                            }
                        }).error(function(data) {
                            toaster.put('error', 'Error occurred while loading data');
                        });
                }

                $scope.init();

                $scope.showSignIn = function() {
                    $modal.open({
                        templateUrl: "app/user/login-tpl.html",
                        controller: "LoginController",
                        size: 'sm'
                    })
                };

                function updateArray(oldArray, newArray) {
                    if (oldArray) {
                        oldArray.length = 0;
                        oldArray.push.apply(oldArray, newArray);
                    } else {
                        oldArray = newArray;
                    }
                }

                function populateTeamNames(matches, teams) {
                    $scope.data.matchDates.length = 0;
                    angular.forEach(matches, function(match) {
                        match.dateTime = new Date(match.matchDateTime.iso);
                        var dateTemp = new Date(match.matchDateTime.iso);
                        dateTemp.setHours(0,0,0,0);
                        match.dateOnly = dateTemp;
                        var found = false;
                        for (var i=0; i < $scope.data.matchDates.length; i++) {
                            if ($scope.data.matchDates[i].getTime() == match.dateOnly.getTime()) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            $scope.data.matchDates.push(match.dateOnly);
                        }
                        angular.forEach(teams, function(team) {
                            if (match.team1Id.objectId == team.objectId) {
                                match.team1Name = team.name;
                            } else if (match.team2Id.objectId == team.objectId) {
                                match.team2Name = team.name;
                            }
                        });
                    });
                }
            }]);
})();