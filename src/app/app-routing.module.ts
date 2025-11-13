import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { PrincipalPageModule } from './pages/principal/principal.module';
import { AuthGuard } from './guards/auth-guard';

// Definición de las rutas principales de la aplicación
const routes: Routes = [

  // Redirección inicial:
  // Si la URL está vacía (ruta raíz), se redirige automáticamente a "principal"
  {
    path: '',
    redirectTo: 'principal',
    pathMatch: 'full'
  },

  // Ruta para la página principal
  {
    path: 'principal',
    loadChildren: () => import('./pages/principal/principal.module')
      .then(m => m.PrincipalPageModule)
  },

  // Ruta para la sección "Social"
  {
    path: 'social',
    loadChildren: () => import('./pages/social/social.module')
      .then(m => m.SocialPageModule)
  },

  // Ruta para la sección "Extras"
  {
    path: 'extras',
    loadChildren: () => import('./pages/extras/extras.module')
      .then(m => m.ExtrasPageModule)
  },

  // Ruta para la página del juego
  {
    path: 'juego',
    loadChildren: () => import('./pages/juego/juego.module')
      .then(m => m.JuegoPageModule)
  },
  {
    path: 'comunidad',
    loadChildren: () => import('./pages/comunidad/comunidad.module').then( m => m.ComunidadPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },

];

@NgModule({
  // Configuración principal del enrutador de Angular
  imports: [
    RouterModule.forRoot(routes, {
      // Estrategia de precarga: carga en segundo plano todos los módulos después del inicio
      preloadingStrategy: PreloadAllModules
    }),
  ],

  // Exporta el RouterModule para que esté disponible en toda la aplicación
  exports: [RouterModule]
})
export class AppRoutingModule { }
