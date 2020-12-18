import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Drizzle, generateStore } from '@drizzle/store';
import BolsaDeTrabajo from './contracts/BolsaDeTrabajo.json';

const drizzle = new Drizzle( {
  contracts: [ BolsaDeTrabajo ],
  web3: {
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:7545',
    },
  },
} ),
      root = document.getElementById( 'root' );

if ( root ) {
  ReactDOM.render( <App drizzle={drizzle} />, root );
}

const recargar = () => {
  alert( 'Se ha detectado un cambio de red o de cuentas. Se refrescará la página.' );

  window.location.reload();
};

if ( window.ethereum ) {
  window.ethereum.on( 'networkChanged', recargar );
  window.ethereum.on( 'accountsChanged', recargar );
}

window.addEventListener( 'load', function() {
  if ( 'undefined' === typeof web3 ) {
    alert( 'Necesitas la extensión MetaMask para poder utilizar esta aplicación.' );
  }
} );
