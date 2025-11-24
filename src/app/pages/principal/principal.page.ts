import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

// Definición de la interfaz
interface Elemento {
  icono: string;
  nombre: string;
  ruta: string;
}

@Component({
  standalone: false,
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit {

  // Variable booleana que controla si se muestra o no el video del tráiler
  showVideo: boolean = false;

  // Lista de elementos que se mostrarán en la página principal
  elementos: Elemento[] = [
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
      ruta: 'https://facebomb.onrender.com/'
    }
  ];

  // Inyectamos Router y NavController (aunque Router no se use en 'navegar', se mantiene por si acaso)
  constructor(private router: Router, private navCtrl: NavController) { }

  ngOnInit() {
  }

  // Cambia el estado para mostrar u ocultar el video
  toggleVideo() {
    this.showVideo = !this.showVideo;
  }

  // Controla la navegación
  navegar(ruta: string) {
    if (ruta.startsWith('http')) {
      // Si es URL externa, usamos window.open
      // En los tests, esto será interceptado por spyOn(window, 'open')
      window.open(ruta, '_system');
    } else {
      // Si es ruta interna, usamos NavController
      // En los tests, esto será interceptado por el mock de navCtrl
      this.navCtrl.navigateForward(ruta);
    }
  }
}
