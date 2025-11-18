import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userState = new BehaviorSubject<User | null>(null);
  user$ = this.userState.asObservable();
  private googleProvider = new GoogleAuthProvider();

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.userState.next(user);
    });

    // Configuración adicional para Google
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, this.googleProvider);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }


  getUser() {
    return this.userState.value;
  }
}
