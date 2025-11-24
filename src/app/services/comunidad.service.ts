import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComunidadService {

  constructor(private firestore: Firestore) { }

  getComentarios(): Observable<any[]> {
    const comentariosRef = collection(this.firestore, 'comentarios');
    // Ordenar por fecha requiere query(), pero por ahora mantenemos tu lógica simple
    return collectionData(comentariosRef, { idField: 'id' });
  }

  agregarComentario(texto: string): Promise<any> {
    const comentariosRef = collection(this.firestore, 'comentarios');
    return addDoc(comentariosRef, {
      texto: texto,
      fecha: new Date(),
    });
  }
}
