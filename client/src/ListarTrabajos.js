import { Component } from 'react';

export default class ListarTrabajos extends Component {
  render() {
    let trabajos = [];

    return <ul>{ trabajos.map( ( trabajo ) => { return <li>{ trabajo.descripcion }</li>; } ) }</ul>;
  }
}
