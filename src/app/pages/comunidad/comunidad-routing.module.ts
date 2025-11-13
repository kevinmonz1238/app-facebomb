// Importamos los módulos necesarios de Angular para manejar rutas
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importamos el componente que se mostrará cuando se acceda a esta ruta
import { ComunidadPage } from './comunidad.page';

// Definimos las rutas de este módulo
// En este caso, solo hay una ruta vacía ('') que carga el componente ComunidadPage
const routes: Routes = [
  {
    path: '',                // Ruta base del módulo (por ejemplo: /comunidad)
    component: ComunidadPage // Componente que se mostrará al acceder a esta ruta
  }
];

// Decorador @NgModule que configura el módulo de enrutamiento
@NgModule({
  // Importamos las rutas definidas usando forChild, ya que este módulo pertenece a una página específica
  imports: [RouterModule.forChild(routes)],
  
  // Exportamos RouterModule para que las rutas estén disponibles fuera de este módulo
  exports: [RouterModule],
})
export class ComunidadPageRoutingModule {} // Clase del módulo de enrutamiento para la página Comunidad
