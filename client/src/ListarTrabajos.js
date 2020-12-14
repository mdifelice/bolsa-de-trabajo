import Trabajo from './contracts/Trabajo.json';
import ComponenteDrizzle from './ComponenteDrizzle';
import $ from 'jquery';

export default class ListarTrabajos extends ComponenteDrizzle {
  iniciado = false;

  static idTotalTrabajos = null;

  static idTrabajos = {};

  constructor( props ) {
    super( props );

    this.state.trabajos = [];

    this.state.trabajoElegido = null;
  }

  drizzleActualizado() {
    super.drizzleActualizado();

    this.desubscribirse();

    const { drizzle }       = this.props,
          { store }         = drizzle,
          estadoDrizzle     = store.getState(),
          bolsaDeTrabajoRef = drizzle.contracts.BolsaDeTrabajo;

    if ( ! ListarTrabajos.idTotalTrabajos ) {
        ListarTrabajos.idTotalTrabajos = bolsaDeTrabajoRef.methods.totalTrabajos.cacheCall();
    }

    const bolsaDeTrabajo    = estadoDrizzle.contracts.BolsaDeTrabajo,
          totalTrabajosRef  = bolsaDeTrabajo.totalTrabajos[ ListarTrabajos.idTotalTrabajos ],
          trabajos          = [];

    if ( totalTrabajosRef ) {
      const totalTrabajos = totalTrabajosRef.value;

      if ( totalTrabajos ) {
        for ( let i = 0; i < totalTrabajos; i++ ) {
          if ( ! ListarTrabajos.idTrabajos[ i ] ) {
            ListarTrabajos.idTrabajos[ i ] = {
              trabajo : bolsaDeTrabajoRef.methods.trabajos.cacheCall( i ),
            };
          }

          const trabajoRef = bolsaDeTrabajo.trabajos[ ListarTrabajos.idTrabajos[ i ].trabajo ];

          if ( trabajoRef ) {
            const direccionTrabajo = trabajoRef.value;

            if ( ! drizzle.contracts[ direccionTrabajo ] ) {
              drizzle.addContract( {
                contractName : direccionTrabajo,
                web3Contract : new drizzle.web3.eth.Contract(
                  Trabajo.abi,
                  direccionTrabajo,
                  {
                    data : Trabajo.deployedBytecode,
                  }
                ),
              } );
            }

            if ( drizzle.contracts[ direccionTrabajo ] ) {
              const trabajo = drizzle.contracts[ direccionTrabajo ],
                    metodos = [
                      'emprendedor',
                      'ofertaElegida',
                      'descripcion',
                      'totalOfertas',
                    ];

              metodos.forEach( ( metodo ) => {
                if ( ! ListarTrabajos.idTrabajos[ i ][ metodo ] ) {
                  ListarTrabajos.idTrabajos[ i ][ metodo ] = trabajo.methods[ metodo ].cacheCall();
                }
              } );

              const idTrabajo     = ListarTrabajos.idTrabajos[ i ],
                    estadoTrabajo = estadoDrizzle.contracts[ direccionTrabajo ];

              if ( estadoTrabajo ) {
                let metodosCompletados = true;

                metodos.forEach( ( metodo ) => {
                  if ( 'undefined' === typeof estadoTrabajo[ metodo ][ ListarTrabajos.idTrabajos[ i ][ metodo ] ] ) {
                    metodosCompletados = false;
                  }
                } );

                if ( metodosCompletados ) {
                  const datosTrabajo = {
                    balance   : -1,
                    direccion : direccionTrabajo,
                    ofertas   : [],
                  };

                  metodos.forEach( ( metodo ) => datosTrabajo[ metodo ] = estadoTrabajo[ metodo ][ idTrabajo[ metodo ] ].value );

                  if ( !  ListarTrabajos.idTrabajos[ i ].ofertas ) {
                    ListarTrabajos.idTrabajos[ i ].ofertas = {};
                  }

                  drizzle.web3.eth.getBalance( direccionTrabajo ).then( balance => { 
                    if ( this.state.trabajos[ i ] ) {
                      this.state.trabajos[ i ].balance = balance;

                      this.setState( { trabajos : this.state.trabajos } );
                    }
                  } );

                  if ( datosTrabajo.totalOfertas ) {
                    for ( let j = 0; j < datosTrabajo.totalOfertas; j++ ) {
                      if ( ! ListarTrabajos.idTrabajos[ i ].ofertas[ j ] ) {
                        ListarTrabajos.idTrabajos[ i ].ofertas[ j ] = trabajo.methods.ofertas.cacheCall( j );
                      }

                      if ( 'undefined' !== typeof estadoTrabajo.ofertas[ ListarTrabajos.idTrabajos[ i ].ofertas[ j ] ] ) {
                        const oferta = estadoTrabajo.ofertas[ ListarTrabajos.idTrabajos[ i ].ofertas[ j ] ].value;

                        datosTrabajo.ofertas.push( {
                          trabajador        : oferta.trabajador,
                          precio            : oferta.precio,
                          descripcion       : oferta.descripcion,
                          definicionPruebas : oferta.definicionPruebas,
                          fechaFinalizacion : oferta.fechaFinalizacion,
                        } );
                      }
                    }
                  }

                  trabajos.push( datosTrabajo );
                }
              }
            }
          }
        }
      }
    }

    this.subscribirse();

    this.setState( { trabajos } );
  }

  ofertar( trabajo, precio, definicionPruebas, descripcion, fechaFinalizacion ) {
    this.crearTransaccion(
      trabajo,
      'ofertar',
      [
        precio,
        definicionPruebas,
        descripcion,
        fechaFinalizacion
      ]
    );
  }

  aceptarOferta( trabajo, ofertaElegida, valor ) {
    this.crearTransaccion(
      trabajo,
      'aceptarOferta',
      [
        ofertaElegida,
      ],
      valor
    );
  }

  solicitarCierre( trabajo ) {
    this.crearTransaccion(
      trabajo,
      'solicitarCierre'
    );
  }

  cancelar( trabajo ) {
    const { drizzle } = this.props;

    this.crearTransaccion( trabajo, 'cancelar' );
  }

  pantalla() {
    return <div>
      { this.state.trabajos.length ?
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Dirección</th>
            <th scope="col" className="text-center">Creador</th>
            <th scope="col" className="text-center">Descripción</th>
            <th scope="col" className="text-center">Estado</th>
            <th scope="col" className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
        { this.state.trabajos.map( ( trabajo, i ) => {
          let salida = null;

          if ( trabajo.balance !== -1 ) {
            const { drizzle }   = this.props,
                  web3          = drizzle.web3,
                  esEmprendedor = trabajo.emprendedor === this.obtenerDireccion(),
                  acciones      = [];

            let insignia         = null,
                estado           = null,
                permitirCancelar = false;

            if ( ! trabajo.emprendedor ) {
              estado = 'cancelado';
              insignia = 'danger';
            } else if ( trabajo.ofertaElegida == -1 ) {
              estado = 'abierto';
              insignia = 'primary';

              if ( esEmprendedor ) {
                if ( trabajo.ofertas.length ) {
                  acciones.push( <button className="btn btn-primary" data-target="#ofertas" data-toggle="modal" onClick={ () => this.setState( { trabajoElegido : trabajo } ) }>Ver ofertas</button> );
                }
              } else {
                acciones.push( <button className="btn btn-primary" data-target="#oferta" data-toggle="modal" onClick={ () => this.setState( { trabajoElegido : trabajo } ) }>Hacer oferta</button> );
              }

              permitirCancelar = true;
            } else {
              if ( trabajo.balance == 0 ) {
                estado = 'terminado';
                insignia = 'success';
              } else {
                if ( trabajo.balance == -1 ) {
                  estado = 'esperando';
                  insignia = 'secondary';

                  permitirCancelar = true;
                } else if ( trabajo.balance > 0 ) {
                  estado = 'cerrado';
                  insignia = 'warning';
                }

                if (
                  trabajo.ofertaElegida !== -1
                  && trabajo.ofertas[ trabajo.ofertaElegida ]
                  && trabajo.ofertas[ trabajo.ofertaElegida ].fechaFinalizacion * 1000 <= Date.now() ) {
                  acciones.push( <button className="btn btn-success" onClick={ ( e ) => { e.preventDefault(); this.solicitarCierre( trabajo.direccion ); } } disabled={ estado === 'terminado' }>Solicitar cierre</button> );
                }

                permitirCancelar = true;
              }
            }

            if (
              permitirCancelar
              && esEmprendedor
            ) {
              acciones.push( <button className="btn btn-danger" onClick={ ( e ) => { e.preventDefault(); this.cancelar( trabajo.direccion ); } }>Cancelar</button> );
            }

            salida = <tr key={ i }>
              <td className="align-middle"><code>{ trabajo.direccion }</code></td>
              <td className="align-middle text-center"><code>{ trabajo.emprendedor }</code></td>
              <td className="align-middle text-center">{ trabajo.descripcion }</td>
              <td className="align-middle text-center"><span className={ 'badge text-uppercase badge-' + insignia }>{ estado }</span></td>
              <td className="align-middle text-nowrap text-right">{ acciones.map( ( accion, i ) => <span key={ i }>{ i ? ' ' : '' }{ accion }</span> ) }</td>
            </tr>;
          }

          return salida;
        } ) }
        </tbody>
      </table> : <div className="alert alert-warning">No hay trabajos cargados aún</div> }
			<div className="modal" id="oferta" tabIndex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<form className="modal-content" onSubmit={ e => {
						e.preventDefault();

						const form = e.target;

						this.ofertar(
              this.state.trabajoElegido.direccion,
							form.precio.value,
							form.definicionPruebas.value,
							form.descripcion.value,
							Date.parse( form.fechaFinalizacion.value ) / 1000
						);

						$( '#oferta' ).modal( 'hide' ).find( ':input' ).val( '' );
					} }>
						<div className="modal-header">
							<h5 className="modal-title">Hacer oferta</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Cerrar">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<div className="form-group">
								<input type="number" min="0" name="precio" className="form-control" placeholder="Precio" required autoFocus />
							</div>
							<div className="form-group">
								<textarea name="definicionPruebas" placeholder="Definición de pruebas" className="form-control"></textarea>
							</div>
							<div className="form-group">
								<textarea name="descripcion" placeholder="Descripción" className="form-control"></textarea>
							</div>
							<div className="form-group">
								<input type="date" name="fechaFinalizacion" className="form-control" placeholder="Fecha de finalización" required />
							</div>
						</div>
						<div className="modal-footer">
							<button type="submit" className="btn btn-primary">Enviar</button>
							<button type="button" className="btn btn-secondary" data-dismiss="modal">Cancelar</button>
						</div>
					</form>
				</div>
			</div> 
			<div className="modal" id="ofertas" tabIndex="-1" role="dialog">
				<div className="modal-dialog modal-xl" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Ofertas</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Cerrar">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Trabajador</th>
                    <th scope="col" className="text-center">Precio</th>
                    <th scope="col" className="text-center">Definición de pruebas</th>
                    <th scope="col" className="text-center">Descripción</th>
                    <th scope="col" className="text-center">Fecha de finalización</th>
                    <th scope="col" className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                { this.state.trabajoElegido ? this.state.trabajoElegido.ofertas.map( ( oferta, i ) => {
                  return <tr key={ i }>
                    <td className="align-middle"><code>{ oferta.trabajador }</code></td>
                    <td className="align-middle text-center"><strong>{ oferta.precio } wei</strong></td>
                    <td className="align-middle text-center">{ oferta.definicionPruebas }</td>
                    <td className="align-middle text-center">{ oferta.descripcion }</td>
                    <td className="align-middle text-center">{ new Date( parseInt( oferta.fechaFinalizacion ) * 1000 ).toLocaleString() }</td>
                    <td className="align-middle text-right"><a className="btn btn-primary" onClick={ e => {
                      e.preventDefault();

                      const { trabajoElegido  } = this.state,
                            oferta              = trabajoElegido.ofertas[ i ];

                      this.aceptarOferta( trabajoElegido.direccion, i, oferta.precio );
                      
                      $( '#ofertas' ).modal( 'hide' );
                    } }>Aceptar oferta</a></td>
                  </tr>
                } ) : null }
                </tbody>
              </table>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
						</div>
					</div>
				</div>
			</div> 
    </div>
    ;
  }
}
