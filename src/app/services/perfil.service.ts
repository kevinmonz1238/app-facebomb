import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, sendEmailVerification, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) { }

  async obtenerDatosPerfil(uid: string): Promise<any> {
    const ref = doc(this.firestore, `usuarios/${uid}`);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : {};
  }

  async enviarCorreoVerificacion(user: User): Promise<void> {
    return sendEmailVerification(user);
  }
}
