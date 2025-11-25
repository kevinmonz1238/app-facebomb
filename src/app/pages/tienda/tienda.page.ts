import { Component, OnInit, OnDestroy } from '@angular/core';
import { TiendaService } from '../../services/tienda.service';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-tienda',
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss'],
})
export class TiendaPage implements OnInit, OnDestroy {

  productos: any[] = [];
  cargando: boolean = true;

  // Variables para las alertas visuales
  mensajeError: string = '';
  mensajeExito: string = '';

  itemsCarrito: number = 0;
  private carritoSubscription: Subscription | null = null;
  private productosSubscription: Subscription | null = null;

  constructor(
    private tiendaSrv: TiendaService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.suscribirAlCarrito();
  }

  ngOnDestroy() {
    this.carritoSubscription?.unsubscribe();
    this.productosSubscription?.unsubscribe();
  }

  cargarProductos() {
    this.cargando = true;
    this.productosSubscription = this.tiendaSrv.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: (error) => {
        console.error(error);
        this.mostrarMensaje('error', 'NO SE PUDO CONECTAR CON EL MERCADO');
        this.cargando = false;
      }
    });
  }

  suscribirAlCarrito() {
    this.carritoSubscription = this.tiendaSrv.getTotalItemsCarrito().subscribe({
      next: (total) => this.itemsCarrito = total,
      error: () => this.itemsCarrito = 0
    });
  }

  async agregar(id: string) {
    const user = this.auth.currentUser;

    // 1. Validación de Login
    if (!user) {
      this.mostrarMensaje('error', 'DEBES INICIAR SESIÓN PARA COMPRAR');
      return;
    }

    try {
      // Intento agregar al carrito
      await this.tiendaSrv.agregarAlCarrito(id);

      // 2. Éxito
      this.mostrarMensaje('exito', '¡ITEM AÑADIDO AL INVENTARIO!');

    } catch (error: any) {
      console.error(error);

      // 3. Manejo de errores específicos
      if (error.message?.includes('stock')) {
        this.mostrarMensaje('error', '¡AGOTADO! YA NO QUEDAN UNIDADES');
      } else if (error.code === 'unavailable' || error.code === 'network-error') {
        this.mostrarMensaje('error', 'FALLO DE RED. REVISA TU CONEXIÓN');
      } else {
        this.mostrarMensaje('error', 'ERROR EN LA TRANSACCIÓN');
      }
    }
  }

  // Función auxiliar para manejar los tiempos de los mensajes
  private mostrarMensaje(tipo: 'exito' | 'error', texto: string) {
    // Limpiamos el contrario para que no se solapen
    if (tipo === 'exito') {
      this.mensajeError = '';
      this.mensajeExito = texto;
    } else {
      this.mensajeExito = '';
      this.mensajeError = texto;
    }

    // Ocultar automáticamente a los 3 segundos
    setTimeout(() => {
      this.mensajeExito = '';
      this.mensajeError = '';
    }, 3000);
  }

 formatearPrecio(precio: number): string {
    // Validación explicita para evitar errores en tests
    if (precio === null || precio === undefined) {
      return '0';
    }
    return precio.toLocaleString('es-MX');
  }

  onErrorImagen(event: any, producto: any) {
    // Imagen placeholder si falla la original
    event.target.src = 'assets/icon/facepost.jpg';
  }
}
