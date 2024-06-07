import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CatalogoData, CatalogoShowModel1 } from 'src/app/core/models/Bienes/Caracteristicas/catalogo';
import { MarcasData, pagMarcas } from 'src/app/core/models/Bienes/Caracteristicas/marcas';
import { OtrosOtros, OtrosShowModelPag } from 'src/app/core/models/Bienes/Inventario/otros';
import { dataUbicacionReporte } from 'src/app/core/models/informes';
import { CaracteristcasService } from 'src/app/core/services/Bienes-Services/caracteristicas-service/caracteristicas.service';
import { InventarioService } from 'src/app/core/services/Bienes-Services/inventario-service/inventario.service';
import { CentrosService } from 'src/app/core/services/centros.service';
import { ModalService } from 'src/app/core/services/modal.service';
import { ReportesService } from 'src/app/core/services/reportes.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-mostrar-reporte',
  templateUrl: './mostrar-reporte.component.html',
  styleUrls: ['./mostrar-reporte.component.css']
})
export class MostrarReporteComponent implements OnInit {

  reporteJson: number[] = [1, 2, 3]
  variable: boolean = true

  selectedCheckboxes: number = 0;
  checkboxLimit: number = 5; // Establece aquí el límite deseado
  areCheckboxesDisabled: boolean = false;

  private destroy$ = new Subject<any>();
  

  pdf: any = ""
  myForm!: FormGroup;

  date!: any

  garant: boolean = false
  auxG: boolean = false

  origenIngreso:boolean = false;
  tipoIngreso: boolean = false;
  bienesPorCatalogo!: number;

  fechaCompra: boolean = false

  fechaActual: Date = new Date();
  fechaFormateada1!: any;
  fechaFormateada2!: any;
  fechaUsar1!: string
  fechaUsar2!: string

  fechaSeleccionada!: number

  catalog: boolean = false;
  bienSelectedId!: number
  _catalog!: boolean
  searchResult: any = null;
  data: string = '';
  parameter: string = '';
  mapFiltersToRequest: any = {};
  

  dataCatalogo!: CatalogoData[]

  options: string[] = ['descripcion'];
  idCatalogo!: string

  dataMarca!: MarcasData[]
  dataUbicacion!: dataUbicacionReporte[]
  dataHistorial!: OtrosOtros[]

  options1: string[] = ['nombre'];
  marc!: boolean
  _marc!: boolean

  options2: string[] = ['nombre'];
  ubic!: boolean
  _ubic!: boolean

  options3: string[] = ['nombre', 'codigo_bien'];
  histo!: boolean
  _histo!: boolean


  totalBienes: boolean = false;



  fechas: {
    fechaI: any,
    fechaF: any
  } = {
      fechaI: '',
      fechaF: ''
    }

  constructor(private srvReportes: ReportesService, public fb: FormBuilder,
    public srvModal: ModalService, private datePipe: DatePipe,
    public srvCaracteristicas: CaracteristcasService,
    public srvInventario: InventarioService,
    private http: HttpClient
  ) {
    this.fechaFormateada1 = this.datePipe.transform(this.fechaActual, 'dd/MM/yyyy')
    this.fechaUsar1 = this.fechaFormateada1.toString()
    this.fechaFormateada2 = this.datePipe.transform(this.fechaActual, 'yyyy-MM-dd')
    this.fechaUsar2 = this.fechaFormateada2.toString()
    // console.log('la fecha es ->>>>>>', this.fechaUsar1, this.fechaUsar2)
    this.myForm = this.fb.group({
      // marca: new FormControl({value:'marca', disabled:true}),
      reporte_marca: [
        false,
      ],
      reporte_color: [
        false,
      ],
      reporte_material: [
        false,
      ],
      reporte_condicion: [
        false,
      ],
      reporte_estado: [
        false,
      ],
      reporte_bodega: [
        false,
      ],
      reporte_origen: [
        false,
      ],
      reporte_custodios: [
        false,
      ],
      reporte_fecha_ingreso: [
        false,
      ],
      reporte_bienes_total: [
        false,
      ]
    })
  }

  ngOnInit(): void {

    // this.getInforme()
    this.funcionFecha('febrero')
  }

  detalle() {
    this.variable = false
  }

  getInforme() {
    this.auxG = false
    this.srvReportes.getPDF({})
      .pipe(takeUntil(this.destroy$)).
      subscribe({
        next: (data: any) => {
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (err) => {
          console.log('Error ->', err);
        }
      })
  }

  getFechaG(e: any) {

  }

  generarExcel(){

    if(this.origenIngreso === true) {
      //console.log('Valor origenINgreso', this.origenIngreso)
      this.getIngresoOrigenExcel()
      this.origenIngreso = false
    } else if (this.catalog === true) {
      this.getBienesCatalogoExcel()
      this.catalog = false
    } else if(this.marc) {
      this.getBienesMarcaExcel()
      this.marc = false
    } else if(this.ubic) {
      this.getBienesUbicacionExcel()
      this.ubic = false
    } else if(this.fechaCompra === true) {
      if(this.fechaSeleccionada === 1)
        this.getBienesFechaCompraExcel()
      else 
      this.getBienesFechaCompraExcelDos()
      
      this.fechaCompra = false
      this.fechaSeleccionada = 0;
    } else if(this.tipoIngreso === true) {
      this.tipoIngresoExcel()
      this.tipoIngreso = false
    } else if(this.totalBienes === true) {
      this.getBienesTotalExcel()
      this.totalBienes = false
    }
    

    //this.srvInventario.setData_Bool$(true);
  }

  getIngresoOrigenExcel() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getIngresoOrigenExcel(this.origenIngreso)
    //this.http.get('http://localhost:8001/wsinventario/reportes/totalBienes', { responseType: 'blob' })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: Blob) => {
        saveAs(response, 'Ingreso_origen.xlsx')
        Swal.close()
      },
      error: (error) => {
        console.log('Error ->', error);
      }
    })

    
  }


  getBienesCatalogoExcel() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getBienesPorCatalogoExcel(this.bienSelectedId, this.catalog)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: Blob) => {
        saveAs(response, 'Bienes_por_catalogo.xlsx')
        Swal.close()
      },
      error: (error) => {
        console.log('Error ->', error);
      }
    })
  }

  getBienesMarcaExcel() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getBienesPorMarcaExcel(this.bienSelectedId, this.marc)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: Blob) => {
        saveAs(response, 'Bienes_por_marca.xlsx')
        Swal.close()
      },
      error: (error) => {
        console.log('Error ->', error);
      }
    })
  }

getBienesUbicacionExcel() {
  Swal.fire({
    title: 'Cargando...',
    didOpen: () => {
      Swal.showLoading()
    },
  });
  this.srvReportes.getBienesPorUbicacionExcel(this.bienSelectedId, this.ubic)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (response: Blob) => {
      saveAs(response, 'Bienes_por_ubicacion.xlsx')
      Swal.close()
    },
    error: (error) => {
      console.log('Error ->', error);
    }
  })
}

getBienesFechaCompraExcel() {
  Swal.fire({
    title: 'Cargando...',
    didOpen: () => {
      Swal.showLoading()
    },
  });
  this.srvReportes.getBienesFechaCompraExcel(this.fechaCompra)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (response: Blob) => {
      saveAs(response, 'Bienes_por_fecha_compra_1.xlsx')
      Swal.close()
    },
    error: (error) => {
      console.log('Error ->', error);
    }
  })
}

getBienesFechaCompraExcelDos() {
  Swal.fire({
    title: 'Cargando...',
    didOpen: () => {
      Swal.showLoading()
    },
  });
  this.srvReportes.getBienesFechaCompraDosExcel(this.fechaCompra)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (response: Blob) => {
      saveAs(response, 'Bienes_por_fecha_compra_2.xlsx')
      Swal.close()
    },
    error: (error) => {
      console.log('Error ->', error);
    }
  })
}

tipoIngresoExcel() {
  Swal.fire({
    title: 'Cargando...',
    didOpen: () => {
      Swal.showLoading()
    },
  });
  this.srvReportes.getTipoIngresoExcel(this.tipoIngreso)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (response: Blob) => {
      saveAs(response, 'BienesTipoIngreso.xlsx')
      Swal.close()
    },
    error: (error) => {
      console.log('Error ->', error);
    }
  })
}

  
  funcionFecha(mesString: string) {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const indice = meses.findIndex(mes => mes.toLowerCase() === mesString.toLowerCase()) + 1;
    // console.log('el numero del mes ->', indice)
  }



  onCheckboxChange(e: any,) {
    this.auxG = false
    this.fechaCompra = false
    this.garant = false
    this.catalog = false
    this.marc = false
    this.ubic = false
    this.histo = false
    this._catalog = false
    this._marc = false
    this._ubic = false
    this._histo = false
    this.totalBienes = false

    this.selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked').length;
    // console.log('cantidad->', this.selectedCheckboxes);
    this.areCheckboxesDisabled = this.selectedCheckboxes >= this.checkboxLimit;
    // console.log('bloqueo ->', this.areCheckboxesDisabled);
    // console.log('valor ->', this.myForm.value);
    // console.log('que arroja el e->', e.target);

    this.date = this.myForm.value.reporte_fecha_ingreso
    // const checked = (e.target as HTMLInputElement)?.checked
    // console.log('que es->');
    // console.log('valor individual ->', e.target.value);
    switch (e.target.value) {
      case '1':
        this.getIngresoOrigen()
        //console.log('Selecciono getOrigenIngreso', e.target.value)
        this.origenIngreso = true
        break
      case '2':
        this.getTipoIngreso()
        this.tipoIngreso = true
        break
      case '3':
        this.fechaCompra = true
        break
      case '4':
        this.garant = true
        break
      case '5':
        this.catalog = true
        this.origenIngreso = false
        break
      case '6':
        this.marc = true
        break
      case '7':
        // this.getUbicacionBien()
        this.ubic = true
        break
      case '8':
        this.histo = true
        break
      case '9':
        this.totalBienes = true
        this.getBienesTotal()
        break
    }

    // console.log('case ->', this.values);
  }

  resetOpciones(){
    this.origenIngreso = false
    this.marc = false
    this.origenIngreso = false
  }


  getBienesTotal () {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getBienesTotal()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()

          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }

      })

  }
  getBienesTotalExcel() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getBienesTotalExcel(this.totalBienes)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: Blob) => {
        saveAs(response, 'bienes.xlsx')
        Swal.close()
      },
      error: (error) => {
        console.log('Error ->', error);
      }
    })
  }

  getIngresoOrigen() {
    this.auxG = false
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getOrigenIngreso()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()

          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }

      })
  }

  getTipoIngreso() {
    this.auxG = false
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getTipoIngreso(this.tipoIngreso)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()

          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }

      })
  }

  getFechaCompra() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getBienesFechaCompra()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()

          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }

      })
  }

  getFechaCompra2() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getBienesFechaCompra2()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }

      })
  }

  getBienesConGarantia() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getBienesConGarantia()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }

      })
  }

  getBienesConGarantiaF(fechas: any) {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getBienesConGarantiaPorFecha(fechas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }

      })

  }

  fechCompra(e: any) {
    switch (e.target.value) {
      case '1':
        this.getFechaCompra()
        this.fechaSeleccionada = 1;
        break
      case '2':
        this.getFechaCompra2()
        this.fechaSeleccionada = 2;
        break
      default:
        break

    }
  }

  funcionGarantia() {
    if (this.auxG) {
      const check = document.getElementById('SelectD') as HTMLInputElement
      const fechI = document.getElementById('dateI') as HTMLInputElement
      const fechF = document.getElementById('dateF') as HTMLInputElement

      const uFechI = this.datePipe.transform(fechI.value, 'dd/MM/yyyy')
      const uFechF = this.datePipe.transform(fechF.value, 'dd/MM/yyyy')

      // console.log('el check', check.checked)
      if (check.checked) {
        this.fechas.fechaI = uFechI?.toString()
        this.fechas.fechaF = uFechF?.toString()
        this.getBienesConGarantiaF(this.fechas)
        // console.log('las fechas ->', fechI.value, fechF.value)
      } else {
        // console.log('esta en el no')
        this.getIngresoOrigen()
      }
    } else {
      this.getBienesConGarantia()
    }

  }

  funcionPrincipalG() {
    this.auxG = false
    const check = document.getElementById('SelectD') as HTMLInputElement
    if (check.checked) {
      this.auxG = true
      // console.log('esta en el si')
    }
  }

  //////////////////////////////////////////////////

  handleSearch(result: any) {
    this.searchResult = result;
    if (this.catalog) {
      if (this.searchResult.data === '' || this.searchResult.data === null || this.searchResult.data === undefined) {
        // this.srvModal.report = false
        this.parameter = ''
        this.data = '';
        // this.pasarPagina(1);
      } else {
        this.srvModal.report = true
        this.parameter = 'str_catalogo_bien_' + this.searchResult.parameter;
        this.data = this.searchResult.data;
        this.mapFiltersToRequest = { size: 1000, page: 1, parameter: this.parameter, data: this.searchResult.data };
        // console.log('lo que llega del filtro ->', this.searchResult.data)
        // this.getCatalogo();
        this.getBienesCatalogo()
      }
    }
    if (this.marc) {
      // console.log('entra al if', this.marc)
      if (this.searchResult.data === '' || this.searchResult.data === null || this.searchResult.data === undefined) {
        this.parameter = ''
        this.data = '';
        // this.pasarPagina(1);
      } else {
        // console.log('handleSearch else');
        this.parameter = 'str_marca_' + this.searchResult.parameter;
        this.data = this.searchResult.data;
        this.mapFiltersToRequest = { size: 1000, page: 1, parameter: this.parameter, data: this.searchResult.data };
        // this.getMarcas();
        this.getBienesMarca()
      }
    }
    if (this.ubic) {
      if (this.searchResult.data === '' || this.searchResult.data === null || this.searchResult.data === undefined) {
        this.parameter = ''
        this.data = '';
        // this.pasarPagina(1);
      } else {
        this.parameter = 'str_ubicacion_' + this.searchResult.parameter
        this.data = this.searchResult.data
        this.mapFiltersToRequest = { size: 1000, page: 1, parameter: this.parameter, data: this.searchResult.data };
        this.getUbicacionBien();
      }
    }

    if (this.histo) {
      if (this.searchResult.data === '' || this.searchResult.data === null || this.searchResult.data === undefined) {
        this.parameter = ''
        this.data = '';
        // this.pasarPagina(1);
      } else {
        // console.log('handleSearch else -> como lega el parametro', this.searchResult.parameter);
        //'nombre', 'modelo', 'marca', 'serie', 'estado'
        if (this.searchResult.parameter === 'estado_logico' || this.searchResult.parameter === 'nombre' || this.searchResult.parameter === 'modelo' || this.searchResult.parameter === 'serie') {
          this.parameter = 'str_bien_' + this.searchResult.parameter;
        }
        //'ubicacion','bodega','condicion_bien','marca'
        else if (this.searchResult.parameter === 'ubicacion' || this.searchResult.parameter === 'bodega' || this.searchResult.parameter === 'condicion_bien' || this.searchResult.parameter === 'marca') {
          this.parameter = 'int_' + this.searchResult.parameter + '_id';
          this.mapFiltersToRequest = { size: 10, page: 1, parameter: this.parameter, data: parseInt(this.searchResult.data) };

        } else {
          this.parameter = 'str_' + this.searchResult.parameter;
        }
        // console.log('handleSearch else -> como queda el parametro ->', this.parameter);
        this.data = this.searchResult.data;
        this.mapFiltersToRequest = { size: 10, page: 1, parameter: this.parameter, data: this.searchResult.data };
        //  this.getBienesOtros();
        this.getBienesHistorial()
      }
    }

  }

  getBienesCatalogo() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvCaracteristicas.getCatalogo(this.mapFiltersToRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: CatalogoShowModel1) => {
          if (data.body) {
            // this.isData = true;
            this._catalog = true
            // console.log("Obteniendo Catalogo de la base de Datos", data.body);
            this.dataCatalogo = data.body
          } else {
            // this.isData = false;
            // console.log("No se pudo obtener el Catalogo de la base de Datos");
          }
        },
        error: (err: any) => {
          console.log("Error al obtener el Catalogo de la base de Datos", err);
        },
        complete: () => {
          // console.log("Peticion completa")
          Swal.close();
          // this.dataPagina()
        }
      });
  }

  getIdCatalogo(e: any) {
    const selectedOption: HTMLOptionElement = e.target['options'][e.target['selectedIndex']]; //  
    const selectedId: number = parseInt(selectedOption.id);
    this.bienSelectedId = selectedId;
    // console.log('e ->', selectedOption.id);


    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getBienesPorCatalogo(selectedId, this.catalog)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }
      })
  }


  getBienesMarca() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    // console.log('datos del filtro ->', this.mapFiltersToRequest)
    this.srvCaracteristicas.getMarcasP(this.mapFiltersToRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: pagMarcas) => {
          if (data.body) {
            this._marc = true
            // console.log('lo que llega del body ->', data.body)
            this.dataMarca = data.body
            // console.log('lo que llega marcas ->', this.dataMarca)
          } else {
            // this.isData = false;
          }
          // this.dataPagina();
        },
        error: (err) => {
          console.log("Error al obtener las marcas", err);
        },
        complete: () => {
          Swal.close();
        }
      });
  }

  getIdMarca(e: any) {
    const selectedOption: HTMLOptionElement = e.target['options'][e.target['selectedIndex']]; //  
    const selectedId: number = parseInt(selectedOption.id);
    this.bienSelectedId = selectedId;
    // console.log('e ->', selectedOption.id);

    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getBienesPorMarca(selectedId, this.marc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }
      })
  }

  getUbicacionBien() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    this.srvReportes.getBienesUbicacion(this.mapFiltersToRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this._ubic = true
          Swal.close()
          // console.log('Lo que llega ->', data);
          this.dataUbicacion = data.body
        },
        error: (error) => {
          console.log('Error ->', error);
        },
        complete: () => {
          Swal.close()
        }
      })
  }

  getIdUbicacion(e: any) {
    const selectedOption: HTMLOptionElement = e.target['options'][e.target['selectedIndex']]; //  
    const selectedId: number = parseInt(selectedOption.id);
    this.bienSelectedId = selectedId;
    // console.log('e ->', selectedOption.id);

    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getBienesPorUbicacion(selectedId, this.ubic)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }
      })
  }


  getBienesHistorial() {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvInventario.getBienes(this.mapFiltersToRequest, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: OtrosShowModelPag) => {
          this._histo = true
          // console.log('lo que llega de bienes ->', data.body)
          this.dataHistorial = data.body
        },
        error: (err) => {
          console.log("Error al obtener los Bienes Otros", err);
        },
        complete: () => {
          Swal.close()
        }
      })

  }

  getIdHistorial(e: any) {
    const selectedOption: HTMLOptionElement = e.target['options'][e.target['selectedIndex']]; //  
    const selectedId: number = parseInt(selectedOption.id);
    // console.log('e ->', selectedOption.id);

    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });

    this.srvReportes.getBienesPorHistorial(selectedId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          this.pdf = data.body
          let viewpdf = document.getElementById('ver-pdf-solicitud');
          if (viewpdf) {
            viewpdf.innerHTML =
              ' <iframe src="' +
              'data:application/pdf;base64,' +
              this.pdf +
              '" type="application/pdf" width="100%" height="600" />';
          }
          // console.log('Lo que llega ->', data);
        },
        error: (error) => {
          console.log('Error ->', error);
        }
      })

  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}