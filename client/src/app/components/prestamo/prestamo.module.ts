import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MostrarPrestamoComponent } from './mostrar-prestamo/mostrar-prestamo.component';
import { AgregarPrestamoComponent } from './agregar-prestamo/agregar-prestamo.component';
import { MostrarEstadosComponent } from './gestion/mostrar-estados/mostrar-estados.component';
import { AgregarEstadosComponent } from './gestion/agregar-estados/agregar-estados.component';
import { ModificarEstadosComponent } from './gestion/modificar-estados/modificar-estados.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MostrarPrestamoComponent,
    AgregarPrestamoComponent,
    MostrarEstadosComponent,
    AgregarEstadosComponent,
    ModificarEstadosComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ], 
  exports: [
    MostrarPrestamoComponent,
    AgregarPrestamoComponent,
    MostrarEstadosComponent,
    AgregarEstadosComponent,
    ModificarEstadosComponent,
  ]
})
export class PrestamoModule { }
