import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { TiendaPage } from './tienda.page';
import { TiendaService } from '../../services/tienda.service';
import { Auth } from '@angular/fire/auth';
import { IonicModule, NavController, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('TiendaPage', () => {
  let component: TiendaPage;
  let fixture: ComponentFixture<TiendaPage>;
  let tiendaServiceSpy: jasmine.SpyObj<TiendaService>;
  let authMock: any;
  let menuCtrlSpy: any;

  beforeEach(waitForAsync(() => {
    // Mocks
    const spy = jasmine.createSpyObj('TiendaService', ['getProductos', 'getTotalItemsCarrito', 'agregarAlCarrito']);
    menuCtrlSpy = jasmine.createSpyObj('MenuController', ['enable', 'close', 'toggle']);

    // 🔥 Mock de Auth dinámico (mutable para pruebas de logout)
    authMock = { currentUser: { uid: 'USER_123' } };

    TestBed.configureTestingModule({
      declarations: [TiendaPage],
      imports: [
        CommonModule,
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: TiendaService, useValue: spy },
        { provide: Auth, useValue: authMock }, // Pasamos la referencia del objeto
        { provide: MenuController, useValue: menuCtrlSpy },
        {
          provide: NavController,
          useValue: { navigateForward: jasmine.createSpy('navigateForward') }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    tiendaServiceSpy = TestBed.inject(TiendaService) as jasmine.SpyObj<TiendaService>;

    // Configuración por defecto (Camino Feliz)
    tiendaServiceSpy.getProductos.and.returnValue(of([
      { id: '1', nombre: 'Prod 1', precio: 100, stock: 5, imagen: 'img1.jpg' }
    ]));
    tiendaServiceSpy.getTotalItemsCarrito.and.returnValue(of(2));
    tiendaServiceSpy.agregarAlCarrito.and.returnValue(Promise.resolve());

    fixture = TestBed.createComponent(TiendaPage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TESTS DE CARGA (ngOnInit) ---

  it('debería cargar productos correctamente al inicio', () => {
    expect(component.productos.length).toBe(1);
    expect(component.cargando).toBeFalse();
    expect(component.itemsCarrito).toBe(2);
  });

  it('debería manejar error al cargar productos y limpiar mensaje (Branch Catch)', fakeAsync(() => {
    // 🔥 Forzamos el error del Observable para entrar en el bloque 'error:'
    tiendaServiceSpy.getProductos.and.returnValue(throwError(() => new Error('Error API')));
    spyOn(console, 'error'); // Evitamos ruido en consola

    component.cargarProductos();

    expect(component.cargando).toBeFalse();
    expect(component.mensajeError).toBe('Error al cargar los productos');

    // 🔥 Avanzamos el tiempo para probar la función dentro de setTimeout
    tick(3000);
    expect(component.mensajeError).toBe('');
  }));

  it('debería manejar error al cargar carrito', () => {
    spyOn(console, 'error');
    tiendaServiceSpy.getTotalItemsCarrito.and.returnValue(throwError(() => new Error('Error Carrito')));

    component.suscribirAlCarrito();

    expect(component.itemsCarrito).toBe(0);
  });

  // --- TESTS DE AGREGAR AL CARRITO (Branches Críticos) ---

  it('NO debería agregar al carrito si el usuario NO está logueado (Branch if !user)', fakeAsync(() => {
    // 🔥 Simulamos logout poniendo currentUser a null
    authMock.currentUser = null;

    component.agregar('1');

    expect(tiendaServiceSpy.agregarAlCarrito).not.toHaveBeenCalled();
    expect(component.mensajeError).toContain('iniciar sesión');

    // Probamos que el mensaje se borra
    tick(3000);
    expect(component.mensajeError).toBe('');
  }));

  it('debería agregar al carrito exitosamente si está logueado', fakeAsync(() => {
    authMock.currentUser = { uid: 'USER_123' };
    spyOn(console, 'log');

    component.agregar('1');
    tick(); // Resolver promesa

    expect(tiendaServiceSpy.agregarAlCarrito).toHaveBeenCalledWith('1');
    expect(component.mensajeExito).toContain('correctamente');

    tick(3000);
    expect(component.mensajeExito).toBe('');
  }));

  it('debería manejar error CON mensaje al agregar al carrito', fakeAsync(() => {
    authMock.currentUser = { uid: 'USER_123' };
    // 🔥 Simulamos un error que tiene propiedad .message
    tiendaServiceSpy.agregarAlCarrito.and.rejectWith({ message: 'Sin stock custom' });

    component.agregar('1');
    tick();

    expect(component.mensajeError).toBe('Sin stock custom');
  }));

  it('debería manejar error SIN mensaje al agregar al carrito (Branch ||)', fakeAsync(() => {
    authMock.currentUser = { uid: 'USER_123' };
    // 🔥 Simulamos error vacío para probar el operador "|| 'Error al agregar...'"
    tiendaServiceSpy.agregarAlCarrito.and.rejectWith({});

    component.agregar('1');
    tick();

    expect(component.mensajeError).toBe('Error al agregar al carrito');
  }));

  // --- TESTS DE UTILIDADES Y FALLBACKS ---

  it('debería formatear el precio correctamente', () => {
    expect(component.formatearPrecio(1500)).toBe('1,500');
  });

  it('debería retornar "0" si el precio es null o undefined (Branch ?.)', () => {
    // 🔥 Cubre el caso donde precio no existe
    expect(component.formatearPrecio(null as any)).toBe('0');
    expect(component.formatearPrecio(undefined as any)).toBe('0');
  });

  it('debería manejar error de carga de imagen (placeholder)', () => {
    const mockEvent = { target: { src: 'imagen_rota.jpg' } };
    const mockProducto = { nombre: 'Producto Test' };
    spyOn(console, 'log');

    component.onErrorImagen(mockEvent, mockProducto);

    // Verificamos que se asignó el base64
    expect(mockEvent.target.src).toContain('data:image/svg+xml;base64');
  });

  // --- TEST DE DESTRUCCIÓN ---

  it('ngOnDestroy debería desuscribirse si existen suscripciones', () => {
    // Forzamos que las suscripciones existan
    component.suscribirAlCarrito();
    component.cargarProductos();

    // Accedemos a las propiedades privadas (casting a any para TS)
    const spyCarrito = spyOn((component as any).carritoSubscription, 'unsubscribe');
    const spyProd = spyOn((component as any).productosSubscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(spyCarrito).toHaveBeenCalled();
    expect(spyProd).toHaveBeenCalled();
  });

  it('ngOnDestroy no debería fallar si las suscripciones son nulas', () => {
    // 🔥 Cubre el operador '?.' (optional chaining)
    (component as any).carritoSubscription = null;
    (component as any).productosSubscription = null;

    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
