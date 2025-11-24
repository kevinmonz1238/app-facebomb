import { TestBed } from '@angular/core/testing';
import { AuthGuard } from '../guards/auth-guard';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Mock del AuthService más robusto
class MockAuthService {
  private userSubject = of(null);

  get user$() {
    return this.userSubject;
  }

  setUser(user: any) {
    this.userSubject = of(user);
  }
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', (done) => {
    // Simular usuario autenticado usando el método del mock
    authService.setUser({ uid: '123', email: 'test@test.com' });

    guard.canActivate().subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should redirect to login when user is not authenticated', (done) => {
    // Usar el estado por defecto (usuario null)
    guard.canActivate().subscribe(result => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
