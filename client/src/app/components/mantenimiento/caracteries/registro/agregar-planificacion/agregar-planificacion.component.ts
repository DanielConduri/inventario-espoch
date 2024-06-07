import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { centrosModel, pagCenter } from 'src/app/core/models/centros';
import { pagNivelMantenimiento } from 'src/app/core/models/mantenimiento/nivelMantenimiento';
import { pagRegistroPreventivo } from 'src/app/core/models/mantenimiento/registro';
import { InventarioService } from 'src/app/core/services/Bienes-Services/inventario-service/inventario.service';
import { CentrosService } from 'src/app/core/services/centros.service';
import { InformesService } from 'src/app/core/services/informes.service';
import { CaracteristicasMantenimientoService } from 'src/app/core/services/mantenimiento/caracteristicas-mantenimiento.service';
import { RegistroMantenimientoService } from 'src/app/core/services/mantenimiento/registro-mantenimiento.service';
import { ModalService } from 'src/app/core/services/modal.service';
import { PaginacionService } from 'src/app/core/services/paginacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-planificacion',
  templateUrl: './agregar-planificacion.component.html',
  styleUrls: ['./agregar-planificacion.component.css']
})
export class AgregarPlanificacionComponent implements OnInit {

  private destroy$ = new Subject<any>() 

  myForm!: FormGroup;

  isLoading: boolean = false
  isData: boolean = false;

  aggBien: boolean = true
  verResumen: boolean = false
  arrBien: any = []
  checkbo!: boolean


  arrNotificar: any = []


  elementPagina: {
    dataLength: number,
    metaData: number,
    currentPage: number
  } = {
      dataLength: 0,
      metaData: 0,
      currentPage: 0
    }

  currentPage = 1;
  metadata: any;
  mapFiltersToRequest: any = {};

  formCentro!: FormGroup;

  nivel_id!: number
  nivel_nombre!: string

  dataCentros: {
    int_centro_id: number;
    int_centro_id_dependencia: number;
    int_centro_id_proceso: number;
    int_centro_nivel: number;
    int_centro_sede_id: number;
    int_centro_tipo: number;
    str_centro_cod_carrera: string;
    str_centro_cod_facultad: string;
    str_centro_estado: string;
    str_centro_nombre: string;
    str_centro_nombre_carrera: string;
    str_centro_nombre_dependencia: string;
    str_centro_nombre_facultad: string;
    str_centro_nombre_proceso: string;
    str_centro_nombre_sede: string;
    str_centro_tipo_nombre: string;
  } = {
    int_centro_id: 0,
    int_centro_id_dependencia: 0,
    int_centro_id_proceso: 0,
    int_centro_nivel: 0,
    int_centro_sede_id: 0,
    int_centro_tipo: 0,
    str_centro_cod_carrera: '',
    str_centro_cod_facultad: '',
    str_centro_estado: '',
    str_centro_nombre: '',
    str_centro_nombre_carrera: '',
    str_centro_nombre_dependencia: '',
    str_centro_nombre_facultad: '',
    str_centro_nombre_proceso: '',
    str_centro_nombre_sede: '',
    str_centro_tipo_nombre: '',
  };

  constructor(
    public srvCentros: CentrosService,
    public fb: FormBuilder,
    public srvMantenimiento: RegistroMantenimientoService, 
    public srvPlanificacion: CaracteristicasMantenimientoService,
    public srvPaginacion: PaginacionService,
    public srvModal: ModalService,
    public srvInventario: InventarioService,
    public srvInforme: InformesService
  ) {
    this.myForm = this.fb.group({

      fechaInicio: ['',[Validators.required] ],
      fechaFin:['', [Validators.required]],
      ubicacionId: [''],
      nombreCentro: [''],
      cantidadBienes:[0, ],
      codigosBienes:[[],],
      int_nivel_mantenimiento_id:[0,],
      str_planificacion_estado: ['']
    })

    this.formCentro = this.fb.group({

      int_centro_id: [''],
      str_centro_nombre: ['',],
      str_centro_tipo_nombre: ['',],
      str_centro_nombre_sede: ['', ],
      str_centro_nombre_facultad: ['', ],
      str_centro_nombre_dependencia: ['', ],
      str_centro_nombre_carrera: ['', ],
      str_centro_nombre_proceso: ['', ],

    });
   }

  ngOnInit(): void {

    this.nivelMantenimiento()

  }

  changeCentro(e: any) {
    const length = e.target.value.length;
    if (length % 2 === 0) {
      this.searchCentro({
        filter: {
          status: { parameter: 'str_centro_estado', data: 'ACTIVO' },
          like: { parameter: 'str_centro_nombre', data: e.target.value },
        },
      });
    }
  }

  searchCentro(filter: any) {
    const parametro = filter.filter?.like?.parameter;
    this.srvCentros
      .getCentrosFiltrados(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resCentro: centrosModel) => {
          // console.log('Informacion que llega a searchCentro =>', resCentro);
          this.autocomplete(
            document.getElementById('inp-Centro') as HTMLInputElement,
            resCentro.body,
            parametro,
            'centro'
          );
          //  console.log('se llena ->', ithis.dataCentros)

        },
      });
  }

  autocomplete(inp: HTMLInputElement, arr: any[], valor: string, name: string) {
    let ruc: string = '';
    let nombreC = '';
    let currentFocus: number;
    let ithis = this;
    inp?.addEventListener('input', function (e) {
      e.preventDefault();
      let a,
        b,
        i,
        val = this.value;
      closeAllLists(arr);
      if (!val) {
        return false;
      }
      currentFocus = -1;
      a = document.createElement('DIV');
      a.setAttribute('id', this.id + 'autocomplete-list');
      a.style.position = 'absolute';
      a.style.width = '100%';
      a.setAttribute('class', 'autocomplete-items');
      this.parentNode?.appendChild(a);

      let count = 0;

      for (let i = 0; i < arr.length; i++) {
        const text = arr[i][valor]?.toUpperCase();
        if (text?.includes(val.trim().toUpperCase())) {
          count++;
          b = document.createElement('DIV');

          const textDivList = text.split(val.toUpperCase());
          b.innerHTML = arr[i][valor].substr(0, textDivList[0].length);
          b.innerHTML +=
            '<strong>' +
            arr[i][valor].substr(textDivList[0].length, val.length) +
            '</strong>';
          b.innerHTML += arr[i][valor].substr(
            textDivList[0].length + val.length
          );
          b.innerHTML += "<input type='hidden' value='" + arr[i][valor] + "'>";

          if (valor.startsWith('str_ruc')) {
            nombreC = arr[i]['str_nombre_contratista'];
            b.innerHTML += ` - ${nombreC}`;
          }

          b.addEventListener('click', function (e) {
            inp.value = this.getElementsByTagName('input')[0].value;
            ithis.dataCentros = arr[i];
            // console.log(
            //   'Esto es lo que se le asigna a dataCentros =>',
            //   ithis.dataCentros
            // );
            // console.log(' para el switch ->',inp, arr, valor, name)

            // this.formCentro.value.str_centro_nombre = ithis.dataCentros.str_centro_nombre

            switch (name) {
              case 'centro':
                ithis.myForm
                  .get('ubicacionId')!
                  .setValue(arr[i].int_centro_id);
                ithis.myForm
                  .get('nombreCentro')!
                  .setValue(arr[i].str_centro_nombre);
                  // ithis.formCentro
                  // .get('int_centro_id')!
                  // .setValue(arr[i].int_centro_id);
                ithis.formCentro
                  .get('str_centro_tipo_nombre')!
                  .setValue(arr[i].str_centro_tipo_nombre);
                ithis.formCentro
                  .get('str_centro_nombre')!
                  .setValue(arr[i].str_centro_nombre);
                ithis.formCentro
                  .get('str_centro_nombre_sede')!
                  .setValue(arr[i].str_centro_nombre_sede);
                ithis.formCentro
                  .get('str_centro_nombre_facultad')!
                  .setValue(arr[i].str_centro_nombre_facultad);
                ithis.formCentro
                  .get('str_centro_nombre_dependencia')!
                  .setValue(arr[i].str_centro_nombre_dependencia);
                ithis.formCentro
                  .get('str_centro_nombre_carrera')!
                  .setValue(arr[i].str_centro_nombre_carrera);
                ithis.formCentro
                  .get('str_centro_nombre_proceso')!
                  .setValue(arr[i].str_centro_nombre_proceso);

                break;
              // case 'proveedor':
              //   ithis.myForm
              //     .get('int_proveedor_id')!
              //     .setValue(arr[i].int_proveedor_id);
              //   ithis.myForm
              //     .get('str_proveedor_nombre')!
              //     .setValue(arr[i].str_proveedor_nombre);
              //   ithis.myForm
              //     .get('str_proveedor_ruc')!
              //     .setValue(arr[i].str_proveedor_ruc);
              //   break;
              // case 'custodio':
              //   ithis.myForm
              //     .get('int_per_id')!
              //     .setValue(arr[i].int_per_id);
              //   ithis.myForm
              //     .get('str_per_nombres')!
              //     .setValue(arr[i].str_per_nombres);
              //   ithis.myForm
              //     .get('str_per_apellidos')!
              //     .setValue(arr[i].str_per_apellidos);
              //   ithis.myForm
              //     .get('str_per_cedula')!
              //     .setValue(arr[i].str_per_cedula);
              //   ithis.myForm
              //     .get('str_per_cargo')!
              //     .setValue(arr[i].str_per_cargo);
              //   break;
              // case 'catalogo':
              //   ithis.myForm
              //     .get('int_catalogo_bien_id')!
              //     .setValue(arr[i].int_catalogo_bien_id);
              //   ithis.myForm
              //     .get('str_catalogo_bien_id_bien')!
              //     .setValue(arr[i].str_catalogo_bien_id_bien);
              //   ithis.myForm
              //   .get('str_catalogo_bien_descripcion')!
              //   .setValue(arr[i].str_catalogo_bien_descripcion);
              //   break;
              //   case 'marca':
              //   ithis.myForm
              //     .get('int_marca_id')!
              //     .setValue(arr[i].int_marca_id);
              //   ithis.myForm
              //     .get('str_marca_nombre')!
              //     .setValue(arr[i].str_marca_nombre);
              //   break;
            }
            localStorage.setItem(
              'dataForm',
              JSON.stringify(ithis.myForm.value)
            );
            closeAllLists(arr);
          });
          a.appendChild(b);
        }
      }
      return true;
    });

    /*execute a function presses a key on the keyboard:*/
    inp?.addEventListener('keydown', function (e) {
      var x = document.getElementById(this.id + 'autocomplete-list') as any;
      if (x) x = x.getElementsByTagName('div');
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) {
        //up
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
    });
    function addActive(x: any) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = x.length - 1;
      x[currentFocus].classList.add('autocomplete-active');
      return true;
    }
    function removeActive(x: any) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove('autocomplete-active');
      }
    }
    function closeAllLists(elmnt: any) {
      /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
      var x = document.getElementsByClassName('autocomplete-items');
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode?.removeChild(x[i]);
        }
      }
    }
  }

  nivelMantenimiento() {
    this.srvPlanificacion.getNivelMantenimiento({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: pagNivelMantenimiento) => {
          if (data.body.length > 0) {
            // this.isData = true;
            // this.isLoading = true;
            this.srvPlanificacion.datosNivelMantenimiento = data.body
            // this.metadata = data.total
          }
          // console.log('lo que llega en el nivel ->', data)
          // Swal.close();
          // this.dataPagina()
        },
        error: (error) => { console.log(error) }
      })
  }

  getNivelName(e: any) {
    // console.log('para agarrar el nivel', e.value)
    const selectedOption: HTMLOptionElement = e.target['options'][e.target['selectedIndex']]; // 
    // console.log('lo que llega ->', selectedOption)
    const selectedValue: string = selectedOption.value;
    const selectedId: string = selectedOption.id;
    this.nivel_id = parseInt(selectedId)
    this.nivel_nombre = selectedValue
    console.log('lo que esta en el nivel', this.nivel_id, '---->', this.nivel_nombre)
    this.myForm.value.int_nivel_mantenimiento_id = this.nivel_id

    // console.log('el id y el nombre', selectedId, selectedValue)
    // this.myForm.value.int_correctivo_nivel_mantenimiento = selectedId
    // this.myForm.value.str_correctivo_nivel_nombre = selectedValue

  }


  send(){
    this.myForm.value.cantidadBienes = this.arrBien.length
    this.myForm.value.codigosBienes = this.arrBien
    this.myForm.value.int_nivel_mantenimiento_id = this.nivel_id
    this.myForm.value.str_planificacion_estado = 'DESARROLLO'

    console.log('lo que sale en el form', this.myForm.value)
    Swal.fire({
      title: '¿Está seguro de crear esta planificacion?',
      showDenyButton: true,
      confirmButtonText: 'Agregar',
      denyButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.srvPlanificacion.postPlanificacion(this.myForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (rest) => {

            if (rest.status) {
              Swal.fire({
                title: 'Planificacion creada Correctamente',
                icon: 'success',
                showConfirmButton: false,
                timer: 3500
              });
              // console.log("Res: ", rest)
            } else {
              Swal.fire({
                title: rest.message,
                icon: 'error',
                showConfirmButton: false,
                timer: 3500
              });
            }
            setTimeout(() => {
              // console.log('SettimeOut');
              // this.showCenter()
              Swal.close();
              this.obtenerRegistro()

            }, 3500);
            // this.srvInforme.typeviw = true
            // this.srvMantenimiento.especial = false
            // this.srvMantenimiento.typeview = false
            // Swal.close();


          },
          error:(err) => {
            console.log(err)
            Swal.fire({
              title: 'No se agrego el Mantenimiento',
              icon: 'error',
              showConfirmButton: false,
              timer: 1500
            });
          },
          complete: () => {
            this.myForm.reset()
            this.srvModal.closeModal()
          }
        })
      }
    })
  }

  obtenerRegistro(){
    Swal.fire({
      title: 'Cargando Registros...',
      didOpen: () => {
        Swal.showLoading();
        this.isLoading = true;
        this.isData = true;
      },
    });
    this.srvPlanificacion.getPlanificacion({})
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        if(data.body.length > 0){
          this.isData = true;
          this.isLoading = true;
          this.srvPlanificacion.datosPlanificacion = data.body
          this.metadata = data.total
        }
        // console.log('lo que llega', data)
        Swal.close();
        // this.dataPagina()
      },
      error: (error) => {
        console.log('Error', error)
      }
    })
  }

  
  // dataPagina() {
  //   this.elementPagina.dataLength = this.srvPlanificacion.datosPlanificacion ? this.srvPlanificacion.datosPlanificacion.length : 0;
  //   this.elementPagina.metaData = this.metadata;
  //   this.elementPagina.currentPage = this.mapFiltersToRequest.page
  //   this.srvPaginacion.setPagination(this.elementPagina)
  // }

  // pasarPagina(page: number) {
  //   this.mapFiltersToRequest = { size: 10, page, parameter: '', data: 0  };
  //   // console.log('mapFiltersToRequest', this.mapFiltersToRequest);
  //   this.obtenerRegistro();
  // }

  avanzarB(){
    this.aggBien = false
    this.verResumen = false
  }

  avanzarR(){
    this.aggBien = true
    this.verResumen = true
  }

  regresar(){
    this.aggBien = true
    this.verResumen = false
    this.srvInforme.datosSearch = []
  }

  regresar2(){
    this.aggBien = false
    this.verResumen = false
  }

  changeBien(e: any) {

    // console.log('lo que llega ->', checkbox);
    // if(checkbox.checked === true){

    // }
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
    console.log('lo que llega del sear ->', e.target.value);

  }

  searchBien(filter: any) {

    const parametro = filter.filter?.like?.parameter;
    this.srvInventario
      .getfiltro(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resBien: any) => {
          const checkbox = document.getElementById("flexCheckDefaultAll") as HTMLInputElement;
          // const checku = document.getElementsByClassName("flexCheckUs")
          let aux = 0
          checkbox.checked = false
          console.log('Informacion que llega a searchCentro =>', resBien);
          this.srvInforme.datosSearch = resBien.body
          console.log('dentro del servicio ->', this.srvInforme.datosSearch);
          for (let i = 0; i < this.srvInforme.datosSearch.length; i++) {
            let va = document.getElementById(String(i)) as any;
            // var dataId =  chekAux.getAttribute("data-id")
            // console.log("lo que sale del aux ->", dataId);
            if (this.arrBien.includes(this.srvInforme.datosSearch[i].str_codigo_bien)) {
              // checku.checked = true

              aux = aux + 1
              va.checked = true
              console.log(' input check->', va);
            }
            else {
              this.checkbo = false
              // this.checkbo = true
              va.checked = false
              console.log('el false ->', this.checkbo);
            }
          }
          if (aux == this.srvInforme.datosSearch.length) {
            checkbox.checked = true

          }
        },
      });
  }

  getAllChecks() {

    //     // const tabla = document.getElementById('tchecks') as any;
    const inputall = document.getElementById('flexCheckDefaultAll') as any;
    if (inputall.checked === true) {
      for (let i = 0; i < this.srvInforme.datosSearch.length; i++) {
        if (!this.arrNotificar.includes(this.srvInforme.datosSearch[i].str_bien_nombre)) {
          console.log('no hay, incgresa ->');
        }
        let vari = document.getElementById(String(i)) as any;
        // console.log('lo que trae code->', this.srvInforme.datosSearch);
        vari.checked = true;
        this.arrNotificar.push({ index: i, id: this.srvInforme.datosSearch[i].str_codigo_bien, name: this.srvInforme.datosSearch[i].str_bien_nombre });
        this.arrBien.push(this.srvInforme.datosSearch[i].str_codigo_bien)
        // this.myForm.value.str_codigo_bien = this.arrNotificar
      }
      // this.arrNotificar.push({ id: this.srvInforme.datosSearch});

    } else {
      for (let i = 0; i < this.srvInforme.datosSearch.length; i++) {
        let vari = document.getElementById(i + '') as any;
        vari.checked = false;
        let index = this.arrNotificar.indexOf(vari.value);
        this.arrNotificar.splice(index, 1);
        this.arrBien.splice(index, 1)
      }
    }

    //     this.newItemEvent.emit(this.arrNotificar);
    console.log('lo que sale del check ->', this.arrNotificar);
  }

  getCheckData(e: any, iD: number) {
    console.log('que llega ->', e.target.id, 'vs', iD);
    let index = Number(iD);
    let code = document.getElementById('dato-check')
    let valor = code?.innerHTML
    let name = document.getElementById('name-check')
    let nameDato = name?.innerHTML
    console.log('datos seleccion->', valor);

    let position = this.arrNotificar.findIndex((x: any) => x.index === index);
    if (e.target.checked) {
      if (!this.arrBien.includes(this.srvInforme.datosSearch[Number(iD)].str_codigo_bien)) {
        // console.log("0Existe ->>>>>");
        this.arrNotificar.push({
          index: Number(iD),
          id: this.srvInforme.datosSearch[Number(iD)].str_codigo_bien,
          name: nameDato
        });
        this.arrBien.push(this.srvInforme.datosSearch[Number(iD)].str_codigo_bien)
        // this.myForm.value.area = ''
      }


      console.log('datos del check solo ->', this.arrNotificar);
      console.log('lo que sale en el otro ->', this.arrBien)
    } else {
      this.arrNotificar.splice(position, 1);
      this.arrBien.splice(position, 1)
    }
    //     this.newItemEvent.emit(this.arrNotificar);
    console.log('lo que sale del check indiviadual ->', this.arrNotificar);

  }

  ngOnDestroy(): void {
    this.destroy$.next({});
    this.destroy$.complete();
  }

}
