import { Component } from 'react';

export default class CrearTrabajo extends Component {
  render() {
    return <form>
      <div className="form-group">
        <textarea name="descripcion" placeholder="Descripción" className="form-control"></textarea>
      </div>
      <input type="submit" className="btn btn-primary" />
    </form>;
  }
}
