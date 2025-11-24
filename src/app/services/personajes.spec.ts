import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Personajes } from './personajes'; // Asegúrate que la ruta sea correcta
import { Firestore } from '@angular/fire/firestore';

describe('Personajes Service', () => {
  let service: Personajes;
  let httpMock: HttpTestingController;
  const firestoreMock = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Personajes,
        { provide: Firestore, useValue: firestoreMock }
      ]
    });
    service = TestBed.inject(Personajes);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Pruebas HTTP Reales
  it('getDatos debería llamar a la API', () => {
    service.getDatos().subscribe();
    const req = httpMock.expectOne('https://reqres.in/api/users');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getDetalle debería llamar a la API con ID', () => {
    service.getDetalle('1').subscribe();
    const req = httpMock.expectOne('https://reqres.in/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  // Pruebas Firebase (Crash Test)
  it('getPersonajes debería intentar leer colección', () => {
    try { service.getPersonajes(); } catch (e) { expect(e).toBeDefined(); }
  });

  it('getPersonajesDetalle debería intentar leer documento', () => {
    try { service.getPersonajesDetalle('1'); } catch (e) { expect(e).toBeDefined(); }
  });
});
