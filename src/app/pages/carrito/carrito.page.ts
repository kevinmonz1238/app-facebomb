import { Component, OnInit } from '@angular/core';
import { TiendaService } from '../../services/tienda.service';

@Component({
  standalone: false,
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {

  carrito: any[] = [];
  total = 0;

  constructor(private tiendaSrv: TiendaService) {}

  ngOnInit() {
    this.tiendaSrv.getCarrito().subscribe(res => {
      this.carrito = res;
      this.calcularTotal();
    });
  }

  calcularTotal() {
    this.total = this.carrito.reduce((acc, item) => acc + (item.cantidad * 100), 0);
  }

  cambiarCantidad(id: string, nueva: number) {
    this.tiendaSrv.cambiarCantidad(id, nueva);
  }

  eliminar(id: string) {
    this.tiendaSrv.eliminarDelCarrito(id);
  }

  comprar() {
    console.log("Compra realizada!");
  }
}
