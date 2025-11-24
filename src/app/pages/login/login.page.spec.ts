import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule, MenuController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; // Importante
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
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
        // CORRECCIÓN CRÍTICA: ActivatedRoute completo con Observables
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

  it('debería navegar a /principal si el login normal es exitoso', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(Promise.resolve({} as any));
    component.email = 'test@test.com';
    component.password = '123456';

    component.onLogin();
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal']);
  }));

  it('debería mostrar alerta si el login normal falla', fakeAsync(() => {
    authServiceSpy.login.and.rejectWith(new Error('Error'));
    spyOn(window, 'alert');

    component.onLogin();
    tick();

    expect(window.alert).toHaveBeenCalled();
  }));

  it('debería navegar si login con Google es exitoso', fakeAsync(() => {
    authServiceSpy.loginWithGoogle.and.returnValue(Promise.resolve({} as any));
    component.onLoginWithGoogle();
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal']);
  }));
});
