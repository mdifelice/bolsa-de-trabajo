const BolsaDeTrabajo = artifacts.require( './BolsaDeTrabajo.sol' ),
      Prueba         = artifacts.require( './Prueba.sol' ),
      Trabajo        = artifacts.require( './Trabajo.sol' );

contract( 'BolsaDeTrabajo', accounts => {
  const trabajador = accounts[1];

  let bolsaDeTrabajo,
      trabajo;

  it( 'Debería guardar dirección de prueba.', async () => {
    const prueba          = await Prueba.deployed(),
          direccionPrueba = prueba.address;
    
    bolsaDeTrabajo = await BolsaDeTrabajo.deployed(),

    await bolsaDeTrabajo.ponerDireccionPrueba( direccionPrueba );

    assert.equal( await bolsaDeTrabajo.direccionPrueba(), direccionPrueba, 'La dirección de prueba no fue guardada.' );
  } );

  it( 'Proceso de creación de trabajo.', async () => {
    const descripcion = 'Trabajo de prueba';

    let transaccion = await bolsaDeTrabajo.crearTrabajo( descripcion );

    trabajo = await Trabajo.at( transaccion.logs[0].address );

    assert.equal( await trabajo.descripcion(), descripcion, 'La descripción del trabajo no coincide.' );
  } );

  it( 'Realizar oferta de trabajo.', async () => {
    const fechaFinalizacion = Math.round( ( new Date() ).getTime() / 1000 ) + 5,
          precio            = 1000000000;

    await trabajo.ofertar( precio, [ 'get https://www.google.com.ar' ], 'Descripción de oferta', fechaFinalizacion, { from: trabajador } );

    await trabajo.aceptarOferta( trabajador, { value: precio } );

    assert.equal( await trabajo.trabajador(), trabajador, 'El trabajador asignado no coincide.' );
  } );

  it ( 'Cerrar trabajo.', async () => { 
    const balanceEmprendedor = await web3.eth.getBalance( trabajador );

    await debug( trabajo.solicitarCierre() );

    assert.equal( await web3.eth.getBalance( trabajador ), balanceEmprendedor + precio, 'El trabajador no recibió el pago.' );
  } );
} );
