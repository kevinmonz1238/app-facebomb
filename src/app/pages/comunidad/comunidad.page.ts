import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ComunidadService } from '../../services/comunidad.service'; // Asegúrate de importar el servicio

@Component({
  standalone: false,
  selector: 'app-comunidad',
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
})
export class ComunidadPage implements OnInit {

  comentarios!: Observable<any[]>;
  nuevoComentario: string = '';

  // Inyectamos NUESTRO servicio, no el de Firebase directo
  constructor(private comunidadService: ComunidadService) {}

  ngOnInit() {
    this.cargarComentarios();
  }

  cargarComentarios() {
    this.comentarios = this.comunidadService.getComentarios();
  }

  async agregarComentario() {
    if (this.nuevoComentario.trim() === '') return;

    try {
      await this.comunidadService.agregarComentario(this.nuevoComentario);
      this.nuevoComentario = ''; // Limpiar input solo si fue exitoso
    } catch (error) {
      console.error('Error al publicar:', error);
    }
  }
}
