import { Component, OnInit } from '@angular/core';
import { Personajes } from 'src/app/services/personajes';
import { ModalController } from '@ionic/angular';
import { DetalleComponent } from 'src/app/componentes/detalle/detalle.component';
import { personajesFirebase } from '../../componentes/interfaces/interfaces';

@Component({
  standalone: false,
  selector: 'app-extras',
  templateUrl: './extras.page.html',
  styleUrls: ['./extras.page.scss'],
})
export class ExtrasPage implements OnInit {

  // Arreglo inicializado para evitar errores de undefined
  personajesRecientes: personajesFirebase[] = [];

  constructor(
    private servicioPersonajes: Personajes,
    private modalCtrl: ModalController
  ) { }

  // En tu extras.page.ts

// 1. Agrega esta función dentro de la clase
onErrorImagen(event: any) {
  // Cuando la URL falla (403), cambiamos el src por una imagen local segura
  event.target.src = 'assets/icon/facepost.jpg';
  // O usa una imagen genérica tipo 'assets/img/placeholder-character.png'
}
  ngOnInit() {
    // Nos suscribimos al servicio.
    // Nota: El test burlará (mock) esta llamada.
    this.servicioPersonajes.getPersonajes().subscribe((respuesta: any[]) => {
      // Limpiamos el arreglo antes de llenarlo para evitar duplicados si el observable emite más veces
      this.personajesRecientes = [];

      respuesta.forEach(personaje => {
        this.personajesRecientes.push(personaje as personajesFirebase);
      });
    });
  }

  async verDetalle(id: string) {
    const modal = await this.modalCtrl.create({
      component: DetalleComponent,
      componentProps: { id }
    });
    await modal.present();
  }
}
