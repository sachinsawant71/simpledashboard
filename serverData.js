var ortcNodeclient = require('ibtrealtimesjnode').IbtRealTimeSJNode;
var deepstream = require( 'deepstream.io-client-js' );
var randomInt = require('random-int');
var FifoArray = require('fifo-array');

var alphabetTrain = "abcdefghijklmnopqrstuvwxyz";

var serverStartDateTime = new Date();

var deviceData = {}

// Create Messaging client
var ortcClient = new ortcNodeclient();
 
// Set Messaging client properties
ortcClient.setConnectionMetadata('clientConnMeta');
ortcClient.setClusterUrl('http://ortc-developers.realtime.co/server/2.1/');

var ds = null;

var getDataSampleForDevice = function(deviceName) {
    var dataSample = {
        deviceName : deviceName,
        temperature : randomInt(10,100),
        energyConsumption : randomInt(40,140)
    }
    return dataSample;
}

var processEventData = function(eventData) {
    var deviceName = eventData.deviceName;
    var deviceEventData = deviceData[deviceName];

    //if device is not in the list 
    if (!deviceEventData) {
        deviceData[deviceName] = {
               analogReading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ]),
               digitalReading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ])
        }        
        var serverInfo = ds.record.getRecord('serverInfo');
        var totalConnectedDevices = serverInfo.get('totalConnectedDevices');
        serverInfo.set('totalConnectedDevices', totalConnectedDevices + 1);  
        deviceData[deviceName].serviceId = alphabetTrain.charAt(totalConnectedDevices);
        deviceData[deviceName].serviceName = deviceName;
    }

    deviceData[deviceName].analogReading.push(eventData.analogReading);
    deviceData[deviceName].digitalReading.push(eventData.digitalFlag);


    //set server event data
    var serverEventData = ds.record.getRecord('serverEventData');
    serverEventData.set(deviceData);     

    var serverInfo = ds.record.getRecord('serverInfo');
    var totalEvents = serverInfo.get('totalEventsCaptured');
    serverInfo.set('totalEventsCaptured', totalEvents + 1);      
}

var generateEventData = function() {

        ortcClient.onConnected = function (ortc) {
            // Messaging client is connected
        
            ortcClient.subscribe('mychat', true,
                function (ortc, channel, message) {
                    processEventData(JSON.parse(message));
            });
        };
      
        ortcClient.connect('bN2HN1', 'myAuthenticationToken');        

}

var init = function() {
	ds = deepstream( 'localhost:6021' );
	ds.login( {}, function() {

        //set server information data 
        var serverInfo = ds.record.getRecord('serverInfo');
        serverInfo.set( {
            startDateTime : serverStartDateTime,
            totalConnectedDevices : 0,
            totalEventsCaptured : 0
        });

        //set initial server event data
        var serverEventData = ds.record.getRecord('serverEventData');
        serverEventData.set(deviceData);        

        generateEventData();

	});

	ds.on( 'error', function() {
		console.log( 'error', arguments )
	});
}

module.exports = {
      init : init
}


