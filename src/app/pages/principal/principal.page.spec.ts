import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PrincipalPage } from './principal.page';
import { IonicModule, NavController, MenuController } from '@ionic/angular'; // Agregamos MenuController
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PrincipalPage', () => {
  let component: PrincipalPage;
  let fixture: ComponentFixture<PrincipalPage>;

  // Spies para los controladores
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let routerSpy: jasmine.SpyObj<Router>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;

  beforeEach(waitForAsync(() => {
    // 1. Crear los objetos espía
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    const rotSpy = jasmine.createSpyObj('Router', ['navigate']);

    // 2. Mock de MenuController (CRÍTICO para <ion-menu-button>)
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable', 'toggle']);

    TestBed.configureTestingModule({
      declarations: [PrincipalPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navSpy },
        { provide: Router, useValue: rotSpy },
        { provide: MenuController, useValue: menuSpy } // Inyección del mock
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    // Recuperar las instancias
    navCtrlSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    menuCtrlSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;

    fixture = TestBed.createComponent(PrincipalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST DE LÓGICA VISUAL (Video) ---

  it('debería alternar la visibilidad del video (toggleVideo)', () => {
    // Estado inicial
    component.showVideo = false;

    // 1. Primer toggle -> true
    component.toggleVideo();
    expect(component.showVideo).toBeTrue();

    // 2. Segundo toggle -> false
    component.toggleVideo();
    expect(component.showVideo).toBeFalse();
  });

  // --- TEST DE NAVEGACIÓN (Branches) ---

  it('debería navegar internamente usando NavController si la ruta NO es http', () => {
    // GIVEN
    const rutaInterna = '/social';

    // WHEN
    component.navegar(rutaInterna);

    // THEN
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith(rutaInterna);

    // Aseguramos que NO se llamó a window.open
    const windowSpy = spyOn(window, 'open');
    expect(windowSpy).not.toHaveBeenCalled();
  });

  it('debería abrir ventana externa si la ruta empieza con http', () => {
    // GIVEN
    const rutaExterna = 'https://facebomb.onrender.com/';

    // Espiamos window.open y devolvemos null para que no abra nada real
    const windowSpy = spyOn(window, 'open').and.returnValue(null);

    // WHEN
    component.navegar(rutaExterna);

    // THEN
    expect(windowSpy).toHaveBeenCalledWith(rutaExterna, '_system');
    // Aseguramos que NO usó la navegación interna
    expect(navCtrlSpy.navigateForward).not.toHaveBeenCalled();
  });
});
