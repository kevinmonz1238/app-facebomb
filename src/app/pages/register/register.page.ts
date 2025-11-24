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
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigate(['/principal']);
    } catch (err) {
      console.error(err);
      // Este alert será interceptado por spyOn(window, 'alert') en el test
      alert('Error al registrar');
    }
  }
}
