(function(){
    angular.module('dribble')
        .controller('MatchController',
            ['$scope', 'toaster', 'tournamentService', '$modalInstance', 'tournament', 'teams',
                function($scope, toaster, tournamentService, $modalInstance, tournament, teams) {
                    //All the initialization should go inside init function
                    $scope.match = {
                        team1: {},
                        team2: {},
                        matchDateTime: new Date(),
                        stage: 'Group'
                    };
                    $scope.teams;
                    $scope.submitted = false;

                    $scope.init = function() {
                        $scope.teams = teams;
                    }

                    $scope.init();

                    $scope.submit = function(form) {
                        $scope.submitted = true;
                        if (form.$valid && $scope.match.team1.objectId && $scope.match.team2.objectId) {
                            tournamentService.addMatch(tournament,
                                    $scope.match.team1,
                                    $scope.match.team2,
                                    $scope.match.matchDateTime.getTime(),
                                    $scope.match.stage,
                                    'Scheduled')
                                .success(function(data, status) {
                                    toaster.pop('success', 'Match added successfully!');
                                    $modalInstance.close(data.result);
                                })
                                .error(function(data, status) {
                                    toaster.pop('error', data.error);
                                    $modalInstance.dismiss('cancel');
                                });
                        } else {
                            alert('Please make sure all values are filled properly');
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
                }])
        .controller('EditMatchController',
            ['$scope', 'toaster', 'tournamentService', '$modalInstance', 'tournament', 'match', 'players', 'matchEvents',
                function($scope, toaster, tournamentService, $modalInstance, tournament, match, players, matchEvents) {
                    //All the initialization should go inside init function
                    $scope.match = {
                        matchDateTime: new Date()
                    };
                    $scope.players;
                    $scope.types = ['Yellow Card', 'Red Card', 'Goal', 'Self Goal', 'Penalty'];
                    $scope.submitted = false;
                    $scope.scores = [0,1,2,3,4,5,6,7,8,9,10];
                    $scope.minutes = [];

                    $scope.init = function() {
                        angular.extend($scope.match, match);
                        $scope.match.matchDateTime = new Date(match.matchDateTime.iso);
                        $scope.players = filterPlayers(players, match);
                        $scope.match.matchEvents = filterEvents(matchEvents, match);
                        for (var i=1; i <= 100; i++) {
                            $scope.minutes.push(i);
                        }
                    };

                    $scope.init();

                    $scope.submit = function(form) {
                        $scope.submitted = true;
                        if (form.$valid) {
                            tournamentService.editMatch($scope.match.objectId,
                                    $scope.match.team1Score,
                                    $scope.match.team2Score,
                                    $scope.match.matchDateTime.getTime(),
                                    $scope.match.stage,
                                    $scope.match.status)
                                .success(function(data, status) {
                                    if ($scope.match.matchEvents.length > 0) {
                                        angular.forEach($scope.match.matchEvents, function(event){
                                            tournamentService.addUpdateMatchEvent(tournament,
                                                    match,
                                                    event,
                                                    event.playerId)
                                                .success(function(data, status) {

                                                })
                                                .error(function(data, status) {
                                                    toaster.pop('error', data.error);
                                                    $modalInstance.dismiss('cancel');
                                                });
                                        });
                                        toaster.pop('success', 'Match Detail Update Started!');
                                        $modalInstance.close(data.result);
                                    } else {
                                        toaster.pop('success', 'Match Details updated successfully!');
                                        $modalInstance.close(data.result);
                                    }
                                })
                                .error(function(data, status) {
                                    toaster.pop('error', data.error);
                                    $modalInstance.dismiss('cancel');
                                });
                        } else {
                            alert('Please make sure all values are filled properly');
                        }
                    };

                    $scope.showValidationMessage = function(form, field) {
                        if (form && field) {
                            return ($scope.submitted || field.$dirty) && field.$invalid;
                        }
                        return false;
                    };

                    $scope.addMatchEvent = function() {
                        $scope.match.matchEvents.push({
                            playerId: '',
                            matchId: match.objectId,
                            tournamentId: tournament.objectId,
                            type: '',
                            time: 0
                        });
                    };

                    $scope.deleteMatchEvent = function(index) {
                        if (confirm('Are you sure')) {
                            if ($scope.match.matchEvents[index]) {
                                var myEvent = $scope.match.matchEvents[index];
                                if (myEvent.objectId) {
                                    tournamentService.deleteMatchEvent(myEvent)
                                        .success(function(data, status) {
                                            $scope.match.matchEvents.splice(index, 1);
                                            for (var i=0; i < matchEvents.length; i++) {
                                                if (matchEvents[i].objectId == myEvent.objectId) {
                                                    matchEvents.splice(i, 1);
                                                    break;
                                                }
                                            }
                                            toaster.pop('success', 'Match Event deleted successfully!');
                                        })
                                        .error(function(data, status) {
                                            toaster.pop('error', data.error);
                                            $modalInstance.dismiss('cancel');
                                        });
                                } else {
                                    $scope.match.matchEvents.splice(index, 1);
                                }
                            }
                        }
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };

                    function filterPlayers(players, match) {
                        var selectedPlayers = [];
                        angular.forEach(players, function(player) {
                            if (player.teamId.objectId == match.team1Id.objectId
                                || player.teamId.objectId == match.team2Id.objectId) {
                                selectedPlayers.push(player);
                            }
                        });
                        return selectedPlayers;
                    };

                    function filterEvents(matchEvents, match) {
                        var selectedEvents = [];
                        angular.forEach(matchEvents, function(event) {
                            if (event.matchId.objectId == match.objectId) {
                                selectedEvents.push(event);
                            }
                        });
                        return selectedEvents;
                    };

                    function replacePlayerIds(matchEvents, players) {
                        angular.forEach(matchEvents, function(matchEvent) {
                            angular.forEach(players, function(player) {
                                if (matchEvent.playerId.objectId == player.objectId) {
                                    matchEvent.playerId = {objectId: player.objectId}
                                }
                            });
                        });
                    };
                }]);
})();