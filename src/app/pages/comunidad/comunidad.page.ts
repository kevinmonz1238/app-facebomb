// Importaciones necesarias desde Angular y Firebase
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  standalone: false, // Indica que el componente pertenece a un módulo (no es standalone)
  selector: 'app-comunidad', // Nombre del selector para usar este componente en HTML
  templateUrl: './comunidad.page.html', // Ruta del archivo de plantilla (HTML)
  styleUrls: ['./comunidad.page.scss'], // Ruta del archivo de estilos (SCSS)
})
export class ComunidadPage implements OnInit {

  // Observable que contendrá los comentarios obtenidos de Firebase
  comentarios!: Observable<any[]>;

  // Variable para almacenar el texto del nuevo comentario que el usuario escriba
  nuevoComentario: string = '';

  // Se inyecta el servicio Firestore para interactuar con la base de datos
  constructor(private firestore: Firestore) {}

  ngOnInit() {
    // Se obtiene una referencia a la colección "comentarios" en Firestore
    const comentariosRef = collection(this.firestore, 'comentarios');

    // Se asigna a la variable "comentarios" un observable con los datos en tiempo real
    // collectionData escucha cambios en la colección y actualiza automáticamente
    this.comentarios = collectionData(comentariosRef, { idField: 'id' });
  }

  // Método asíncrono que agrega un nuevo comentario a la base de datos
  async agregarComentario() {
    // Si el campo está vacío o contiene solo espacios, no hace nada
    if (this.nuevoComentario.trim() === '') return;

    // Se obtiene la referencia a la colección "comentarios"
    const comentariosRef = collection(this.firestore, 'comentarios');

    // Se agrega un nuevo documento con el texto y la fecha actual
    await addDoc(comentariosRef, {
      texto: this.nuevoComentario,
      fecha: new Date(),
    });

    // Limpia el campo de texto después de enviar el comentario
    this.nuevoComentario = '';
  }
}
