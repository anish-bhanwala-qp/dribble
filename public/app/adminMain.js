(function(){
    angular.module('dribble', ['dribble.utility', 'toaster', 'cgBusy', 'ui.router', 'ngRoute'])
        .config(function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/admin');
            $stateProvider
                .state('admin', {
                    url: '/admin',
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
        .controller('MainController', ['$scope', 'userService', 'tournamentService', 'toaster', '$modal', 'tableService',
            function($scope, userService, tournamentService, toaster, $modal, tableService) {
                $scope.user;
                $scope.tournaments;
                $scope.users;
                $scope.data = {
                    selectedMatchDate: {},
                    selectedMatchGuests: [],
                    selectedMatchLineups: [],
                    matchDates: [],
                    tournament: {},
                    groups: [],
                    teams: [],
                    matches: [],
                    players: [],
                    matchEvents: [],
                    team: {},
                    group: {},
                    table: [],
                    consolidatedMatchEvents: []
                };

                $scope.init = function() {
                    $scope.user = userService.getAuthenticatedUser(getParameterByName('token'));
                    $scope.tournaments = tournamentService.getAll()
                        .success(function(data) {
                            console.log(data);
                            $scope.tournaments = data.result;
                            if ($scope.tournaments.length > 0) {
                                $scope.data.tournament = $scope.tournaments[0];
                                $scope.tournamentSelected();
                            }
                        }).error(function(data) {
                            console.log(data);
                        });
                    $scope.users = tournamentService.getAllUsers()
                        .success(function(data) {
                            console.log(data);
                            $scope.users = data.result;
                        }).error(function(data) {
                            console.log(data);
                        });
                }

                $scope.init();

                $scope.tournamentSelected = function() {
                    if ($scope.data.tournament) {
                        tournamentService.getData($scope.data.tournament)
                            .success(function(data) {
                                console.log(data);
                                updateArray($scope.data.teams, data.result.teams);
                                updateArray($scope.data.groups, data.result.groups);
                                updateArray($scope.data.matches, data.result.matches);
                                updateArray($scope.data.players, data.result.players);
                                updateArray($scope.data.matchEvents, data.result.matchEvents);

                                populateTeamNames($scope.data.matches, $scope.data.teams);
                                $scope.data.table.length = 0;
                                $scope.data.table.push.apply($scope.data.table,
                                    tableService.calculateTable($scope.data));
                                updateArray($scope.data.consolidatedMatchEvents,
                                    tableService.calculateStats(data.result.matchEvents, $scope.data));
                            }).error(function(data) {
                                toaster.pop('error', data.error);
                                console.log(data);
                            });
                    }
                }

                $scope.showAddGroup = function() {
                    var modalInstance = $modal.open({
                        templateUrl: 'app/admin/group/add-group-tpl.html',
                        controller: 'GroupController',
                        size: 'sm',
                        resolve: {
                            tournament: function() {
                                return $scope.data.tournament;
                            },
                            toaster: function() {
                                return toaster
                            },
                            tournamentService: function() {
                                return tournamentService;
                            }
                        }
                    });

                    modalInstance.result.then(function(group) {
                        $scope.data.groups.push(group);
                    });
                }

                $scope.showAddTeam = function() {
                    var modalInstance = $modal.open({
                        templateUrl: 'app/admin/team/add-team-tpl.html',
                        controller: 'TeamController',
                        size: 'sm',
                        resolve: {
                            tournament: function() {
                                return $scope.data.tournament;
                            },
                            toaster: function() {
                                return toaster
                            },
                            tournamentService: function() {
                                return tournamentService;
                            },
                            group: function() {
                                return $scope.data.group
                            }
                        }
                    });

                    modalInstance.result.then(function(team) {
                        $scope.data.teams.push(team);
                    });
                }

                $scope.showAddMatch = function() {
                    var modalInstance = $modal.open({
                        templateUrl: 'app/admin/match/add-match-tpl.html',
                        controller: 'MatchController',
                        size: 'sm',
                        resolve: {
                            tournament: function() {
                                return $scope.data.tournament;
                            },
                            toaster: function() {
                                return toaster
                            },
                            tournamentService: function() {
                                return tournamentService;
                            },
                            teams: function() {
                                return $scope.data.teams
                            }
                        }
                    });

                    modalInstance.result.then(function(match) {
                        $scope.data.matches.push(match);
                        populateTeamNames([match], $scope.data.teams);
                    });
                }

                $scope.showEditMatch = function(match) {
                    var modalInstance = $modal.open({
                        templateUrl: 'app/admin/match/edit-match-tpl.html',
                        controller: 'EditMatchController',
                        size: 'lg',
                        resolve: {
                            tournament: function() {
                                return $scope.data.tournament;
                            },
                            toaster: function() {
                                return toaster
                            },
                            tournamentService: function() {
                                return tournamentService;
                            },
                            match: function() {
                                return match;
                            },
                            players: function() {
                                return $scope.data.players;
                            },
                            matchEvents: function() {
                                return $scope.data.matchEvents;
                            }
                        }
                    });

                    modalInstance.result.then(function(match) {
                        //refresh it
                        $scope.init();
                    });
                }

                $scope.showAddPlayer = function() {
                    var modalInstance = $modal.open({
                        templateUrl: 'app/player/add-player-tpl.html',
                        controller: 'AddPlayerController',
                        size: 'sm',
                        resolve: {
                            tournament: function() {
                                return $scope.data.tournament;
                            },
                            toaster: function() {
                                return toaster
                            },
                            tournamentService: function() {
                                return tournamentService;
                            },
                            team: function() {
                                return $scope.data.team
                            }
                        }
                    });

                    modalInstance.result.then(function(players) {
                        $scope.data.players.push.apply($scope.data.players, players);
                    });
                }

                $scope.showAddUser = function() {
                    var modalInstance = $modal.open({
                        templateUrl: 'add-user-tpl.html',
                        controller: 'AddUserController',
                        size: 'sm',
                        resolve: {
                            toaster: function() {
                                return toaster
                            },
                            tournamentService: function() {
                                return tournamentService;
                            },
                            teams: function() {
                                return $scope.data.teams
                            }
                        }
                    });

                    modalInstance.result.then(function(user) {
                        $scope.users.push.apply($scope.users, user);
                    });
                }


                $scope.matchDateSelected = function() {
                    var matches = [];
                    $scope.data.selectedMatchGuests.length = 0;
                    $scope.data.selectedMatchLineups.length = 0;
                    for (var i=0; i < $scope.data.matches.length; i++) {
                        var match = $scope.data.matches[i];
                        if (match.status == 'Scheduled'
                            && match.dateOnly.getTime() == $scope.data.selectedMatchDate.getTime()) {
                            matches.push(match);
                        }
                    }
                    if (matches.length == 0) {
                        toaster.pop('info', 'No matches are scheduled for selected date');
                    } else {
                        tournamentService.getMatchGuestsForMatches(matches)
                            .success(function(data) {
                                for (var j=0; j < data.result.length; j++) {
                                    var guest = data.result[j];
                                    for (var k=0; k < $scope.data.teams.length; k++) {
                                        var team = $scope.data.teams[k];
                                        if (guest.teamId.objectId == team.objectId) {
                                            guest.teamName = team.name;
                                            break;
                                        }
                                    }
                                    for (var k=0; k < $scope.data.matches.length; k++) {
                                        var match = $scope.data.matches[k];
                                        if (guest.matchId.objectId == match.objectId) {
                                            guest.matchName = match.team1Name + ' Vs ' + match.team2Name;
                                            break;
                                        }
                                    }
                                    $scope.data.selectedMatchGuests.push(guest);
                                }
                            })
                            .error(function(data) {
                                toaster.pop('error', data.error);
                            });
                        tournamentService.getMatchLineupsForMatches(matches)
                            .success(function(data) {
                                for (var j=0; j < data.result.length; j++) {
                                    var lineup = data.result[j];
                                    for (var k=0; k < $scope.data.teams.length; k++) {
                                        var team = $scope.data.teams[k];
                                        if (lineup.teamId.objectId == team.objectId) {
                                            lineup.teamName = team.name;
                                            break;
                                        }
                                    }
                                    for (var k=0; k < $scope.data.matches.length; k++) {
                                        var match = $scope.data.matches[k];
                                        if (lineup.matchId.objectId == match.objectId) {
                                            lineup.matchName = match.team1Name + ' Vs ' + match.team2Name;
                                            break;
                                        }
                                    }
                                    for (var k=0; k < $scope.data.players.length; k++) {
                                        var player = $scope.data.players[k];
                                        if (lineup.playerId.objectId == player.objectId) {
                                            lineup.player = player;
                                            break;
                                        }
                                    }
                                    $scope.data.selectedMatchLineups.push(lineup);
                                }
                            })
                            .error(function(data) {
                                toaster.pop('error', data.error);
                            });
                    }
                }

                function getParameterByName(name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                        results = regex.exec(location.search);
                    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                }

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
            }])
        .controller('AddUserController',
            ['$scope', 'toaster', 'tournamentService', '$modalInstance', 'teams',
                function($scope, toaster, tournamentService, $modalInstance, teams) {
                    //All the initialization should go inside init function
                    $scope.newUser = {

                    };
                    $scope.teams = teams;

                    $scope.submitted = false;

                    $scope.submit = function(form) {
                        $scope.submitted = true;
                        if (form.$valid) {
                            tournamentService.addUser($scope.newUser)
                                .success(function(data, status) {
                                    toaster.pop('success', 'User added successfully!');
                                    $modalInstance.close(data.result);
                                })
                                .error(function(data, status) {
                                    toaster.pop('error', data.error);
                                    $modalInstance.dismiss('cancel');
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
