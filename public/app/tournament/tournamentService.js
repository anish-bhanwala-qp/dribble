(function(){
    angular.module('dribble')
        .service('tournamentService', ['$http', 'userService', 'APP_CONSTANTS', '$rootScope',
            function($http, userService, APP_CONSTANTS, $rootScope) {
                function getAll() {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/tournaments',
                        data: {}
                    })
                    return $rootScope.myPromise;
                }

                function getData(tournament) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/tournamentDetails',
                        data: {
                            tournamentId: tournament.objectId
                        }
                    });
                    return $rootScope.myPromise;
                }

                function getAllMatchLineup(team) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/matchLineupsForTeam',
                        data: {
                            teamId: team.objectId
                        }
                    });
                    return $rootScope.myPromise;
                }

                function getAllMatchGuests(team) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/matchGuests',
                        data: {
                            teamId: team.objectId
                        }
                    });
                    return $rootScope.myPromise;
                }

                function addPlayerToMatchLineup(team, match, players) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addPlayerToMatchLineup',
                        data: {
                            team: team,
                            match: match,
                            selectedPlayers: players
                        } ,
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function deletePlayerFromMatchLineup(deletedMatchLineups) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/deletePlayerFromMatchLineup',
                        data: {
                            deletedMatchLineups: deletedMatchLineups
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function addGuests(team, match, guests) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addGuests',
                        data: {
                            team: team,
                            match: match,
                            guests: guests
                        } ,
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function deleteGuests(guests) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/deleteGuests',
                        data: {
                            guests: guests
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                function addPlayer(tournament, team, player) {
                    $rootScope.myPromise = $http({
                        method: "post",
                        url: APP_CONSTANTS.apiUrl + 'functions/addPlayer',
                        data: {
                            tournamentId: tournament.objectId,
                            teamId: team.objectId,
                            player: player
                        },
                        headers: {
                            'X-Parse-Session-Token' : userService.token()
                        }
                    });
                    return $rootScope.myPromise;
                }

                return {
                    getAll: getAll,
                    getData: getData,
                    getAllMatchLineup: getAllMatchLineup,
                    addPlayerToMatchLineup: addPlayerToMatchLineup,
                    deletePlayerFromMatchLineup: deletePlayerFromMatchLineup,
                    getAllMatchGuests: getAllMatchGuests,
                    addGuests: addGuests,
                    deleteGuests: deleteGuests,
                    addPlayer: addPlayer
                };
            }]);
})();
