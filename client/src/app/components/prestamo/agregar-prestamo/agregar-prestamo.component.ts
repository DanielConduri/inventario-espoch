import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { OtrosShowModelPag } from 'src/app/core/models/Bienes/Inventario/otros';
import { cargaLoading, pagCenter } from 'src/app/core/models/centros';
import { InventarioService } from 'src/app/core/services/Bienes-Services/inventario-service/inventario.service';
import { CentrosService } from 'src/app/core/services/centros.service';
import { HorarioService } from 'src/app/core/services/horario.service';
import { PrestamosService } from 'src/app/core/services/prestamos/prestamos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-prestamo',
  templateUrl: './agregar-prestamo.component.html',
  styleUrls: ['./agregar-prestamo.component.css']
})
export class AgregarPrestamoComponent implements OnInit {
  private destroy$ = new Subject<any>();

  currentPage = 1;
  metadata: any;
  mapFiltersToRequest: any = {};
  cedulaLogin: any = {};

  data: string = '';
  parameter: string = '';

  elementPagina: {
    dataLength: number,
    metaData: number,
    currentPage: number
  } = {
      dataLength: 0,
      metaData: 0,
      currentPage: 0
    }

  isLoading: boolean = false
  isData: boolean = false;

  arrBien: any = []
  checkbo!: boolean

  moTabla!: boolean
  moTabla2!: boolean
  srvMantenimiento: any;

  cedulaCustodio!: string

  bienesSelect: any = []
  bienesCustodio: any = []
  prueba!: any

  dias!: string[]
  horarios!: any[]
  id!:any[]
  inicio!: string[]
  fin!: string[]
  aux!:any[]

  ubicacion!: string

  constructor(
    public srvPrestamos: PrestamosService,
    public srvInventario: InventarioService,
    public srvCentros: CentrosService,
    public srvHorario: HorarioService
  ) { }

  ngOnInit(): void {
    // this.pasarPagina(1)
    this.srvHorario.horarioPrestamo = []

  }

  regresar() {
    this.srvPrestamos.typeview = false
  }

  changeBien(e: any) {
    this.moTabla2 = false
    const length = e.target.value.length;
    if (length % 2 === 0 && length > 2) {
      const textSearch = Number(e.target.value);
      if (isNaN(textSearch)) {
        this.searchBien({
          filter: {
            status: { parameter: 'str_bien_estado', data: 'ACTIVO' },
            like: { parameter: 'str_bien_nombre', data: e.target.value },
          },
        });
      } else {
        this.searchBien({
          filter: {
            status: { parameter: 'str_bien_estado', data: 'ACTIVO' },
            like: { parameter: 'str_codigo_bien', data: e.target.value },
          },
        });
      }

    }
    // console.log('lo que llega del sear ->', e.target.value);

  }

  searchBien(filter: any) {
    const parametro = filter.filter?.like?.parameter;
    this.srvInventario
      .getfiltro(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resBien: any) => {
          this.srvPrestamos.datosSearch = resBien.body
          console.log('dentro del servicio ->', this.srvPrestamos.datosSearch);
          this.moTabla = true
        },
      });
  }

  checkData(e: any) {
    console.log('entra a la funcion de agregar')
    this.srvPrestamos.datosSearch = []
    this.moTabla = false
    this.moTabla2 = true
    this.srvInventario.getBienById(e)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (datosbien) => {
          console.log('lo que llega del bien ->', datosbien.body)
          this.ubicacion = datosbien.body.str_ubicacion_nombre
          this.srvInventario.dataBienInfo = datosbien.body
          this.cedulaCustodio = datosbien.body.str_custodio_cedula
          this.bienesSelect.push(datosbien.body)
          console.log('bienes select ->', this.bienesSelect)
          this.bienesCustodio = []
          this.getBienesOtros()
          this.traerCentro()
        },
        error: (err) => {
          console.log('error al obtener el bien', err)
        }
      })
  }

  getBienesOtros() {
    
    this.mapFiltersToRequest = {
        size: 100,
        page: 1,
        parameter: '',
        data: '',
      };

    Swal.fire({
      title: 'Cargando Bienes...',
      didOpen: () => {
        Swal.showLoading()
      }
    });


    this.srvInventario.getBienesPorCustodio(this.mapFiltersToRequest, this.cedulaCustodio)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dataOtros: OtrosShowModelPag) => {
          // console.log("Obteniendo Bienes Otros de la base de Datos", dataOtros);
          this.isData = false;
          if (dataOtros.body.length > 0) {

            this.isData = true;
            console.log("Obteniendo Bienes Otros de la base de Datos", dataOtros);
            this.srvInventario.datosOtros = dataOtros.body;
            // });
            const bienesSelectIds = new Set(this.bienesSelect.map((bien: any) => bien.int_bien_id));

            this.bienesCustodio = this.srvInventario.datosOtros.filter(
              dato => !bienesSelectIds.has(dato.int_bien_id)
            );
            console.log('bienes custodio ->', this.bienesCustodio)
            // this.metadata = dataOtros.total;
            // console.log('metadatos ->', this.metadata);
            Swal.close();
          }

        },
        error: (err) => {
          console.log("Error al obtener los Bienes Otros", err);
        },
        complete: () => {

          // this.dataPagina()
        }
      })
  }

  Agregar(bien: any) {
    console.log('bien a agregar ->', bien)
    this.checkData(bien)

  }

  quitarBien(index: number){
    console.log('bien a quitar ->', index)
    this.bienesSelect.splice(index, 1)
    console.log('bienes select ->', this.bienesSelect)
    this.getBienesOtros()
    // this.bienesSelect.pop()
  }

  traerCentro(){
    this.mapFiltersToRequest = {
      size: 10,
      page: 1,
      parameter: 'str_centro_nombre',
      data: this.ubicacion,
    };
    console.log('lo que envio ->', this.mapFiltersToRequest)
    this.srvCentros
      .getCenter(this.mapFiltersToRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (center: pagCenter) => {
          console.log('center ->', center);
          this.srvHorario.getHorarios(center.body[0].int_centro_id)
          
          this.horario()

        },
        error: (err) => {
          console.log('error ->', err);
        },
        complete: () => {},
      });

  }

  horario(){
    this.srvHorario.SelectHorarioCentro$
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        console.log('data horario ->', data)
        this.srvHorario.horarioPrestamo = data.body
      },
      error: (err) => {
        console.log('error ->', err);
      },
    })
  }

  // pasarPagina(page: number) {
  //   this.mapFiltersToRequest = { size: 100, page: page, parameter: this.parameter, data: this.data };
  //   // this.getBienesOtros();
  // }


  ngOnDestroy(): void {
    this.destroy$.next({});
    this.destroy$.complete();
  }



}
