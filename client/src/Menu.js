import { Component } from 'react';

export default class Menu extends Component {
  render() {
    return <ul className="nav">
        <li className="nav-item"><a className="nav-link" href="#">Crear trabajo</a></li>
        <li className="nav-item"><a className="nav-link" href="#">Buscar trabajo</a></li>
      </ul>
      ;
  }
}
