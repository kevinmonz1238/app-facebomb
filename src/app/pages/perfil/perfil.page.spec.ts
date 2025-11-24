import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { PerfilPage } from './perfil.page';
import { IonicModule, MenuController } from '@ionic/angular'; // Agregamos MenuController
import { AuthService } from 'src/app/services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { of, Subscription } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;

  // Spies
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let perfilServiceSpy: jasmine.SpyObj<PerfilService>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;

  // Usuario simulado base
  const mockUser = {
    uid: '123',
    email: 'test@test.com',
    displayName: 'Test User',
    photoURL: 'google-photo.jpg',
    emailVerified: true,
    providerData: [{ providerId: 'google.com' }]
  };

  beforeEach(waitForAsync(() => {
    // 1. Mock de AuthService
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of(mockUser)
    });

    // 2. Mock de PerfilService
    const perfilSpy = jasmine.createSpyObj('PerfilService', ['obtenerDatosPerfil', 'enviarCorreoVerificacion']);

    // 3. Mock de MenuController (Solución al error de consola)
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable', 'toggle']);

    TestBed.configureTestingModule({
      declarations: [PerfilPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: PerfilService, useValue: perfilSpy },
        { provide: MenuController, useValue: menuSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    perfilServiceSpy = TestBed.inject(PerfilService) as jasmine.SpyObj<PerfilService>;
    menuCtrlSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;

    // Configuramos respuestas por defecto
    perfilServiceSpy.obtenerDatosPerfil.and.returnValue(Promise.resolve({ monedas: 500, nombre: 'Perfil DB' }));
    perfilServiceSpy.enviarCorreoVerificacion.and.returnValue(Promise.resolve());

    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST DE CARGA DE DATOS ---

  it('debería cargar datos del perfil y combinarlos al iniciar', fakeAsync(() => {
    // ngOnInit ya se disparó. Esperamos promesas.
    tick();

    expect(component.user?.uid).toBe('123');
    expect(perfilServiceSpy.obtenerDatosPerfil).toHaveBeenCalledWith('123');
    expect(component.monedas).toBe(500);
    expect(component.perfil.nombre).toBe('Perfil DB'); // Prioridad DB sobre Auth
    expect(component.cargando).toBeFalse();
  }));

  it('debería manejar usuario nulo (Logout)', fakeAsync(() => {
    // Re-configuramos el observable para emitir null
    (Object.getOwnPropertyDescriptor(authServiceSpy, 'user$')?.get as jasmine.Spy).and.returnValue(of(null));

    component.ngOnInit(); // Re-ejecutamos ngOnInit
    tick();

    expect(component.user).toBeNull();
    expect(component.cargando).toBeFalse();
  }));

  it('debería manejar error al cargar datos de firestore (Catch)', fakeAsync(() => {
    perfilServiceSpy.obtenerDatosPerfil.and.rejectWith(new Error('Error DB'));
    spyOn(console, 'error');

    component.cargarDatosUsuario();
    tick();

    expect(console.error).toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  }));

  // --- TEST DE LÓGICA DE FOTOS (Branches) ---

  it('getFotoPerfil debería priorizar foto del perfil DB', () => {
    component.perfil.fotoURL = 'db-photo.jpg';
    expect(component.getFotoPerfil()).toBe('db-photo.jpg');
  });

  it('getFotoPerfil debería usar foto de Auth si no hay en DB', () => {
    component.perfil.fotoURL = null;
    component.user = { ...mockUser, photoURL: 'auth-photo.jpg' } as any;
    expect(component.getFotoPerfil()).toBe('auth-photo.jpg');
  });

  it('getFotoPerfil debería usar avatar por defecto si no hay ninguna', () => {
    component.perfil.fotoURL = null;
    component.user = { ...mockUser, photoURL: null } as any;
    expect(component.getFotoPerfil()).toContain('data:image/svg+xml');
  });

  it('onErrorImagen debería reemplazar la fuente por el avatar por defecto', () => {
    const mockEvent = { target: { src: 'rota.jpg' } };
    component.onErrorImagen(mockEvent);
    expect(mockEvent.target.src).toContain('data:image/svg+xml');
  });

  // --- TEST DE VERIFICACIÓN DE EMAIL ---

  it('debería enviar correo de verificación exitosamente', fakeAsync(() => {
    spyOn(window, 'alert');
    component.user = mockUser as any;

    component.enviarVerificacionEmail();
    tick();

    expect(perfilServiceSpy.enviarCorreoVerificacion).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/enviado/i));
    expect(component.enviandoVerificacion).toBeFalse();
  }));

  it('debería manejar error al enviar verificación', fakeAsync(() => {
    spyOn(window, 'alert');
    spyOn(console, 'error');
    component.user = mockUser as any;

    perfilServiceSpy.enviarCorreoVerificacion.and.rejectWith(new Error('Fallo envío'));

    component.enviarVerificacionEmail();
    tick();

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Error/i));
    expect(component.enviandoVerificacion).toBeFalse();
  }));

  it('NO debería enviar verificación si no hay usuario', fakeAsync(() => {
    component.user = null;
    component.enviarVerificacionEmail();
    tick();
    expect(perfilServiceSpy.enviarCorreoVerificacion).not.toHaveBeenCalled();
  }));

  // --- TEST DE UTILIDADES Y ACTUALIZACIÓN ---

  it('getProveedor debería identificar google correctamente', () => {
    component.perfil.proveedor = 'google.com';
    expect(component.getProveedor()).toBe('GOOGLE');

    component.perfil.proveedor = 'password';
    expect(component.getProveedor()).toBe('EMAIL');
  });

  it('actualizarPerfil debería recargar los datos', fakeAsync(() => {
    const spyCargar = spyOn(component, 'cargarDatosUsuario').and.callThrough();

    component.actualizarPerfil();
    tick();

    expect(spyCargar).toHaveBeenCalled();
  }));

  it('ngOnDestroy debería desuscribirse', () => {
    // Forzamos la suscripción si no existe
    if (!component['userSubscription']) {
      component['userSubscription'] = new Subscription();
    }
    const spyUnsub = spyOn(component['userSubscription']!, 'unsubscribe');

    component.ngOnDestroy();

    expect(spyUnsub).toHaveBeenCalled();
  });
});
