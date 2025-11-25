import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';
  mensajeError = ''; // Variable para mostrar el error en el HTML

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    // 1. Limpiar errores previos
    this.mensajeError = '';

    // 2. Validar campos vacíos
    if (!this.email || !this.password) {
      this.mensajeError = 'INGRESA TU CORREO Y CONTRASEÑA';
      return;
    }

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/principal']);
    } catch (err: any) {
      console.error(err);

      // 3. Manejo de errores de Firebase en Español
      if (err.code === 'auth/invalid-email') {
        this.mensajeError = 'FORMATO DE CORREO INVÁLIDO';
      } else if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        this.mensajeError = 'CORREO O CONTRASEÑA INCORRECTOS';
      } else if (err.code === 'auth/too-many-requests') {
        this.mensajeError = 'DEMASIADOS INTENTOS. ESPERA UN MOMENTO.';
      } else {
        this.mensajeError = 'ERROR DE ACCESO. INTENTA DE NUEVO.';
      }
    }
  }

  async onLoginWithGoogle() {
    this.mensajeError = ''; // Limpiar error

    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/principal']);
    } catch (err: any) {
      console.error('Error en login con Google:', err);

      // Manejo de errores comunes de Google
      if (err.code === 'auth/popup-closed-by-user') {
        this.mensajeError = 'INICIO DE SESIÓN CANCELADO';
      } else if (err.code === 'auth/network-request-failed') {
        this.mensajeError = 'ERROR DE CONEXIÓN A INTERNET';
      } else {
        this.mensajeError = 'NO SE PUDO INICIAR CON GOOGLE';
      }
    }
  }
}
