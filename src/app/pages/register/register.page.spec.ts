import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RegisterPage } from './register.page';
import { IonicModule, MenuController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    TestBed.configureTestingModule({
      declarations: [RegisterPage],
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

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería navegar a /principal si el registro es exitoso y datos válidos', fakeAsync(() => {
    // 1. Configurar datos correctos
    component.email = 'test@test.com';
    component.password = '123456';
    component.confirmPassword = '123456'; // Deben coincidir

    authServiceSpy.register.and.returnValue(Promise.resolve({} as any));

    // 2. Llamar a la NUEVA función
    component.validarYRegistrar();
    tick();

    // 3. Verificar
    expect(authServiceSpy.register).toHaveBeenCalledWith('test@test.com', '123456');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal']);
    expect(component.mensajeError).toBe('');
  }));

  it('debería mostrar error si las contraseñas no coinciden', () => {
    component.email = 'test@test.com';
    component.password = '123456';
    component.confirmPassword = '654321'; // Diferentes

    component.validarYRegistrar();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(component.mensajeError).toBe('LAS CONTRASEÑAS NO COINCIDEN');
  });

  it('debería mostrar error si hay campos vacíos', () => {
    component.email = '';
    component.password = '123456';
    component.confirmPassword = '123456';

    component.validarYRegistrar();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(component.mensajeError).toBe('TODOS LOS CAMPOS SON OBLIGATORIOS');
  });

  it('debería mostrar mensaje de error si Firebase falla', fakeAsync(() => {
    component.email = 'test@test.com';
    component.password = '123456';
    component.confirmPassword = '123456';

    // Simulamos error de email en uso
    const errorMock = { code: 'auth/email-already-in-use', message: 'Error' };
    authServiceSpy.register.and.rejectWith(errorMock);

    component.validarYRegistrar();
    tick();

    expect(authServiceSpy.register).toHaveBeenCalled();
    // Verificamos que el mensaje de error se asignó a la variable del componente
    expect(component.mensajeError).toBe('ESTE CORREO YA ESTÁ REGISTRADO');
  }));
});
