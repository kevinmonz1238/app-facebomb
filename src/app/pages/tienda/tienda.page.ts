import { Component, OnInit } from '@angular/core';
import { TiendaService } from '../../services/tienda.service';

@Component({
  standalone: false,
  selector: 'app-tienda',
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss'],
})
export class TiendaPage implements OnInit {

  productos: any[] = [];

  constructor(private tiendaSrv: TiendaService) {}

  ngOnInit() {
    this.tiendaSrv.getProductos().subscribe(res => {
      this.productos = res;
    });
  }

  agregar(id: string) {
    this.tiendaSrv.agregarAlCarrito(id);
  }
}
