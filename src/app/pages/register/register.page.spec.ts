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
        // CORRECCIÓN CRÍTICA
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

  it('debería navegar si el registro es exitoso', fakeAsync(() => {
    authServiceSpy.register.and.returnValue(Promise.resolve({} as any));
    component.onRegister();
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal']);
  }));

  it('debería alertar si el registro falla', fakeAsync(() => {
    authServiceSpy.register.and.rejectWith(new Error('Error'));
    spyOn(window, 'alert');
    component.onRegister();
    tick();
    expect(window.alert).toHaveBeenCalled();
  }));
});
