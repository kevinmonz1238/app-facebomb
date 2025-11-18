import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of, combineLatest, map, switchMap } from 'rxjs';

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
    console.log('Consultando productos...');
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  // Obtener información completa de un producto
  getProducto(productoId: string): Observable<any> {
    const ref = doc(this.firestore, `productos/${productoId}`);
    return new Observable(observer => {
      getDoc(ref).then(snapshot => {
        if (snapshot.exists()) {
          observer.next({
            id: snapshot.id,
            ...snapshot.data()
          });
        } else {
          observer.next(null);
        }
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  // Obtener carrito del usuario con información completa de productos
  getCarrito(): Observable<any[]> {
    const user = this.auth.currentUser;
    if (!user) {
      console.log('No hay usuario autenticado');
      return of([]);
    }

    const carritoRef = collection(this.firestore, `usuarios/${user.uid}/carrito`);
    console.log('Consultando carrito para usuario:', user.uid);

    return collectionData(carritoRef, { idField: 'id' }).pipe(
      switchMap((carritoItems: any[]) => {
        if (carritoItems.length === 0) {
          return of([]);
        }

        // Obtener información completa de cada producto
        const productosObservables = carritoItems.map(item =>
          this.getProducto(item.productoId).pipe(
            map(producto => ({
              ...item,
              producto: producto || { nombre: 'Producto no disponible', precio: 0, imagen: this.getImagenPorDefecto() }
            }))
          )
        );

        return combineLatest(productosObservables);
      })
    ) as Observable<any[]>;
  }

  // Agregar producto al carrito
  async agregarAlCarrito(productoId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Verificar si el producto existe
    const producto = await getDoc(doc(this.firestore, `productos/${productoId}`));
    if (!producto.exists()) {
      throw new Error('El producto no existe');
    }

    const itemRef = doc(this.firestore, `usuarios/${user.uid}/carrito/${productoId}`);

    try {
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        const currentData = itemSnapshot.data();
        await updateDoc(itemRef, {
          cantidad: (currentData?.['cantidad'] || 1) + 1,
          actualizadoEn: new Date()
        });
        console.log('Producto actualizado en carrito:', productoId);
      } else {
        await setDoc(itemRef, {
          productoId,
          cantidad: 1,
          agregadoEn: new Date(),
          actualizadoEn: new Date()
        });
        console.log('Producto agregado al carrito:', productoId);
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  }

  // Cambiar cantidad
  async cambiarCantidad(productoId: string, cantidad: number): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    if (cantidad <= 0) {
      await this.eliminarDelCarrito(productoId);
      return;
    }

    const ref = doc(this.firestore, `usuarios/${user.uid}/carrito/${productoId}`);
    await updateDoc(ref, {
      cantidad,
      actualizadoEn: new Date()
    });
    console.log('Cantidad actualizada:', productoId, cantidad);
  }

  // Eliminar del carrito
  async eliminarDelCarrito(productoId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const ref = doc(this.firestore, `usuarios/${user.uid}/carrito/${productoId}`);
    await deleteDoc(ref);
    console.log('Producto eliminado del carrito:', productoId);
  }

  // Vaciar carrito
  async vaciarCarrito(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const carritoRef = collection(this.firestore, `usuarios/${user.uid}/carrito`);
    const carritoSnapshot = await getDocs(carritoRef);

    const deletePromises = carritoSnapshot.docs.map(docSnapshot =>
      deleteDoc(doc(this.firestore, `usuarios/${user.uid}/carrito/${docSnapshot.id}`))
    );

    await Promise.all(deletePromises);
    console.log('Carrito vaciado');
  }

  // Obtener total de items en carrito
  getTotalItemsCarrito(): Observable<number> {
    return this.getCarrito().pipe(
      map(carrito => carrito.reduce((total, item) => total + (item.cantidad || 1), 0))
    );
  }

  private getImagenPorDefecto(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyNjE5MTIiLz4KICA8cGF0aCBkPSJNODAgNjBDOTMuMjUgNjAgMTA0IDcwLjc1IDEwNCA4NEMxMDQgOTcuMjUgOTMuMjUgMTA4IDgwIDEwOEM2Ni43NSAxMDggNTYgOTcuMjUgNTYgODRDNTYgNzAuNzUgNjYuNzUgNjAgODAgNjBaTTgwIDEyMEM5NiAxMjAgMTEwIDEzMCAxMTAgMTQ2VjE3MEg1MFYxNDZDNTAgMTMwIDY0IDEyMCA4MCAxMjBaIiBmaWxsPSIjZmZjYzVjIi8+Cjwvc3ZnPg==';
  }
}
