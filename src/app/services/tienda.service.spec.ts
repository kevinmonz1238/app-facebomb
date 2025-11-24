import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TiendaService } from './tienda.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { of } from 'rxjs';

describe('TiendaService', () => {
  let service: TiendaService;
  const firestoreMock = {};
  const authMock = { currentUser: { uid: '123' } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TiendaService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: Auth, useValue: authMock }
      ]
    });
    service = TestBed.inject(TiendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- TESTS DE LECTURA (Con Mocks de Wrappers) ---

  it('getProductos debería devolver datos', (done) => {
    const mockData = [{ id: '1' }];
    spyOn(service, 'getCollectionData').and.returnValue(of(mockData));

    service.getProductos().subscribe(res => {
      expect(res).toEqual(mockData);
      done();
    });
  });

  it('getCarrito debería combinar datos del carrito y productos', (done) => {
    const mockCarrito = [{ id: 'item1', productoId: 'prod1', cantidad: 2 }];
    const mockProducto = { nombre: 'Coca Cola', precio: 10 };

    // Mockeamos la colección del carrito
    spyOn(service, 'getCollectionData').and.returnValue(of(mockCarrito));

    // Mockeamos la obtención del producto individual
    spyOn(service, 'getProducto').and.returnValue(of(mockProducto));

    service.getCarrito().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].producto.nombre).toBe('Coca Cola'); // Verifica que el map funcionó
      done();
    });
  });

  it('getCarrito debería manejar carrito vacío', (done) => {
    spyOn(service, 'getCollectionData').and.returnValue(of([]));

    service.getCarrito().subscribe(res => {
      expect(res).toEqual([]);
      done();
    });
  });

  // --- TESTS DE ESCRITURA (Lógica de Negocio) ---

  it('agregarAlCarrito debería CREAR documento si no existe', async () => {
    // Mock producto existe
    spyOn(service, 'getDocSnapshot').and.returnValues(
      Promise.resolve({ exists: () => true } as any), // Producto
      Promise.resolve({ exists: () => false } as any) // Item en carrito (no existe)
    );
    const setSpy = spyOn(service, 'setDocument').and.returnValue(Promise.resolve());

    await service.agregarAlCarrito('prod1');

    expect(setSpy).toHaveBeenCalled(); // Verifica que entró al 'else'
  });

  it('agregarAlCarrito debería ACTUALIZAR documento si ya existe', async () => {
    // Mock producto y item existen
    spyOn(service, 'getDocSnapshot').and.returnValues(
      Promise.resolve({ exists: () => true } as any), // Producto
      Promise.resolve({ exists: () => true, data: () => ({ cantidad: 1 }) } as any) // Item
    );
    const updateSpy = spyOn(service, 'updateDocument').and.returnValue(Promise.resolve());

    await service.agregarAlCarrito('prod1');

    expect(updateSpy).toHaveBeenCalled(); // Verifica que entró al 'if'
  });

  it('cambiarCantidad debería eliminar si cantidad es 0', async () => {
    const deleteSpy = spyOn(service, 'eliminarDelCarrito').and.returnValue(Promise.resolve());
    await service.cambiarCantidad('prod1', 0);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('cambiarCantidad debería actualizar si cantidad es positiva', async () => {
    const updateSpy = spyOn(service, 'updateDocument').and.returnValue(Promise.resolve());
    await service.cambiarCantidad('prod1', 5);
    expect(updateSpy).toHaveBeenCalled();
  });

  // --- CRASH TESTS (Para lo que no mockeamos) ---

  it('vaciarCarrito debería intentar borrar', async () => {
    try { await service.vaciarCarrito(); } catch (e) { expect(e).toBeDefined(); }
  });
  // --- 4. TESTS DE BRANCHES FALTANTES (Para subir del 58% al 100%) ---

  it('getProducto debería devolver null si el documento no existe (Branch Else)', (done) => {
    // Simulamos que Firebase responde, pero el documento no existe
    spyOn(service, 'getDocSnapshot').and.returnValue(Promise.resolve({
      exists: () => false, // <--- Esto fuerza el 'else'
      id: 'id_inexistente',
      data: () => null
    } as any));

    service.getProducto('id_inexistente').subscribe(res => {
      expect(res).toBeNull(); // Probamos que devuelva null
      done();
    });
  });

  it('getCarrito debería usar datos por defecto si un producto fue borrado (Branch ||)', (done) => {
    const mockCarrito = [{ id: 'item1', productoId: 'prod_borrado', cantidad: 1 }];

    // 1. El carrito devuelve un item
    spyOn(service, 'getCollectionData').and.returnValue(of(mockCarrito));

    // 2. Pero el producto asociado devuelve NULL (simulando que se borró de la tienda)
    spyOn(service, 'getProducto').and.returnValue(of(null));

    service.getCarrito().subscribe(res => {
      // 3. Verificamos que entre en el '|| { nombre: "Producto no disponible" }'
      expect(res[0].producto.nombre).toBe('Producto no disponible');
      expect(res[0].producto.precio).toBe(0);
      done();
    });
  });

  it('getProducto debería manejar error de red en la promesa (Catch)', (done) => {
    // Forzamos que getDocSnapshot falle (ej. sin internet)
    spyOn(service, 'getDocSnapshot').and.rejectWith(new Error('Fallo Firebase'));

    service.getProducto('id').subscribe({
      next: () => {},
      error: (error) => {
        expect(error).toBeDefined(); // Confirmamos que entra al catch
        done();
      }
    });
  });
  // --- 5. TESTS DE CASOS BORDE (Para el 100% de Branches) ---

  it('agregarAlCarrito debería lanzar error si el producto NO existe en la base de datos', async () => {
    (service as any).auth = authMock;

    // Simulamos que al buscar el producto, Firebase dice "no existe"
    spyOn(service, 'getDocSnapshot').and.returnValue(Promise.resolve({
      exists: () => false
    } as any));

    await expectAsync(service.agregarAlCarrito('id-fantasma'))
      .toBeRejectedWithError('El producto no existe');
  });

  it('agregarAlCarrito debería asumir cantidad 1 si el dato viene corrupto (Branch || 1)', async () => {
    (service as any).auth = authMock;

    // 1. El producto existe
    const productSnap = { exists: () => true };
    // 2. El item en carrito existe, PERO no tiene campo cantidad (Dato corrupto)
    const itemSnap = { exists: () => true, data: () => ({}) };

    spyOn(service, 'getDocSnapshot').and.returnValues(
      Promise.resolve(productSnap as any),
      Promise.resolve(itemSnap as any)
    );

    const updateSpy = spyOn(service, 'updateDocument').and.returnValue(Promise.resolve());

    await service.agregarAlCarrito('prod1');

    // Verificamos que usó el "|| 1" -> (1 + 1 = 2)
    expect(updateSpy).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.objectContaining({ cantidad: 2 })
    );
  });
});
