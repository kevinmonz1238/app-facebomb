import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TiendaService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  // Obtener todos los productos disponibles
  getProductos(): Observable<any[]> {
    const ref = collection(this.firestore, 'productos');
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  // Agregar producto al carrito del usuario
  async agregarAlCarrito(productoId: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    const ref = doc(this.firestore, `usuarios/${user.uid}/carrito/${productoId}`);

    await setDoc(ref, {
      productoId,
      cantidad: 1
    }, { merge: true });
  }

  // Obtener carrito del usuario
  getCarrito(): Observable<any[]> {
    const user = this.auth.currentUser;
    const ref = collection(this.firestore, `usuarios/${user?.uid}/carrito`);
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  // Cambiar cantidad
  async cambiarCantidad(productoId: string, cantidad: number) {
    const user = this.auth.currentUser;
    const ref = doc(this.firestore, `usuarios/${user!.uid}/carrito/${productoId}`);

    await updateDoc(ref, { cantidad });
  }

  // Eliminar del carrito
  async eliminarDelCarrito(productoId: string) {
    const user = this.auth.currentUser;
    const ref = doc(this.firestore, `usuarios/${user!.uid}/carrito/${productoId}`);
    await deleteDoc(ref);
  }
}
