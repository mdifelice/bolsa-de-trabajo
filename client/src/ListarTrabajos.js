import { Component } from 'react';
import Trabajo from './contracts/Trabajo.json';

export default class ListarTrabajos extends Component {
  state = { trabajos : [], error : null };

  componentDidMount() {
    const { drizzle } = this.props;

    const contrato = drizzle.contracts.BolsaDeTrabajo;

    console.log(1);
    console.log(drizzle.store.getState().contracts.BolsaDeTrabajo.totalTrabajos);
    const totalDataKey = contrato.methods.totalTrabajos.cacheCall();
    console.log(2);
    console.log(drizzle.store.getState().contracts.BolsaDeTrabajo.totalTrabajos);
    const { BolsaDeTrabajo } = drizzle.store.getState().contracts;


    console.log(3);
    console.log(drizzle.store.getState().contracts.BolsaDeTrabajo.totalTrabajos);
    const totalTrabajos = BolsaDeTrabajo.totalTrabajos[ totalDataKey ];

    console.log(4);
    console.log(drizzle.store.getState().contracts.BolsaDeTrabajo.totalTrabajos);
    if ( totalTrabajos ) {
      for ( let i = 0; i < totalTrabajos.value; i++ ) {
        let key = contrato.methods.trabajos.cacheCall( i );

        let direccion = BolsaDeTrabajo.trabajos[ key ];

        let trabajos = [];

        if ( direccion ) {
          trabajos.push( direccion.value );

          if ( ! drizzle.contracts[ direccion.value ] ) {
            drizzle.addContract( {
              contractName: direccion.value,
              web3Contract: new drizzle.web3.eth.Contract( Trabajo.abi, direccion.value, { data: Trabajo.deployedBytecode } ),
            } );
          }

          this.setState( { trabajos } );
        }
      }
    }
  }

  render() {
    let salida = null;

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
            console.log( trabajo );
            console.log( this.props.drizzleState );
            console.log( this.props.drizzle );
            if ( this.props.drizzle.contracts[trabajo]
              && this.props.drizzleState.contracts[trabajo]
            ) {
              const empKey = this.props.drizzle.contracts[trabajo].methods.emprendedor.cacheCall();
              const descKey = this.props.drizzle.contracts[trabajo].methods.descripcion.cacheCall();

              if ( this.props.drizzleState.contracts[trabajo].emprendedor[ empKey ]
                && this.props.drizzleState.contracts[trabajo].descripcion[ descKey ]
              ) {
                return <tr key={ i }>
                  <td><code>{ trabajo }</code></td>
                  <td><code>{ this.props.drizzleState.contracts[trabajo].emprendedor[ empKey ].value }</code></td>
                  <td>{ this.props.drizzleState.contracts[trabajo].descripcion[ descKey ].value }</td>
                  <td></td>
                  <td><a href="#" onClick="">Hacer oferta</a></td>
                </tr>;
              }
            }
            return null;
          } ) }
          </tbody>
        </table>
      ;
    }

    return salida;
  }
}
