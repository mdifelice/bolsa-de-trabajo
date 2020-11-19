pragma solidity 0.7.5;

contract BolsaDeTrabajo {
  address[] contratos;

  function crearContrato( descripcion ) {
    address contrato = new Contrato( descripcion );

    contratos.push( contrato );
  }
}

contract Contrato {
  struct Oferta {
    gasto;
    string[] pruebas;
    string descripcion;
    int fechaDeEntrega;
  };

  address creador, ofertaElegida;

  string descripcion;

  mapping ( address => Oferta ) ofertas;

  modifier noCerrado() {
    require ( ofertaElegida == undefined );

    _;
  };

  modifier cerrado() {
    require ( ! noCerrado() );

    _;
  };

  modifier soloCreador() {
    require ( msg.sender == creador );

    _;
  };

  constructor( address _creador, string _descripcion ) {
    creador = _creador;
    descripcion = _descripcion;
  }

  function ofertar( gasto, pruebas, string descripcion, int fechaDeEntrega ) noCerrado {
    Oferta oferta;

    oferta.gasto = gasto;
    oferta.pruebas = pruebas;
    oferta.descripcion = descripcion;

    ofertas[ msg.sender ] = oferta;
  }

  function aceptarOferta( address direccion ) noCerrado soloCreador payable {
    ofertaElegida = direccion;
  }

  function cerrarTrabajo() cerrado {
    Oferta oferta = ofertas[ ofertaElegida ];

    require ( oferta.fechaElegida >= now() );

    address destino;

    if ( oferta.pruebas ) {
      destino = ofertaElegida;
    } else {
      destino = creador;
    }

    destino.transfer( address( this ).balance );
  }
}
