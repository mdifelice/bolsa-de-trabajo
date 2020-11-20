pragma solidity 0.7.5;

import 'github.com/Arachnid/solidity-stringutils/strings.sol';

contract Trabajo is ChainlinkClient {
  struct Prueba {
    string metodo;
    string direccion;
    string parametros;
    string cadena;
  };

  struct Oferta {
    uint256 precio;
    Prueba[] pruebas;
    string descripcion;
    int fechaFinalizacion;
  };

  address emprendedor, trabajador;

  string descripcion;

  bool[] resultadoPruebas;

  bool validando;

  mapping ( address => Oferta ) ofertas;

  mapping ( bytes32 => Prueba ) pruebasEnTramite;

  modifier abierto() {
    require ( trabajador == false );

    _;
  };

  modifier soloCreador() {
    require ( msg.sender == emprendedor );

    _;
  };

  constructor( address _emprendedor, string _descripcion ) {
    emprendedor = _emprendedor;
    descripcion = _descripcion;
  }

  function ofertar( uint256 precio, string definicionPruebas, string descripcion, int fechaFinalizacion ) public abierto {
    Oferta oferta;

    oferta.precio = precio;
    oferta.pruebas = cargarPruebas( definicionPruebas );
    oferta.descripcion = descripcion;
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

    if ( oferta.pruebas.length ) {
      address oraculo = 0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e;
      bytes32 idTrabajoGet = 'b0bde308282843d49a3a8d2dd2464af1',
              idTrabajoPost = 'c28c092ad6f045c79bdbd54ebb42ce4d';
            
      for ( uint i = 0; i < oferta.pruebas.length; i++ ) {
        bytes32 idTrabajo = prueba.metodo == 'get' ? idTrabajoGet : idTrabajoPost;

        Chainlink.Request memory pedido = buildChainlinkRequest( idTrabajo, address( this ), this.cerrarPrueba );

        request.add( prueba.metodo, prueba.direccion );

        if ( parameteros ) {
          request.add( 'queryParams', prueba.parametros );
        }

        bytes32 idPedido = sendChainlinkRequestTo( oraculo, pedido, tarifa );

        pruebasEnTramite[ idPedido ] = i;
      }
    } else {
      cerrar();
    }
  }

  function cerrarPrueba( bytes32 idPedido, string cuerpo ) public recordChainlinkFulfillment( idPedido ) {
    string prueba = pruebas[ pruebasEnTramite[ idPedido ] ];
    bool pruebaExitosa = false;

    if ( prueba.cadena.length ) {
      if ( cuerpo.toSlice().contains( prueba.cadena.toSlice() ) ) {
        pruebaExitosa = true;
      }
    } else {
      pruebaExitosa = true;
    }

    resultadoPruebas.push( exito );

    if ( resultadoPruebas.length === pruebas.length ) {
      cerrar();
    }
  }

  function cargarPruebas( string definicion ) {
    Prueba[] pruebas;

    string[] pruebasCrudas = definicion.split( '\n' );

    for ( uint i = 0; i < pruebasCrudas.length; i++ ) {
      string[] partes = pruebasCrudas[ i ].trim().split( ' ' );

      require ( partes.length > 1 );

      prueba.metodo = partes[0].toLowerCase().trim();
      prueba.direccion = partes[1].trim();
      prueba.parametros = '';
      prueba.expresionRegular = '';

      require ( [ 'get', 'post' ].indexOf( prueba.metodo ) != -1 );

      if ( partes.length > 3 ) {
        prueba.parametros = partes[2];
        prueba.expresionRegular = partes[3];
      } else if ( partes.length > 2 ) {
        prueba.expresionRegular = partes[2];
      }

      pruebas.push( prueba );
    }

    return pruebas;
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
