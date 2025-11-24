import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ComunidadPage } from './comunidad.page';
import { IonicModule, MenuController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // Importante para ngModel
import { ComunidadService } from '../../services/comunidad.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ComunidadPage', () => {
  let component: ComunidadPage;
  let fixture: ComponentFixture<ComunidadPage>;
  let comunidadServiceSpy: jasmine.SpyObj<ComunidadService>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;

  beforeEach(waitForAsync(() => {
    // 1. Mock del Servicio
    const spy = jasmine.createSpyObj('ComunidadService', ['getComentarios', 'agregarComentario']);

    // 2. Mock del MenuController (Evita errores de HTML)
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable']);

    TestBed.configureTestingModule({
      declarations: [ComunidadPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule // Necesario para que funcione [(ngModel)] en el test
      ],
      providers: [
        { provide: ComunidadService, useValue: spy },
        { provide: MenuController, useValue: menuSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    comunidadServiceSpy = TestBed.inject(ComunidadService) as jasmine.SpyObj<ComunidadService>;

    // Configuración por defecto de Observables
    // Simulamos un Timestamp de Firebase con un objeto simple que tenga toDate()
    const fechaMock = { toDate: () => new Date() };
    comunidadServiceSpy.getComentarios.and.returnValue(of([
      { id: '1', texto: 'Hola mundo', fecha: fechaMock }
    ]));

    // Configuración por defecto de promesa exitosa
    comunidadServiceSpy.agregarComentario.and.returnValue(Promise.resolve({ id: '123' }));

    fixture = TestBed.createComponent(ComunidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST DE CARGA ---
  it('debería cargar comentarios al iniciar (ngOnInit)', () => {
    // ngOnInit se llama automáticamente en el primer detectChanges() del beforeEach
    expect(comunidadServiceSpy.getComentarios).toHaveBeenCalled();

    // Verificamos que la variable observable esté definida
    expect(component.comentarios).toBeDefined();
  });

  // --- TESTS DE AGREGAR COMENTARIO (Lógica Principal) ---

  it('debería llamar al servicio y limpiar input si el comentario es válido', fakeAsync(() => {
    component.nuevoComentario = 'Nuevo post de prueba';

    component.agregarComentario();
    tick(); // Esperamos a que se resuelva la promesa

    expect(comunidadServiceSpy.agregarComentario).toHaveBeenCalledWith('Nuevo post de prueba');
    expect(component.nuevoComentario).toBe(''); // Se debe limpiar tras éxito
  }));

  it('NO debería llamar al servicio si el comentario está vacío o son solo espacios', fakeAsync(() => {
    // Caso 1: Vacío
    component.nuevoComentario = '';
    component.agregarComentario();
    tick();
    expect(comunidadServiceSpy.agregarComentario).not.toHaveBeenCalled();

    // Caso 2: Solo espacios (Branch trim())
    component.nuevoComentario = '   ';
    component.agregarComentario();
    tick();
    expect(comunidadServiceSpy.agregarComentario).not.toHaveBeenCalled();
  }));

  it('debería manejar errores al agregar comentario (Catch block)', fakeAsync(() => {
    // 1. Preparamos el escenario de error
    const mensajeIntento = 'Mensaje que fallará';
    component.nuevoComentario = mensajeIntento;

    // 2. Simulamos fallo en el servicio
    comunidadServiceSpy.agregarComentario.and.rejectWith(new Error('Error de conexión'));

    // 3. Espiamos la consola para verificar que se loguea el error
    spyOn(console, 'error');

    // 4. Ejecutamos
    component.agregarComentario();
    tick(); // Esperamos al rechazo de la promesa

    // 5. Verificaciones
    expect(console.error).toHaveBeenCalled(); // Entró al catch

    // IMPORTANTE: Si falla, el input NO debe borrarse para que el usuario pueda reintentar.
    // Esto prueba que la línea "this.nuevoComentario = ''" no se ejecutó.
    expect(component.nuevoComentario).toBe(mensajeIntento);
  }));
});
