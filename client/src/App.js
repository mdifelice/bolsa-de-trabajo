import { Component } from 'react';
import Cargador from './Cargador';
import CrearTrabajo from './CrearTrabajo';
import ListarTrabajos from './ListarTrabajos';

export default class App extends Component {
  state = { drizzleState: null, pantalla: null };

  iniciado = false;

  componentDidMount() {
    const { drizzle } = this.props;

    Cargador.activar();

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe( () => {

      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if ( drizzleState.drizzleStatus.initialized ) {
        this.setState( { drizzleState } );

        if ( ! this.iniciado ) {
          Cargador.desactivar();

          this.iniciado = true;
        }
      }
    } );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  cargarPantalla( pantalla ) {
    this.setState( { pantalla : pantalla } );
  }

  render() {
    return <div className="container">
      <h1>Bolsa de trabajo v0.1</h1>
      <ul className="nav nav-tabs">
        <li className="nav-item"><a className="nav-link active" href="#" onClick={ ( e ) => { e.preventDefault(); this.cargarPantalla( <CrearTrabajo drizzle={this.props.drizzle} drizzleState={this.state.drizzleState} /> ) } }>Crear trabajo</a></li>
        <li className="nav-item"><a className="nav-link" href="#" onClick={ ( e ) => { e.preventDefault(); this.cargarPantalla( <ListarTrabajos drizzle={this.props.drizzle} drizzleState={this.state.drizzleState} /> ) } }>Listar trabajos</a></li>
      </ul>
      <div className="mt-3">{ this.state.pantalla }</div>
    </div>
    ;
  }
}
