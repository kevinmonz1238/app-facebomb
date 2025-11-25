import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  // Variables del formulario
  email = '';
  password = '';
  confirmPassword = ''; // Nuevo campo para validar

  // Variable para controlar la caja roja de error en el HTML
  mensajeError = '';

  constructor(private authService: AuthService, private router: Router) {}

  async validarYRegistrar() {
    // 1. Limpiamos errores previos
    this.mensajeError = '';

    // 2. Validaciones de campos vacíos
    if (!this.email || !this.password || !this.confirmPassword) {
      this.mensajeError = 'TODOS LOS CAMPOS SON OBLIGATORIOS';
      return; // Detenemos la función aquí
    }

    // 3. Validación de coincidencia de contraseñas
    if (this.password !== this.confirmPassword) {
      this.mensajeError = 'LAS CONTRASEÑAS NO COINCIDEN';
      return;
    }

    // 4. Validación de longitud (Firebase pide mínimo 6)
    if (this.password.length < 6) {
      this.mensajeError = 'LA CONTRASEÑA DEBE TENER AL MENOS 6 CARACTERES';
      return;
    }

    // 5. Si todo está bien, intentamos registrar en Firebase
    try {
      await this.authService.register(this.email, this.password);

      // Registro exitoso: Navegar a la pantalla principal
      this.router.navigate(['/principal']);

    } catch (error: any) {
      console.error(error);

      // 6. Manejo de errores específicos de Firebase (Traducción)
      if (error.code === 'auth/email-already-in-use') {
        this.mensajeError = 'ESTE CORREO YA ESTÁ REGISTRADO';
      } else if (error.code === 'auth/invalid-email') {
        this.mensajeError = 'FORMATO DE CORREO INVÁLIDO';
      } else if (error.code === 'auth/network-request-failed') {
        this.mensajeError = 'ERROR DE CONEXIÓN A INTERNET';
      } else {
        this.mensajeError = 'ERROR AL REGISTRARSE. INTENTA DE NUEVO.';
      }
    }
  }
}
