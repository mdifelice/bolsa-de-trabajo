const BolsaDeTrabajo = artifacts.require( 'BolsaDeTrabajo' ),
      Prueba = artifacts.require( 'Prueba' );

module.exports = function( deployer ) {
  deployer.deploy( BolsaDeTrabajo );
  deployer.deploy( Prueba );
};
