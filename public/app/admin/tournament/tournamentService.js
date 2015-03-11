(function(){
    angular.module('dribble')
        .service('tournamentService', ['$http', 'userService', 'APP_CONSTANTS', '$rootScope',
            function($http, userService, APP_CONSTANTS, $rootScope) {
                function getAll() {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/tournaments',
                        data: {},
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    })
                    return $rootScope.myPromise;
                }

                function getData(tournament) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/adminTournamentDetails',
                        data: {
                            tournamentId: tournament.objectId
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function addGroup(tournament, groupName) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addGroup',
                        data: {
                            tournamentId: tournament.objectId,
                            name: groupName
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function addTeam(tournament, group, teamName) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addTeam',
                        data: {
                            tournamentId: tournament.objectId,
                            groupId: group.objectId,
                            name: teamName
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function addMatch(tournament, team1, team2, dateTime, stage, status) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addMatch',
                        data: {
                            tournamentId: tournament.objectId,
                            team1Id: team1.objectId,
                            team2Id: team2.objectId,
                            matchDateTime: dateTime,
                            stage: stage,
                            status: status
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function editMatch(objectId, team1Score, team2Score, dateTime, stage, status) {
                    return $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/editMatch',
                        data: {
                            objectId: objectId,
                            team1Score: team1Score,
                            team2Score: team2Score,
                            matchDateTime: dateTime,
                            stage: stage,
                            status: status
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                }

                function addUpdateMatchEvent(tournament, match, event, player) {
                    return $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addUpdateMatchEvent',
                        data: {
                            tournamentId: tournament.objectId,
                            matchId: match.objectId,
                            matchEvent: {
                                objectId: event.objectId,
                                time: event.time,
                                type: event.type
                            },
                            playerId: player.objectId
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                }

                function addPlayer(tournament, team, players) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addPlayers',
                        data: {
                            tournamentId: tournament.objectId,
                            teamId: team.objectId,
                            players: players
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

		function getAllUsers() {
                    $rootScope.myPromise = $http({
			    method: "post",
			    url: APP_CONSTANTS.apiUrl + 'functions/users',
			    data: {},
			    headers: {
				'X-Parse-Session-Token' : userService.token()
			    }
			})
			return $rootScope.myPromise;
                }

                function addUser(user) {
                    $rootScope.myPromise = $http({
			    method: "post",
			    url: APP_CONSTANTS.apiUrl + 'functions/addUser',
			    data: {
				teamId: user.team.objectId,
				username: user.username,
				email: user.email,
				password: user.password
			    },
			    headers: {
				'X-Parse-Session-Token' : userService.token()
			    }
			});
                    return $rootScope.myPromise;
                }

                // Return public API.
                return {
                    getAll: getAll,
                    getData: getData,
                    addGroup: addGroup,
                    addTeam: addTeam,
                    addMatch: addMatch,
                    editMatch: editMatch,
                    addPlayer: addPlayer,
			addUpdateMatchEvent: addUpdateMatchEvent,
			getAllUsers: getAllUsers,
			addUser: addUser
                };
            }]);
})();
