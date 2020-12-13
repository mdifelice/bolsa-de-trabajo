// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;
pragma abicoder v2;

import './Prueba.sol';

contract Trabajo {
  struct Oferta {
    address payable trabajador;
    uint256 precio;
    string definicionPruebas;
    string descripcion;
    uint fechaFinalizacion;
  }

  address payable public emprendedor;
  address direccionPrueba;
  string public descripcion;
  uint fechaValidacion;
  uint public totalOfertas;
  int public ofertaElegida;
  Oferta[] public ofertas;

  modifier abierto() {
    require ( ofertaElegida == -1 );

    _;
  }

  modifier soloEmprendedor() {
    require ( msg.sender == emprendedor );

    _;
  }

  constructor( address payable _emprendedor, string memory _descripcion, address _direccionPrueba ) {
    emprendedor     = _emprendedor;
    descripcion     = _descripcion;
    direccionPrueba = _direccionPrueba;
    ofertaElegida   = -1;
  }

  function ofertar( uint256 precio, string memory definicionPruebas, string memory descripcion, uint fechaFinalizacion ) public abierto {
    Oferta memory oferta;

    oferta.trabajador        = msg.sender;
    oferta.precio            = precio;
    oferta.definicionPruebas = definicionPruebas;
    oferta.descripcion       = descripcion;
    oferta.fechaFinalizacion = fechaFinalizacion;

    ofertas.push( oferta );

    totalOfertas++;
  }

  function aceptarOferta( uint _ofertaElegida ) public payable abierto soloEmprendedor {
    ofertaElegida = int( _ofertaElegida );

    Oferta memory oferta = ofertas[ uint( ofertaElegida ) ];

    require ( oferta.precio != 0 );
    require ( msg.value == oferta.precio );
  }

  function cancelar() public abierto soloEmprendedor {
    selfdestruct( emprendedor );
  }

  function solicitarCierre() public {
    Oferta memory oferta = ofertas[ uint( ofertaElegida ) ];

    uint ahora = block.timestamp;

    require ( oferta.fechaFinalizacion <= ahora );
    require ( fechaValidacion != 0 || fechaValidacion + ( 24 * 60 * 60 ) < ahora );

    fechaValidacion = ahora;

    if ( direccionPrueba != address( 0 ) ) {
      Prueba prueba = Prueba( direccionPrueba );

      prueba.validar( oferta.definicionPruebas, this.cerrarPrueba );
    } else {
      cerrar( true );
    }
  }

  function cerrarPrueba( bool resultadoPrueba ) public {
    require ( msg.sender == direccionPrueba );

    cerrar( resultadoPrueba );
  }

  function cerrar( bool resultadoPrueba ) private {
    address payable destino;

    if ( resultadoPrueba ) {
      destino = ofertas[ uint( ofertaElegida ) ].trabajador;
    } else {
      destino = emprendedor;
    }

    destino.transfer( address( this ).balance );
  }
}
