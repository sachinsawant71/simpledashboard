'use strict';
angular.module('yapp')
  .controller('DashboardCtrl', function($scope,deepstream,$window) {

    var colorArray = ['#0b62a4', '#7a92a3', '#4da74d', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'];

    $scope.serverInfo = {
        serverStartDate : new Date(),
        connectedDevices : 0,
        totalExceptions : 0,
        eventsReceived : 0
    }

    var serverInfo = deepstream.record.getRecord('serverInfo');
    
    serverInfo.whenReady(function(){
        $scope.serverInfo.serverStartDate = serverInfo.get('startDateTime');
        $scope.serverInfo.connectedDevices = serverInfo.get('totalConnectedDevices');
        $scope.serverInfo.eventsReceived = serverInfo.get('totalEventsCaptured');
        if( !$scope.$$phase ) {
            $scope.$apply();
        }
    });

    $scope.xLabelFormat = function(x) {
        return x + "";
     }
      
      $scope.dateFormat = function(x) {
        return x + "";
      }

    serverInfo.subscribe('totalConnectedDevices',function(){
        $scope.serverInfo.connectedDevices = serverInfo.get('totalConnectedDevices');
        //$window.location.reload();
        if( !$scope.$$phase ) {
            $scope.$apply();
        }
    });   

    serverInfo.subscribe('totalEventsCaptured',function(){
        $scope.serverInfo.eventsReceived = serverInfo.get('totalEventsCaptured');
        if( !$scope.$$phase ) {
            $scope.$apply();
        }
    });       

    var serverEventData = deepstream.record.getRecord('serverEventData');
    
    serverEventData.subscribe(function() {
                var eventData = serverEventData.get();

                var temperatureArray = [];
                var energyArray = [];

                for (var i=0; i < 7; i++) {

                    var temparatureData = {
                        "y" : i + 1
                    } 

                    var energyData = {
                        "y" : i + 1
                    }

                    for (var property in eventData) {
                        if (eventData.hasOwnProperty(property)) {
                            var eventItem = eventData[property];
                            var itemEnergyValue = eventItem.energyReading[i];
                            var itemTempValue = eventItem.temperatureReading[i];
                            temparatureData[eventItem.serviceId] =  itemTempValue;
                            energyData[eventItem.serviceId] =  itemEnergyValue;
                        }
                    }

                    temperatureArray.push(temparatureData);
                    energyArray.push(energyData);
                }

                var lineYKeys = [];
                var lineLabels = [];
                var lineColors = [];

                var itemIndex = 0;
                for (var property in eventData) {
                    if (eventData.hasOwnProperty(property)) {
                        var eventItem = eventData[property];
                        lineYKeys.push(eventItem.serviceId);
                        lineLabels.push(property);
                        lineColors.push(colorArray[itemIndex++]);
                    }
                }

                //set total lines in the graph
                if (!$scope.totalGraphItems) {
                    $scope.totalGraphItems = itemIndex;
                }else {
                    //this is true only when newly added device starts emmiting values
                    if ($scope.totalGraphItems < itemIndex) {
                         $scope.totalGraphItems = itemIndex;
                         $scope.newDeviceAdded = true;
                         $window.location.reload();
                    }
                }

                $scope.lineYKeys = lineYKeys;
                $scope.lineLabels = lineLabels;
                $scope.lineColors = lineColors;

                $scope.chart1Data =  temperatureArray;
                $scope.chart2Data =  energyArray;

                if( !$scope.$$phase ) {
                    $scope.$apply(function() {
                        $scope.chart1Data =  temperatureArray;
                        $scope.chart2Data =  energyArray;
                    });
                }

      }); 


  });
