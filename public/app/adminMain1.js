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
			    templateUrl: '/app/match/matches-tpl.html'
			    })
                .state('table', {
			url: '/table',
			    templateUrl: '/app/table/table-tpl.html'
			    })
                .state('stats', {
			url: '/stats',
			    templateUrl: '/app/stats/stats-tpl.html'
			    });
	    })
        .controller('MainController', ['$scope', 'userService', 'tournamentService', 'toaster', '$modal', 'tableService',
				       function($scope, userService, tournamentService, toaster, $modal, tableService) {
			    $scope.user;
			    $scope.tournaments;
			    $scope.data = {
				tournament: {},
				groups: [],
				teams: [],
				matches: [],
				players: [],
				team: {},
				group: {},
				table: []
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
			    }

			    $scope.init();

			    $scope.tournamentSelected = function() {
				if ($scope.data.tournament) {
				    tournamentService.getData($scope.data.tournament)
				    .success(function(data) {
					    console.log(data);
					    if ($scope.data.groups) {
						$scope.data.groups.length = 0;
					    }
					    if ($scope.data.teams) {
						$scope.data.teams.length = 0;
					    }
					    if ($scope.data.matches) {
						$scope.data.matches.length = 0;
					    }
					    if ($scope.data.players) {
						$scope.data.players.length = 0;
					    }

					    $scope.data.groups.push.apply($scope.data.groups, data.result.groups);
					    $scope.data.teams.push.apply($scope.data.teams, data.result.teams);
					    $scope.data.matches.push.apply($scope.data.matches, data.result.matches);
					    $scope.data.players.push.apply($scope.data.players, data.result.players);
					    populateTeamNames($scope.data.matches, $scope.data.teams);
					    $scope.data.table.push.apply($scope.data.table,
									 tableService.calculateTable($scope.data));
					}).error(function(data) {
						toaster.pop('error', data.error);
						console.log(data);
					    });
				}
			    }

			    $scope.showAddGroup = function() {
				var modalInstance = $modal.open({
					templateUrl: '/app/admin/group/add-group-tpl.html',
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
					templateUrl: '/app/admin/team/add-team-tpl.html',
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
					templateUrl: '/app/admin/match/add-match-tpl.html',
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
					templateUrl: '/app/admin/match/edit-match-tpl.html',
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
					    }
					}
				    });

				modalInstance.result.then(function(match) {
					for (var i=0; i < $scope.data.matches.length; i++) {
					    if ($scope.data.matches[i].objectId == match.objectId) {
						$scope.data.matches[i] = match;
						populateTeamNames([match], $scope.data.teams);
						break;
					    }
					}
				    });
			    }

			    $scope.showAddPlayer = function() {
				var modalInstance = $modal.open({
					templateUrl: '/app/player/add-player-tpl.html',
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

			    function getParameterByName(name) {
				name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
				var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				    results = regex.exec(location.search);
				return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
			    }

			    function populateTeamNames(matches, teams) {
				angular.forEach(matches, function(match) {
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