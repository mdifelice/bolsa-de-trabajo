import { Component } from 'react';

export default class ListarTrabajos extends Component {
  render() {
    const { drizzle } = this.props;

    const contrato = drizzle.contracts.BolsaDeTrabajo;

    const { BolsaDeTrabajo } = this.props.drizzleState.contracts;

    const totalDataKey = contrato.methods.totalTrabajos.cacheCall();

    const totalTrabajos = BolsaDeTrabajo.totalTrabajos[ totalDataKey ];

    console.log(totalDataKey);
    let salida = null;

    console.log(totalTrabajos);
    if ( totalTrabajos ) {
      let trabajos = [];

      for ( let i = 0; i < totalTrabajos.value; i++ ) {
        let key = contrato.methods.totalTrabajos.cacheCall( i );
        console.log(key);
        console.log( BolsaDeTrabajo.trabajos[ totalDataKey ] );
        trabajos.push( BolsaDeTrabajo.trabajos[ key ] );
      }
      console.log(trabajos);

      salida = <ul>{ trabajos.map( ( trabajo ) => { return <li></li>; } ) }</ul>;
    }

    return salida;
  }
}
