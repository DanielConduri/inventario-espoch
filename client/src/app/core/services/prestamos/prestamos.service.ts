import { Injectable } from '@angular/core';
import { OtrosOtros } from '../../models/Bienes/Inventario/otros';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { informeAgg } from '../../models/informes';


const intInfor: informeAgg = {
  id: 0,
  status: true
}
@Injectable({
  providedIn: 'root'
})
export class PrestamosService {

  typeview: boolean = false

  datosSearch!: OtrosOtros[]

  constructor(private http: HttpClient) { }

  private buttonName$ = new BehaviorSubject<informeAgg>(intInfor);

  get SelectButtonName$(): Observable<informeAgg> {
    return this.buttonName$.asObservable();
  }

  setButtonName(data: informeAgg) {
    this.buttonName$.next(data);
  }
}
