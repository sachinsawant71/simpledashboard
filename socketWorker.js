var ortcNodeclient = require('ibtrealtimesjnode').IbtRealTimeSJNode;
var randomInt = require('random-int');
 
// Create Messaging client
var ortcClient = new ortcNodeclient();
var clientChannel = null;

var getDataSampleForDevice = function(deviceName) {
    var dataSample = {
        deviceName : deviceName,
        temperature : randomInt(10,100),
        energyConsumption : randomInt(40,140)
    }
    return dataSample;
}
 
// Set Messaging client properties
ortcClient.setConnectionMetadata('clientConnMeta');
ortcClient.setClusterUrl('http://ortc-developers.realtime.co/server/2.1/');
 
ortcClient.onConnected = function (ortc) {
    // Messaging client is connected
 
    ortcClient.subscribe('mychat', true,
        function (ortc, channel, message) {
            //console.log('Client connected to realtime.co');
    });
};
 
ortcClient.onSubscribed = function (ortc, channel) {
    clientChannel = channel;
};
 
ortcClient.connect('bN2HN1', 'myAuthenticationToken');

module.exports = {
     sendMessage : function(data) {
         ortcClient.send(clientChannel,data);
     }
}

