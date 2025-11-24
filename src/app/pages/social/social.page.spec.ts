import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SocialPage } from './social.page';
import { IonicModule, MenuController } from '@ionic/angular'; // Agregamos MenuController
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SocialPage', () => {
  let component: SocialPage;
  let fixture: ComponentFixture<SocialPage>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;

  beforeEach(waitForAsync(() => {
    // 1. Mock del MenuController (Para evitar error [ion-menu] del HTML)
    const mSpy = jasmine.createSpyObj('MenuController', ['enable', 'toggle']);

    TestBed.configureTestingModule({
      declarations: [SocialPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MenuController, useValue: mSpy } // Inyectamos el mock
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    menuCtrlSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;

    fixture = TestBed.createComponent(SocialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería abrir el enlace del juego en una nueva pestaña al llamar irAlJuego()', () => {
    // GIVEN: Espiamos window.open y devolvemos null para evitar abrir ventanas reales
    const windowSpy = spyOn(window, 'open').and.returnValue(null);
    const urlEsperada = 'https://facebomb.onrender.com/';

    // WHEN: Ejecutamos la función
    component.irAlJuego();

    // THEN: Verificamos llamada correcta
    expect(windowSpy).toHaveBeenCalledWith(urlEsperada, '_blank');
  });
});
