import { Component } from '@angular/core';
import { Auth, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

interface Elemento {
  icono: string;
  nombre: string;
  ruta: string;
  requiereLogin?: boolean; // 👈 OPCIONAL: para indicar si se muestra solo logueado
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

  elementos: Elemento[] = [
    { icono: 'home-outline', nombre: 'Inicio', ruta: '/principal' },
    { icono: 'newspaper-outline', nombre: 'Novedades', ruta: '/social' },
    { icono: 'information-circle-outline', nombre: 'Información', ruta: '/extras' },
    { icono: 'game-controller-outline', nombre: 'Jugar', ruta: '/juego' },
    { icono: 'chatbubbles-outline', nombre: 'Comunidad', ruta: '/comunidad' },

    // SOLO LOGUEADO
    { icono: 'cart-outline', nombre: 'Tienda', ruta: '/tienda', requiereLogin: true },
    { icono: 'bag-handle-outline', nombre: 'Carrito', ruta: '/carrito', requiereLogin: true },
    { icono: 'person-circle-outline', nombre: 'Perfil de Jugador', ruta: '/perfil', requiereLogin: true }
  ];

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.usuario = user;
      this.loggedIn = !!user;  // true si hay usuario

      console.log("Estado login:", this.loggedIn);
    });
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
