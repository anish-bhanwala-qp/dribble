(function(){
    angular.module('dribble')
        .service('tableService', ['$q', 'APP_CONSTANTS', 'toaster', '$timeout', '$rootScope',
            function($q, APP_CONSTANTS, toaster, $timeout, $rootScope) {

                function calculateTable(data) {
                    var table = [];
                    for (var j=0; j < data.groups.length; j++) {
                        var group = data.groups[j];
                        for (var i=0; i < data.teams.length; i++) {
                            var team = angular.copy(data.teams[i]);
                            if (team.groupId.objectId != group.objectId) {
                                continue;
                            }
                            var matchPlayed = 0;
                            var won = 0;
                            var lost = 0;
                            var draw = 0;
                            var goalFor = 0;
                            var goalAgainst = 0;
                            angular.forEach(data.matches, function(match) {
                                if (match.status == 'Over') {
                                    if (match.team1Id.objectId == team.objectId) {
                                        matchPlayed++;
                                        goalFor += match.team1Score;
                                        goalAgainst += match.team2Score;
                                        won += (match.team1Score > match.team2Score ? 1 : 0);
                                        lost += (match.team1Score < match.team2Score ? 1 : 0);
                                        draw += (match.team1Score == match.team2Score ? 1 : 0);
                                    } else if (match.team2Id.objectId == team.objectId) {
                                        matchPlayed++;
                                        goalFor += match.team2Score;
                                        goalAgainst += match.team1Score;
                                        won += (match.team2Score > match.team1Score ? 1 : 0);
                                        lost += (match.team2Score < match.team1Score ? 1 : 0);
                                        draw += (match.team2Score == match.team1Score ? 1 : 0);
                                    }
                                }
                            });

                            table.push({
                                team: team,
                                groupId: group.objectId,
                                matchPlayed: matchPlayed,
                                won: won,
                                lost: lost,
                                draw: draw,
                                goalFor: goalFor,
                                goalAgainst: goalAgainst,
                                goalDifference: (goalFor - goalAgainst),
                                points: (won*3 + draw)
                            });
                        }
                    }

                    //User team1, team2 in order to change sort order
                    table.sort(function (team2, team1) {
                        if (team1.points != team2.points) {
                            return team1.points - team2.points;
                        }
                        if (team1.goalDifference != team2.goalDifference) {
                            return team1.goalDifference - team2.goalDifference;
                        }
                        if (team1.goalFor != team2.goalFor) {
                            return team1.goalFor - team2.goalFor;
                        }
                        /*if (team1.goalAgainst != team2.goalAgainst) {
                            return team1.goalAgainst - team2.goalAgainst;
                        }*/

                        //now we need to check head to head
                        for (var i=0; i < data.matches.length; i++) {
                            var match = data.matches[i];
                            if (match.status == 'Over') {
                                if ((match.team1Id.objectId == team1.team.objectId
                                    && match.team2Id.objectId == team2.team.objectId)) {
                                    if (match.team1Score != match.team2Score) {
                                        return match.team1Score - match.team2Score;
                                    }
                                } else if (match.team1Id.objectId == team2.team.objectId
                                    && match.team2Id.objectId == team1.team.objectId) {
                                    if (match.team2Score != match.team1Score) {
                                        return match.team2Score - match.team1Score
                                    }
                                }
                            }
                        }
                        //sort by name
                        if (team1.team.name < team2.team.name) {
                            return 1;
                        } else if (team1.team.name > team2.team.name) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });


                    return table;
                }


                function calculateStats(events, data) {
                    var consolidatedEvents = [];
                    for (var i=0; i < events.length; i++) {
                        var event = events[i];

                        var eventFound;
                        var found = false;
                        for (var j=0; j < consolidatedEvents.length; j++) {
                            var consolidatedEvent = consolidatedEvents[j];
                            if (consolidatedEvent.playerId == event.playerId.objectId) {
                                eventFound = consolidatedEvent;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            eventFound = {
                                playerId: event.playerId.objectId,
                                goal: 0,
                                yellowCard: 0,
                                redCard: 0,
                                ownGoal: 0
                            }
                            consolidatedEvents.push(eventFound);
                        }

                        switch (event.type) {
                            case 'Yellow Card':
                                eventFound.yellowCard++;
                                break;
                            case 'Red Card':
                                eventFound.redCard++;
                                break;
                            case 'Goal':
                                eventFound.goal++;
                                break;
                            case 'Self Goal':
                                eventFound.ownGoal++;
                                break;
                        }
                    }

                    for (var j=0; j < consolidatedEvents.length; j++) {
                        var consolidatedEvent = consolidatedEvents[j];
                        var playerFound;
                        for (var i=0; i < data.players.length; i++) {
                            var player = data.players[i];
                            if (player.objectId == consolidatedEvent.playerId) {
                                consolidatedEvent.playerName = player.name;
                                playerFound = player;
                                break;
                            }
                        }
                        for (var i=0; i < data.teams.length; i++) {
                            var team = data.teams[i];
                            if (team.objectId == playerFound.teamId.objectId) {
                                consolidatedEvent.teamName = team.name;
                                break;
                            }
                        }
                    }

                    return consolidatedEvents;
                }

                return {
                    calculateTable: calculateTable,
                    calculateStats: calculateStats
                };
            }]);
})();
