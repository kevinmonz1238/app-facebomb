import { Component } from '@angular/core';
import { Auth, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

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
export class AppComponent {

  loggedIn: boolean = false;
  usuario: User | null = null;
   avatarUrl: string = '';

  elementos: Elemento[] = [
    // ACCIONES PRINCIPALES (más usadas)
    { icono: 'home-outline', nombre: 'Inicio', ruta: '/principal' },
    { icono: 'game-controller-outline', nombre: 'Jugar', ruta: '/juego' },

    // SECCIÓN SOCIAL Y CONTENIDO
    { icono: 'newspaper-outline', nombre: 'Novedades', ruta: '/social' },
    { icono: 'chatbubbles-outline', nombre: 'Comunidad', ruta: '/comunidad' },

    // COMPRAS Y ECONOMÍA (requieren login)
    { icono: 'cart-outline', nombre: 'Tienda', ruta: '/tienda', requiereLogin: true },
    { icono: 'bag-handle-outline', nombre: 'Carrito', ruta: '/carrito', requiereLogin: true },

    // INFORMACIÓN Y AYUDA
    { icono: 'information-circle-outline', nombre: 'Información', ruta: '/extras' }
  ];

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.usuario = user;
      this.loggedIn = !!user;

      // Actualizar avatar cuando cambia el usuario
      if (user) {
        this.avatarUrl = user.photoURL || this.getAvatarPorDefecto();
      } else {
        this.avatarUrl = this.getAvatarPorDefecto();
      }

      console.log("Estado login:", this.loggedIn);
    });
  }

  // Manejar error en la imagen
  onErrorImagen() {
    this.avatarUrl = this.getAvatarPorDefecto();
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Método para obtener el nombre para mostrar
  getNombreDisplay(): string {
    if (!this.usuario) return 'USUARIO';

    return this.usuario.displayName ||
           this.usuario.email?.split('@')[0] ||
           'USUARIO';
  }

  // Método para obtener el email para mostrar
  getEmailDisplay(): string {
    if (!this.usuario) return 'Inicia sesión';

    return this.usuario.email || 'Usuario';
  }

  // Método para obtener avatar por defecto
  getAvatarPorDefecto(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSI2MCIgZmlsbD0iIzI2MTkxMiIvPgogIDxwYXRoIGQ9Ik02MCAzMEM2Ni42IDMwIDcyIDM1LjQgNzIgNDJDNzIgNDguNiA2Ni42IDU0IDYwIDU0QzUzLjQgNTQgNDggNDguNiA0OCA0MkM0OCAzNS40IDUzLjQgMzAgNjAgMzBaTTYwIDYwQzcyIDYwIDgyIDY2IDgyIDc0Vjg2SDM4Vjc0QzM4IDY2IDQ4IDYwIDYwIDYwWiIgZmlsbD0iI2ZmY2M1YyIvPgo8L3N2Zz4=';
  }
}
