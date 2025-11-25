import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ComunidadService } from '../../services/comunidad.service';

@Component({
  standalone: false,
  selector: 'app-comunidad',
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
})
export class ComunidadPage implements OnInit {

  comentarios!: Observable<any[]>;
  nuevoComentario: string = '';
  mensajeError: string = ''; // Variable para el error

  constructor(private comunidadService: ComunidadService) {}

  ngOnInit() {
    this.cargarComentarios();
  }

  cargarComentarios() {
    this.comentarios = this.comunidadService.getComentarios();
  }

  async agregarComentario() {
    // 1. Limpiar error previo
    this.mensajeError = '';

    // 2. Validación: Mensaje vacío
    if (this.nuevoComentario.trim() === '') {
      this.mostrarError('NO PUEDES ENVIAR MENSAJES VACÍOS');
      return;
    }

    // 3. Validación: Mensaje muy largo (opcional)
    if (this.nuevoComentario.length > 150) {
      this.mostrarError('MENSAJE DEMASIADO LARGO (MÁX 150)');
      return;
    }

    try {
      await this.comunidadService.agregarComentario(this.nuevoComentario);
      this.nuevoComentario = ''; // Limpiar input
    } catch (error: any) {
      console.error('Error al publicar:', error);
      // 4. Manejo de errores de red
      if (error.code === 'permission-denied') {
        this.mostrarError('NO TIENES PERMISO PARA PUBLICAR');
      } else {
        this.mostrarError('ERROR DE CONEXIÓN. REINTENTA.');
      }
    }
  }

  // Función auxiliar para mostrar error y ocultarlo a los 3 segundos
  mostrarError(msg: string) {
    this.mensajeError = msg;
    setTimeout(() => {
      this.mensajeError = '';
    }, 3000);
  }
}
