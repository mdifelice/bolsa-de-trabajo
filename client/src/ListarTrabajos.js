import Trabajo from './contracts/Trabajo.json';
import ComponenteDrizzle from './ComponenteDrizzle';
import Cargador from './Cargador';
import $ from 'jquery';

export default class ListarTrabajos extends ComponenteDrizzle {
  state = {
    trabajos : [],
  };

  idTotalTrabajos = null;

	ofertasHechas = {};

	trabajoOfertado = null;

  componentDidMount() {
    const { drizzle } = this.props,
          contrato    = drizzle.contracts.BolsaDeTrabajo;

    this.idTotalTrabajos = contrato.methods.totalTrabajos.cacheCall();

    Cargador.activar();

    this.cargarTrabajos();
  }

  drizzleActualizado() {
    this.cargarTrabajos();
  }

  cargarTrabajos() {
    const trabajos = [];

    if ( null !== this.idTotalTrabajos ) {
      const { drizzle }        = this.props,
            estadoDrizzle      = drizzle.store.getState(),
            { BolsaDeTrabajo } = estadoDrizzle.contracts,
            totalTrabajosRef   = BolsaDeTrabajo.totalTrabajos[ this.idTotalTrabajos ];

      if ( totalTrabajosRef ) {
        const totalTrabajos = totalTrabajosRef.value;

        if ( totalTrabajos ) {
          const contrato = drizzle.contracts.BolsaDeTrabajo;

          for ( let i = 0; i < totalTrabajos; i++ ) {
            this.dispararActualizacion = false;

            const idTrabajo = contrato.methods.trabajos.cacheCall( i );

            this.dispararActualizacion = true;

            if ( idTrabajo ) { 
              const trabajoRef = BolsaDeTrabajo.trabajos[ idTrabajo ];

              if ( trabajoRef ) {
                const trabajo = trabajoRef.value;

                if ( ! drizzle.contracts[ trabajo ] ) {
                  this.dispararActualizacion = false;

                  drizzle.addContract( {
                    contractName : trabajo,
                    web3Contract : new drizzle.web3.eth.Contract(
                      Trabajo.abi,
                      trabajo,
                      {
                        data : Trabajo.deployedBytecode,
                      }
                    ),
                  } );

                  this.dispararActualizacion = true;
                }

                if ( drizzle.contracts[ trabajo ] ) {
                  this.dispararActualizacion = false;

                  const contratoTrabajo = drizzle.contracts[ trabajo ],
                        emprendedorId   = contratoTrabajo.methods.emprendedor.cacheCall(),
                        descripcionId   = contratoTrabajo.methods.descripcion.cacheCall(),
                        trabajadorId    = contratoTrabajo.methods.trabajador.cacheCall(),
                        totalOfertasId  = contratoTrabajo.methods.totalOfertas.cacheCall(),
                        estadoTrabajo   = estadoDrizzle.contracts[ trabajo ];

                  this.dispararActualizacion = true;
                        
                  if ( estadoTrabajo ) {
                    if (
                      estadoTrabajo.emprendedor[ emprendedorId ]
                      && estadoTrabajo.descripcion[ descripcionId ]
                      && estadoTrabajo.trabajador[ trabajadorId ]
                      && estadoTrabajo.totalOfertas[ totalOfertasId ]
                    ) {
                      trabajos.push( {
                        direccion   : trabajo,
                        emprendedor : estadoTrabajo.emprendedor[ emprendedorId ].value,
                        descripcion : estadoTrabajo.descripcion[ descripcionId ].value,
                        trabajador  : estadoTrabajo.trabajador[ trabajadorId ].value,
                        ofertas     : [],
                      } );
                    }
                  }
                }
              }
            }
          }

          if ( totalTrabajos == trabajos.length ) {
            Cargador.desactivar();
          }
        } else {
          Cargador.desactivar();
        }
      }
    }

    this.setState( { trabajos } );
  }

  hacerOferta( precio, definicionPruebas, descripcion, fechaFinalizacion ) {
		if ( this.trabajoOfertado ) {
			const { drizzle }   = this.props,
						contrato      = drizzle.contracts[ this.trabajoOfertado ],
						idHacerOferta = contrato.methods['hacerOferta'].cacheSend(
							precio,
							definicionPruebas,
							descripcion,
							fechaFinalizacion,
							{
								from: drizzle.store.getState().accounts[0]
							}
						);

			this.ofertasHechas[ this.trabajoOfertado ] = idHacerOferta;
			// @todo verificar cuando oferta es ingresada en la blockchain
		}
  }

  cancelar() {
  }

  render() {
    return <div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Dirección</th>
            <th scope="col">Creador</th>
            <th scope="col">Descripción</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
        { this.state.trabajos.map( ( trabajo, i ) => {
          const { drizzle } = this.props;

          let insignia = null,
              estado   = null,
              acciones = [];

          if ( ! drizzle.web3.utils.hexToNumber( trabajo.trabajador ) ) {
            estado = 'abierto';
            insignia = 'primary';

            if ( trabajo.emprendedor === drizzle.store.getState().accounts[0] ) {
              if ( trabajo.ofertas.length ) {
                acciones.push( <a className="btn btn-primary" href="#" onClick={ ( e ) => { e.preventDefault(); } }>Ver ofertas</a> );
              }

              acciones.push( <a className="btn btn-danger" href="#" onClick={ ( e ) => { e.preventDefault(); this.cancelar(); } }>Cancelar</a> );
            } else {
              acciones.push( <a className="btn btn-primary" href="#" data-target="#oferta" data-toggle="modal" onClick={ () => this.trabajoOfertado = trabajo /* @todo asi? */ }>Hacer oferta</a> );
            }
          } else if ( true ) {
            estado = 'cerrado';
            insignia = 'warning';
          } else {
            estado = 'terminado';
            insignia = 'success';
          }

          return <tr key={ i }>
            <td className="align-middle"><code>{ trabajo.direccion }</code></td>
            <td className="align-middle"><code>{ trabajo.emprendedor }</code></td>
            <td className="align-middle">{ trabajo.descripcion }</td>
            <td className="align-middle"><span className={ 'badge text-uppercase badge-' + insignia }>{ estado }</span></td>
            <td className="align-middle">{ acciones.map( ( accion, i ) => <span key={ i }>{ i ? ' ' : '' }{ accion }</span> ) }</td>
          </tr>;
        } ) }
        </tbody>
      </table>
			<div className="modal" id="oferta" tabIndex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<form className="modal-content" onSubmit={ e => {
						e.preventDefault();

						const form = e.target;

						this.hacerOferta(
							form.precio.value,
							form.definicionPruebas.value.split( '\n' ),
							form.descripcion.value,
							form.fechaFinalizacion.value
						);

						$( '#oferta' ).modal( 'hide' );
					} }>
						<div className="modal-header">
							<h5 className="modal-title">Hacer oferta</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
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
    </div>
    ;
  }
}
