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

var processEventData = function(eventData) {

    var objectArr = Object.keys(eventData);
    var deviceName = objectArr[0];

    var deviceEventData = deviceData[deviceName];
    //if device is not in the list 
    if (!deviceEventData) {
        deviceData[deviceName] = {
               voltageReading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ]),
               temperatureReading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ]),
               analog3Reading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ]),
               digital1Reading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ]),
               digital2Reading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ]),
               digital3Reading : new FifoArray(7,[ 0, 0, 0, 0, 0, 0, 0 ])                              
        }        
        var serverInfo = ds.record.getRecord('serverInfo');
        var totalConnectedDevices = serverInfo.get('totalConnectedDevices');
        serverInfo.set('totalConnectedDevices', totalConnectedDevices + 1);

        deviceData[deviceName].serviceId = alphabetTrain.charAt(totalConnectedDevices);
        deviceData[deviceName].serviceName = deviceName;
    }

    var eventReadingData = eventData[deviceName];

    deviceData[deviceName].voltageReading.push(eventReadingData.Ana1);
    deviceData[deviceName].temperatureReading.push(eventReadingData.Ana2);
    deviceData[deviceName].analog3Reading.push(eventReadingData.Ana3);
    deviceData[deviceName].digital1Reading.push(eventReadingData.IP1);
    deviceData[deviceName].digital2Reading.push(eventReadingData.IP2);
    deviceData[deviceName].digital3Reading.push(eventReadingData.IP3);

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


