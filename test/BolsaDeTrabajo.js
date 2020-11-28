const BolsaDeTrabajo = artifacts.require( './BolsaDeTrabajo.sol' ),
      Trabajo = artifacts.require( './Trabajo.sol' );

contract( 'BolsaDeTrabajo', accounts => {
  it( 'Debería guardar dirección de prueba.', async () => {
    const bolsaDeTrabajo  = await BolsaDeTrabajo.deployed(),
          direccionPrueba = accounts[ Math.floor( Math.random() * accounts.length ) ];
    
    await bolsaDeTrabajo.ponerDireccionPrueba( direccionPrueba );

    assert.equal( await bolsaDeTrabajo.direccionPrueba(), direccionPrueba, 'La dirección de prueba no fue guardada.' );
  } );

  it( 'Debería crear un trabajo.', async () => {
    const bolsaDeTrabajo  = await BolsaDeTrabajo.deployed(),
          descripcion     = 'Trabajo de prueba';

    await bolsaDeTrabajo.crearTrabajo( descripcion );

    const trabajo = await Trabajo.at( await bolsaDeTrabajo.trabajos(0) );

    assert.equal( await trabajo.descripcion(), descripcion, 'La descripción del trabajo no coincide.' );
  } );
} );
