// Importaciones necesarias desde Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importación del componente que se usará en esta ruta
import { RegisterPage } from './register.page';

// Definición de las rutas para este módulo
const routes: Routes = [
  {
    path: '', // Ruta vacía: se carga cuando el usuario entra a "/register"
    component: RegisterPage // Componente que se mostrará en esta ruta
  }
];

// Decorador @NgModule que define las configuraciones del módulo de enrutamiento
@NgModule({
  // Se importan las rutas configuradas usando forChild porque es un módulo secundario
  imports: [RouterModule.forChild(routes)],
  // Se exporta RouterModule para que otras partes del proyecto puedan usar las rutas definidas aquí
  exports: [RouterModule],
})
export class RegisterPageRoutingModule {} // Clase del módulo de rutas para la página "Register"
