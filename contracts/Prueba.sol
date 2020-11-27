// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;

import './lib/strings.sol';
import '../node_modules/@chainlink/contracts/src/v0.7/ChainlinkClient.sol';

contract Prueba is ChainlinkClient {
  using Chainlink for Chainlink.Request;
  using strings for *;

  struct Devolucion {
    function( bool ) external retrollamada;
    string resultado;
  }

  mapping ( bytes32 => Devolucion ) devoluciones;

  function validar( string memory definicionPrueba, function( bool ) external retrollamada ) public {
    string[] memory arregloPartes;
    strings.slice memory definicionPruebaEnPartes = definicionPrueba.toSlice();
    uint numeroPartes = definicionPruebaEnPartes.count( ' '.toSlice() ) + 1;
    string memory metodo;
    string memory direccion;
    string memory parametros;
    string memory resultado;
    address oraculo = 0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e;
    bytes32 idTrabajoGet = 'b0bde308282843d49a3a8d2dd2464af1';
    bytes32 idTrabajoPost = 'c28c092ad6f045c79bdbd54ebb42ce4d';
    bytes32 idPedido;
    uint tarifa = 0;
    Chainlink.Request memory pedido;

    for ( uint i = 0; i < numeroPartes; i++ ) {
      arregloPartes[ i ] = definicionPruebaEnPartes.split( ' '.toSlice() ).toString();
    }

    require ( arregloPartes.length >= 2 );

    metodo     = arregloPartes[0];
    direccion  = arregloPartes[1];
    parametros = '';
    resultado  = '';

    require ( metodo.toSlice().equals( 'GET'.toSlice() ) || metodo.toSlice().equals( 'POST'.toSlice() ) );

    if ( arregloPartes.length > 3 ) {
      parametros = arregloPartes[2];
      resultado  = arregloPartes[3];
    } else if ( arregloPartes.length > 2 ) {
      resultado = arregloPartes[2];
    }

    pedido = buildChainlinkRequest( metodo.toSlice().equals( 'GET'.toSlice() ) ? idTrabajoGet : idTrabajoPost, address( this ), this.cerrar.selector );

    pedido.add( metodo, direccion );

    if ( parametros.toSlice().len() > 0 ) {
      pedido.add( 'queryParams', parametros );
    }

    idPedido = sendChainlinkRequestTo( oraculo, pedido, tarifa );

    Devolucion memory devolucion;

    devolucion.retrollamada = retrollamada;
    devolucion.resultado    = resultado;

    devoluciones[ idPedido ] = devolucion; 
  }

  function cerrar( bytes32 idPedido, string memory cuerpo ) public recordChainlinkFulfillment( idPedido ) {
    Devolucion memory devolucion = devoluciones[ idPedido ];
    strings.slice memory resultado = devolucion.resultado.toSlice();
    bool validacion = false;

    if ( resultado.len() > 0 ) {
      if ( cuerpo.toSlice().contains( resultado ) ) {
        validacion = true;
      }
    } else {
      validacion = true;
    }

    devolucion.retrollamada( validacion );
  }
}
