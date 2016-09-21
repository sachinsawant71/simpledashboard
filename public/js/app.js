'use strict';

angular
  .module('yapp', [
    'angular.morris','angularMoment'
  ])
  .service( 'deepstream', function() {
    var client = deepstream();
		client.login( {}, function( success, errorEvent, errorMessage ) {
			console.log( 'Logged in to deepstream' );
		});
    return client;
})
