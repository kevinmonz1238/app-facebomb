import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DetalleComponent } from './detalle.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { Personajes } from 'src/app/services/personajes'; // Verifica que la ruta sea correcta
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DetalleComponent', () => {
  let component: DetalleComponent;
  let fixture: ComponentFixture<DetalleComponent>;
  let personajesSpy: jasmine.SpyObj<Personajes>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    // 1. Mock del Servicio Personajes
    const pSpy = jasmine.createSpyObj('Personajes', ['getPersonajesDetalle']);

    // 2. Mock del ModalController
    const mSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [DetalleComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Personajes, useValue: pSpy },
        { provide: ModalController, useValue: mSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    personajesSpy = TestBed.inject(Personajes) as jasmine.SpyObj<Personajes>;
    modalCtrlSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

    fixture = TestBed.createComponent(DetalleComponent);
    component = fixture.componentInstance;

    // Simulamos que el componente recibe un ID (como si fuera @Input)
    component.id = 'test-id-123';
  }));

  it('should create', () => {
    // Configuramos el retorno por defecto para que no falle al instanciarse
    personajesSpy.getPersonajesDetalle.and.returnValue(of({}));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit debería llamar al servicio y asignar los datos', () => {
    // GIVEN: Unos datos simulados
    const datosSimulados = { nombre: 'Personaje Test', descripcion: 'Desc' };
    personajesSpy.getPersonajesDetalle.and.returnValue(of(datosSimulados));

    // WHEN: Se inicia el componente
    fixture.detectChanges(); // Esto dispara ngOnInit automáticamente

    // THEN: Verificamos llamadas y asignaciones
    expect(personajesSpy.getPersonajesDetalle).toHaveBeenCalledWith('test-id-123');
    expect(component.detallePersonaje).toEqual(datosSimulados as any);
  });

  it('regresar() debería cerrar el modal', () => {
    // Configuramos el retorno para ngOnInit para que no moleste
    personajesSpy.getPersonajesDetalle.and.returnValue(of({}));
    fixture.detectChanges();

    // WHEN: Llamamos a regresar
    component.regresar();

    // THEN: Verificamos que se llamó a dismiss
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });
});
