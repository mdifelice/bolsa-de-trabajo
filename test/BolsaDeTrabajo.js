const BolsaDeTrabajo = artifacts.require( './BolsaDeTrabajo.sol' ),
      Prueba         = artifacts.require( './Prueba.sol' ),
      Trabajo        = artifacts.require( './Trabajo.sol' );

contract( 'BolsaDeTrabajo', accounts => {
  const trabajador     = accounts[1],
        precio         = 1000000000,
        direccionNula  = '0x0000000000000000000000000000000000000000';

  let bolsaDeTrabajo,
      prueba,
      trabajo;

  it( 'Debería guardar dirección de prueba.', async () => {
    prueba = await Prueba.deployed();

    const direccionPrueba = prueba.address;

    bolsaDeTrabajo = await BolsaDeTrabajo.deployed();

    await bolsaDeTrabajo.establecerDireccionPrueba( direccionPrueba );

    assert.equal( await bolsaDeTrabajo.direccionPrueba(), direccionPrueba, 'La dirección de prueba no fue guardada.' );
  } );

  it( 'Apuntar dirección de oráculo de Rinkeby.', async () => {
    await prueba.apuntarRinkeby();

    assert.notEqual( await prueba.oraculo(), direccionNula, 'La dirección del oráculo no fue guardada.' );
  } );

  it( 'Proceso de creación de trabajo.', async () => {
    const descripcion = 'Trabajo de prueba';

    let transaccion = await bolsaDeTrabajo.crearTrabajo( descripcion );

    trabajo = await Trabajo.at( transaccion.logs[0].args[0] );

    assert.equal( await trabajo.descripcion(), descripcion, 'La descripción del trabajo no coincide.' );
  } );

  it( 'Realizar oferta de trabajo.', async () => {
    const fechaFinalizacion = Math.round( ( new Date() ).getTime() / 1000 ) - 10,
          ofertaElegida     = 0;

    await trabajo.ofertar( precio, 'GET https://www.google.com.ar', 'Descripción de oferta', fechaFinalizacion, { from: trabajador } );

    await trabajo.aceptarOferta( ofertaElegida, { value: precio } );

    assert.equal( await trabajo.ofertaElegida(), ofertaElegida, 'El trabajador asignado no coincide.' );
  } );

  it ( 'Cerrar trabajo.', async () => { 
    const balanceEmprendedor = await web3.eth.getBalance( trabajador );

    // Se establece dirección nula para evitar pruebas reales en entorno de pruebas.
    await prueba.establecerOraculo( direccionNula );

    await trabajo.solicitarCierre();

    assert.equal( await web3.eth.getBalance( trabajador ), parseFloat( balanceEmprendedor ) + parseFloat( precio ), 'El trabajador no recibió el pago.' );
  } );
} );
