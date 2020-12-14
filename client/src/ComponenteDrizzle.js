import { Component } from 'react';
import Cargador from './Cargador';

export default class ComponenteDrizzle extends Component {
  state = {
    ultimaTransaccion : null,
  };

  idPilaUltimaTransaccion = null;

  iniciando = false;

  desubscribirse = null;

  constructor( props ) {
    super( props );
  }

  componentDidMount() {
    const estadoDrizzle = this.props.drizzle.store.getState();

    this.subscribirse();

    if ( estadoDrizzle.drizzleStatus.initialized ) {
      this.drizzleActualizado();
    } else {
      this.iniciando = true;

      Cargador.activar();
    }
  }

  subscribirse() {
    const { store } = this.props.drizzle;

    this.desubscribirse = store.subscribe( () => {
      const estadoDrizzle = store.getState();

      if ( estadoDrizzle.drizzleStatus.initialized ) {
        if ( this.iniciando ) {
          Cargador.desactivar();

          this.iniciando = false;
        }

        this.drizzleActualizado();
      }
    } );
  }

  componentWillUnmount() {
    this.desubscribirse();
  }

  render() {
    const ultimaTransaccion = this.state.ultimaTransaccion;

    let alerta = null;

    if ( ultimaTransaccion ) {
      let tipo = null,
          mensaje;

      switch ( ultimaTransaccion.status ) {
        case 'success':
          mensaje = 'Transacción exitosa';
          tipo    = 'success';
          break;
        case 'pending':
          mensaje = 'Transacción pendiente';
          tipo    = 'warning';
          break;
        case 'error':
          mensaje = 'Ha habido un error con la transaccion: ' + ultimaTransaccion.error.message;
          tipo    = 'danger';
          break;
      }

      if ( tipo ) {
        const clases = 'alert alert-' + tipo;

        alerta = <div className={ clases }>{ mensaje }</div>;
      }
    }

    return <div>
      { alerta }
      { this.pantalla() }
    </div>
    ;
  }

  crearTransaccion( nombreContrato, metodo, argumentos = [], valor = 0 ) {
    Cargador.activar();

    const { drizzle } = this.props,
          contrato    = drizzle.contracts[ nombreContrato ];

    if (
      contrato
      && contrato.methods[ metodo ]
    ) {
      argumentos.push( {
          from  : drizzle.store.getState().accounts[0],
          value : valor
      } );

      this.state.ultimaTransaccion = null;

      this.idPilaUltimaTransaccion = contrato.methods[ metodo ].cacheSend.apply( null, argumentos );
    }
  }

  drizzleActualizado() {
    if ( null !== this.idPilaUltimaTransaccion ) {
      const estadoDrizzle       = this.props.drizzle.store.getState(),
            idUltimaTransaccion = estadoDrizzle.transactionStack[ this.idPilaUltimaTransaccion ],
            ultimaTransaccion   = estadoDrizzle.transactions[ idUltimaTransaccion ];

      this.setState( { ultimaTransaccion } );

      if (
        this.ultimaTransaccionEs( 'success' )
        || this.ultimaTransaccionEs( 'error' )
      ) {
        Cargador.desactivar();
      }
    }
  }

  ultimaTransaccionEs( estado ) {
    const ultimaTransaccion = this.state.ultimaTransaccion;

    return ultimaTransaccion && ultimaTransaccion.status === estado;
  }

  ultimaTransaccionEsExitosa() {
    return this.ultimaTransaccionEs( 'success' );
  }

  obtenerDireccion() {
    return this.props.drizzle.store.getState().accounts[0];
  }
}
