(function(){
    angular.module('dribble', ['dribble.utility', 'toaster', 'cgBusy', 'ui.router', 'ngRoute'])
        .config(function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/myTeam');
            $stateProvider
                .state('myTeam', {
                    url: '/myTeam',
                    templateUrl: 'my-team-tpl.html'
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
        .controller('MainController',
            ['$scope', 'userService', 'tournamentService', 'toaster', '$modal', 'tableService', '$timeout',
                function($scope, userService, tournamentService, toaster, $modal, tableService, $timeout) {
                    $scope.user;
                    $scope.guestError = false;
                    $scope.data = {
                        eventType: 'Goals',
                        matchFilter: 'Scheduled',
                        matchDates: [],
                        tournament: {},
                        groups: [],
                        teams: [],
                        matches: [],
                        players: [],
                        consolidatedMatchEvents: [],
                        myTeam: {},
                        myPlayers: [],
                        group: {},
                        table: [],
                        match: {},
                        myLineups: [],
                        myGuests: [],
                        selectedMatchLineup: [],
                        selectedMatchGuest: [],
                        editMatchLineup: [],
                        editMatchGuest: [],
                        editLineup: false,
                        editGuest: false
                    };

                    $scope.init = function() {
                        $scope.user = userService.getAuthenticatedUser(getParameterByName('token'));
                        tournamentService.getAll()
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
                    }

                    $scope.init();

                    $scope.tournamentSelected = function() {
                        if ($scope.data.tournament) {
                            tournamentService.getData($scope.data.tournament)
                                .success(function(data) {
                                    updateArray($scope.data.teams, data.result.teams);
                                    updateArray($scope.data.groups, data.result.groups);
                                    updateArray($scope.data.matches, data.result.matches);
                                    updateArray($scope.data.players, data.result.players);

                                    populateTeamNames($scope.data.matches, $scope.data.teams);

                                    $scope.data.myTeam = getUserTeam($scope.user, $scope.data.teams);
                                    updateArray($scope.data.myPlayers,
                                        getTeamPlayers($scope.user.teamId.objectId, data.result.players))
                                    $scope.data.table.length = 0;
                                    $scope.data.table.push.apply($scope.data.table,
                                        tableService.calculateTable($scope.data));
                                    updateArray($scope.data.consolidatedMatchEvents,
                                        tableService.calculateStats(data.result.matchEvents, $scope.data));

                                    getMatchLineups(false);
                                    getMatchGuests(false);
                                    populateMatchEventsPlayerNames(data.result.matchEvents, data.result.players);
                                    populateMatchEvents($scope.data.matches, data.result.matchEvents);
                                }).error(function(data) {
                                    toaster.pop('error', data.error);
                                    console.log(data);
                                });
                        }
                    }

                    function getMatchLineups(isMatchSelected) {
                        tournamentService.getAllMatchLineup($scope.data.myTeam)
                            .success(function(data) {
                                updateArray($scope.data.myLineups, data.result);
                                if (isMatchSelected) {
                                    $scope.matchSelected();
                                }
                            })
                            .error(function(data) {
                                toaster.pop('error', data.error);
                            });
                    }

                    function getMatchGuests(isMatchSelected) {
                        $scope.data.myGuests.length = 0;
                        tournamentService.getAllMatchGuests($scope.data.myTeam)
                            .success(function(data) {
                                updateArray($scope.data.myGuests, data.result);
                                if (isMatchSelected) {
                                    $scope.matchSelected();
                                }
                            })
                            .error(function(data) {
                                toaster.pop('error', data.error);
                            });
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

                    function getUserTeam(user, teams) {
                        for (var i=0; i < teams.length; i++) {
                            if (teams[i].objectId == user.teamId.objectId) {
                                return teams[i];
                            }
                        }
                    }

                    function getTeamPlayers(teamId, players) {
                        var selectedPlayers = [];
                        angular.forEach(players, function(player) {
                            if (player.teamId.objectId == teamId) {
                                selectedPlayers.push(player);
                            }
                        });
                        return selectedPlayers;
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

                    $scope.matchSelected = function() {
                        if ($scope.data.match) {
                            $scope.data.selectedMatchLineup.length = 0;
                            angular.forEach($scope.data.myLineups, function(lineup) {
                                if (lineup.matchId.objectId == $scope.data.match.objectId) {
                                    angular.forEach($scope.data.myPlayers, function(player) {
                                        if (lineup.playerId.objectId == player.objectId) {
                                            $scope.data.selectedMatchLineup.push(player);
                                        }
                                    });
                                }
                            });

                            $scope.data.selectedMatchGuest.length = 0;
                            for (var i=0; i < $scope.data.myGuests.length; i++) {
                                var guest = $scope.data.myGuests[i];
                                if (guest.matchId.objectId == $scope.data.match.objectId) {
                                    $scope.data.selectedMatchGuest.push(guest);
                                }
                            }
                        } else {
                            $scope.data.selectedMatchLineup.length = 0;
                        }
                    }

                    $scope.editMatchLineup = function() {
                        $scope.data.editMatchLineup.length = 0;
                        $scope.data.editMatchLineup.push.apply($scope.data.editMatchLineup,
                            $scope.data.selectedMatchLineup);
                    }

                    $scope.editMatchGuest = function() {
                        $scope.data.editMatchGuest.length = 0;
                        for (var i=0; i < $scope.data.selectedMatchGuest.length; i++) {
                            var tempGuest = $scope.data.selectedMatchGuest[i];
                            $scope.data.editMatchGuest.push(tempGuest.name +
                                ',' + tempGuest.phone + ',' + (tempGuest.email || ''));
                        }
                    }


                    $scope.submit = function(form) {
                        $scope.data.editLineup = false;
                        var deletedMatchLineups = [];
                        for (var i=0; i < $scope.data.selectedMatchLineup.length; i++) {
                            var alreadySelectedPlayer = $scope.data.selectedMatchLineup[i];
                            var found = false;
                            for (var j=0; j < $scope.data.editMatchLineup.length; j++) {
                                var playerTemp = $scope.data.editMatchLineup[j];
                                if (playerTemp.objectId == alreadySelectedPlayer.objectId) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                for (var k=0; k < $scope.data.myLineups.length; k++) {
                                    var lineup = $scope.data.myLineups[k];
                                    if (lineup.matchId.objectId == $scope.data.match.objectId
                                        && lineup.playerId.objectId == alreadySelectedPlayer.objectId) {
                                        deletedMatchLineups.push(lineup);
                                        break;
                                    }
                                }
                            }
                        }

                        var newPlayers = [];
                        for (var i=0; i < $scope.data.editMatchLineup.length; i++) {
                            var  playerTemp = $scope.data.editMatchLineup[i];
                            var found = false;
                            for (var j=0; j < $scope.data.selectedMatchLineup.length; j++) {
                                var alreadySelectedPlayer = $scope.data.selectedMatchLineup[j];
                                if (playerTemp.objectId == alreadySelectedPlayer.objectId) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                newPlayers.push(playerTemp);
                            }
                        }

                        toaster.pop('info', 'Updating Match Lineup');
                        if (deletedMatchLineups.length > 0) {
                            tournamentService.deletePlayerFromMatchLineup(deletedMatchLineups)
                                .success(function(data, status) {
                                    if (newPlayers.length > 0) {
                                        tournamentService.addPlayerToMatchLineup($scope.data.myTeam,
                                                $scope.data.match, newPlayers)
                                            .success(function(data, status) {
                                                toaster.pop('success', 'MatchLineup updated successfully');
                                                $timeout(function() {
                                                    getMatchLineups(true);
                                                }, 500);
                                            })
                                            .error(function(data, status) {
                                                toaster.pop('error', data.error);
                                            });
                                    } else {
                                        toaster.pop('success', 'MatchLineup updated successfully');
                                        $timeout(function() {
                                            getMatchLineups(true);
                                        }, 500);
                                    }
                                })
                                .error(function(data, status) {
                                    toaster.pop('error', data.error);
                                });
                        } else if (newPlayers.length > 0) {
                            tournamentService.addPlayerToMatchLineup($scope.data.myTeam,
                                    $scope.data.match, newPlayers)
                                .success(function(data, status) {
                                    toaster.pop('success', 'MatchLineup updated successfully');
                                    $timeout(function() {
                                        getMatchLineups(true);
                                    }, 500);
                                })
                                .error(function(data, status) {
                                    toaster.pop('error', data.error);
                                });
                        }
                    };

                    $scope.submitGuest = function(form) {
                        var guests = csvToJSON($scope.data.editMatchGuest);
                        if (guests.length == 0) {
                            toaster.pop('error', 'Please enter at least one guest');
                            return;
                        }

                        for (var i=0; i < guests.length; i++) {
                            var guestTemp = guests[i];
                            var name = guestTemp.name.toUpperCase();
                            if (guestTemp.name && guestTemp.phone) {
                                for (var j=0; j < guests.length; j++) {
                                    var otherName = guests[j].name.toUpperCase();
                                    if (i != j && name == otherName) {
                                        toaster.pop('error', 'Duplicate names are not allowed');
                                        return;
                                    }
                                }
                            } else {
                                toaster.pop('error', 'Name/Phone missing at row ' + (i + 1));
                                return;
                            }
                        }

                        $scope.data.editGuest = false;
                        var deletedGuests = [];
                        for (var i=0; i < $scope.data.selectedMatchGuest.length; i++) {
                            var alreadySelectedGuest = $scope.data.selectedMatchGuest[i];
                            var found = false;
                            for (var j=0; j < guests.length; j++) {
                                var guestTemp = guests[j];
                                if (guestTemp.name.toUpperCase() == alreadySelectedGuest.name.toUpperCase()) {
                                    if (guestTemp.phone != alreadySelectedGuest.phone ||
                                        guestTemp.email != alreadySelectedGuest.email) {
                                        found = false;
                                        break;
                                    }
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                for (var j=0; j < $scope.data.selectedMatchGuest.length; j++) {
                                    var guestTemp = $scope.data.selectedMatchGuest[j];
                                    if (guestTemp.name.toUpperCase() == alreadySelectedGuest.name.toUpperCase()) {
                                        deletedGuests.push(guestTemp)
                                        break;
                                    }
                                }
                            }
                        }

                        var newGuests = [];
                        for (var i=0; i < guests.length; i++) {
                            var  guestTemp = guests[i];
                            var found = false;
                            for (var j=0; j < $scope.data.selectedMatchGuest.length; j++) {
                                var alreadySelectedGuest = $scope.data.selectedMatchGuest[j];
                                if (guestTemp.name.toUpperCase() == alreadySelectedGuest.name.toUpperCase()) {
                                    if (guestTemp.phone != alreadySelectedGuest.phone ||
                                        guestTemp.email != alreadySelectedGuest.email) {
                                        found = false;
                                        break;
                                    }
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                newGuests.push(guestTemp);
                            }
                        }

                        $scope.data.editMatchGuest.length = 0;
                        toaster.pop('info', 'Updating Guests');
                        if (deletedGuests.length > 0) {
                            tournamentService.deleteGuests(deletedGuests)
                                .success(function(data, status) {
                                    if (newGuests.length > 0) {
                                        tournamentService.addGuests($scope.data.myTeam,
                                                $scope.data.match, newGuests)
                                            .success(function(data, status) {
                                                toaster.pop('success', 'Guests updated successfully');
                                                $timeout(function() {
                                                    getMatchGuests(true);
                                                }, 500);
                                            })
                                            .error(function(data, status) {
                                                toaster.pop('error', data.error);
                                            });
                                    } else {
                                        toaster.pop('success', 'Guests updated successfully');
                                        $timeout(function() {
                                            getMatchGuests(true);
                                        }, 500);
                                    }
                                })
                                .error(function(data, status) {
                                    toaster.pop('error', data.error);
                                });
                        } else if (newGuests.length > 0) {
                            tournamentService.addGuests($scope.data.myTeam,
                                    $scope.data.match, newGuests)
                                .success(function(data, status) {
                                    toaster.pop('success', 'Guests updated successfully');
                                    $timeout(function() {
                                        getMatchGuests(true);
                                    }, 500);
                                })
                                .error(function(data, status) {
                                    toaster.pop('error', data.error);
                                });
                        }
                    };

                    $scope.showAddMyPlayer = function() {
                        var modalInstance = $modal.open({
                            templateUrl: 'add-my-player-tpl.html',
                            controller: 'AddMyPlayerController',
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
                                    return $scope.data.myTeam;
                                },
                                myPlayers: function() {
                                    return $scope.data.myPlayers;
                                }
                            }
                        });

                        modalInstance.result.then(function(player) {
                            $scope.data.players.push(player);
                            $scope.data.myPlayers.push(player);
                        });
                    };

                    function csvToJSON(lines){
                        var result = [];
                        var headers = ['name', 'phone', 'email'];

                        for (var i=0; i < lines.length; i++) {
                            var obj = {};
                            var currentLine = lines[i].split(",");

                            for(var j=0; j <headers.length; j++){
                                var val = currentLine[j] ? currentLine[j].trim() : currentLine[j];
                                if (j == 1) {
                                    obj[headers[j]] = (val ? parseInt(val) : 0);
                                } else {
                                    obj[headers[j]] = val;
                                }
                            }
                            result.push(obj);
                        }
                        return result;
                    }
                }])
        .controller('AddMyPlayerController',
            ['$scope', 'toaster', 'tournamentService', '$modalInstance', 'tournament', 'team', 'myPlayers',
                function($scope, toaster, tournamentService, $modalInstance, tournament, team, myPlayers) {
                    //All the initialization should go inside init function
                    $scope.data = {
                        player: {}
                    };
                    $scope.submitted = false;

                    $scope.submitAddMyPlayer = function(form) {
                        $scope.submitted = true;
                        for (var i=0; i < myPlayers.length; i++) {
                            var tempPlayer = myPlayers[i];
                            if (tempPlayer.name.toUpperCase() == $scope.data.player.name.toUpperCase()) {
                                toaster.pop('error', 'Player with same name already exists');
                                return;
                            }
                            if (tempPlayer.email.toUpperCase() == $scope.data.player.email.toUpperCase()) {
                                toaster.pop('error', 'Player with same email already exists');
                                return;
                            }
                        }
                        if (form.$valid) {
                            tournamentService.addPlayer(tournament, team, $scope.data.player)
                                .success(function(data) {
                                    toaster.pop('success', 'Player added successfully!');
                                    $modalInstance.close(data.result);
                                })
                                .error(function(data) {
                                    toaster.pop('error', data.error);
                                    $modalInstance.dismiss('cancel');
                                });
                        } else {
                            toaster.pop('info', 'Please make sure all values are filled properly');
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

