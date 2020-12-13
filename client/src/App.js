import React from 'react';
import ComponenteDrizzle from './ComponenteDrizzle';
import CrearTrabajo from './CrearTrabajo';
import ListarTrabajos from './ListarTrabajos';

export default class App extends ComponenteDrizzle {
  constructor( props ) {
    super( props );

    this.state.pantalla = null;
  }

  cargarPantalla( pantalla ) {
    this.setState( { pantalla } );
  }

  pantalla() {
    const menu = [
      {
        titulo   : 'Crear trabajo',
        pantalla : CrearTrabajo
      },
      {
        titulo   : 'Listar trabajos',
        pantalla : ListarTrabajos
      }
    ];

    return <div className="container">
      <h1>Bolsa de trabajo v0.1</h1>
      <ul className="nav nav-tabs">
        { menu.map( ( item, i ) => <li key={ i } className="nav-item">
          <a className={ 'nav-link' + ( this.state.pantalla == item.pantalla ? ' active' : '' ) } href="#" onClick={ ( e ) => { e.preventDefault(); this.cargarPantalla( item.pantalla ) } }>{ item.titulo }</a>
          </li>
        ) }
      </ul>
      <div className="mt-3">{ this.state.pantalla ? React.createElement( this.state.pantalla, { drizzle : this.props.drizzle } ) : null }</div>
    </div>
    ;
  }
}
