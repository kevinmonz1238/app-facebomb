import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule, MenuController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    // Creamos los espías (Mocks)
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'loginWithGoogle']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable', 'toggle']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy },
        { provide: MenuController, useValue: menuSpy },
        { provide: NavController, useValue: navSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
            params: of({}),
            queryParams: of({})
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- LOGIN NORMAL ---

  it('debería navegar a /principal si el login normal es exitoso', fakeAsync(() => {
    // Simulamos que el login funciona
    authServiceSpy.login.and.returnValue(Promise.resolve({} as any));

    component.email = 'test@test.com';
    component.password = '123456';

    component.onLogin();
    tick(); // Esperamos a que la promesa se resuelva

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal']);
  }));

  it('debería mostrar mensaje de error en la variable si el login falla', fakeAsync(() => {
    // Simulamos un error de Firebase
    const errorSimulado = { code: 'auth/wrong-password', message: 'Wrong pass' };
    authServiceSpy.login.and.rejectWith(errorSimulado);

    component.email = 'test@test.com';
    component.password = '123456';

    component.onLogin();
    tick(); // Esperamos a que el error sea capturado

    // VERIFICACIÓN CORREGIDA: Revisamos la variable, no un alert
    expect(component.mensajeError).toBe('CORREO O CONTRASEÑA INCORRECTOS');
  }));

  // --- LOGIN GOOGLE ---

  it('debería navegar si login con Google es exitoso', fakeAsync(() => {
    authServiceSpy.loginWithGoogle.and.returnValue(Promise.resolve({} as any));

    component.onLoginWithGoogle();
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal']);
  }));

  it('debería manejar error en login con Google', fakeAsync(() => {
    // Simulamos cancelación
    authServiceSpy.loginWithGoogle.and.rejectWith({ code: 'auth/popup-closed-by-user' });

    component.onLoginWithGoogle();
    tick();

    expect(component.mensajeError).toBe('INICIO DE SESIÓN CANCELADO');
  }));
});
