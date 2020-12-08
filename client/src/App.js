import { Component } from 'react';
import CrearTrabajo from './CrearTrabajo';
import ListarTrabajos from './ListarTrabajos';

export default class App extends Component {
  state = { loading: true, drizzleState: null, pantalla: null };

  componentDidMount() {
    const { drizzle } = this.props;

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe( () => {

      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if ( drizzleState.drizzleStatus.initialized ) {
        this.setState( { loading: false, drizzleState } );
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
    //if ( this.state.loading ) return "Loading Drizzle...";

    console.log(this.state);
    return <div className="container">
      <h1>Bolsa de trabajo v0.1</h1>
      <ul className="nav nav-tabs">
        <li className="nav-item"><a className="nav-link" href="#" onClick={ ( e ) => { e.preventDefault(); this.cargarPantalla( <CrearTrabajo /> ) } }>Crear trabajo</a></li>
        <li className="nav-item"><a className="nav-link" href="#" onClick={ ( e ) => { e.preventDefault(); this.cargarPantalla( <ListarTrabajos /> ) } }>Listar trabajos</a></li>
      </ul>
      <div className="mt-3">{ this.state.pantalla }</div>
    </div>
    ;
  }
}
