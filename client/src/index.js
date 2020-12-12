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
} );

var root = document.getElementById( 'root' );

if ( root ) {
  ReactDOM.render( <App drizzle={drizzle} />, root );
}
