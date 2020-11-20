const Trabajo = artifacts.require( 'Trabajo' );

module.exports = function( deployer ) {
  deployer.deploy( Trabajo );
};
