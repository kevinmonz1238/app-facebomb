// Importación del decorador Component para definir el componente
import { Component } from '@angular/core';
// Importación del servicio de autenticación personalizado
import { AuthService } from 'src/app/services/auth.service';
// Importación del servicio Router para la navegación entre páginas
import { Router } from '@angular/router';

// Decorador que define los metadatos del componente
@Component({
  standalone: false, // Indica que este componente no es standalone (depende de un módulo)
  selector: 'app-register', // Nombre del selector para usar el componente en HTML
  templateUrl: './register.page.html', // Archivo HTML asociado al componente
  styleUrls: ['./register.page.scss'], // Archivo de estilos asociado
})
export class RegisterPage {
  // Variables que almacenan los datos del formulario de registro
  email = ''; // Correo electrónico del usuario
  password = ''; // Contraseña del usuario

  // Inyección de dependencias: servicio de autenticación y enrutador
  constructor(private authService: AuthService, private router: Router) {}

  // Método asíncrono que se ejecuta al presionar el botón "REGISTRAR"
  async onRegister() {
    try {
      // Intenta registrar al usuario con el email y contraseña ingresados
      await this.authService.register(this.email, this.password);

      // Si el registro es exitoso, redirige a la página principal
      this.router.navigate(['/principal']);
    } catch (err) {
      // Si ocurre un error, lo muestra en consola y lanza una alerta
      console.error(err);
      alert('Error al registrar');
    }
  }
}
