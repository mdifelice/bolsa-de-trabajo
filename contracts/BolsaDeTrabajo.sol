// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;

import './Trabajo.sol';

contract BolsaDeTrabajo {
  address creador;
  address direccionPrueba;

  constructor() public {
    creador = msg.sender;
  }

  function ponerDireccionPrueba( address _direccionPrueba ) public {
    require ( msg.sender == creador );

    direccionPrueba = _direccionPrueba;
  }

  function crearTrabajo( string descripcion ) public {
    return new Trabajo( msg.sender, descripcion, direccionPrueba );
  }
}
