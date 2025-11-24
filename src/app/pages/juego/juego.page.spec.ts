import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { JuegoPage } from './juego.page';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular'; // Agregamos MenuController
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('JuegoPage', () => {
  let component: JuegoPage;
  let fixture: ComponentFixture<JuegoPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;

  beforeEach(waitForAsync(() => {
    // 1. Mock del Router
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    // 2. Mock del MenuController (CRÍTICO para evitar errores del HTML)
    const mSpy = jasmine.createSpyObj('MenuController', ['enable', 'toggle']);

    TestBed.configureTestingModule({
      declarations: [JuegoPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: rSpy },
        { provide: MenuController, useValue: mSpy } // Inyectamos el mock
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    menuCtrlSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;

    fixture = TestBed.createComponent(JuegoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería navegar a la ruta correcta usando navegar()', () => {
    // GIVEN: Una ruta destino
    const rutaPrueba = '/extras';

    // WHEN: Llamamos a la función
    component.navegar(rutaPrueba);

    // THEN: Verificamos que el router haya sido llamado con esa ruta
    expect(routerSpy.navigate).toHaveBeenCalledWith([rutaPrueba]);
  });

  it('debería intentar abrir el enlace externo en irAlJuego()', () => {
    // 1. Espiamos el objeto window.open para evitar que abra una pestaña real durante el test
    // y devolvemos null para cumplir con la firma de la función
    const windowSpy = spyOn(window, 'open').and.returnValue(null);

    // 2. Ejecutamos la función
    component.irAlJuego();

    // 3. Verificamos que window.open fue llamado con la URL exacta y en nueva pestaña
    expect(windowSpy).toHaveBeenCalledWith('https://facebomb.onrender.com/', '_blank');
  });
});
