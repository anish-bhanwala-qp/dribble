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
                    eventType: 'Goals',
                    matchFilter: 'Scheduled',
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
                                for (var i=0; i < $scope.tournaments.length; i++) {
                                    var tournament = $scope.tournaments[i];
                                    if (tournament.isCurrent) {
                                        $scope.data.tournament = tournament;
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
                                                populateMatchEventsPlayerNames(data.result.matchEvents, data.result.players);
                                                populateMatchEvents($scope.data.matches, data.result.matchEvents);
                                            })
                                            .error(function(error) {
                                                toaster.put('error', 'Error occurred while loading data');
                                            });
                                        break;
                                    }
                                }
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
                                if (match.status == 'Scheduled') {
                                    $scope.data.matchDates[i].hasScheduled = 'hasScheduled';
                                } else {
                                    $scope.data.matchDates[i].hasOver = 'hasOver';
                                }
                                break;
                            }
                        }
                        if (!found) {
                            if (match.status == 'Scheduled') {
                                match.dateOnly.hasScheduled = 'hasScheduled';
                            } else {
                                match.dateOnly.hasOver = 'hasOver';
                            }
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

                function populateMatchEventsPlayerNames(matchEvents, players) {
                    for (var i=0; i < matchEvents.length; i++) {
                        var event = matchEvents[i];
                        var events = [];
                        for (var j=0; j < players.length; j++) {
                            var player = players[j];
                            if (event.playerId.objectId == player.objectId) {
                                event.playerName = player.name;
                                event.teamId = player.teamId.objectId;
                                break;
                            }
                        }
                    }
                }

                function populateMatchEvents(matches, matchEvents) {
                    for (var i=0; i < matches.length; i++) {
                        var match = matches[i];
                        var events = [];
                        for (var j=0; j < matchEvents.length; j++) {
                            var event = matchEvents[j];
                            if (event.matchId.objectId == match.objectId) {
                                events.push(event);
                            }
                        }
                        match.events = events;
                    }
                }
            }]);
})();