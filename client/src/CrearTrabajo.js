import { Component } from 'react';

export default class CrearTrabajo extends Component {
  state = { idPila : null };

  handleFormSubmission = e => {
    e.preventDefault();

    const { drizzle, drizzleState } = this.props,
          contrato = drizzle.contracts.BolsaDeTrabajo,
          descripcion = e.target.descripcion.value,
          idPila = contrato.methods['crearTrabajo'].cacheSend(
            descripcion,
            {
              from: drizzleState.accounts[0]
            }
          );

    this.setState( { idPila } );
  }

  render() {
    console.log( this.state );
    return <form onSubmit={ this.handleFormSubmission }>
      <div className="form-group">
        <textarea name="descripcion" placeholder="Descripción" className="form-control" required autoFocus></textarea>
      </div>
      <input type="submit" className="btn btn-primary" />
    </form>;
  }
}
