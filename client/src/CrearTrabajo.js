import Cargador from './Cargador';
import ComponenteDrizzle from './ComponenteDrizzle';

export default class CrearTrabajo extends ComponenteDrizzle {
  state = {
    ultimaTransaccion : null,
  };

	idCrearTrabajo = null;

  crearTrabajo( descripcion ) {
    Cargador.activar();

    const { drizzle } = this.props,
          contrato    = drizzle.contracts.BolsaDeTrabajo;


		this.idCrearTrabajo = contrato.methods['crearTrabajo'].cacheSend(
			descripcion,
			{
				from: drizzle.store.getState().accounts[0]
			}
		);
  }

  drizzleActualizado( estadoDrizzle ) {
    if ( null !== this.idCrearTrabajo ) {
      Cargador.desactivar();

      const idTransaccion     = estadoDrizzle.transactionStack[ this.idCrearTrabajo ],
            ultimaTransaccion = estadoDrizzle.transactions[ idTransaccion ];

      if ( ultimaTransaccion ) {
        this.setState( { ultimaTransaccion } );
      }
    }
  }

  render() {
    const ultimaTransaccion = this.state.ultimaTransaccion;

    let alerta = null,
        descripcion;

    if ( ultimaTransaccion ) {
      let tipo = null,
          mensaje;

      switch ( ultimaTransaccion.status ) {
        case 'success':
          mensaje     = 'Transacción exitosa';
          tipo        = 'success';
          descripcion = '';
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

    return <form onSubmit={ e => { e.preventDefault(); this.crearTrabajo( e.target.descripcion.value ) } }>
      { alerta }
      <div className="form-group">
        <textarea name="descripcion" placeholder="Descripción" className="form-control" value={ descripcion } required autoFocus></textarea>
      </div>
      <input type="submit" className="btn btn-primary" />
    </form>;
  }
}
