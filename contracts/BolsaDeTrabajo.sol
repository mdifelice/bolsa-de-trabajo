// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.5;

import './Trabajo.sol';

contract BolsaDeTrabajo {
  address creador;
  address public direccionPrueba;
  Trabajo[] public trabajos;
  uint public totalTrabajos;

  event trabajoCreado( Trabajo );

  constructor() {
    creador = msg.sender;
  }

  function establecerDireccionPrueba( address _direccionPrueba ) public {
    require ( msg.sender == creador );

    direccionPrueba = _direccionPrueba;
  }

  function crearTrabajo( string memory descripcion ) public {
    Trabajo trabajo = new Trabajo( msg.sender, descripcion, direccionPrueba );

    emit trabajoCreado( trabajo );

    totalTrabajos++;

    trabajos.push( trabajo );
  }
}
