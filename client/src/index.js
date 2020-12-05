import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Drizzle, generateStore } from "@drizzle/store";
import BolsaDeTrabajo from "./contracts/BolsaDeTrabajo.json";

// let drizzle know what contracts we want and how to access our test blockchain
const options = {
  contracts: [ BolsaDeTrabajo ],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:9545",
    },
  },
};

// setup the drizzle store and drizzle
const drizzle = new Drizzle( options );

ReactDOM.render( <App drizzle={drizzle} />, document.getElementById( 'root' ) );
