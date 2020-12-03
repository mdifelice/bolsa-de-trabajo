// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;

import './Trabajo.sol';

contract BolsaDeTrabajo {
  address creador;
  address public direccionPrueba;

  event trabajoCreado( Trabajo );

  constructor() {
    creador = msg.sender;
  }

  function ponerDireccionPrueba( address _direccionPrueba ) public {
    require ( msg.sender == creador );

    direccionPrueba = _direccionPrueba;
  }

  function crearTrabajo( string memory descripcion ) public {
    Trabajo trabajo = new Trabajo( msg.sender, descripcion, direccionPrueba );

    emit trabajoCreado( trabajo );
  }
}
