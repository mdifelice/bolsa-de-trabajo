import './Cargador.css';

export default class Cargador {
  static activar() {
    document.body.classList.add( 'cargando' );
  }

  static desactivar() {
    document.body.classList.remove( 'cargando' );
  }
}
