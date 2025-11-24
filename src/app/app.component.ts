import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service'; // Usamos el servicio
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

interface Elemento {
  icono: string;
  nombre: string;
  ruta: string;
  requiereLogin?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {

  loggedIn: boolean = false;
  usuario: User | null = null;
  avatarUrl: string = '';
  private userSub: Subscription | null = null;

  elementos: Elemento[] = [
    // ACCIONES PRINCIPALES
    { icono: 'home-outline', nombre: 'Inicio', ruta: '/principal' },
    { icono: 'game-controller-outline', nombre: 'Jugar', ruta: '/juego' },

    // SECCIÓN SOCIAL Y CONTENIDO
    { icono: 'newspaper-outline', nombre: 'Novedades', ruta: '/social' },
    { icono: 'chatbubbles-outline', nombre: 'Comunidad', ruta: '/comunidad' },

    // COMPRAS Y ECONOMÍA
    { icono: 'cart-outline', nombre: 'Tienda', ruta: '/tienda', requiereLogin: true },
    { icono: 'bag-handle-outline', nombre: 'Carrito', ruta: '/carrito', requiereLogin: true },

    // INFORMACIÓN Y AYUDA
    { icono: 'information-circle-outline', nombre: 'Información', ruta: '/extras' }
  ];

  // Inyectamos AuthService en lugar de Auth directo
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Nos suscribimos al observable user$ del servicio
    this.userSub = this.authService.user$.subscribe((user) => {
      this.actualizarEstadoUsuario(user);
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  // Método auxiliar para actualizar la UI (útil para tests también)
  actualizarEstadoUsuario(user: User | null) {
    this.usuario = user;
    this.loggedIn = !!user;

    console.log("Estado login:", this.loggedIn);

    if (user) {
      this.avatarUrl = user.photoURL || this.getAvatarPorDefecto();
    } else {
      this.avatarUrl = this.getAvatarPorDefecto();
    }
  }

  onErrorImagen() {
    this.avatarUrl = this.getAvatarPorDefecto();
  }

  async logout() {
    try {
      // Usamos el servicio para cerrar sesión
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  getNombreDisplay(): string {
    if (!this.usuario) return 'USUARIO';
    return this.usuario.displayName ||
           this.usuario.email?.split('@')[0] ||
           'USUARIO';
  }

  getEmailDisplay(): string {
    if (!this.usuario) return 'Inicia sesión';
    return this.usuario.email || 'Usuario';
  }

  getAvatarPorDefecto(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSI2MCIgZmlsbD0iIzI2MTkxMiIvPgogIDxwYXRoIGQ9Ik02MCAzMEM2Ni42IDMwIDcyIDM1LjQgNzIgNDJDNzIgNDguNiA2Ni42IDU0IDYwIDU0QzUzLjQgNTQgNDggNDguNiA0OCA0MkM0OCAzNS40IDUzLjQgMzAgNjAgMzBaTTYwIDYwQzcyIDYwIDgyIDY2IDgyIDc0Vjg2SDM4Vjc0QzM4IDY2IDQ4IDYwIDYwIDYwWiIgZmlsbD0iI2ZmY2M1YyIvPgo8L3N2Zz4=';
  }
}
