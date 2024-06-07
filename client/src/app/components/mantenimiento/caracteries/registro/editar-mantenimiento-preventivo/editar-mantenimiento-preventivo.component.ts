import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { pagNivelMantenimiento } from 'src/app/core/models/mantenimiento/nivelMantenimiento';
import { InventarioService } from 'src/app/core/services/Bienes-Services/inventario-service/inventario.service';
import { CentrosService } from 'src/app/core/services/centros.service';
import { InformesService } from 'src/app/core/services/informes.service';
import { CaracteristicasMantenimientoService } from 'src/app/core/services/mantenimiento/caracteristicas-mantenimiento.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento/mantenimiento.service';
import { RegistroMantenimientoService } from 'src/app/core/services/mantenimiento/registro-mantenimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-mantenimiento-preventivo',
  templateUrl: './editar-mantenimiento-preventivo.component.html',
  styleUrls: ['./editar-mantenimiento-preventivo.component.css']
})


export class EditarMantenimientoPreventivoComponent implements OnInit {

  paso: number = 0
  arrNotificar: any = []
  arrBien: any = []
  manBien: any = []

  myForm!: FormGroup
  formPlanificacion!: FormGroup
  formCentro!: FormGroup
  formSent!: FormGroup
  formNivel!: FormGroup
  formSent2!: FormGroup

  descriptionForm!: FormGroup
  inventoryForm!: FormGroup

  // FormPrueba!: FormGroup

  planificacionID!: number


  bien!: string
  idSelect!: number

  nivel_id!: number
  nivel_nombre!: string

  mantenimientoId!: number

  checkbo!: boolean

  fields: any;

  cantidad!: number



  private destroy$ = new Subject<any>();


  constructor(
    public srvNivelM: CaracteristicasMantenimientoService,
    public srvInforme: InformesService,
    public srvInventario: InventarioService,
    public fb: FormBuilder,
    public srvRegistro: RegistroMantenimientoService,
    public srvCentros: CentrosService,
    public srvMantenimiento: MantenimientoService

  ) {


    this.formPlanificacion = this.fb.group({
      fechaInicio: ['',],
      fechaFin: ['',],
      ubicacionId: [''],
      nombreCentro: [''],
      cantidadBienes: [0,],
      codigosBienes: [[],],
      int_nivel_mantenimiento_id: [0,],
      str_planificacion_estado: ['']
    })

    this.formCentro = this.fb.group({

      // str_planificacion_centro: [''],

      int_centro_id: [''],
      str_centro_nombre: ['',],
      str_centro_tipo_nombre: ['',],
      str_centro_nombre_sede: ['',],
      str_centro_nombre_facultad: ['',],
      str_centro_nombre_dependencia: ['',],
      str_centro_nombre_carrera: ['',],
      str_centro_nombre_proceso: ['',],


    });

    this.formNivel = this.fb.group({
      nivel_descripción: [''],
      // int_nivel_mantenimiento_id:[0]
    })

    this.formSent = fb.group({
      // int_nivel_mantenimiento_id: [0],
      bienesDescripcion: [{}],
      idPlanificacion: [0],
      estadoPlanificacion: ['']
    })

    this.descriptionForm = this.fb.group({
      description: ['',],
      code: ['',],
    });

    this.inventoryForm = this.fb.group({
      inventoryItems: this.fb.array([]),
    });

    // this.FormPrueba = fb.group({
    //   area:[['']]
    // })
    // this.formSent2 = this.fb.group({
    //   str_planificacion_estado: ['']
    // })
    // console.log('por favor dejame dormir',
    //   this.srvRegistro.idRegistroPreventivoModify
    // )
  }
  
  
  ngOnInit(): void {
    
    // // this.nivelMantenimiento()
    // this.getPlanificacionById(this.srvRegistro.idRegistroPreventivoModify)
    this.srvNivelM.SelectUbicacionC$
    .pipe(takeUntil(this.destroy$))
    .subscribe({
        next: (data: any) => {
          console.log('lo que asoma----->', data)
          this.srvRegistro.ubicacionPreventivo = data
          if (data > 0) {
            // console.log('entrando al if del behavor')
            this.getInfocentros(data)
          }
        }
      })
      this.srvNivelM.SelectPlanEdid
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('lo que llega', data)
          this.planificacionID = data
          
          this.getPlanificacionById(data)
          this.getMantenimientoID(data)
          this.getMantenimiento2(data)
        }
      })
    this.srvRegistro.SelectCantidadBienes$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('lo que llega en el otro beha', data)
        }
      })

    
    console.log('funciona???', this.cantidad)
    this.myForm = this.fb.group({
      area: this.fb.array([])
    })
   
  }



  getMantenimiento2(id: number) {
    this.srvNivelM.dormirHoy(this.srvRegistro.idRegistroPreventivoModify)

    this.srvRegistro.obetnerMantenimientoP(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          
          this.myForm.patchValue({
            area: data.body.map((item: any) => item.str_mantenimiento_descripcion)
          });
          
          console.log('lo que llega mantenimiento ----->', data.body)

          console.log('lo que emprime de area --->', this.myForm.value)
        }
      })
  }

  getMantenimientoID(id: number) {
    this.srvRegistro.getPreventivoById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          for (let i = 0; i < data.body.bienes.length; i++) {
            (this.myForm.get('area') as FormArray).push(this.fb.control(''));
            console.log('------>')
          }
          console.log('lo que llega mantenimiento->', data.body)

          this.agregarBienes(data.body)
        },
        error: (err) => {
          console.log(err)
        }
      })
  }

  getPlanificacionById(id: number) {
    Swal.fire({
      title: 'Cargando...',
      didOpen: () => {
        Swal.showLoading()
      },
    });
    console.log('llegando ando', id)
    this.srvNivelM.getByIdPlanificacion(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('datos de la planificacion ->', data);
          console.log('funciona ---- 1 -----???', this.cantidad)

          Swal.close();
          this.formPlanificacion = this.fb.group({
            fechaInicio: [data.body.dt_fecha_inicio.substring(0, 10),],
            fechaFin: [data.body.dt_fecha_fin.substring(0, 10),],
            ubicacionId: [data.body.int_ubicacion_id],
            cantidadBienes: [data.body.int_planificacion_cantidad_bienes,],
            nombreCentro: [data.body.str_planificacion_centro],
            int_nivel_mantenimiento_id: [data.body.int_nivel_mantenimiento_id,],

          })

          this.getInfocentros(data.body.int_ubicacion_id)
          this.getNivelById(data.body.int_nivel_mantenimiento_id)

        },
        error: (error) => { console.log(error) }
      })
  }



  agregarBienes(bienes: any) {
    for (let i = 0; i < bienes.bienesNombre.length; i++) {
      this.arrNotificar.push({
        cod: bienes.bienesNombre[i].str_codigo_bien,
        name: bienes.bienesNombre[i].str_nombre_bien,
        id: bienes.bienes[i].int_mantenimiento_id,
        desc: bienes.bienes[i].str_mantenimiento_descripcion
        // int_mantenimiento_id: this.mantenimientoId
      })
      const newItemFormGroup = this.fb.group({
        descripcion: bienes.bienes[i].str_mantenimiento_descripcion,
        int_mantenimiento_id: bienes.bienes[i].int_mantenimiento_id,
      });

      (this.inventoryForm.get('inventoryItems') as FormArray).push(newItemFormGroup);
      this.arrBien.push(bienes.bienesNombre[i].str_codigo_bien)
    }
    console.log('lo que sale ------------>', this.arrNotificar)
  }

  nivelMantenimiento() {
    this.srvNivelM.getNivelMantenimiento({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: pagNivelMantenimiento) => {
          if (data.body.length > 0) {
            // this.isData = true;
            // this.isLoading = true;
            this.srvNivelM.datosNivelMantenimiento = data.body
            // this.metadata = data.total
          }
          // console.log('lo que llega en el nivel ->', data)
          // Swal.close();
          // this.dataPagina()
        },
        error: (error) => { console.log(error) }
      })
  }
  getNivelById(id: number) {
    console.log('lo que llega de id ->', id)
    // Swal.fire({
    //   title: 'Cargando...',
    //   didOpen: () => {
    //     Swal.showLoading();
    //     this.isLoading = true;
    //     this.isData = true;
    //   },
    // });
    this.srvNivelM.getByIdNivelM(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // Swal.close();
          console.log('lo que llega en nivel', data)
          this.formNivel = this.fb.group({
            nivel_descripción: [data.body.str_nivel_mantenimiento_descripcion]
          })

        },
        error: (error) => { console.log(error) }
      })
  }

  getInfocentros(id: number) {

    this.srvCentros.getDetalles(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          Swal.close()
          // console.log('datos de centro ->', data);
          this.formCentro = this.fb.group({
            str_centro_nombre: [data.body.str_centro_nombre,],
            // str_planificacion_centro: [data.str_planificacion_centro],
            str_centro_tipo_nombre: [data.body.str_centro_tipo_nombre,],
            str_centro_nombre_sede: [data.body.str_centro_nombre_sede,],
            str_centro_nombre_facultad: [data.body.str_centro_nombre_facultad,],
            str_centro_nombre_dependencia: [data.body.str_centro_nombre_dependencia,],
            str_centro_nombre_carrera: [data.body.str_centro_nombre_carrera,],
            str_centro_nombre_proceso: [data.body.str_centro_nombre_proceso,],



          })
        },
        error: (err) => {
          console.log(err)
        }
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
    this.myForm.value.int_preventivo_nivel_mantenimiento = this.nivel_id

    // console.log('el id y el nombre', selectedId, selectedValue)
    // this.myForm.value.int_correctivo_nivel_mantenimiento = selectedId
    // this.myForm.value.str_correctivo_nivel_nombre = selectedValue

  }


  regresar() {
    this.srvMantenimiento.preventivo = false

  }

  send() {


    this.formSent.value.bienesDescripcion = this.inventoryForm.value.inventoryItems
    const sendDataAc = this.myForm.value
    this.myForm.value.str_codigo_bien = this.arrBien
    this.formSent.value.idPlanificacion = this.planificacionID
    this.formSent.value.estadoPlanificacion = 'FINALIZADO'
    // this.formPlanificacion.value.str_planificacion_estado = 'FINALIZADO'
    // this.formPlanificacion.value.codigosBienes = this.arrBien
    console.log('------------------------------------------------------')
    console.log('formularios nuevos??????', this.inventoryForm.value)
    console.log('lo que va en el otro nuevo ????', this.descriptionForm.value)
    console.log('------------------------------------------------------')

    console.log('el enviar ->', this.myForm.value);
    console.log('lo que se envia ahora si ->', this.formSent.value)
    console.log('otro formulario ->', this.formPlanificacion.value)
    // console.log('otro otro formulario ->', this.formPlanificacion.value)
    Swal.fire({
      title: '¿Está seguro que desea agregar las observaciones?',
      showDenyButton: true,
      confirmButtonText: 'Agregar',
      denyButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.srvRegistro.putMantenimientoP(this.formSent.value)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              console.log(' todo bien')
            },
            error: (err) => {
              console.log(err)
            },
            complete: () => {
              this.srvMantenimiento.preventivo = false
              // this.actualizarEstado()
            }
          })
      }
    })
  }


  observaciones(loqsea: string, e: any, i: number) {
    console.log('lo que llega', loqsea)
    console.log('formulario', this.myForm.value)
    console.log('el bien ->', this.bien)
    console.log('-------------- i -------------', i)
    console.log(' ojala valgaesto ..--->', this.myForm.value.area[i])
    if (this.manBien.length > this.idSelect) {
      // for(let aux = 0; aux < this.manBien.length; aux ++){
      console.log('se corre-->', this.idSelect)
      if (this.bien == this.manBien[this.idSelect].codigo) {
        console.log('existe xd--------->')
        this.manBien[this.idSelect].descripcion = this.myForm.value.area
      } else {
        console.log('en el else---->')
        this.manBien.push({
          // codigo: this.bien,
          descripcion: this.myForm.value.area[i],
          // descripcion: e.target.value,
          int_mantenimiento_id: loqsea
        })
      }
      // }
    } else {
      this.manBien.push({
        // codigo: this.bien,
        descripcion: this.myForm.value.area[i],
        // descripcion: e.target.value,
        int_mantenimiento_id: loqsea
      })
    }
    this.modiSoloUno(this.manBien)
    console.log('como va el array de objetos ->>>', this.manBien)
  }

  modiSoloUno(bie: any) {
    console.log('lo que llega la funcion ->', bie)
    for (let i = 0; i < bie.length; i++) {
      for (let j = 0; j < this.arrNotificar.length; j++) {
        if (this.arrNotificar[j].id == bie[i].int_mantenimiento_id) {
          console.log('formular ----->', this.inventoryForm.value.inventoryItems[j].descripcion)
          console.log('array cambio -->', bie[i].descripcion)
          this.inventoryForm.value.inventoryItems[j].descripcion = bie[i].descripcion
        }
      }
    }
  }

  selectArea(id: number) {
    this.bien = ''
    this.bien = this.arrBien[id]
    this.idSelect = id
    // console.log('lo que sale ->', id)
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
