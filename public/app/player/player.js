(function(){
    angular.module('dribble')
        .controller('AddPlayerController',
            ['$scope', 'toaster', 'tournamentService', '$modalInstance', 'tournament', 'team',
                function($scope, toaster, tournamentService, $modalInstance, tournament, team) {
                    //All the initialization should go inside init function
                    $scope.data = {
                        players:''
                    };
                    $scope.submitted = false;

                    $scope.submit = function(form) {
                        $scope.submitted = true;
                        if (form.$valid && $scope.data.players.length > 0) {
                            var players = csvToJSON($scope.data.players);
                            players = removeDuplicates(players);
                            if (players.length > 0) {
                                tournamentService.addPlayer(tournament, team, players)
                                    .success(function(data, status) {
                                        toaster.pop('info', 'Adding Players, refresh page to view added players.');
                                        $modalInstance.close(data.result);
                                    })
                                    .error(function(data, status) {
                                        toaster.pop('error', data.error);
                                        $modalInstance.dismiss('cancel');
                                    });
                            } else {
                                $modalInstance.dismiss('cancel');
                            }
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

                    function removeDuplicates(players) {
                        var selectedPlayers = [];
                        for (var i=0; i < players.length; i++) {
                            var player = players[i];
                            var found = false;
                            for (var j=0; j < selectedPlayers.length; j++) {
                                if (selectedPlayers[j].name == player.name) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                selectedPlayers.push(player);
                            }
                        }
                        return selectedPlayers;
                    }

                    function csvToJSON(csv){
                        var lines = csv.split("\n");
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
                }]);
})();