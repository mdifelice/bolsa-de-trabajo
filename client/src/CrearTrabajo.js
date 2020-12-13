import ComponenteDrizzle from './ComponenteDrizzle';

export default class CrearTrabajo extends ComponenteDrizzle {
	idCrearTrabajo = null;

  crearTrabajo( descripcion ) {
    this.crearTransaccion( 'BolsaDeTrabajo', 'crearTrabajo', [ descripcion ] );
  }

  pantalla() {
    let descripcion;

    if ( this.ultimaTransaccionEsExitosa() ) {
      descripcion = '';
    }

    return <form onSubmit={ e => { e.preventDefault(); this.crearTrabajo( e.target.descripcion.value ) } }>
      <div className="form-group">
        <textarea name="descripcion" placeholder="Descripción" className="form-control" required autoFocus value={ descripcion }></textarea>
      </div>
      <input type="submit" className="btn btn-primary" />
    </form>;
  }
}
