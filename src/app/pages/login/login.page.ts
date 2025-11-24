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

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/principal']);
    } catch (err) {
      console.error(err);
      // En el test, spyOn(window, 'alert') captura esto
      alert('Credenciales inválidas');
    }
  }

  async onLoginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/principal']);
    } catch (err) {
      console.error('Error en login con Google:', err);
      alert('Error al iniciar sesión con Google');
    }
  }
}
