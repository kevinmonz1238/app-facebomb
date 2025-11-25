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
    const spy = jasmine.createSpyObj('TiendaService', ['getProductos', 'getTotalItemsCarrito', 'agregarAlCarrito']);
    menuCtrlSpy = jasmine.createSpyObj('MenuController', ['enable', 'close', 'toggle']);

    // Mock de Auth
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
        { provide: Auth, useValue: authMock },
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

    // Configuración por defecto
    tiendaServiceSpy.getProductos.and.returnValue(of([
      { id: '1', nombre: 'Prod 1', precio: 100, stock: 5, imagen: 'img1.jpg' }
    ]));
    tiendaServiceSpy.getTotalItemsCarrito.and.returnValue(of(2));
    tiendaServiceSpy.agregarAlCarrito.and.returnValue(Promise.resolve());

    fixture = TestBed.createComponent(TiendaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TESTS DE CARGA ---

  it('debería cargar productos correctamente al inicio', () => {
    expect(component.productos.length).toBe(1);
    expect(component.cargando).toBeFalse();
  });

  it('debería manejar error al cargar productos y limpiar mensaje (Branch Catch)', fakeAsync(() => {
    tiendaServiceSpy.getProductos.and.returnValue(throwError(() => new Error('Error API')));
    spyOn(console, 'error');

    component.cargarProductos();

    expect(component.cargando).toBeFalse();
    // CORREGIDO: Texto coincide con el componente
    expect(component.mensajeError).toBe('NO SE PUDO CONECTAR CON EL MERCADO');

    tick(3000);
    expect(component.mensajeError).toBe('');
  }));

  // --- TESTS DE AGREGAR AL CARRITO ---

  it('NO debería agregar al carrito si el usuario NO está logueado (Branch if !user)', fakeAsync(() => {
    authMock.currentUser = null;

    component.agregar('1');

    expect(tiendaServiceSpy.agregarAlCarrito).not.toHaveBeenCalled();
    // CORREGIDO: Texto en mayúsculas como en el componente
    expect(component.mensajeError).toContain('DEBES INICIAR SESIÓN');

    tick(3000);
    expect(component.mensajeError).toBe('');
  }));

  it('debería agregar al carrito exitosamente si está logueado', fakeAsync(() => {
    authMock.currentUser = { uid: 'USER_123' };
    spyOn(console, 'log'); // Evitar logs sucios en el test

    component.agregar('1');
    tick();

    expect(tiendaServiceSpy.agregarAlCarrito).toHaveBeenCalledWith('1');
    // CORREGIDO: Texto exacto del componente
    expect(component.mensajeExito).toContain('¡ITEM AÑADIDO AL INVENTARIO!');

    tick(3000);
    expect(component.mensajeExito).toBe('');
  }));

  it('debería manejar error CON mensaje al agregar al carrito', fakeAsync(() => {
    authMock.currentUser = { uid: 'USER_123' };
    spyOn(console, 'error'); // Silenciar el console.error esperado

    // El servicio falla con mensaje 'stock'
    tiendaServiceSpy.agregarAlCarrito.and.rejectWith({ message: 'Sin stock custom' });

    component.agregar('1');
    tick();

    // CORREGIDO: El componente transforma el error en este mensaje específico
    expect(component.mensajeError).toBe('¡AGOTADO! YA NO QUEDAN UNIDADES');
  }));

  it('debería manejar error SIN mensaje al agregar al carrito (Branch ||)', fakeAsync(() => {
    authMock.currentUser = { uid: 'USER_123' };
    spyOn(console, 'error');

    tiendaServiceSpy.agregarAlCarrito.and.rejectWith({});

    component.agregar('1');
    tick();

    // CORREGIDO: Texto exacto del 'else' en tu try/catch
    expect(component.mensajeError).toBe('ERROR EN LA TRANSACCIÓN');
  }));

  // --- TESTS DE UTILIDADES ---

  it('debería retornar "0" si el precio es null o undefined (Branch ?.)', () => {
    // CORREGIDO: Evitamos el "Script Error" asegurando la validación
    expect(component.formatearPrecio(null as any)).toBe('0');
    expect(component.formatearPrecio(undefined as any)).toBe('0');
  });

  it('debería manejar error de carga de imagen (placeholder)', () => {
    const mockEvent = { target: { src: 'imagen_rota.jpg' } };
    const mockProducto = { nombre: 'Producto Test' };

    component.onErrorImagen(mockEvent, mockProducto);

    // CORREGIDO: Tu componente asigna una ruta estática, no un base64
    expect(mockEvent.target.src).toBe('assets/icon/facepost.jpg');
  });

  // --- TEST DE DESTRUCCIÓN ---

  it('ngOnDestroy debería desuscribirse si existen suscripciones', () => {
    component.suscribirAlCarrito();
    component.cargarProductos();

    const spyCarrito = spyOn((component as any).carritoSubscription, 'unsubscribe');
    const spyProd = spyOn((component as any).productosSubscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(spyCarrito).toHaveBeenCalled();
    expect(spyProd).toHaveBeenCalled();
  });
});
