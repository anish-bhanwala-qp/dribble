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


			     return table;
			 }
			 return {
			     calculateTable: calculateTable
				 };
		     }]);
})();
