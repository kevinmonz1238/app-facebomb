import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-juego',
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.scss'],
  standalone: false
})
export class JuegoPage {

  // Se inyecta el Router de Angular para manejar la navegación interna entre rutas
  constructor(private router: Router) {}

  // Abre el enlace del juego externo en una nueva pestaña del navegador
  irAlJuego() {
    window.open('https://facebomb.onrender.com/', '_blank');
  }

  // Realiza la navegación interna hacia una ruta dentro de la aplicación
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
