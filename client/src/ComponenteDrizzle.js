import { Component } from 'react';

export default class ComponenteDrizzle extends Component {
  dispararActualizacion = true;

  constructor( props ) {
    super( props );

    const { store } = this.props.drizzle;

    this.unsubscribe = store.subscribe( () => {
      if ( this.dispararActualizacion ) {
        this.drizzleActualizado( store.getState() );
      }
    } );
  }

  drizzleActualizado() {
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
}
