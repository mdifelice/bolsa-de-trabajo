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

const recargarRed = ( red ) => {
  const version = drizzle.web3.version;

  if (
    'undefined' !== typeof version
    && version.network !== red
  ) {
    recargar( 'Se ha detectado un cambio de red.' );
  }
};

const recargarCuentas = ( cuentas ) => {
  const cuentaActual = drizzle.store.getState().accounts[0];

  if (
    'undefined' !== typeof cuentaActual
    && cuentaActual !== cuentas[0]
  ) {
    recargar( 'Se ha detectado un cambio de cuentas.' );
  }
};

const recargar = ( mensaje ) => {
  alert( mensaje + ' Se refrescará la página.' );

  window.location.reload();
};

if ( window.ethereum ) {
  window.ethereum.on( 'networkChanged', recargarRed );
  window.ethereum.on( 'accountsChanged', recargarCuentas );
}

window.addEventListener( 'load', function() {
  if ( 'undefined' === typeof web3 ) {
    alert( 'Necesitas la extensión MetaMask para poder utilizar esta aplicación.' );
  }
} );

setTimeout( () => {
  var estadoDrizzle = drizzle.store.getState();

  if ( ! estadoDrizzle.drizzleStatus.initialized ) {
    alert( 'Drizzle está tardando más de la cuenta en iniciar, chequea que MetaMask esté conectado a la red correspondiente.' );
  }
}, 3000 );
