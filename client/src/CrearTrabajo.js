import { Component } from 'react';
import Cargador from './Cargador';

export default class CrearTrabajo extends Component {
  state = { idPila : null, ultimaTransaccion : null };

  handleFormSubmission = e => {
    e.preventDefault();

    Cargador.activar();

    const { drizzle, drizzleState } = this.props;

    const contrato = drizzle.contracts.BolsaDeTrabajo;

    const descripcion = e.target.descripcion.value;

    const idPila = contrato.methods['crearTrabajo'].cacheSend(
      descripcion,
      {
        from: drizzleState.accounts[0]
      }
    );

    this.setState( { idPila } );
  }

  componentDidMount() {
    this.unsubscribe = this.props.drizzle.store.subscribe( () => {
      const drizzleState = this.props.drizzle.store.getState();

      if ( null !== this.state.idPila ) {
        Cargador.desactivar();

        const hash = drizzleState.transactionStack[ this.state.idPila ];

        const transaccion = drizzleState.transactions[ hash ];

        if ( transaccion ) {
          this.setState( { ultimaTransaccion : transaccion } );
        }
      }
    } );
  }

  componentWillUnmount() {
    if ( this.unsubscribe ) {
      this.unsubscribe();
    }
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
          tipo = 'success';

          document.forms[0].descripcion.value = '';
          break;
        case 'pending':
          mensaje = 'Transacción pendiente';
          tipo = 'warning';
          break;
        case 'error':
          mensaje = 'Ha habido un error con la transaccion: ' + ultimaTransaccion.error.message;
          tipo = 'danger';
          break;
      }

      if ( tipo ) {
        const clases = 'alert alert-' + tipo;

        alerta = <div className={ clases }>{ mensaje }</div>;
      }
    }

    return <form onSubmit={ this.handleFormSubmission }>
      { alerta }
      <div className="form-group">
        <textarea name="descripcion" placeholder="Descripción" className="form-control" required autoFocus></textarea>
      </div>
      <input type="submit" className="btn btn-primary" />
    </form>;
  }
}
