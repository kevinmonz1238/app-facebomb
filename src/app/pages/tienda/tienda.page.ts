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
  mensajeError: string = '';
  itemsCarrito: number = 0;
  mensajeExito: string = '';

  private carritoSubscription: Subscription = new Subscription();
  private productosSubscription: Subscription = new Subscription();

  constructor(
    private tiendaSrv: TiendaService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.suscribirAlCarrito();
  }

  ngOnDestroy() {
    this.carritoSubscription.unsubscribe();
    this.productosSubscription.unsubscribe();
  }

  cargarProductos() {
    this.cargando = true;
    this.productosSubscription = this.tiendaSrv.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
        console.log('Productos cargados:', productos.length);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.mensajeError = 'Error al cargar los productos';
        this.cargando = false;
        this.ocultarMensajesDespuesDeTiempo();
      }
    });
  }

  suscribirAlCarrito() {
    this.carritoSubscription = this.tiendaSrv.getTotalItemsCarrito().subscribe({
      next: (totalItems) => {
        this.itemsCarrito = totalItems;
        console.log('Items en carrito:', totalItems);
      },
      error: (error) => {
        console.error('Error cargando carrito:', error);
        this.itemsCarrito = 0;
      }
    });
  }

  async agregar(id: string) {
    const user = this.auth.currentUser;
    if (!user) {
      this.mensajeError = 'Debes iniciar sesión para agregar productos al carrito';
      this.ocultarMensajesDespuesDeTiempo();
      return;
    }

    try {
      await this.tiendaSrv.agregarAlCarrito(id);
      this.mensajeExito = 'Producto agregado al carrito correctamente';
      this.mensajeError = '';
      this.ocultarMensajesDespuesDeTiempo();
      console.log('Producto agregado al carrito:', id);
    } catch (error: any) {
      console.error('Error agregando al carrito:', error);
      this.mensajeError = error.message || 'Error al agregar al carrito';
      this.mensajeExito = '';
      this.ocultarMensajesDespuesDeTiempo();
    }
  }

  private ocultarMensajesDespuesDeTiempo() {
    setTimeout(() => {
      this.mensajeError = '';
      this.mensajeExito = '';
    }, 3000);
  }

  // Formatear precio para mostrar
  formatearPrecio(precio: number): string {
    return precio?.toLocaleString('es-MX') || '0';
  }

  // Manejar imagen rota
  onErrorImagen(event: any, producto: any) {
    console.log('Error cargando imagen para producto:', producto.nombre);
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyNjE5MTIiLz4KICA8cGF0aCBkPSJNODAgNjBDOTMuMjUgNjAgMTA0IDcwLjc1IDEwNCA4NEMxMDQgOTcuMjUgOTMuMjUgMTA4IDgwIDEwOEM2Ni43NSAxMDggNTYgOTcuMjUgNTYgODRDNTYgNzAuNzUgNjYuNzUgNjAgODAgNjBaTTgwIDEyMEM5NiAxMjAgMTEwIDEzMCAxExMCAxNDZWMTcwSDUwVjE0NkM1MCAxMzAgNjQgMTIwIDgwIDEyMFoiIGZpbGw9IiNmZmNjNWMiLz4KPC9zdmc+';
  }
}
