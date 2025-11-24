import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CarritoPage } from './carrito.page';
import { IonicModule, AlertController, MenuController } from '@ionic/angular';
import { TiendaService } from '../../services/tienda.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CarritoPage', () => {
  let component: CarritoPage;
  let fixture: ComponentFixture<CarritoPage>;
  let tiendaServiceSpy: jasmine.SpyObj<TiendaService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;

  beforeEach(waitForAsync(() => {
    // 1. Mock de TiendaService
    const tiendaSpy = jasmine.createSpyObj('TiendaService', [
      'getCarrito',
      'cambiarCantidad',
      'eliminarDelCarrito',
      'vaciarCarrito'
    ]);

    // 2. Mock de AlertController (Complejo para poder simular clicks)
    const alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    const alertHTMLSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertCtrlSpy.create.and.returnValue(Promise.resolve(alertHTMLSpy));

    // 3. Mock de MenuController (Para evitar error [ion-menu])
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable']);

    TestBed.configureTestingModule({
      declarations: [CarritoPage],
      imports: [IonicModule.forRoot()], // forRoot es importante para servicios internos
      providers: [
        { provide: TiendaService, useValue: tiendaSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: MenuController, useValue: menuSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    tiendaServiceSpy = TestBed.inject(TiendaService) as jasmine.SpyObj<TiendaService>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    menuCtrlSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;

    // Datos falsos por defecto
    tiendaServiceSpy.getCarrito.and.returnValue(of([
      { id: '1', cantidad: 2, producto: { id: 'p1', nombre: 'Item 1', precio: 100, imagen: 'img.jpg' } },
      { id: '2', cantidad: 1, producto: { id: 'p2', nombre: 'Item 2', precio: 50 } } // Sin imagen
    ]));

    fixture = TestBed.createComponent(CarritoPage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta ngOnInit -> suscribirAlCarrito
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- 1. TESTS DE CARGA Y CÁLCULO ---

  it('debería calcular el total correctamente al iniciar', () => {
    // Item 1: 2 * 100 = 200
    // Item 2: 1 * 50 = 50
    // Total esperado: 250
    expect(component.total).toBe(250);
    expect(component.carrito.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('ionViewWillEnter debería recargar el carrito', () => {
    const spySuscribir = spyOn(component, 'suscribirAlCarrito').and.callThrough();
    component.ionViewWillEnter();
    expect(spySuscribir).toHaveBeenCalled();
  });

  it('debería manejar errores al cargar el carrito (Branch Error)', () => {
    spyOn(console, 'error');
    tiendaServiceSpy.getCarrito.and.returnValue(throwError(() => new Error('Error DB')));

    component.recargarCarrito(); // Llama a suscribir

    expect(component.carrito).toEqual([]);
    expect(component.total).toBe(0);
    expect(component.cargando).toBeFalse();
  });

  // --- 2. TESTS DE INTERACCIÓN (Cambiar Cantidad / Eliminar) ---

  it('debería llamar al servicio al cambiar cantidad', fakeAsync(() => {
    tiendaServiceSpy.cambiarCantidad.and.returnValue(Promise.resolve());

    component.cambiarCantidad('1', 5);
    tick();

    expect(tiendaServiceSpy.cambiarCantidad).toHaveBeenCalledWith('1', 5);
  }));

  it('debería mostrar error si falla cambiar cantidad (Catch)', fakeAsync(() => {
    spyOn(component, 'mostrarError'); // Espiamos el método interno
    tiendaServiceSpy.cambiarCantidad.and.rejectWith(new Error('Fallo'));

    component.cambiarCantidad('1', 5);
    tick();

    expect(component.mostrarError).toHaveBeenCalled();
  }));

  it('debería eliminar un producto correctamente', fakeAsync(() => {
    tiendaServiceSpy.eliminarDelCarrito.and.returnValue(Promise.resolve());

    component.eliminar('1');
    tick();

    expect(tiendaServiceSpy.eliminarDelCarrito).toHaveBeenCalledWith('1');
  }));

  // --- 3. TESTS DE COMPRA (Flujo Complejo) ---

  it('debería mostrar error si intentamos comprar con carrito vacío', fakeAsync(() => {
    component.carrito = []; // Vaciamos manualmente
    spyOn(component, 'mostrarError');

    component.comprar();
    tick();

    expect(component.mostrarError).toHaveBeenCalledWith('El carrito está vacío');
    expect(alertControllerSpy.create).not.toHaveBeenCalled(); // No debe salir confirmación
  }));

  it('debería procesar la compra SI el usuario confirma en el Alert', fakeAsync(() => {
    // 1. Configuramos espía para vaciar carrito
    tiendaServiceSpy.vaciarCarrito.and.returnValue(Promise.resolve());

    // 2. Ejecutamos comprar
    component.comprar();
    tick();

    // 3. Obtenemos los argumentos y los convertimos a 'any' para evitar errores de TS
    const alertArgs = alertControllerSpy.create.calls.mostRecent().args[0] as any;

    // Verificamos que buttons exista antes de intentar acceder
    expect(alertArgs.buttons).toBeDefined();

    // 4. Buscamos el botón 'COMPRAR' (índice 1 según tu código)
    const botonComprar = alertArgs.buttons[1];

    // Verificación extra de seguridad
    expect(botonComprar.text).toBe('COMPRAR');

    // 5. SIMULAMOS EL CLICK ejecutando el handler manualmente
    botonComprar.handler();
    tick(); // Esperamos a que se procese la compra

    // 6. Verificaciones
    expect(tiendaServiceSpy.vaciarCarrito).toHaveBeenCalled();
    expect(alertControllerSpy.create).toHaveBeenCalledTimes(2);
  }));

  it('debería manejar error durante el proceso de compra', fakeAsync(() => {
    // 1. Hacemos que vaciarCarrito falle
    tiendaServiceSpy.vaciarCarrito.and.rejectWith(new Error('Fallo de red'));
    spyOn(component, 'mostrarError');

    // 2. Ejecutamos procesarCompra directamente (atajo para probar solo esa fn)
    component.procesarCompra();
    tick();

    expect(component.mostrarError).toHaveBeenCalledWith('Hubo un error al procesar tu compra');
  }));

  // --- 4. TESTS DE HELPERS (Cobertura de Branches || ) ---

  it('getNombreProducto debería usar fallback si no hay nombre', () => {
    const itemNormal = { producto: { nombre: 'Coca Cola' } };
    const itemSinProd = { id: '99', producto: null }; // Fallback

    expect(component.getNombreProducto(itemNormal)).toBe('Coca Cola');
    expect(component.getNombreProducto(itemSinProd)).toBe('Producto 99');
  });

  it('getPrecioProducto debería usar fallback de 100', () => {
    const itemNormal = { producto: { precio: 500 } };
    const itemFallo = { producto: null };

    expect(component.getPrecioProducto(itemNormal)).toBe(500);
    expect(component.getPrecioProducto(itemFallo)).toBe(100);
  });

  it('getImagenProducto debería usar imagen por defecto si no existe', () => {
    const itemConImg = { producto: { imagen: 'foto.jpg' } };
    const itemSinImg = { producto: null };

    expect(component.getImagenProducto(itemConImg)).toBe('foto.jpg');
    // Verifica que retorna el base64 largo
    expect(component.getImagenProducto(itemSinImg)).toContain('data:image/svg+xml;base64');
  });

  it('ngOnDestroy debería desuscribirse', () => {
    // Forzamos una suscripción
    component.suscribirAlCarrito();
    // Accedemos a la propiedad privada para espiarla (casting a any)
    const subSpy = spyOn((component as any).carritoSubscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(subSpy).toHaveBeenCalled();
  });
});
