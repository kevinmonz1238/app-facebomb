import { Component } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

interface Elemento {
  icono: string;
  nombre: string;
  ruta: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  elementos: Elemento[] = [
    {
      icono: 'home-outline',
      nombre: 'Inicio',
      ruta: '/principal'
    },
    {
      icono: 'newspaper-outline',
      nombre: 'Novedades',
      ruta: '/social'
    },
    {
      icono: 'information-circle-outline',
      nombre: 'Información',
      ruta: '/extras'
    },
    {
      icono: 'game-controller-outline',
      nombre: 'Jugar',
      ruta: '/juego'
    },
    {
      icono: 'chatbubbles-outline',
      nombre: 'Comunidad',
      ruta: '/comunidad'
    },
  ];

  constructor(private auth: Auth, private router: Router) {}

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']); // Redirige a la pantalla de login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
