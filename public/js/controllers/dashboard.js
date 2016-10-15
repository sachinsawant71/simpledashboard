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

                $scope.deviceCurrentInfo = [];

                for (var property in eventData) {
                    if (eventData.hasOwnProperty(property)) {
                        var eventItem = eventData[property];
                        var arrayLength =  eventItem.voltageReading.length;

                        var deviceInfo = {
                            deviceName : property,
                            voltageReading : eventItem.voltageReading[arrayLength - 1],
                            temperatureReading : eventItem.temperatureReading[arrayLength - 1],
                            analog3Reading : eventItem.analog3Reading[arrayLength - 1],
                            digital1Reading : eventItem.digital1Reading[arrayLength - 1],
                            digital2Reading : eventItem.digital2Reading[arrayLength - 1],
                            digital3Reading : eventItem.digital3Reading[arrayLength - 1]
                        }
                        $scope.deviceCurrentInfo.push(deviceInfo);
                    }
                }                

                var temperatureArray = [];
                var voltageArray = [];

                for (var i=0; i < 7; i++) {

                    var temparatureData = {
                        "y" : i + 1
                    } 

                    var voltageData = {
                        "y" : i + 1
                    }

                    for (var property in eventData) {
                        if (eventData.hasOwnProperty(property)) {
                            var eventItem = eventData[property];
                            var itemvoltageValue = eventItem.voltageReading[i];
                            var itemTempValue = eventItem.temperatureReading[i];
                            temparatureData[eventItem.serviceId] =  itemTempValue;
                            voltageData[eventItem.serviceId] =  itemvoltageValue;
                        }
                    }

                    temperatureArray.push(temparatureData);
                    voltageArray.push(voltageData);
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

                $scope.chart1Data =  voltageArray;
                $scope.chart2Data =  temperatureArray

                if( !$scope.$$phase ) {
                    $scope.$apply(function() {
                        $scope.chart1Data =  voltageArray;
                        $scope.chart2Data =  temperatureArray
                    });
                }

      }); 


  });
