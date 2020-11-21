// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;

import './Prueba.sol';

contract Trabajo {
  struct Oferta {
    uint256 precio;
    string[] definicionPruebas;
    string descripcion;
    int fechaFinalizacion;
  }

  address emprendedor;
  address trabajador;
  address direccionPrueba;
  string descripcion;
  bool[] resultadoPruebas;
  bool validando;
  mapping ( address => Oferta ) ofertas;

  modifier abierto() {
    require ( trabajador == false );

    _;
  }

  modifier soloCreador() {
    require ( msg.sender == emprendedor );

    _;
  }

  constructor( address _emprendedor, string _descripcion, address _direccionPrueba ) {
    emprendedor     = _emprendedor;
    descripcion     = _descripcion;
    direccionPrueba = _direccionPrueba;
  }

  function ofertar( uint256 precio, string definicionPruebas, string descripcion, int fechaFinalizacion ) public abierto {
    Oferta oferta;

    oferta.precio            = precio;
    oferta.definicionPruebas = definicionPruebas;
    oferta.descripcion       = descripcion;
    oferta.fechaFinalizacion = fechaFinalizacion;

    ofertas[ msg.sender ] = oferta;
  }

  function aceptarOferta( address _trabajador ) public payable abierto soloCreador {
    Oferta oferta = ofertas[ _trabajador ];

    require ( oferta.precio != 0 );
    require ( msg.value == oferta.precio );

    trabajador = _trabajador;
  }

  function cancelar() public abierto soloCreador {
    selfdestruct( owner );
  }

  function solicitarCierre() public {
    Oferta oferta = ofertas[ trabajador ];

    require ( oferta.fechaFinalizacion >= now() );
    require ( ! validando );

    validando = true;

    if ( oferta.definicionPruebas.length ) {
      for ( uint i = 0; i < oferta.definicionPruebas.length; i++ ) {
        Prueba prueba = Prueba( direccionPrueba );

        prueba.validar( oferta.definicionPruebas[ i ], cerrarPrueba );
      }
    } else {
      cerrar();
    }
  }

  function cerrarPrueba( bool resultadoPrueba ) {
    require ( msg.sender == direccionPrueba );

    resultadoPruebas.push( resultadoPrueba );

    if ( resultadoPruebas.length == pruebas.length ) {
      cerrar();
    }
  }

  function cerrar() {
    address destino;
    bool trabajoCumplido = true;

    for ( uint i = 0; i < resultadoPruebas.length; i++ ) {
      if ( ! resultadoPruebas[ i ] ) {
        trabajoCumplido = false;

        break;
      }
    }

    if ( trabajoCumplido ) {
      destino = trabajador;
    } else {
      destino = emprendedor;
    }

    destino.transfer( address( this ).balance );
  }
}
