import { Component } from 'react';
import CrearTrabajo from './CrearTrabajo';
import ListarTrabajos from './ListarTrabajos';
import { Modal, Spinner } from 'react-bootstrap';

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
    let salida = [
      <div className="container" key="contenedor">
      <h1>Bolsa de trabajo v0.1</h1>
      <ul className="nav nav-tabs">
        <li className="nav-item"><a className="nav-link" href="#" onClick={ ( e ) => { e.preventDefault(); this.cargarPantalla( <CrearTrabajo drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} /> ) } }>Crear trabajo</a></li>
        <li className="nav-item"><a className="nav-link" href="#" onClick={ ( e ) => { e.preventDefault(); this.cargarPantalla( <ListarTrabajos drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} /> ) } }>Listar trabajos</a></li>
      </ul>
      <div className="mt-3">{ this.state.pantalla }</div>
    </div>
    ];

    if ( this.state.loading ) {
      salida.push( 
        <Modal key="modal" show={ true } onHide={ () => {} }>
          <Modal.Header>
            <Modal.Title>Cargando...</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </Modal.Body>
        </Modal>
      );
    }

    return salida;
  }
}
