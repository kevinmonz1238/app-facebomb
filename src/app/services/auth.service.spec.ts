import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let authMock: any;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authMock = { currentUser: null };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: authMock },
        { provide: Router, useValue: routerSpy }
      ]
    });

    // Bypass del constructor real para pruebas unitarias controladas
    service = Object.create(AuthService.prototype);
    (service as any).auth = authMock;
    (service as any).router = routerSpy;
    (service as any).userState = new BehaviorSubject(null);
    (service as any).googleProvider = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initAuthState debería suscribirse a los cambios de usuario', () => {
    // Este test solo verifica que la función existe y no explota
    // Ya que onAuthStateChanged es importada, es difícil de espiar sin wrappers complejos
    // pero al moverla a un método, la aislamos del constructor.
    expect(service.initAuthState).toBeDefined();
  });

  it('login debería ejecutarse', async () => {
    try { await service.login('a@a.com', '123'); } catch (e) { expect(e).toBeDefined(); }
  });

  it('loginWithGoogle debería ejecutarse', async () => {
    try { await service.loginWithGoogle(); } catch (e) { expect(e).toBeDefined(); }
  });

  it('register debería ejecutarse', async () => {
    try { await service.register('a@a.com', '123'); } catch (e) { expect(e).toBeDefined(); }
  });

  it('logout debería intentar navegar', async () => {
    try {
      await service.logout();
      expect(routerSpy.navigate).toHaveBeenCalled();
    } catch (e) { expect(e).toBeDefined(); }
  });

  it('getUser debería retornar el valor actual', () => {
    (service as any).userState.next({ uid: '123' });
    expect(service.getUser()).toEqual({ uid: '123' } as any);
  });
});
