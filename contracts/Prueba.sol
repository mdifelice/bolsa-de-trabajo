// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;

import './lib/strings.sol';

contract Prueba is ChainlinkClient {
  struct Devolucion {
    bytes4 retrollamada;
    string resultado;
  }

  mapping ( bytes32 => Devolucion ) devoluciones;

  function validar( string definicionPrueba, bytes4 retrollamada ) {
    string[] partes = definicionPrueba.toSlice().split( ' '.toSlice() );
    string metodo;
    string direccion;
    string parametros;
    string resultado;
    address oraculo = 0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e;
    bytes32 idTrabajoGet  = 'b0bde308282843d49a3a8d2dd2464af1';
    bytes32 idTrabajoPost = 'c28c092ad6f045c79bdbd54ebb42ce4d';
    bytes32 idTrabajo;
    bytes32 idPedido;
    uint tarifa = 0;

    require ( partes.length >= 2 );

    metodo     = partes[0].toLowerCase().trim();
    direccion  = partes[1].trim();
    parametros = '';
    resultado  = '';

    require ( [ 'get', 'post' ].indexOf( prueba.metodo ) != -1 );

    if ( partes.length > 3 ) {
      parametros = partes[2];
      resultado  = partes[3];
    } else if ( partes.length > 2 ) {
      resultado = partes[2];
    }

    idTrabajo = metodo == 'get' ? idTrabajoGet : idTrabajoPost;

    Chainlink.Request memory pedido = buildChainlinkRequest( idTrabajo, address( this ), this.cerrar );

    request.add( metodo, direccion );

    if ( parametros ) {
      request.add( 'queryParams', parametros );
    }

    idPedido = sendChainlinkRequestTo( oraculo, pedido, tarifa );

    Devolucion devolucion;

    devolucion.retrollamada = retrollamada;
    devolucion.resultado    = resultado;

    devoluciones[ idPedido ] = retrollamada; 
  }

  function cerrar( bytes32 idPedido, string cuerpo ) public recordChainlinkFulfillment( idPedido ) {
    bytes4 devolucion = devoluciones[ idPedido ];

    bool validacion = false;

    if ( devolucion.resultado.length ) {
      if ( cuerpo.toSlice().contains( devolucion.resultado.toSlice() ) ) {
        validacion = true;
      }
    } else {
      validacion = true;
    }

    devolucion.retrollamada( validacion );
  }
}
