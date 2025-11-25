import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCredential // Importante: Agregamos esto
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'; // Plugin Nativo
import { Capacitor } from '@capacitor/core'; // Para detectar plataforma

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userState = new BehaviorSubject<User | null>(null);
  user$ = this.userState.asObservable();
  private googleProvider = new GoogleAuthProvider();

  constructor(private auth: Auth, private router: Router) {
    this.initAuthState();
    this.initGoogleAuth(); // Inicializamos el plugin nativo

    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  initAuthState() {
    onAuthStateChanged(this.auth, (user) => {
      this.userState.next(user);
    });
  }

  // Inicialización segura para evitar errores en web si el plugin no carga
  initGoogleAuth() {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize();
    }
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle() {
    // Lógica Híbrida: Nativa vs Web
    if (Capacitor.isNativePlatform()) {
      // --- EN ANDROID (APK) ---
      // 1. Obtener credenciales nativas
      const googleUser = await GoogleAuth.signIn();
      // 2. Crear credencial de Firebase con el token
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      // 3. Iniciar sesión en Firebase
      return signInWithCredential(this.auth, credential);
    } else {
      // --- EN WEB (Localhost) ---
      return signInWithPopup(this.auth, this.googleProvider);
    }
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth).then(async () => {
      // También cerramos sesión en el plugin nativo si corresponde
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
      this.router.navigate(['/login']);
    });
  }

  getUser() {
    return this.userState.value;
  }
}
