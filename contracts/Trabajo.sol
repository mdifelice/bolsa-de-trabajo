// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;

import './Prueba.sol';

contract Trabajo {
  struct Oferta {
    uint256 precio;
    string[] definicionPruebas;
    string descripcion;
    uint fechaFinalizacion;
  }

  address emprendedor;
  address trabajador;
  address direccionPrueba;
  string descripcion;
  bool[] resultadoPruebas;
  uint fechaValidacion;
  mapping ( address => Oferta ) ofertas;

  modifier abierto() {
    require ( trabajador == false );

    _;
  }

  modifier soloEmprendedor() {
    require ( msg.sender == emprendedor );

    _;
  }

  constructor( address _emprendedor, string memory _descripcion, address _direccionPrueba ) {
    emprendedor     = _emprendedor;
    descripcion     = _descripcion;
    direccionPrueba = _direccionPrueba;
  }

  function ofertar( uint256 precio, string memory definicionPruebas, string memory descripcion, int fechaFinalizacion ) public abierto {
    Oferta memory oferta;

    oferta.precio            = precio;
    oferta.definicionPruebas = definicionPruebas;
    oferta.descripcion       = descripcion;
    oferta.fechaFinalizacion = fechaFinalizacion;

    ofertas[ msg.sender ] = oferta;
  }

  function aceptarOferta( address _trabajador ) public payable abierto soloEmprendedor {
    Oferta memory oferta = ofertas[ _trabajador ];

    require ( oferta.precio != 0 );
    require ( msg.value == oferta.precio );

    trabajador = _trabajador;
  }

  function cancelar() public abierto soloEmprendedor {
    selfdestruct( emprendedor );
  }

  function solicitarCierre() public {
    Oferta memory oferta = ofertas[ trabajador ];

    uint ahora = now();

    require ( oferta.fechaFinalizacion >= ahora );
    require ( ! fechaValidacion || fechaValidacion + ( 24 * 60 * 60 ) < ahora );

    fechaValidacion  = ahora;
    resultadoPruebas = [];

    if ( oferta.definicionPruebas.length ) {
      for ( uint i = 0; i < oferta.definicionPruebas.length; i++ ) {
        Prueba prueba = Prueba( direccionPrueba );

        prueba.validar( oferta.definicionPruebas[ i ], cerrarPrueba );
      }
    } else {
      cerrar();
    }
  }

  function cerrarPrueba( bool resultadoPrueba ) public {
    require ( msg.sender == direccionPrueba );

    resultadoPruebas.push( resultadoPrueba );

    if ( resultadoPruebas.length == ofertas[ trabajador ].definicionPruebas.length ) {
      cerrar();
    }
  }

  function cerrar() private {
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
