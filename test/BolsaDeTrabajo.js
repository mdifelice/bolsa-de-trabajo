const BolsaDeTrabajo = artifacts.require( './BolsaDeTrabajo.sol' );

contract( 'BolsaDeTrabajo', accounts => {
  it( 'Debería guardar dirección de prueba.', async () => {
    const bolsaDeTrabajo  = await BolsaDeTrabajo.deployed(),
          direccionPrueba = Math.random();
    
    await bolsaDeTrabajo.ponerDireccionPrueba( direccionPrueba );

    assert.equal( direccionPrueba, await bolsaDeTrabajo.direccionPrueba.call(), 'La dirección de prueba no fue guardada.' );
  } );

  it( 'Debería crear un trabajo.', async () => {
    const bolsaDeTrabajo  = await BolsaDeTrabajo.deployed(),
          descripcion     = 'Trabajo de prueba',
          trabajo         = await bolsaDeTrabajo.crearTrabajo( descripcion );
    
    assert.equal( trabajo.descripcion, descripcion, 'La descripción del trabajo no coincide.' );
  } );
} );
