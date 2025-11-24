import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ExtrasPage } from './extras.page';
import { IonicModule, ModalController, MenuController } from '@ionic/angular'; // Agregamos MenuController
import { Personajes } from 'src/app/services/personajes';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ExtrasPage', () => {
  let component: ExtrasPage;
  let fixture: ComponentFixture<ExtrasPage>;

  // Spies
  let personajesServiceSpy: jasmine.SpyObj<Personajes>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;

  beforeEach(waitForAsync(() => {
    // 1. Mock del Servicio de Personajes
    const serviceSpy = jasmine.createSpyObj('Personajes', ['getPersonajes']);

    // 2. Mock del ModalController
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
    const ctrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    ctrlSpy.create.and.returnValue(Promise.resolve(modalSpy));

    // 3. Mock del MenuController (IMPORTANTE para <ion-menu-button>)
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable', 'toggle']);

    TestBed.configureTestingModule({
      declarations: [ExtrasPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Personajes, useValue: serviceSpy },
        { provide: ModalController, useValue: ctrlSpy },
        { provide: MenuController, useValue: menuSpy } // Inyectamos el mock
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    // Inyecciones
    personajesServiceSpy = TestBed.inject(Personajes) as jasmine.SpyObj<Personajes>;
    modalCtrlSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    menuCtrlSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;

    // Configuración inicial por defecto (Lista vacía para que no falle ngOnInit si se llama)
    personajesServiceSpy.getPersonajes.and.returnValue(of([]));

    fixture = TestBed.createComponent(ExtrasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar la lista de personajes al iniciar (Happy Path)', () => {
    // GIVEN: Datos simulados
    const datosSimulados = [
      { nombre: 'Bomba', apellido: 'Fuego', imagen: 'img1.jpg', id: '1' },
      { nombre: 'Hielo', apellido: 'Frost', imagen: 'img2.jpg', id: '2' }
    ];

    // Preparamos el spy para devolver datos
    personajesServiceSpy.getPersonajes.and.returnValue(of(datosSimulados));

    // Reiniciamos ngOnInit llamando a ngOnInit manualmente o recreando el componente,
    // pero como ya corrió en el beforeEach con [], simplemente llamamos al método si existe
    // o re-ejecutamos la lógica.
    // Lo más limpio en tests unitarios simples es llamar a ngOnInit directo:
    component.ngOnInit();

    // THEN
    expect(component.personajesRecientes.length).toBe(2);
    expect(component.personajesRecientes[0].nombre).toBe('Bomba');
  });

  it('debería manejar una lista vacía de personajes (Empty Path)', () => {
    // GIVEN: Servicio retorna array vacío
    personajesServiceSpy.getPersonajes.and.returnValue(of([]));

    // WHEN
    component.ngOnInit();

    // THEN
    expect(component.personajesRecientes).toEqual([]);
    expect(component.personajesRecientes.length).toBe(0);
    // Esto asegura que el *ngIf="personajesRecientes.length === 0" del HTML tiene sentido lógico
  });

  it('debería abrir el modal con el ID correcto al ver detalle', fakeAsync(() => {
    // WHEN: Llamamos a verDetalle
    const idPrueba = 'abc-123';
    component.verDetalle(idPrueba);

    tick(); // Esperamos a que la promesa del modal se resuelva

    // THEN: Verificamos que se llamó a create con el ID correcto
    expect(modalCtrlSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      componentProps: { id: idPrueba }
    }));
  }));
});
