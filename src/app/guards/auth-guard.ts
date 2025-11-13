// Importamos los decoradores y dependencias necesarias desde Angular y RxJS
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

// Marcamos la clase como un servicio inyectable
// 'providedIn: root' significa que estará disponible en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate { // Implementa la interfaz CanActivate para proteger rutas

  // Inyectamos el servicio de autenticación y el enrutador
  constructor(private authService: AuthService, private router: Router) {}

  // Método que decide si se puede activar una ruta o no
  canActivate() {
    // Retorna un observable basado en el estado del usuario (user$)
    return this.authService.user$.pipe(
      // Usamos 'map' para transformar el valor emitido por el observable
      map(user => {
        // Si el usuario existe (está autenticado), se permite el acceso
        if (user) return true;
        
        // Si no hay usuario autenticado, redirigimos al login
        this.router.navigate(['/login']);
        
        // Y devolvemos 'false' para bloquear el acceso
        return false;
      })
    );
  }
}
