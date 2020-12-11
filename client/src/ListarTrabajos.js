import { Component } from 'react';
import Trabajo from './contracts/Trabajo.json';

export default class ListarTrabajos extends Component {
  state = { trabajos : [], error : null };

  componentDidMount() {
    const { drizzle } = this.props;

    const contrato = drizzle.contracts.BolsaDeTrabajo;

    const { BolsaDeTrabajo } = this.props.drizzleState.contracts;

    console.log( drizzle );
    console.log( this.props.drizzleState );
    const totalDataKey = contrato.methods.totalTrabajos.cacheCall();

    const totalTrabajos = BolsaDeTrabajo.totalTrabajos[ totalDataKey ];

            console.log(totalTrabajos);
    if ( totalTrabajos ) {
      for ( let i = 0; i < totalTrabajos.value; i++ ) {
        let key = contrato.methods.trabajos.cacheCall( i );

        let direccion = BolsaDeTrabajo.trabajos[ key ];

        if ( direccion ) {
          drizzle.addContract( {
            contractName: direccion.value,
            web3Contract: new drizzle.web3.eth.Contract( Trabajo.abi, direccion.value ),
          } );
        }
      }
    }
  }

  render() {
    let salida = null;

    console.log(this.props.drizzle);
    console.log(this.state);
    if ( this.state.trabajos ) {
      salida =
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Dirección</th>
              <th scope="col">Creador</th>
              <th scope="col">Descripción</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
          { this.state.trabajos.map( ( trabajo, i ) => {
            const empKey = this.props.drizzle.contracts.Trabajo.methods.emprendedor.cacheCall();
            const descKey = this.props.drizzle.contracts.Trabajo.methods.descripcion.cacheCall();

            return <tr key={ i }>
              <td>{ trabajo.value }</td>
              <td>{ this.props.drizzleState.Trabajo.emprendedor[ empKey ] }</td>
              <td>{ this.props.drizzleState.Trabajo.descripcion[ descKey ] }</td>
              <td></td>
              <td><a href="#" onClick="">Hacer oferta</a></td>
            </tr>;
          } ) }
          </tbody>
        </table>
      ;
    }

    return salida;
  }
}
