import { Component, OnInit, OnDestroy } from '@angular/core';
import { TiendaService } from '../../services/tienda.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit, OnDestroy {

  carrito: any[] = [];
  total = 0;
  cargando: boolean = true;

  private carritoSubscription: Subscription = new Subscription();

  constructor(
    private tiendaSrv: TiendaService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.suscribirAlCarrito();
  }

  ngOnDestroy() {
    this.carritoSubscription.unsubscribe();
  }

  suscribirAlCarrito() {
    this.cargando = true;

    this.carritoSubscription = this.tiendaSrv.getCarrito().subscribe({
      next: (carrito) => {
        console.log('Carrito recibido:', carrito);
        this.carrito = carrito || [];
        this.calcularTotal();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando carrito:', error);
        this.carrito = [];
        this.total = 0;
        this.cargando = false;
      }
    });
  }

  // Forzar recarga del carrito
  ionViewWillEnter() {
    this.recargarCarrito();
  }

  recargarCarrito() {
    this.cargando = true;
    // Nos resuscribimos para forzar una nueva consulta
    this.carritoSubscription.unsubscribe();
    this.suscribirAlCarrito();
  }

  calcularTotal() {
    this.total = this.carrito.reduce((acc, item) => {
      const precio = this.getPrecioProducto(item);
      const cantidad = item.cantidad || 1;
      return acc + (cantidad * precio);
    }, 0);
    console.log('Total calculado:', this.total);
  }

  async cambiarCantidad(id: string, nuevaCantidad: number) {
    try {
      console.log('Cambiando cantidad:', id, nuevaCantidad);
      await this.tiendaSrv.cambiarCantidad(id, nuevaCantidad);
      // No necesitamos forzar recarga ya que la suscripción se actualiza automáticamente
    } catch (error) {
      console.error('Error cambiando cantidad:', error);
      this.mostrarError('Error al cambiar la cantidad');
    }
  }

  async eliminar(id: string) {
    try {
      console.log('Eliminando producto:', id);
      await this.tiendaSrv.eliminarDelCarrito(id);
      // No necesitamos forzar recarga ya que la suscripción se actualiza automáticamente
    } catch (error) {
      console.error('Error eliminando producto:', error);
      this.mostrarError('Error al eliminar el producto');
    }
  }

  async comprar() {
    if (this.carrito.length === 0) {
      this.mostrarError('El carrito está vacío');
      return;
    }

    const alert = await this.alertController.create({
      header: '¡CONFIRMAR COMPRA!',
      message: `¿Estás seguro de que quieres comprar ${this.carrito.reduce((total, item) => total + (item.cantidad || 1), 0)} productos por ${this.total} monedas?`,
      buttons: [
        {
          text: 'CANCELAR',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'COMPRAR',
          handler: () => {
            this.procesarCompra();
          }
        }
      ]
    });

    await alert.present();
  }

  async procesarCompra() {
    try {
      console.log('Procesando compra...', this.carrito);
      const totalItems = this.carrito.reduce((total, item) => total + (item.cantidad || 1), 0);

      // Aquí iría la lógica real de compra
      // Por ahora solo vaciamos el carrito
      await this.tiendaSrv.vaciarCarrito();

      const alert = await this.alertController.create({
        header: '¡COMPRA EXITOSA!',
        message: `Has comprado ${totalItems} productos por ${this.total} monedas.`,
        buttons: ['OK']
      });

      await alert.present();

    } catch (error) {
      console.error('Error procesando compra:', error);
      this.mostrarError('Hubo un error al procesar tu compra');
    }
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'ERROR',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Obtener nombre del producto
  getNombreProducto(item: any): string {
    if (item.producto?.nombre) {
      return item.producto.nombre;
    }
    // Si no hay producto, intentar obtener del ID
    return `Producto ${item.productoId || item.id}`;
  }

  // Obtener precio del producto
  getPrecioProducto(item: any): number {
    return item.producto?.precio || 100;
  }

  // Obtener imagen del producto
  getImagenProducto(item: any): string {
    if (item.producto?.imagen) {
      return item.producto.imagen;
    }
    return this.getImagenPorDefecto();
  }

  getImagenPorDefecto(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyNjE5MTIiLz4KICA8cGF0aCBkPSJNODAgNjBDOTMuMjUgNjAgMTA0IDcwLjc1IDEwNCA4NEMxMDQgOTcuMjUgOTMuMjUgMTA4IDgwIDEwOEM2Ni43NSAxMDggNTYgOTcuMjUgNTYgODRDNTYgNzAuNzUgNjYuNzUgNjAgODAgNjBaTTgwIDEyMEM5NiAxMjAgMTEwIDEzMCAxMTAgMTQ2VjE3MEg1MFYxNDZDNTAgMTMwIDY0IDEyMCA4MCAxMjBaIiBmaWxsPSIjZmZjYzVjIi8+Cjwvc3ZnPg==';
  }
}
